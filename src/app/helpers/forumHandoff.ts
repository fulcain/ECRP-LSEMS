/**
 * Hands a prepared GOV post to the LSEMS Forum Poster browser extension, which
 * holds it until the member presses Alt+Shift+F on the posting or PM page - or,
 * when the post is marked, pastes it in once as that page opens.
 *
 * The extension is optional: every helper still copies to the clipboard, so a
 * member without it keeps the old paste-it-yourself flow. The handoff travels as
 * a `postMessage` (see `extension/src/app-bridge.js`), which means the app never
 * needs the extension's id and the extension never reads the app's DOM.
 */

const PAGE_SOURCE = "lsems-app";
const MSG_HANDOFF = "lsems:handoff";
const MSG_PING = "lsems:ping";
const MSG_READY = "lsems:ready";
const MSG_STATUS = "lsems:status";
const MSG_STATUS_REQUEST = "lsems:status-request";
const MSG_SAVED = "lsems:saved";

type HandoffMessage = {
  __lsems?: string;
  version?: string;
  pending?: ForumPosterPending | null;
  /** Absent on extension versions before 1.2.1, which were always assumed alive. */
  alive?: boolean;
};

/** The post the extension is holding, as it reports it back. */
export type ForumPosterPending = {
  subject: string;
  url: string;
  feature: string;
  createdAt: number;
};

export type ForumPosterStatus = {
  version: string;
  pending: ForumPosterPending | null;
  /**
   * False when the copy running on this page lost its extension underneath it
   * (an update or reload after the tab opened). It still answers, so "it replied"
   * is not the same as "it works" - this is what tells the two apart.
   */
  alive: boolean;
};

export type ForumPost = {
  /** Title the post should carry. Omitted when the workflow has no title. */
  subject?: string;
  /** GOV private-message recipients, comma separated. */
  recipient?: string;
  /** The posting.php / ucp.php page the post belongs on. */
  url?: string;
  /** Shown in the extension popup, e.g. "the LOA processor". */
  feature?: string;
  /** Overrides the copied text as the post body, for callers that copy a title only. */
  bbcode?: string;
  /**
   * Set by Copy & Open: the page that button opens pastes the post in as it
   * loads, once. A plain Copy leaves it alone and it waits for the shortcut.
   */
  autoFill?: boolean;
};

/**
 * A URL the extension can act on: a section's posting form, a topic to reply to
 * (which is where the quick reply lives), or the PM composer.
 */
function isPostTarget(url: string): boolean {
  return /(posting\.php|viewtopic\.php|ucp\.php)/i.test(url);
}

/**
 * Which page a post belongs on, given what the tool offers and what the member
 * pasted. A tool's own link wins when it names a page a post can go on; when it
 * only names a listing (`viewforum.php`) or nothing at all, a topic link the
 * member filled in - the applicant's personnel file, the resignation post - is
 * the better answer, because that is where the content actually goes.
 */
export function pickPostTarget(
  actionUrl?: string | null,
  fallbackUrl?: string | null,
): string | undefined {
  if (actionUrl && isPostTarget(actionUrl)) return actionUrl;
  if (fallbackUrl && isPostTarget(fallbackUrl)) return fallbackUrl;
  return actionUrl ?? undefined;
}

/**
 * A workflow step copies either a post body or a bare title line. A title never
 * wraps a tag of its own, so a BBCode body is recognisable: it closes a tag or
 * opens one that takes a value.
 */
export function isTitleOnlyText(text: string): boolean {
  return (
    text.length <= 120 &&
    !text.includes("\n") &&
    !text.includes("[/") &&
    !/\[[a-z]+=/i.test(text)
  );
}

let installed = false;
let extensionVersion = "";
let lastStatus: ForumPosterStatus | null = null;
const readyListeners = new Set<(version: string) => void>();
const statusListeners = new Set<(status: ForumPosterStatus) => void>();
const versionListeners = new Set<(versions: string[]) => void>();

/**
 * Every version that has announced itself on this page. One extension answers
 * once per document, so two different versions means two copies are installed -
 * and the older one is exactly what keeps throwing `chrome.storage` errors from
 * code that is no longer in the repo. Naming both is the only way to see it.
 */
const announcedVersions = new Set<string>();

function post(data: Record<string, unknown>): void {
  window.postMessage(data, window.location.origin);
}

if (typeof window !== "undefined") {
  window.addEventListener("message", (event: MessageEvent<HandoffMessage>) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data) return;

    if (data.__lsems === MSG_READY) {
      installed = true;
      extensionVersion = data.version ?? "1";
      document.documentElement.dataset.lsemsExtension = extensionVersion;
      if (!announcedVersions.has(extensionVersion)) {
        announcedVersions.add(extensionVersion);
        const versions = [...announcedVersions].sort();
        for (const listener of versionListeners) listener(versions);
      }
      for (const listener of readyListeners) listener(extensionVersion);
      return;
    }

    if (data.__lsems === MSG_STATUS) {
      lastStatus = {
        version: data.version ?? extensionVersion,
        pending: data.pending ?? null,
        alive: data.alive !== false,
      };
      for (const listener of statusListeners) listener(lastStatus);
      return;
    }

    // A fresh handoff changes what the extension is holding, so ask again.
    if (data.__lsems === MSG_SAVED) requestForumPosterStatus();
  });
  // The bridge announces itself at document start, before this bundle exists.
  post({ __lsems: MSG_PING });
}

/** Ask the bridge what it is holding. It answers with a status message. */
export function requestForumPosterStatus(): void {
  if (typeof window === "undefined") return;
  post({ __lsems: MSG_STATUS_REQUEST });
}

/**
 * Subscribe to the extension's own report of itself - alive, and what it has
 * queued. Fires immediately once a status has been seen at least once.
 */
export function onForumPosterStatus(
  listener: (status: ForumPosterStatus) => void,
): () => void {
  if (lastStatus) listener(lastStatus);
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

/** True once the extension has answered this page. */
export function isForumPosterInstalled(): boolean {
  return installed;
}

/**
 * True when one version is older than another, compared a numeric part at a
 * time: an extension copy in the browser predates the app's by a minor bump
 * (`1.10.0` against `1.9.0`) as often as by a whole one, and string comparison
 * puts those the wrong way round. A copy that never announced a version is
 * treated as `1`, which is older than anything shipped.
 */
export function isVersionOlder(candidate: string, baseline: string): boolean {
  const parts = (version: string) =>
    version.split(".").map((part) => Number.parseInt(part, 10) || 0);
  const older = parts(candidate);
  const newer = parts(baseline);
  const length = Math.max(older.length, newer.length);
  for (let index = 0; index < length; index += 1) {
    const left = older[index] ?? 0;
    const right = newer[index] ?? 0;
    if (left !== right) return left < right;
  }
  return false;
}

/**
 * Every version answering on this page, oldest report first. More than one means
 * more than one copy is installed, which is a fault worth showing rather than a
 * detail: the stale copy is the one throwing errors in the console.
 */
export function onForumPosterVersions(
  listener: (versions: string[]) => void,
): () => void {
  if (announcedVersions.size > 0) listener([...announcedVersions].sort());
  versionListeners.add(listener);
  return () => {
    versionListeners.delete(listener);
  };
}

/**
 * Called when the extension answers, or immediately when it already has.
 * Returns an unsubscribe function. The answer is asynchronous even when the
 * extension is installed, so a component that reads the flag on mount would
 * always show "not installed" first.
 */
export function onForumPosterReady(
  listener: (version: string) => void,
): () => void {
  if (installed) listener(extensionVersion);
  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
}

/**
 * Sends the post to the extension. Returns whether the extension picked it up,
 * so callers can tell the member the GOV page will be filled for them.
 */
export function handOffForumPost(post: ForumPost, bbcode: string): boolean {
  if (typeof window === "undefined") return false;
  const body = post.bbcode ?? bbcode;
  if (!body.trim() && !post.subject?.trim()) return false;
  window.postMessage(
    {
      __lsems: MSG_HANDOFF,
      payload: {
        bbcode: body,
        subject: post.subject,
        recipient: post.recipient,
        url: post.url,
        feature: post.feature,
        autoFill: post.autoFill === true,
        source: PAGE_SOURCE,
      },
    },
    window.location.origin,
  );
  return installed;
}

/**
 * A handoff from a button that also opens the GOV page - a Copy & Open, whatever
 * it is called. Marking the post is what makes that page paste it in once as it
 * loads, so this is the only handoff form an opening button may use: a handoff
 * that leaves the member to open the page themselves must not mark it, or a post
 * they only copied would paste itself into a page nobody asked for.
 */
export function handOffAndOpenForumPost(
  post: ForumPost,
  bbcode: string,
): boolean {
  return handOffForumPost({ ...post, autoFill: true }, bbcode);
}

/**
 * The message a copy button shows, which depends on how the button hands over.
 * Copy & Open opens the page itself, so its post pastes itself in; every other
 * copy waits for the shortcut, because nothing on a GOV page pastes a post
 * nobody asked for. A post that nobody collected is said out loud, once a
 * session, because a silent "copied" is what an extension that isn't running
 * looks like from here.
 */
let nudgeShown = false;

export function forumPostToast(
  isHandedOff: boolean,
  fallback: string,
  /** True for Copy & Open, whose page pastes the post in as it opens. */
  autoFill = false,
): string {
  if (isHandedOff) {
    return autoFill
      ? "Copied - the GOV page that opened will paste it in for you."
      : "Copied - press Alt+Shift+F on the GOV page to paste it in.";
  }
  if (nudgeShown) return fallback;
  nudgeShown = true;
  return `${fallback} (No browser extension detected - install it from Resources → Browser Extension to have GOV filled for you.)`;
}
