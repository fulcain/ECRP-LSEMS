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
import { divisions } from "@/app/constants/divisions";
import { DISCUSSION_BOARDS } from "@/app/constants/divisions/discussion-boards";

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

/* ---- pasted once, and only for the click that asked ---- */
// A Copy & Open marks its post (`autoFill`), and the page it opens pastes it in
// once: the fill spends the post, so a forum Preview - which reloads the page
// with your text in it - or reopening the page finds it already pasted and
// leaves the editor alone. Pasting it again takes another Copy & Open. Nothing
// else is written into a page on arrival, and the clipboard is still only read
// when somebody asks for it.
const fillSource = readFileSync("extension/src/forum-fill.js", "utf8");
const sharedSource = readFileSync("extension/src/shared.js", "utf8");
expect(
  "the clipboard fill is always explicit",
  /function fillFromClipboard\(surface, shadow\)/.test(fillSource),
  true,
);
expect(
  "only a marked post pastes itself into a page",
  /if \(!payload\.autoFill \|\| payload\.filledAt\)/.test(fillSource),
  true,
);
expect(
  "a fill spends the post through one shared path",
  /void spendPost\(payload\)/.test(fillSource) && /LSEMS\.markFilled\(payload\.id\)/.test(fillSource),
  true,
);
expect("and nothing else clears or forgets it", /forgetWhenAsked/.test(fillSource), false);
expect(
  "the confirmation of an unasked paste goes away by itself",
  /state\.transient/.test(fillSource) && /CONFIRM_MS = 3000/.test(fillSource),
  true,
);
expect("an editor with nothing prepared is left alone", /renderClipboardBar\(surface, true\)/.test(fillSource), true);
// Prosilver's quick reply is `<form id="qr_postform">`, so a check for the
// board's own spelling of "quickreply" never fires and a filled reply reports
// itself as a full posting form instead.
expect(
  "a topic's quick reply is recognised by the forum's own form id",
  /\^\(qr_\|quickreply\)\/i\.test\(form\.id/.test(fillSource),
  true,
);
// A reply is prepared as `topic:<t>` and the editor that serves it reads
// `post:<section>:<t>`, so the two keys are never equal: the topic has to be
// pulled out of whichever shape each side has. Comparing a fixed field position
// is what pasted nothing into a topic's quick reply.
expect(
  "a topic is compared by topic, not by key shape",
  /function topicId\(key\)/.test(fillSource) &&
    /surface\.topicId === topicId\(wanted\)/.test(fillSource),
  true,
);
// phpBB sends the topic in a hidden field, and a quick reply's action need only
// name the section - so the hidden field comes first, the action second, and the
// page's own URL last. Reading the action alone is what pasted nothing into a
// reply, which is the one page a member is most likely to be looking at.
expect(
  "the topic is read from the form's hidden field before anything else",
  /input\[name="topic_id"\]/.test(fillSource) &&
    /topicId: formTopic \|\| topicId\(actionKey\) \|\| topicId\(pageKey\)/.test(fillSource),
  true,
);
expect(
  "a fill into a box the member cannot see says where it went",
  /function fillStatus\(surface, hidden\)/.test(fillSource) &&
    /fillStatus\(surface, !surface\.visible\)/.test(fillSource),
  true,
);
expect(
  "a marked post with no editor to land in says so instead of nothing",
  /function reportNoEditor\(/.test(fillSource) && /void reportNoEditor\(\)/.test(fillSource),
  true,
);

/* ---- a user group's page is filled too, and it is not a post ---- */
// The User Groups tool hands a member's name to a group's own manage page, which
// is not a posting form at all: the name belongs in the forum's `usernames` box.
// It goes in through the same path a post does - written, marked as filled, then
// spent - and the page is compared the same way, so a name prepared for one
// group can never land in another. One thing it must never do is press Submit:
// adding the member stays the member's click.
expect(
  "the extension knows the user group's member box",
  /textarea\[name="usernames"\]/.test(fillSource),
  true,
);
expect(
  "a page with no post editor falls back to it",
  /function findGroupSurface\(usernames\)/.test(fillSource) &&
    /return usernames \? findGroupSurface\(usernames\) : null;/.test(fillSource),
  true,
);
expect(
  "a group's own page is a target in its own right",
  /if \(group && url\.searchParams\.get\("i"\) === "ucp_groups"\) return "group:" \+ group;/.test(
    fillSource,
  ) &&
    /key\.indexOf\("group:"\) === 0/.test(fillSource),
  true,
);
expect(
  "so the group it was prepared for is the group it fills",
  /pageKey: targetKey\(action, location\.href\) \|\| targetKey\(location\.href\) \|\| ""/.test(
    fillSource,
  ) && /return wanted === surface\.pageKey;/.test(fillSource),
  true,
);
expect(
  "the member box is named for what it is",
  /surface\.kind === "group"/.test(fillSource),
  true,
);
expect(
  "and nothing presses Submit for the member",
  /\.click\(\)|\.submit\(\)|requestSubmit/.test(fillSource),
  false,
);

const userGroupTool = readFileSync("src/components/user-group-add.tsx", "utf8");
expect(
  "the User Groups tool hands the name to the page it opens",
  /handOffAndOpenForumPost\(/.test(userGroupTool),
  true,
);
expect(
  "and leaves it on the clipboard for a browser without the extension",
  /navigator\.clipboard\.writeText\(member\)/.test(userGroupTool),
  true,
);
// An older copy answers the app and fills a post, but knows nothing about a
// group's member box, which landed in 1.6.0 - so "the extension is installed"
// is not "it will fill this box". The tool compares the version it reports with
// the one the app ships and says which, instead of promising a fill that never
// arrives.
expect(
  "the tool asks which extension version is running",
  /onForumPosterReady\(/.test(userGroupTool),
  true,
);
expect(
  "and compares it with the one this app ships",
  /isVersionOlder\(posterVersion, shippedVersion\)/.test(userGroupTool) &&
    /shippedVersion/.test(
      readFileSync(
        "src/app/(routes)/resources/user-groups/page.tsx",
        "utf8",
      ),
    ),
  true,
);
expect(
  "an older copy is named, and not promised a fill it cannot do",
  /toast\.warn\(/.test(userGroupTool) &&
    /older than the v\$\{shippedVersion\}/.test(userGroupTool),
  true,
);
// A division's own groups are offered from the division's own page: the header
// button carries the set's label (read back from the declaration, so the
// forum's name for a division is not retyped) and the FTO creation card hands
// the applicant's name over with it.
expect(
  "the tool opens the list on the search a link brought",
  /USER_GROUP_SEARCH_PARAM/.test(userGroupTool),
  true,
);
expect(
  "each division page offers its own set",
  /<DivisionUserGroupsLink group="bls" \/>/.test(
    readFileSync("src/app/(routes)/divisions/bls/page.tsx", "utf8"),
  ) &&
    /<DivisionUserGroupsLink group="red" \/>/.test(
      readFileSync("src/app/(routes)/divisions/red/page.tsx", "utf8"),
    ),
  true,
);
expect(
  "and FTO creation hands the name over with the division's groups",
  /govGroupSetOf\("ftd"\)/.test(
    readFileSync("src/components/employee-stats/components/FtoCreationCard.tsx", "utf8"),
  ),
  true,
);
expect("the auto-fill setting is gone with it", "autoFill" in globalThis.LSEMS.DEFAULT_SETTINGS, false);
expect("the guard for an unasked paste is gone with it", "looksLikePost" in globalThis.LSEMS, false);
expect(
  "a filled post is kept, marked as pasted",
  /LSEMS\.markFilled = async function/.test(sharedSource),
  true,
);

app.handOffForumPost(
  { subject: "Rank Adjustment | CeeCee Rhodes", url: TARGET, autoFill: true },
  "[b]Rank Adjustment[/b]",
);
await tick();
expect("a Copy & Open marks its post", store.pendingPost?.autoFill, true);
expect("which has not been pasted yet", store.pendingPost?.filledAt, undefined);

const markedId = store.pendingPost?.id;
const marked = await globalThis.LSEMS.markFilled(markedId);
expect("a fill marks the post as pasted", typeof marked?.filledAt, "number");
expect("and the mark is the stored one", typeof store.pendingPost?.filledAt, "number");
expect(
  "marking a post that is no longer stored changes nothing",
  await globalThis.LSEMS.markFilled("a-post-from-another-page"),
  null,
);
expect(
  "and marking it twice keeps the first mark",
  (await globalThis.LSEMS.markFilled(markedId))?.filledAt,
  store.pendingPost?.filledAt,
);

expect(
  "the opening-handoff helper marks its post",
  app.handOffAndOpenForumPost({ subject: "Notice | Opened" }, "[b]Notice[/b]"),
  true,
);
await tick();
expect("so the page it opens pastes it once", store.pendingPost?.autoFill, true);

expect(
  "a plain Copy is not marked",
  app.handOffForumPost({ subject: "Notice | Plain copy" }, "[b]Notice[/b]"),
  true,
);
await tick();
expect("so it never pastes itself into a page", store.pendingPost?.autoFill, false);

// A button that opens the GOV page it hands to has to mark its post, or nothing
// on that page pastes - which is exactly how Copy & Open went quiet once, when
// only one of its callers set the flag. So the marking is structural: the one
// helper is the only place in the app that writes it.
const autoFillWriters = [];
const walkAppSources = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walkAppSources(path);
    else if (/\.(ts|tsx)$/.test(entry.name)) {
      if (/autoFill: true/.test(readFileSync(path, "utf8"))) {
        autoFillWriters.push(path);
      }
    }
  }
};
walkAppSources("src");
expect(
  "only the opening-handoff helper marks a post for auto-fill",
  autoFillWriters,
  ["src/app/helpers/forumHandoff.ts"],
);

// An opener must not leave a prepared post behind, and two of them open a page
// the member has not pasted a link for yet: the RED format page knows the
// posting page of two of its formats, and the FTI card opens the profile the
// copy beside it was prepared for. Both have to hand the post over as they open.
const redFormatsPage = readFileSync(
  "src/app/(routes)/divisions/red/page.tsx",
  "utf8",
);
expect(
  "a format that names its own posting page can Copy & Open without a pasted link",
  /govLink\.trim\(\) \|\| formatPostTarget/.test(
    redFormatsPage,
  ),
  true,
);
// The two feedback requests are letters to a person, not posts: they leave as
// private messages, so Copy & Open is the composer and the name the page asks
// for is the PM's recipient. A link pasted for some earlier post must not win
// over that - the member is writing to somebody, not replying on their thread.
expect(
  "a feedback request opens the private-message composer",
  /"feedback-request": GOV_PM_COMPOSE_URL/.test(redFormatsPage) &&
    /"frd-feedback-request": GOV_PM_COMPOSE_URL/.test(redFormatsPage),
  true,
);
expect(
  "and the name typed for it travels as the PM's recipient",
  /recipient: feedbackRecipient \|\| undefined/.test(redFormatsPage),
  true,
);
expect(
  "so a link pasted for another post cannot redirect it",
  /const formatUrl = isFeedbackRequest\s*\?\s*GOV_PM_COMPOSE_URL/.test(
    redFormatsPage,
  ),
  true,
);
const ftiPage = readFileSync(
  "src/app/(routes)/divisions/ftd/fti/page.tsx",
  "utf8",
);
expect(
  "opening the FTO profile pastes the body copied last into it",
  /if \(last\) handOffAndOpenForumPost\(\{ \.\.\.last\.post, url \}, last\.text\)/.test(
    ftiPage,
  ),
  true,
);

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
expect("settings fall back to their defaults", (await globalThis.LSEMS.getSettings()).clearAfterFill, false);
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

/* ---- every discussion board has somewhere for its post to land ---- */
// A board is only useful if the page it opens is one the extension can fill:
// a posting form in the section the board names. A typo'd forum id, or a board
// left pointing at a division that no longer exists, would otherwise only show
// up as a post that lands in the wrong place - or nowhere.
for (const [key, board] of Object.entries(DISCUSSION_BOARDS)) {
  expect(
    `${key} opens a GOV posting page`,
    /^https:\/\/gov\.eclipse-rp\.net\/posting\.php\?mode=post&f=\d+$/.test(board.url),
    true,
  );
  expect(
    `${key} is written in a division that exists`,
    divisions.some((division) => division.key === board.division),
    true,
  );
}

/* ---- every declared format is offered by its division's picker ---- */
// The paperwork picker is the only way a member reaches a format now, and its
// groups name each one by hand. A template no group lists would still build and
// would simply be unreachable from the page, so it is asserted here - the same
// way a board with nowhere to post is.
const PICKER_SOURCES = {
  BLS: {
    picker: "src/app/(routes)/divisions/bls/components/paperwork-documents.ts",
    templates: "src/app/templates/bls-formats",
  },
  RED: {
    picker: "src/app/(routes)/divisions/red/components/paperwork-documents.ts",
    templates: "src/app/templates/red-formats",
  },
};
for (const [name, { picker: pickerPath, templates }] of Object.entries(
  PICKER_SOURCES,
)) {
  // Read from source rather than importing: the template modules import their
  // types without `type`, which Node's loader cannot elide.
  const declared = readdirSync(templates)
    .filter((file) => file.endsWith(".ts") && file !== "types.ts")
    .flatMap((file) =>
      [
        ...readFileSync(`${templates}/${file}`, "utf8").matchAll(
          /^\s*value:\s*"([^"]+)",/gm,
        ),
      ].map((match) => match[1]),
    );
  expect(`${name} declares its formats`, declared.length > 0, true);

  const picker = readFileSync(pickerPath, "utf8");
  for (const value of declared) {
    expect(
      `${name} "${value}" is offered by the paperwork picker`,
      picker.includes(`"${value}"`),
      true,
    );
  }
}

/* ---- the upcoming-courses listing is one card whose change is its dropdown ---- */
// The listing is a single post edited in place, so the picker offers one card
// and the add/reschedule/cancel choice lives in the builder. Two halves have to
// agree for that to work: the card has to reach the builder, and the builder
// has to do something for each declared change - a change nothing generates is
// as unreachable as a card nothing opens.
const upcomingProcessor = readFileSync(
  "src/app/(routes)/divisions/bls/components/UpcomingCourseProcessor.tsx",
  "utf8",
);
const upcomingCourses = [
  ...(
    upcomingProcessor.match(/export const UPCOMING_COURSES:[\s\S]*?\n\];/)?.[0] ??
    ""
  ).matchAll(/value:\s*"([^"]+)",/g),
].map((match) => match[1]);
expect(
  "the upcoming-courses builder declares its actions",
  upcomingCourses.length > 0,
  true,
);
for (const value of upcomingCourses) {
  expect(
    `BLS upcoming-courses "${value}" is generated by the builder`,
    upcomingProcessor.includes(`courseType === "${value}"`),
    true,
  );
}
expect(
  "the upcoming-courses builder's dropdown offers its declared actions",
  upcomingProcessor.includes("UPCOMING_COURSES.map("),
  true,
);
const blsPicker = readFileSync(
  "src/app/(routes)/divisions/bls/components/paperwork-documents.ts",
  "utf8",
);
expect(
  "the BLS picker offers the upcoming-courses listing as one card",
  blsPicker.includes("value: BLS_LISTING") &&
    blsPicker.includes("label: UPCOMING_COURSES_LISTING.label"),
  true,
);
expect(
  "the BLS picker offers no separate card per listing change",
  !blsPicker.includes("upcomingCourseDocument("),
  true,
);
const blsPage = readFileSync(
  "src/app/(routes)/divisions/bls/page.tsx",
  "utf8",
);
expect(
  "the BLS page opens the listing builder for that one card",
  blsPage.includes("selectedDocument === BLS_LISTING"),
  true,
);

/* ---- the FTD paperwork picker offers every form the tab knows ---- */
// Same rule one division over: the FTD picker is the only list of forms on the
// page now, so a form the tab knows and the picker does not is unreachable.
const ftdSelector = readFileSync(
  "src/app/(routes)/divisions/ftd/paperwork/components/PaperworkTypeSelector.tsx",
  "utf8",
);
const ftdForms = [
  ...(
    readFileSync(
      "src/app/(routes)/divisions/ftd/paperwork/components/SessionContext.tsx",
      "utf8",
    ).match(/export type FormType =([\s\S]*?);/)?.[1] ?? ""
  ).matchAll(/"([^"]+)"/g),
].map((match) => match[1]);
expect("the FTD paperwork tab declares its forms", ftdForms.length > 0, true);
for (const form of ftdForms) {
  expect(
    `FTD "${form}" is offered by the paperwork picker`,
    ftdSelector.includes(`value: "${form}"`),
    true,
  );
}

/* ---- the instructors' board is offered where its readers work ---- */
// It is not a form on the paperwork tab - it belongs to the FTI page, where the
// instructors who post on it already are - so the loop above cannot see it. A
// board no page offers is the failure this file exists to catch. (`ftiPage` is
// the source read with the copy assertions above.)
expect(
  "the FTI page offers the FTD instructor discussion board",
  ftiPage.includes('boardKey="ftdInstructorBoard"'),
  true,
);

console.log(`\n${checks - failures}/${checks} checks passed`);
console.log(`the installer page would show: ${JSON.stringify(status)}`);
if (failures > 0) process.exitCode = 1;
