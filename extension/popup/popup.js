const els = {
  version: document.getElementById("version"),
  empty: document.getElementById("empty"),
  saved: document.getElementById("saved"),
  feature: document.getElementById("feature"),
  subject: document.getElementById("subject"),
  target: document.getElementById("target"),
  recipientRow: document.getElementById("recipientRow"),
  recipient: document.getElementById("recipient"),
  preview: document.getElementById("preview"),
  open: document.getElementById("open"),
  copy: document.getElementById("copy"),
  clear: document.getElementById("clear"),
  clearAfterFill: document.getElementById("clearAfterFill"),
  status: document.getElementById("status"),
};

const PREVIEW_LIMIT = 700;

function say(message, isError) {
  els.status.textContent = message;
  els.status.className = "status" + (isError ? " error" : "");
}

function targetLabel(url) {
  if (!url) return "Whatever posting page you open";
  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;
    if (params.get("mode") === "compose") return "GOV private message";
    if (params.get("f")) return `GOV section f=${params.get("f")}`;
    if (params.get("t")) return `GOV topic t=${params.get("t")}`;
    return parsed.hostname;
  } catch {
    return url;
  }
}

/** Only a posting/PM page can be auto-filled, so only those get the button. */
function openableUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const posting = parsed.pathname.includes("posting.php");
    const compose = parsed.pathname.includes("ucp.php");
    return posting || compose ? url : "";
  } catch {
    return "";
  }
}

async function render() {
  els.version.textContent = `v${LSEMS.VERSION}`;

  // Storage is missing when this page is not running as an extension at all -
  // popup.html opened from disk, or a copy whose extension was reloaded. Say
  // that rather than "nothing prepared yet", which would be a wrong answer.
  if (!LSEMS.storageArea()) {
    els.empty.hidden = false;
    els.saved.hidden = true;
    const [line, hint] = els.empty.querySelectorAll("p");
    if (line) line.textContent = "This page is not running with the extension's storage.";
    if (hint) {
      hint.textContent =
        "Open the popup from the browser toolbar, and reload the tab if the extension was just updated.";
    }
    return;
  }

  const [pending, settings] = await Promise.all([LSEMS.getPending(), LSEMS.getSettings()]);

  els.clearAfterFill.checked = settings.clearAfterFill;

  if (!pending) {
    els.empty.hidden = false;
    els.saved.hidden = true;
    return;
  }

  els.empty.hidden = true;
  els.saved.hidden = false;
  els.feature.textContent = pending.feature ? `Prepared from ${pending.feature}` : "Prepared post";
  els.subject.textContent = pending.subject || "-";
  els.target.textContent = targetLabel(pending.url);
  els.recipientRow.hidden = !pending.recipient;
  els.recipient.textContent = pending.recipient;
  els.preview.textContent =
    pending.bbcode.length > PREVIEW_LIMIT
      ? `${pending.bbcode.slice(0, PREVIEW_LIMIT)}\n…`
      : pending.bbcode || "(no body)";

  const url = openableUrl(pending.url);
  els.open.disabled = !url;
  if (url) {
    els.open.onclick = () => {
      chrome.tabs.create({ url });
      window.close();
    };
  }
}

els.copy.onclick = async () => {
  const pending = await LSEMS.getPending();
  if (!pending) return;
  try {
    await navigator.clipboard.writeText(pending.bbcode || pending.subject);
    say("BBCode copied to the clipboard.");
  } catch {
    say("Couldn't copy - check the clipboard permission.", true);
  }
};

els.clear.onclick = async () => {
  await LSEMS.clearPending();
  LSEMS.syncBadge();
  say("Cleared.");
  await render();
};

for (const [key, input] of [["clearAfterFill", els.clearAfterFill]]) {
  input.addEventListener("change", async () => {
    await LSEMS.saveSettings({ [key]: input.checked });
    say("Saved.");
  });
}

render();
