/**
 * Hands a prepared GOV post to the LSEMS Forum Poster browser extension, which
 * holds it until the member presses Fill on the posting or PM page.
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
        source: PAGE_SOURCE,
      },
    },
    window.location.origin,
  );
  return installed;
}

/**
 * The message a copy button shows. A post handed to the extension says so, and
 * says what to do with it - the fill is a click on the GOV page, never something
 * that happens on its own; a post that nobody collected says so too, once a
 * session, because a silent "copied" is what an extension that isn't running
 * looks like from here.
 */
let nudgeShown = false;

export function forumPostToast(isHandedOff: boolean, fallback: string): string {
  if (isHandedOff) return "Copied - press Fill on the GOV page to put it in.";
  if (nudgeShown) return fallback;
  nudgeShown = true;
  return `${fallback} (No browser extension detected - install it from Resources → Browser Extension to have GOV filled for you.)`;
}
