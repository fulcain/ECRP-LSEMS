"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  AlertTriangle,
  BadgeCheck,
  Chrome,
  Copy,
  Download,
  Puzzle,
} from "lucide-react";

import {
  onForumPosterStatus,
  onForumPosterVersions,
  requestForumPosterStatus,
  type ForumPosterStatus,
} from "@/app/helpers/forumHandoff";
import { Button } from "@/components/ui/button";

/** Where a prepared post says it belongs - the same three cases the extension fills. */
function describeTarget(url: string): string {
  if (!url) return "any editor you open";
  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;
    if (params.get("mode") === "compose") return "the PM composer";
    if (params.get("f")) return `section f=${params.get("f")}`;
    if (params.get("t")) return `topic t=${params.get("t")}`;
    return parsed.pathname;
  } catch {
    return url;
  }
}

function describeAge(createdAt: number): string {
  if (!createdAt) return "";
  const minutes = Math.round((Date.now() - createdAt) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h ago` : `${Math.round(hours / 24)} d ago`;
}

type Props = {
  /** From the archive itself, so the page cannot promise a version it lacks. */
  version: string;
  fileCount: number;
  /** False when the deployment has no `extension/` folder to package. */
  available: boolean;
  /** Store listing, once there is one - the zip becomes the fallback. */
  storeUrl: string | null;
};

const EXTENSIONS_PAGE = "chrome://extensions";

/**
 * The button names the store it actually opens. Publishing to Edge is free and
 * to Chrome costs a one-off fee, so which listing exists is a decision that can
 * change - a hard-coded "Add to Chrome" would start lying the moment it did.
 */
function storeLabel(url: string): string {
  if (url.includes("chromewebstore.google.com")) return "Add to Chrome";
  if (url.includes("microsoftedge.microsoft.com")) return "Add to Edge";
  return "Install from the store";
}

/**
 * The install half of the page: whether this browser already has the extension,
 * the download, and the steps in the order Chrome asks for them.
 *
 * Detection is a message from the extension's content script, so it arrives a
 * moment after mount - the card says it is looking rather than guessing.
 */
export function ExtensionInstallCard({
  version,
  fileCount,
  available,
  storeUrl,
}: Props) {
  const [status, setStatus] = useState<ForumPosterStatus | null>(null);
  const [checked, setChecked] = useState(false);
  /** Every version answering on this page: more than one is two installs. */
  const [versions, setVersions] = useState<string[]>([]);
  const detected = status?.version ?? null;
  /** Answered, but this page's copy has no extension behind it any more. */
  const stale = Boolean(status && !status.alive);
  const duplicated = versions.length > 1;

  useEffect(() => {
    const unsubscribe = onForumPosterStatus(setStatus);
    const unsubscribeVersions = onForumPosterVersions(setVersions);
    // The bridge answers a ping on load; asking again covers a status that
    // arrived before this effect existed.
    requestForumPosterStatus();
    // Nothing answers on a browser without it, and silence is not a message.
    const settle = window.setTimeout(() => setChecked(true), 1500);
    return () => {
      unsubscribe();
      unsubscribeVersions();
      window.clearTimeout(settle);
    };
  }, []);

  const copyExtensionsPage = () => {
    navigator.clipboard
      .writeText(EXTENSIONS_PAGE)
      .then(() => toast.success("Copied - paste it into the address bar."))
      .catch(() => toast.error("Couldn't copy - type it instead."));
  };

  return (
    <section className="panel p-5">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-500/15">
            <Puzzle className="h-5 w-5 text-cyan-700 dark:text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Install the extension
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {storeUrl ? (
                <>
                  Add it once and every{" "}
                  <span className="font-medium text-foreground">
                    Copy &amp; Open
                  </span>{" "}
                  button starts writing the GOV page for you. Updates install
                  themselves.
                </>
              ) : (
                <>
                  Install it once and every{" "}
                  <span className="font-medium text-foreground">
                    Copy &amp; Open
                  </span>{" "}
                  button starts writing the GOV page for you.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2">
          {storeUrl ? (
            <>
              <Button
                asChild
                size="lg"
                className="border-emerald-600/50 bg-emerald-600 text-foreground transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500 hover:bg-emerald-500 active:scale-[0.98]"
              >
                <a href={storeUrl} target="_blank" rel="noreferrer">
                  <Chrome className="mr-2 h-4 w-4" />
                  {storeLabel(storeUrl)}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/api/extension" download>
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Or install the zip by hand
                </a>
              </Button>
            </>
          ) : (
            <Button
              asChild
              size="lg"
              className="border-emerald-600/50 bg-emerald-600 text-foreground transition-all duration-200 hover:scale-[1.02] hover:border-emerald-500 hover:bg-emerald-500 active:scale-[0.98]"
            >
              <a href="/api/extension" download>
                <Download className="mr-2 h-4 w-4" />
                Download extension
              </a>
            </Button>
          )}
          {available ? (
            <p className="text-[11px] text-muted-foreground">
              v{version} · {fileCount} files · zipped from the repo on every
              download
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              This deployment has no extension folder to package.
            </p>
          )}
        </div>
      </div>

      {/* Two copies is the fault behind most "it still does not work" reports:
          the older one is the copy throwing errors on GOV pages. */}
      {duplicated && (
        <div className="mt-4 rounded-xl border border-rose-300/30 bg-rose-50 p-3 dark:border-rose-500/20 dark:bg-rose-500/10">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="min-w-0 flex-1 text-xs text-muted-foreground">
              <p className="font-medium text-rose-700 dark:text-rose-300">
                Two copies of the extension are installed in this browser
              </p>
              <p className="mt-1">
                {versions.map((item) => `v${item}`).join(" and ")} both answer on
                this page. The older one cannot fill a post any more and is what
                keeps logging errors in the console - remove that card at{" "}
                <code className="font-mono">chrome://extensions</code> and keep
                only the newest.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Installed or not, answered by the extension itself. A copy that lost its
          extension answers too, which is why `alive` is part of the answer. */}
      <div
        className={`mt-4 rounded-xl border p-3 ${
          stale
            ? "border-amber-300/30 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10"
            : detected
              ? "border-emerald-300/20 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10"
              : "border-border bg-surface-hover/40"
        }`}
      >
        <div className="flex items-start gap-2.5">
          {stale ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          ) : detected ? (
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">
              {stale ? (
                <>
                  <span className="font-medium text-amber-700 dark:text-amber-300">
                    Installed, but this tab is out of date
                  </span>{" "}
                  - the extension was updated or reloaded after this page loaded,
                  so this copy cannot store anything. Reload the page (F5) and
                  try the button again.
                </>
              ) : detected ? (
                <>
                  <span
                    className={`font-medium ${
                      detected === version
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {detected === version
                      ? "Running in this browser"
                      : "An older copy is running"}
                  </span>{" "}
                  (v{detected}
                  {detected === version
                    ? ""
                    : `, this page has v${version} - unzip the download over the same folder and reload it`}
                  ) - Copy &amp; Open buttons hand the post over, ready for the Fill
                  button on that page.
                </>
              ) : checked ? (
                <>
                  Not detected in this browser. Follow the steps below; if it is
                  already installed, this tab was open before it - reload and
                  check again.
                </>
              ) : (
                "Looking for the extension…"
              )}
            </p>

            {/* The live half of the diagnosis: what the extension is holding. */}
            {status && (
              <p className="mt-1 text-xs">
                {status.pending ? (
                  <>
                    <span className="text-muted-foreground">
                      Last prepared post:{" "}
                    </span>
                    <span className="font-medium text-foreground">
                      {status.pending.subject || "(no title)"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      → {describeTarget(status.pending.url)}
                      {status.pending.feature
                        ? `, from ${status.pending.feature}`
                        : ""}
                      {status.pending.createdAt
                        ? ` · ${describeAge(status.pending.createdAt)}`
                        : ""}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    Nothing handed over yet - press any Copy or Copy &amp; Open
                    button in a tool and this line will name the post it sent.
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setChecked(false);
              requestForumPosterStatus();
              window.setTimeout(() => setChecked(true), 800);
            }}
            className="shrink-0 cursor-pointer rounded-md border border-border bg-surface-raised px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            Check again
          </button>
        </div>
      </div>

      {/* With a store listing this is the fallback; without one it is the install. */}
      <section
        className={
          storeUrl ? "mt-5 rounded-xl border border-border bg-surface-hover/30 p-3" : undefined
        }
      >
        {storeUrl && (
          <h3 className="text-xs font-medium text-foreground">
            Installing by hand instead (another browser, or if the store is
          blocked)
          </h3>
        )}

      <ol
        className={
          storeUrl ? "mt-3 space-y-3 text-sm" : "mt-5 space-y-3 text-sm"
        }
      >
        <Step index={1} title="Download and unzip">
          Chrome loads a <span className="font-medium">folder</span>, not a zip,
          so unzip it somewhere permanent - the extension is read from that
          folder every time the browser starts.
        </Step>

        <Step index={2} title="Open the extensions page">
          <code className="rounded-md bg-surface-hover px-1.5 py-0.5 font-mono text-xs text-foreground">
            {EXTENSIONS_PAGE}
          </code>{" "}
          <button
            type="button"
            onClick={copyExtensionsPage}
            className="ml-1 inline-flex cursor-pointer items-center gap-1 rounded-md border border-border bg-surface-raised px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>{" "}
          - browsers refuse to open it from a link, so paste it in the address
          bar. On Edge it is{" "}
          <code className="font-mono text-xs">edge://extensions</code>.
        </Step>

        <Step index={3} title="Turn on Developer mode">
          The toggle in the top-right corner of that page.
        </Step>

        <Step index={4} title="Load unpacked">
          Pick the unzipped{" "}
          <code className="font-mono text-xs">lsems-forum-poster</code> folder.
          The card that appears is the extension.
        </Step>

        <Step index={5} title="Try it">
          Open any tool with a Copy &amp; Open button, press it, and the GOV page
          it opens should already contain your post - title, recipients and all -
          with the cursor waiting in it.
        </Step>
      </ol>

      <p className="mt-4 rounded-xl border border-border bg-surface-hover/40 p-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {storeUrl ? "Updating a hand install:" : "Updating it:"}
        </span>{" "}
        download the zip again and unzip over the old folder, then press the
        reload arrow on the extension&apos;s card - a store install updates
        itself. Firefox works too (
        <code className="font-mono">about:debugging</code> → Load Temporary
        Add-on → pick <code className="font-mono">manifest.json</code>), but its
        manifest needs a gecko id first - ask before relying on it.
      </p>
      </section>
    </section>
  );
}

function Step({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-hover text-xs font-semibold text-muted-foreground">
        {index}
      </span>
      <p className="text-muted-foreground">
        <span className="font-medium text-foreground">{title}.</span> {children}
      </p>
    </li>
  );
}
