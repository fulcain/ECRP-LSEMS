#!/usr/bin/env node
/**
 * Asserts the app <-> extension handoff, which is the half of the browser
 * extension that has no DOM in it: the app posts a message, the bridge stores it
 * as the pending post and answers, and the app can ask what is queued.
 *
 *   npm run extension:check
 *
 * It also pins the rule for choosing a target: a tool's own post link wins, a
 * listing (`viewforum.php`) gives way to the topic the member pasted, and no
 * link at all means the post fills whatever editor is open.
 *
 * Everything below is a stub browser: the two content scripts are evaluated
 * exactly as Chrome injects them, and `window.postMessage` fans out to every
 * listener the way a real window does - which is what makes a bridge that
 * answers its own message a failing test rather than a spinning tab.
 */
import { readFileSync, readdirSync } from "node:fs";

const listeners = [];
const store = {};
let workerMessages = 0;

const windowStub = {
  location: {
    origin: "https://ecrp-ftd.vercel.app",
    href: "https://ecrp-ftd.vercel.app/divisions/bls",
  },
  addEventListener(type, fn) {
    if (type === "message") listeners.push(fn);
  },
  postMessage(data) {
    for (const fn of [...listeners]) fn({ source: windowStub, data });
  },
};

const local = {
  async get(key) {
    return key in store ? { [key]: store[key] } : {};
  },
  async set(values) {
    Object.assign(store, values);
  },
  async remove(key) {
    delete store[key];
  },
};

globalThis.window = windowStub;
globalThis.document = {
  readyState: "complete",
  documentElement: {
    dataset: {},
    setAttribute(name, value) {
      this[name] = value;
    },
  },
  addEventListener() {},
};
globalThis.chrome = {
  storage: { local },
  runtime: {
    // Present only in a live extension context; `isContextAlive` reads it.
    id: "stub-extension-id",
    sendMessage() {
      workerMessages += 1;
    },
  },
};
globalThis.sessionStorage = { getItem: () => null, setItem() {} };

const evaluate = (file) => (0, eval)(readFileSync(file, "utf8"));
const manifest = JSON.parse(readFileSync("extension/manifest.json", "utf8"));

evaluate("extension/src/shared.js");
// The version is written down twice - in the manifest Chrome reads and in
// `shared.js`, which answers the app with it - so they are checked here.
const sharedVersion = globalThis.LSEMS.VERSION;
evaluate("extension/src/app-bridge.js");

// Imported after the stubs, because the helper pings the bridge on load.
const app = await import("@/app/helpers/forumHandoff");

/** Let the async halves of the protocol finish. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

let failures = 0;
let checks = 0;
const expect = (label, actual, wanted) => {
  checks += 1;
  const ok = JSON.stringify(actual) === JSON.stringify(wanted);
  if (!ok) failures += 1;
  console.log(
    `${ok ? "ok  " : "FAIL"}  ${label}` +
      (ok
        ? ""
        : `\n        got  ${JSON.stringify(actual)}\n        want ${JSON.stringify(wanted)}`),
  );
};

let status = null;
app.onForumPosterStatus((next) => {
  status = next;
});

await tick();
expect("shared.js and the manifest agree on the version", sharedVersion, manifest.version);
expect("the bridge answers the app's ping", app.isForumPosterInstalled(), true);
expect(
  "it marks <html> so the app can see it without a round trip",
  document.documentElement["data-lsemsExtension"],
  manifest.version,
);
expect("nothing is queued to start with", status?.pending ?? null, null);

// Two installs answer on one page, and only the version list shows it. An older
// copy is what keeps throwing errors from code the repo no longer has.
let versionsSeen = [];
app.onForumPosterVersions((versions) => {
  versionsSeen = versions;
});
expect("one install reports one version", versionsSeen, [sharedVersion]);
windowStub.postMessage({ __lsems: "lsems:ready", version: "1.1.0" });
await tick();
expect("a second install is reported alongside it", versionsSeen, ["1.1.0", sharedVersion]);

const body = "[b]Rank Adjustment[/b]\n[b]Name:[/b] CeeCee Rhodes";
const handedOff = app.handOffForumPost(
  {
    subject: "Rank Adjustment | CeeCee Rhodes",
    url: "https://gov.eclipse-rp.net/posting.php?mode=post&f=573",
    feature: "the promotion processor",
  },
  body,
);

expect("the app is told it was collected", handedOff, true);
await tick();

expect("the title is queued", store.pendingPost?.subject, "Rank Adjustment | CeeCee Rhodes");
expect("the body is queued", store.pendingPost?.bbcode, body);
expect(
  "the target is queued",
  store.pendingPost?.url,
  "https://gov.eclipse-rp.net/posting.php?mode=post&f=573",
);
expect("it remembers which tool sent it", store.pendingPost?.feature, "the promotion processor");
expect("the toolbar badge was refreshed", workerMessages > 0, true);
expect("the app's status names the queued post", status?.pending?.subject, "Rank Adjustment | CeeCee Rhodes");

// A title-only copy (workflow steps that copy just a subject) carries no body.
app.handOffForumPost({ subject: "Reinstatee Profile | John Smith", bbcode: "" }, "Reinstatee Profile | John Smith");
expect("a title-only copy keeps the body empty", store.pendingPost?.bbcode, "");
expect("a title-only copy replaces the subject", store.pendingPost?.subject, "Reinstatee Profile | John Smith");

/* ---- one post per step: title and body together ---- */
// A tool that knows a step's title hands it over from every one of that step's
// buttons, so a posting page fills the subject and the body together.
const TARGET = "https://gov.eclipse-rp.net/posting.php?mode=post&f=573";

app.handOffForumPost(
  { subject: "Rank Adjustment | CeeCee Rhodes", url: TARGET, feature: "the promotion processor" },
  "[b]Rank Adjustment[/b]",
);
await tick();
expect("a step's title is held", store.pendingPost?.subject, "Rank Adjustment | CeeCee Rhodes");
expect("with its body", store.pendingPost?.bbcode, "[b]Rank Adjustment[/b]");

// A step that only copies a bare title (some workflow steps do) sends no body.
// It must not borrow the previous step's: a stale body under a fresh title is
// worse than an empty editor, and pressing Fill proves which one it is.
app.handOffForumPost(
  { subject: "Reinstatement | CeeCee Rhodes", url: TARGET, feature: "the promotion processor" },
  "",
);
await tick();
expect("a body-less step keeps its own title", store.pendingPost?.subject, "Reinstatement | CeeCee Rhodes");
expect("and carries no body from the step before it", store.pendingPost?.bbcode, "");

/* ---- telling a copied title from a copied body ---- */
const looksLikeTitle = globalThis.LSEMS.looksLikeTitle;
expect("a bare workflow title reads as a title", looksLikeTitle("Rank Adjustment | CeeCee Rhodes"), true);
expect("a BBCode body does not", looksLikeTitle("[b]Rank Adjustment[/b]\n[b]Name:[/b] X"), false);
expect("a short tag opener does not", looksLikeTitle("[size=150]x[/size]"), false);
expect("several lines do not", looksLikeTitle("LOA Request\nName: X"), false);
expect("an empty clipboard does not", looksLikeTitle("   "), false);
expect("nor does a wall of text", looksLikeTitle("x".repeat(200)), false);
expect("but a plain sentence does", looksLikeTitle("Normal BLS Course Reports | 25/SEP/2026"), true);

/* ---- nothing is ever filled behind the member's back ---- */
// Filling used to happen on arrival: the clipboard was read on a page nobody
// prepared, and a prepared post was written in as the page opened. Both were
// wrong in the same way - a forum Preview reloads the page with your text in it,
// and "this page just loaded" cannot be told apart from "this page just
// reloaded" - so every fill is a click now. This is the structural half of that
// promise: no auto-fill setting, no unasked branch, no guard for one.
const fillSource = readFileSync("extension/src/forum-fill.js", "utf8");
expect(
  "the clipboard fill is always explicit",
  /function fillFromClipboard\(surface, shadow\)/.test(fillSource),
  true,
);
expect("no unasked clipboard pass is left", /if \(autoFill\)/.test(fillSource), false);
expect("nothing is written into a page on arrival", /autoFill/.test(fillSource), false);
expect("the auto-fill setting is gone with it", "autoFill" in globalThis.LSEMS.DEFAULT_SETTINGS, false);
expect("the guard for an unasked paste is gone with it", "looksLikePost" in globalThis.LSEMS, false);

// A payload with nothing in it must never wipe a good queued post.
const queued = { ...store.pendingPost };
app.handOffForumPost({}, "");
expect("an empty handoff changes nothing", { ...store.pendingPost }, queued);

/* ---- a page whose extension was reloaded underneath it ---- */
// Chrome revokes the APIs of a content script already on the page, leaving
// `chrome` without `storage`. Every helper has to survive that: one that threw
// "Cannot read properties of undefined (reading 'local')" is what took the bar
// down, and a bridge that answered anyway is what made the app blame the member.
expect("a live context reports itself alive", globalThis.LSEMS.isContextAlive(), true);

const liveStorage = globalThis.chrome.storage;
const liveRuntime = globalThis.chrome.runtime;
// A reload takes both: the storage area and the runtime identity that proves
// which extension this script belongs to.
globalThis.chrome.storage = {};
globalThis.chrome.runtime = { sendMessage() { workerMessages += 1; } };

expect("the context is reported as gone", globalThis.LSEMS.isContextAlive(), false);
expect("storage is reported missing", globalThis.LSEMS.storageArea(), null);
expect("settings fall back to their defaults", (await globalThis.LSEMS.getSettings()).clearAfterFill, true);
expect("a pending post reads as none", await globalThis.LSEMS.getPending(), null);
expect(
  "saving reports failure instead of pretending",
  await globalThis.LSEMS.setPending({ id: "x", subject: "x", bbcode: "x" }),
  null,
);
expect("clearing is a no-op rather than a throw", await globalThis.LSEMS.clearPending(), undefined);

status = null;
const held = { ...store.pendingPost };
app.handOffForumPost({ subject: "Rank Adjustment | CeeCee Rhodes" }, "body");
await tick();
expect("a stale bridge reports itself as not alive", status?.alive, false);
expect("and it did not write anything", { ...store.pendingPost }, held);

// And the harsher version of the same thing: no `chrome` at all, which is what
// opening popup.html straight from disk looks like.
delete globalThis.chrome;
expect("with no chrome at all, storage reads as absent", globalThis.LSEMS.storageArea(), null);
expect("and a pending post is still just null", await globalThis.LSEMS.getPending(), null);
expect("and the context reads as gone, not as an error", globalThis.LSEMS.isContextAlive(), false);
globalThis.chrome = { storage: { local }, runtime: { sendMessage() { workerMessages += 1; } } };

globalThis.chrome.storage = liveStorage;
globalThis.chrome.runtime = liveRuntime;
expect("and a live context is back once the page reloads", globalThis.LSEMS.isContextAlive(), true);
// Leave the harness healthy, so the summary line below describes a normal page.
app.requestForumPosterStatus();
await tick();

/* ---- which page a post belongs on ---- */
const POSTING = "https://gov.eclipse-rp.net/posting.php?mode=post&f=573";
const TOPIC = "https://gov.eclipse-rp.net/viewtopic.php?t=99";
const LISTING = "https://gov.eclipse-rp.net/viewforum.php?f=605";
const COMPOSE = "https://gov.eclipse-rp.net/ucp.php?i=pm&mode=compose";

expect("a tool's own posting link is the target", app.pickPostTarget(POSTING, TOPIC), POSTING);
expect("a topic link the member filled in wins over a listing", app.pickPostTarget(LISTING, TOPIC), TOPIC);
expect("with no topic link, the tool's listing is all we have", app.pickPostTarget(LISTING, ""), LISTING);
expect("the PM composer counts as a target", app.pickPostTarget(COMPOSE, null), COMPOSE);
expect("no link anywhere leaves the post untargeted", app.pickPostTarget(undefined, null), undefined);

/* ---- one place reads storage, and it is the guarded one ---- */
// Every file that touched `chrome.storage` directly is how "Cannot read
// properties of undefined (reading 'local')" got onto a member's console, and a
// stale copy of that code kept replaying it long after the fix shipped. So the
// rule is structural: the helpers in shared.js are the only way in.
const sources = [
  ...readdirSync("extension/src").map((name) => `extension/src/${name}`),
  ...readdirSync("extension/popup").map((name) => `extension/popup/${name}`),
]
  .filter((name) => name.endsWith(".js"))
  .map((path) => ({ name: path, code: readFileSync(path, "utf8") }));

const directStorage = sources.filter(
  (file) => !file.name.endsWith("shared.js") && /chrome\.storage/.test(file.code),
);
expect(
  "only shared.js touches chrome.storage directly",
  directStorage.map((file) => file.name),
  [],
);
const guarded = sources.find((file) => file.name.endsWith("shared.js"));
expect(
  "shared.js has the guarded accessor",
  /LSEMS\.storageArea = function/.test(guarded.code),
  true,
);
// The old shape, and the one that crashed: a helper calling straight into
// `chrome.storage.local.get(...)` without asking whether it is there.
expect(
  "and never calls into storage directly",
  /chrome\.storage\.local\.(get|set|remove)\(/.test(guarded.code),
  false,
);

/* ---- the two archive shapes, which are what a release actually ships ---- */
const { readExtensionFiles } = await import("@/lib/extension-download");
const flat = (await readExtensionFiles({ prefix: "", runtimeOnly: true })).map(
  (file) => file.name,
);
const nested = (await readExtensionFiles()).map((file) => file.name);
const chromiumPack = await readExtensionFiles({ chromium: true });
const chromiumManifestText = JSON.parse(
  new TextDecoder().decode(chromiumPack.find((f) => f.name.endsWith("manifest.json")).data),
);
const fullManifest = JSON.parse(readFileSync("extension/manifest.json", "utf8"));
expect(
  "the chromium download carries no gecko settings",
  chromiumManifestText.browser_specific_settings,
  undefined,
);
expect(
  "the chromium download names only the service worker",
  chromiumManifestText.background,
  { service_worker: fullManifest.background.service_worker },
);
expect(
  "the chromium download keeps the version",
  chromiumManifestText.version,
  fullManifest.version,
);

// The Web Store rejects a nested folder; it does not care where in the file
// order the manifest sits, so this asserts the shape, not a position.
expect("the store archive puts manifest.json at the root", flat.includes("manifest.json"), true);
expect(
  "nothing in it is wrapped in a folder",
  flat.some((name) => name.startsWith("lsems-forum-poster/")),
  false,
);
expect("the store archive leaves the docs out", flat.some((name) => name.endsWith(".md")), false);
expect(
  "every icon the manifest names is in it",
  [...Object.values(manifest.icons), ...Object.values(manifest.action.default_icon)].every(
    (icon) => flat.includes(icon),
  ),
  true,
);
expect("the toolbar icon the manifest names exists", manifest.action.default_icon["16"], "icons/icon-16.png");
expect(
  "the hand install is one folder",
  nested.length > 0 && nested.every((name) => name.startsWith("lsems-forum-poster/")),
  true,
);
// Listing art lives in extension/store/, which is uploaded by hand - neither
// archive should carry it into a member's browser.
expect(
  "the store upload leaves the listing art out",
  flat.some((name) => name.startsWith("store/")),
  false,
);
expect(
  "the hand install leaves the listing art out",
  nested.some((name) => name.includes("/store/")),
  false,
);

console.log(`\n${checks - failures}/${checks} checks passed`);
console.log(`the installer page would show: ${JSON.stringify(status)}`);
if (failures > 0) process.exitCode = 1;
