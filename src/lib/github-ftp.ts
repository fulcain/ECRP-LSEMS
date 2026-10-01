/**
 * The GitHub write backend: commits FTP files straight to the repository.
 *
 * The FTP is files in the repository, and git is the one version history
 * the app trusts - so an update from a deployment commits through the same
 * repository the app ships from, rather than keeping a second copy anywhere.
 * No database, no config store: a commit is the update, and its history *is*
 * the version history.
 *
 * Uses the Git Data API (tree → commit → ref) rather than the Contents API
 * because an update moves several files at once - the section files, the
 * generated module the contract workflow copies from, and the phase Guides -
 * and those belong in one commit, reviewable as one change.
 *
 * Everything here degrades to "not configured": with no token the callers fall
 * back to writing the local checkout, which is what a development machine uses.
 */

const API = "https://api.github.com";

export type GitHubFileChange = {
  /** Path from the repository root. */
  path: string;
  content: string;
};

export type GitHubCommitResult =
  | { ok: true; commitUrl: string; sha: string }
  | { ok: false; reason: string };

/** Whether commits can be made from this deployment. */
export function isGitHubCommitConfigured(): boolean {
  return Boolean(process.env.GITHUB_FTP_TOKEN && process.env.GITHUB_REPOSITORY);
}

/**
 * Whether an update should take the commit path: wherever the token and the
 * repository are configured - a deployment or a development server alike - an
 * accepted update is a commit on the repository, pushed as it is made. Without
 * them a checkout writes its own files and the member commits by hand.
 */
export function commitsThroughGitHub(): boolean {
  return isGitHubCommitConfigured();
}

function repo(): { owner: string; repo: string } {
  const slug = (process.env.GITHUB_REPOSITORY ?? "").replace(/^.*github\.com\//, "").replace(/\.git$/, "");
  const [owner, repo] = slug.split("/");
  return { owner, repo };
}

async function gh<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<{ ok: true; data: T } | { ok: false; status: number; reason: string }> {
  const token = process.env.GITHUB_FTP_TOKEN;
  if (!token) return { ok: false, status: 500, reason: "No GitHub token configured." };
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    ...(init.json !== undefined ? { body: JSON.stringify(init.json) } : {}),
    cache: "no-store",
  });
  if (!response.ok) {
    let reason = `GitHub API ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) reason = `${reason}: ${body.message}`;
    } catch {
      // A status line is enough when the body is not JSON.
    }
    return { ok: false, status: response.status, reason };
  }
  // 204s (fast-forward ref updates) have no body to read.
  if (response.status === 204) return { ok: true, data: undefined as T };
  return { ok: true, data: (await response.json()) as T };
}

type CommitRef = {
  object: { sha: string; commit?: { tree?: { sha?: string } } };
};

/** The branch head, and its tree when the commit came with it. */
async function branchHead(ref: string): Promise<{ sha: string; tree?: string } | null> {
  const result = await gh<CommitRef>(`/repos/${repo().owner}/${repo().repo}/git/ref/${ref}`);
  if (!result.ok) return null;
  const sha = result.data.object.sha;
  // The ref points at a commit, whose tree we need for the base of the new one.
  const commit = await gh<{ tree: { sha: string } }>(
    `/repos/${repo().owner}/${repo().repo}/git/commits/${sha}`,
  );
  return commit.ok ? { sha, tree: commit.data.tree.sha } : { sha };
}

/**
 * Commits `files` to `branch` as one commit, authored by the member whose
 * update it was.
 */
export async function commitFtpFiles(options: {
  files: readonly GitHubFileChange[];
  message: string;
  authorName: string;
  authorEmail: string;
  branch?: string;
}): Promise<GitHubCommitResult> {
  if (!isGitHubCommitConfigured()) {
    return { ok: false, reason: "GitHub committing is not configured on this deployment." };
  }
  if (options.files.length === 0) {
    return { ok: false, reason: "No files to commit." };
  }
  const ref = options.branch ?? "heads/main";
  const head = await branchHead(ref);
  if (!head?.tree) {
    return { ok: false, reason: "The branch head could not be read from GitHub." };
  }

  const blobs: { path: string; sha: string }[] = [];
  for (const file of options.files) {
    const blob = await gh<{ sha: string }>(`/repos/${repo().owner}/${repo().repo}/git/blobs`, {
      method: "POST",
      json: { content: Buffer.from(file.content, "utf8").toString("base64"), encoding: "base64" },
    });
    if (!blob.ok) return { ok: false, reason: blob.reason };
    blobs.push({ path: file.path, sha: blob.data.sha });
  }

  const tree = await gh<{ sha: string }>(`/repos/${repo().owner}/${repo().repo}/git/trees`, {
    method: "POST",
    json: { base_tree: head.tree, tree: blobs.map((blob) => ({ path: blob.path, mode: "100644", type: "blob", sha: blob.sha })) },
  });
  if (!tree.ok) return { ok: false, reason: tree.reason };

  const commit = await gh<{ sha: string; html_url?: string }>(
    `/repos/${repo().owner}/${repo().repo}/git/commits`,
    {
      method: "POST",
      json: {
        message: options.message,
        tree: tree.data.sha,
        parents: [head.sha],
        author: { name: options.authorName, email: options.authorEmail, date: new Date().toISOString() },
      },
    },
  );
  if (!commit.ok) return { ok: false, reason: commit.reason };

  // The branch may have moved while this commit was being built; a
  // fast-forward-only ref update says so rather than silently dropping it.
  const updated = await gh(`/repos/${repo().owner}/${repo().repo}/git/refs/${ref}`, {
    method: "PATCH",
    json: { sha: commit.data.sha, force: false },
  });
  if (!updated.ok) {
    return { ok: false, reason: `The branch moved while the update was being committed: ${updated.reason}` };
  }

  return {
    ok: true,
    sha: commit.data.sha,
    commitUrl: `https://github.com/${repo().owner}/${repo().repo}/commit/${commit.data.sha}`,
  };
}

export type GitHubHistoryEntry = {
  sha: string;
  date: string;
  author: string;
  message: string;
  url: string;
};

/** The commits that touched any of `paths`, newest first - the version history. */
export async function commitHistory(
  paths: readonly string[],
  limit = 30,
): Promise<GitHubHistoryEntry[]> {
  if (!isGitHubCommitConfigured() || paths.length === 0) return [];
  // The commits API takes one `path` per call - repeats are ignored, not
  // ORed - so the FTP's history is one answer per section file, merged here.
  const answers = await Promise.all(
    paths.map(async (path) => {
      const query = new URLSearchParams({ path, per_page: String(limit) });
      const result = await gh<
        {
          sha: string;
          html_url: string;
          commit: { message: string; author: { name: string; date: string } };
        }[]
      >(`/repos/${repo().owner}/${repo().repo}/commits?${query.toString()}`);
      return result.ok ? result.data : [];
    }),
  );
  const bySha = new Map<string, GitHubHistoryEntry>();
  for (const entry of answers.flat()) {
    if (!bySha.has(entry.sha)) {
      bySha.set(entry.sha, {
        sha: entry.sha,
        date: entry.commit.author.date,
        author: entry.commit.author.name,
        message: entry.commit.message.split("\n")[0],
        url: entry.html_url,
      });
    }
  }
  return [...bySha.values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/** One file's content as of one commit - what "look at this version" shows. */
export async function fileAtCommit(path: string, sha: string): Promise<string | null> {
  if (!isGitHubCommitConfigured()) return null;
  const result = await gh<{ content: string; encoding: string }>(
    `/repos/${repo().owner}/${repo().repo}/contents/${path}?ref=${sha}`,
  );
  if (!result.ok || result.data.encoding !== "base64") return null;
  return Buffer.from(result.data.content, "base64").toString("utf8");
}
