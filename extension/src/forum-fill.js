/**
 * Runs on gov.eclipse-rp.net. Fills the last post the app prepared into whatever
 * editor is on the page - the full posting form, the topic's quick reply, or the
 * PM composer - then shows a review bar.
 *
 * phpBB keeps raw BBCode in `textarea[name="message"]`, so writing the app's
 * BBCode there is exactly what pasting it by hand does.
 *
 * The selectors are the only theme-dependent part of the extension, and the
 * quick reply's form `action` is what tells us which section it posts into (the
 * page URL is just `viewtopic.php?t=…`). See README.md before changing them.
 */
(function () {
  var SELECTORS = {
    message: ['textarea[name="message"]', "#message"],
    subject: ['input[name="subject"]', "#subject"],
    recipient: ['input[name="username_list"]', "#username_list"],
    submit: ['input[name="post"]', 'button[name="post"]'],
  };

  var barHost = null;
  /** How long a confirmation of a paste nobody had to ask for stays. */
  var CONFIRM_MS = 3000;
  var confirmTimer = null;

  /** One stylesheet for both bars: the review bar and the clipboard one. */
  var BAR_CSS = [
    "<style>",
    "*{box-sizing:border-box;font-family:ui-sans-serif,system-ui,sans-serif;}",
    ".bar{width:310px;border-radius:14px;border:1px solid #1e293b;background:#0b1220;color:#e2e8f0;box-shadow:0 18px 40px rgba(2,6,23,.55);padding:12px;font-size:12px;line-height:1.45;}",
    ".head{display:flex;align-items:center;gap:8px;font-weight:600;}",
    ".dot{width:8px;height:8px;border-radius:999px;background:#22d3ee;box-shadow:0 0 8px #22d3ee;}",
    ".head .close{margin-left:auto;background:none;border:0;color:#64748b;font-size:16px;cursor:pointer;line-height:1;}",
    ".from{margin-top:2px;color:#64748b;font-size:10px;}",
    ".status{margin-top:8px;color:#94a3b8;}",
    ".status.ok{color:#34d399;}",
    ".status.warn{color:#fbbf24;}",
    ".subject{margin-top:6px;padding:6px 8px;border-radius:8px;background:#111c33;color:#a5f3fc;font-family:ui-monospace,monospace;word-break:break-word;}",
    ".actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}",
    "button{font:inherit;cursor:pointer;border-radius:8px;border:1px solid #1e293b;background:#16233c;color:#cbd5e1;padding:5px 9px;}",
    "button:hover{background:#1e2f4d;color:#fff;}",
    "button.primary{border-color:#0e7490;background:#0e7490;color:#fff;}",
    "button.primary:hover{background:#0891b2;}",
    ".hint{margin-top:8px;color:#64748b;font-size:11px;}",
    "kbd{border:1px solid #1e293b;border-radius:4px;background:#111c33;padding:0 4px;font-family:ui-monospace,monospace;font-size:10px;}",
    "</style>",
  ].join("");

  /** Whether the member can actually see an element. */
  function isVisible(el) {
    return !!el && (el.offsetParent !== null || el.getClientRects().length > 0);
  }

  /** Prefer a field the member can actually see: a page can carry two editors. */
  function firstMatch(selectors, root) {
    var scope = root || document;
    var found = null;
    for (var i = 0; i < selectors.length; i += 1) {
      var candidates = scope.querySelectorAll(selectors[i]);
      for (var j = 0; j < candidates.length; j += 1) {
        var el = candidates[j];
        if (isVisible(el)) return el;
        if (!found) found = el;
      }
    }
    return found;
  }

  /**
   * What a URL says it is: "post:<section>:<topic>" for a posting page (read from
   * the form's own action, so a quick reply on a topic page resolves to the topic
   * it replies to), "topic:<topic>" for a topic that is read rather than posted
   * to, and "pm" for the composer.
   */
  function targetKey(href, base) {
    try {
      var url = new URL(href, base || location.origin);
      if (url.hostname !== "gov.eclipse-rp.net") return null;
      if (url.pathname.indexOf("posting.php") !== -1) {
        return "post:" + (url.searchParams.get("f") || "") + ":" + (url.searchParams.get("t") || "");
      }
      if (url.pathname.indexOf("ucp.php") !== -1 && url.searchParams.get("mode") === "compose") {
        return "pm";
      }
      if (url.pathname.indexOf("viewtopic.php") !== -1) {
        var topic = url.searchParams.get("t");
        return topic ? "topic:" + topic : null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * The topic a target key names, whichever shape it has: `topic:<t>` on a topic
   * page, `post:<section>:<t>` on a posting form. Comparing the two has to go
   * through this - the raw keys are never equal, and a surface whose own key is a
   * topic key (a quick reply whose form action does not say where it posts) used
   * to compare an undefined third field against the topic id and paste nothing.
   */
  function topicId(key) {
    if (!key) return "";
    if (key.indexOf("topic:") === 0) return key.slice(6);
    var parts = key.split(":");
    return parts[2] || "";
  }

  function findSurface() {
    var message = firstMatch(SELECTORS.message);
    if (!message) return null;
    var form = message.form || message.closest("form");
    var host = form || document;
    var action = (form && form.getAttribute("action")) || location.href;
    var params = new URLSearchParams(location.search);
    var actionKey = targetKey(action, location.href) || "";
    var pageKey = actionKey || targetKey(location.href) || "";
    // phpBB posts the topic in a hidden field, and a quick reply's action need
    // only name the section: reading the topic off the action alone is what made
    // a reply match nothing at all. The field is the authority.
    var topicField = form ? form.querySelector('input[name="topic_id"]') : null;
    var formTopic =
      topicField && topicField.value ? String(topicField.value).trim() : "";
    return {
      kind: location.pathname.indexOf("ucp.php") !== -1 ? "pm" : "post",
      mode: (new URL(action, location.href).searchParams.get("mode")) || params.get("mode") || "",
      // Prosilver includes the quick reply as `<form id="qr_postform">`, so the
      // board's "quickreply" spelling is not the one that turns up.
      quickReply: !!(form && /^(qr_|quickreply)/i.test(form.id || "")),
      form: form,
      message: message,
      subject: firstMatch(SELECTORS.subject, host),
      recipient: firstMatch(SELECTORS.recipient, host),
      submit: firstMatch(SELECTORS.submit, host),
      pageKey: pageKey,
      // Where the topic comes from, best first: the form's own hidden field, the
      // topic the action names, and last the page's `viewtopic.php?t=…` - which
      // is all a script-submitted quick reply leaves to go on.
      topicId: formTopic || topicId(actionKey) || topicId(pageKey),
      visible: isVisible(message),
    };
  }

  function describeKey(key) {
    if (!key) return "this page";
    if (key === "pm") return "Private message";
    if (key.indexOf("topic:") === 0) return "Topic t=" + key.slice(6);
    var parts = key.split(":");
    if (parts[1]) return "Section f=" + parts[1];
    if (parts[2]) return "Topic t=" + parts[2];
    return "GOV post";
  }

  /**
   * Set a field the way a user would. phpBB's own scripts listen for input/
   * change, and the native setter bypasses any framework value tracking.
   */
  function setValue(el, value) {
    var proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var descriptor = Object.getOwnPropertyDescriptor(proto, "value");
    if (descriptor && descriptor.set) descriptor.set.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function fill(surface, payload) {
    var before = {
      subject: surface.subject ? surface.subject.value : "",
      message: surface.message.value,
      recipient: surface.recipient ? surface.recipient.value : "",
    };
    var wrote = false;

    if (surface.recipient && payload.recipient) {
      setValue(surface.recipient, payload.recipient);
      wrote = true;
    }
    if (surface.subject && payload.subject) {
      setValue(surface.subject, payload.subject);
      wrote = true;
    }
    if (payload.bbcode) {
      setValue(surface.message, payload.bbcode);
      wrote = true;
    }
    if (wrote) surface.message.dataset.lsemsFilled = payload.id;

    return { before: before, wrote: wrote };
  }

  /**
   * Put the caret in the post so it can be edited straight away, and ring the
   * Submit button so it is obvious which button finishes the job. Focus stays in
   * the editor: this extension never submits anything itself.
   */
  function placeCaret(surface) {
    try {
      surface.message.focus({ preventScroll: true });
      surface.message.scrollIntoView({ block: "center", behavior: "smooth" });
    } catch (error) {
      surface.message.focus();
    }
    if (surface.submit) {
      surface.submit.style.outline = "2px solid #22d3ee";
      surface.submit.style.outlineOffset = "2px";
    }
  }

  function renderBar(state) {
    var host = document.createElement("div");
    host.style.cssText = "all:initial;position:fixed;right:16px;bottom:16px;z-index:2147483647;";
    var shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = [
      BAR_CSS,
      '<div class="bar">',
      '<div class="head"><span class="dot"></span><span>LSEMS Poster</span><button class="close" data-act="dismiss" title="Hide for this post">×</button></div>',
      state.feature ? '<div class="from">Prepared from ' + state.feature + "</div>" : "",
      '<div class="status ' + state.statusClass + '" data-role="status">' + state.status + "</div>",
      state.subject ? '<div class="subject" data-role="subject"></div>' : "",
      // One action and the way back from it. Jump to editor is redundant (a
      // fill already puts the caret there), and Copy/Clipboard only duplicated
      // what the app's own buttons had just done. A confirmation of a paste the
      // page did by itself carries no actions at all: the post is already in.
      state.transient
        ? ""
        : '<div class="actions">' +
          (state.canUndo ? '<button data-act="undo">Undo</button>' : "") +
          "</div>",
      '<div class="hint">' + state.hint + "</div>",
      "</div>",
    ].join("");

    var subjectNode = shadow.querySelector('[data-role="subject"]');
    if (subjectNode) subjectNode.textContent = state.subject;

    shadow.querySelector('[data-act="dismiss"]').addEventListener("click", function () {
      dismiss(host);
    });

    if (state.canUndo) addUndo(shadow, state);

    document.body.appendChild(host);
    barHost = host;
    // A confirmation of a paste the page made by itself takes itself away: it
    // is news, not a control panel.
    if (state.transient) {
      clearTimeout(confirmTimer);
      confirmTimer = setTimeout(function () {
        dismiss(host);
      }, CONFIRM_MS);
    }
    return host;
  }

  /** Take a bar away, timer and reference included. */
  function dismiss(host) {
    clearTimeout(confirmTimer);
    if (host) host.remove();
    if (barHost === host) barHost = null;
  }

  function setStatus(shadow, text, className) {
    var node = shadow.querySelector('[data-role="status"]');
    if (!node) return;
    node.textContent = text;
    node.className = "status " + (className || "");
  }

  function addUndo(shadow, state) {
    if (!state.prefilled || shadow.querySelector('[data-act="undo"]')) return;
    var button = document.createElement("button");
    button.dataset.act = "undo";
    button.textContent = "Undo";
    button.addEventListener("click", function () {
      var before = state.prefilled;
      if (state.surface.subject) setValue(state.surface.subject, before.subject);
      if (state.surface.recipient) setValue(state.surface.recipient, before.recipient);
      setValue(state.surface.message, before.message);
      button.remove();
      setStatus(shadow, "Restored what was on the page before.", "");
    });
    shadow.querySelector(".actions").appendChild(button);
  }

  /**
   * The safety net. Every copy button in the app leaves a GOV post on the
   * clipboard, so an editor can be filled even when nothing was handed over -
   * the tool isn't wired yet, or the app is served from a host the bridge does
   * not run on. It is only ever reached because someone asked: the shortcut, or
   * a button on the bar.
   */
  async function fillFromClipboard(surface, shadow) {
    var text = "";
    try {
      text = await navigator.clipboard.readText();
    } catch (error) {
      // Reading is refused while the page has no focus, and the member asked for
      // this read, so silence would look like a broken button.
      setStatus(
        shadow,
        "Couldn't read the clipboard - check the extension's clipboard permission.",
        "warn",
      );
      return null;
    }
    if (!text || !text.trim()) {
      setStatus(shadow, "The clipboard is empty - copy from a tool first.", "warn");
      return null;
    }
    // A tool's Copy Title leaves just a title on the clipboard. With no BBCode in
    // it and an empty subject box in front of us, the subject is where it belongs:
    // pasting a title into the body is the one outcome nobody wants. No subject
    // field on this page means it is treated as a body, as before.
    var title = LSEMS.looksLikeTitle(text) && surface.subject ? text.trim() : "";
    var before = fill(surface, {
      id: "clipboard",
      bbcode: title ? "" : text,
      subject: title,
    }).before;
    setStatus(
      shadow,
      title
        ? "Title filled from the clipboard - the body is copied from a separate button."
        : "Filled from the clipboard - review, then press Submit.",
      "ok",
    );
    placeCaret(surface);
    return before;
  }

  /**
   * The bar for a page whose copy of the extension was replaced underneath it.
   * It offers no action, because nothing it could do would reach storage.
   */
  function renderStaleBar(surface) {
    var host = document.createElement("div");
    host.style.cssText = "all:initial;position:fixed;right:16px;bottom:16px;z-index:2147483647;";
    var shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = [
      BAR_CSS,
      '<div class="bar">',
      '<div class="head"><span class="dot"></span><span>LSEMS Poster</span><button class="close" data-act="dismiss" title="Hide">×</button></div>',
      '<div class="status warn" data-role="status">The extension was updated while this page was open.</div>',
      '<div class="actions">',
      '<button class="primary" data-act="reload">Reload this page</button>',
      "</div>",
      '<div class="hint">Reloading picks up the new copy, which still has the post you prepared. If this keeps happening, an older copy of the extension is also installed - remove it from <kbd>chrome://extensions</kbd>.</div>',
      "</div>",
    ].join("");

    shadow.querySelector('[data-act="dismiss"]').addEventListener("click", function () {
      dismiss(host);
    });
    shadow.querySelector('[data-act="reload"]').addEventListener("click", function () {
      location.reload();
    });

    document.body.appendChild(host);
    barHost = host;
    return host;
  }

  /**
   * The bar for a GOV editor nobody prepared a post for. The clipboard is read
   * only when this bar's button or the shortcut asks: a clipboard that still
   * holds an old post must never fill a page nobody asked to fill.
   */
  function renderClipboardBar(surface, fillNow) {
    var host = document.createElement("div");
    host.style.cssText = "all:initial;position:fixed;right:16px;bottom:16px;z-index:2147483647;";
    var shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = [
      BAR_CSS,
      '<div class="bar">',
      '<div class="head"><span class="dot"></span><span>LSEMS Poster</span><button class="close" data-act="dismiss" title="Hide">×</button></div>',
      '<div class="status" data-role="status">No post was handed over for this page.</div>',
      '<div class="actions">',
      '<button class="primary" data-act="clip">Fill from clipboard</button>',
      "</div>",
      '<div class="hint">Copy in the app, then press this to paste it here. <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> does the same thing from anywhere.</div>',
      "</div>",
    ].join("");

    shadow.querySelector('[data-act="dismiss"]').addEventListener("click", function () {
      dismiss(host);
    });

    shadow.querySelector('[data-act="clip"]').addEventListener("click", async function () {
      var before = await fillFromClipboard(surface, shadow);
      if (before) addUndo(shadow, { surface: surface, prefilled: before });
    });

    document.body.appendChild(host);
    barHost = host;
    // Only the shortcut lands here asking for a fill; arriving at a page does
    // not, so nothing is read until someone presses the button.
    if (fillNow) {
      void fillFromClipboard(surface, shadow).then(function (before) {
        if (before) addUndo(shadow, { surface: surface, prefilled: before });
      });
    }
    return host;
  }

  /**
   * A fill spends the post. Marking it is what makes it fill once: the mark
   * outlives the page, so a Preview, a reload or reopening the page finds a post
   * that has already been pasted and leaves the editor alone. Pasting it again
   * takes another Copy & Open in the app.
   */
  async function spendPost(payload) {
    if (payload && payload.id) await LSEMS.markFilled(payload.id);
    var settings = await LSEMS.getSettings();
    if (settings.clearAfterFill) {
      await LSEMS.clearPending();
    }
    LSEMS.syncBadge();
  }

  /** True when this page is where the prepared post belongs. */
  function matchesTarget(payload, surface) {
    var wanted = targetKey(payload.url);
    // Nothing specific saved, or a form that does not say where it posts.
    if (!wanted) return true;
    if (!surface.pageKey) return true;
    if (wanted.indexOf("topic:") === 0) {
      // Prepared to reply to a topic: only that topic's editor counts, whether it
      // is the quick reply or the full one.
      return surface.topicId === topicId(wanted);
    }
    return wanted === surface.pageKey;
  }

  /**
   * What a fill says it did. A box the member cannot see still submits - the text
   * is in the form - so saying where it went is the difference between "it worked"
   * and "nothing happened", which is exactly what a collapsed reply box looks
   * like from the outside.
   */
  function fillStatus(surface, hidden) {
    if (hidden) {
      return (
        "Filled the hidden " +
        (surface.quickReply ? "quick reply" : "editor") +
        " - open it to review, then press Submit."
      );
    }
    return surface.quickReply
      ? "Quick reply filled - review, then press Submit."
      : "Filled from the LSEMS app - review, then press Submit.";
  }

  /** The transient bar that confirms what the page just did to itself. */
  function confirmState(surface, payload, status, statusClass, hint) {
    return {
      surface: surface,
      payload: payload,
      feature: payload.feature || "",
      subject: payload.subject || "",
      prefilled: null,
      canUndo: false,
      transient: true,
      status: status,
      statusClass: statusClass,
      hint: hint,
    };
  }

  /**
   * The one pass that writes into a page on its own, and it only runs for a post
   * the member marked by pressing Copy & Open. A fill spends the post, so a forum
   * Preview, a reload or the same page opened again finds it already pasted and
   * leaves the editor alone - pasting it again takes another Copy & Open.
   *
   * Returns true when this page is done with. An empty read is not one of those:
   * the app stores the post from its own tab, which may still be loading this one.
   */
  async function autoFill() {
    var surface = findSurface();
    if (!surface) return false;

    // The extension was reloaded or updated under this page, so this copy has no
    // storage and no way to get any. Saying so is all that can be done here.
    if (!LSEMS.storageArea()) {
      renderStaleBar(surface);
      return true;
    }

    var payload = await LSEMS.getPending();
    if (!payload) return false;
    // A post nobody marked, or one that has already been pasted, is not this
    // page's business - and nothing appears on the page to say so.
    if (!payload.autoFill || payload.filledAt) return true;

    var value = surface.message.value.trim();
    var ours =
      surface.message.dataset.lsemsFilled === payload.id ||
      value === (payload.bbcode || "").trim();

    // A Copy & Open this page cannot serve says why, once, and then goes away.
    // Replacing a post somebody is editing, or a draft already in the editor, is
    // never what that click meant.
    if (surface.mode === "edit") {
      renderBar(
        confirmState(
          surface,
          payload,
          "This is an edit page, so nothing was pasted.",
          "warn",
          "<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> pastes it here anyway.",
        ),
      );
      return true;
    }
    if (value && !ours) {
      renderBar(
        confirmState(
          surface,
          payload,
          "This editor already has text, so nothing was pasted.",
          "warn",
          "<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> replaces it with the saved post.",
        ),
      );
      return true;
    }
    if (!matchesTarget(payload, surface)) {
      renderBar(
        confirmState(
          surface,
          payload,
          "Prepared for " +
            describeKey(targetKey(payload.url)) +
            ", and you are on " +
            describeKey(surface.pageKey) +
            ".",
          "warn",
          "<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> pastes it here anyway.",
        ),
      );
      return true;
    }

    fill(surface, payload);
    void spendPost(payload);
    placeCaret(surface);
    renderBar(
      confirmState(
        surface,
        payload,
        fillStatus(surface, !surface.visible),
        "ok",
        "Pasted once: a Preview or a reload leaves your edits alone.",
      ),
    );
    return true;
  }

  /**
   * A fill somebody asked for: the shortcut, or the toolbar popup. It writes what
   * is prepared - or what is on the clipboard when nothing is - and waits to be
   * dismissed, because that time the member asked for it outright.
   */
  async function run() {
    var surface = findSurface();
    if (!surface) return;
    if (!LSEMS.storageArea()) {
      renderStaleBar(surface);
      return;
    }
    var bar = shadowBar();
    if (bar) dismiss(bar);

    var payload = await LSEMS.getPending();
    if (!payload) {
      // Nothing prepared: the clipboard is the fallback, and this is the one
      // moment reading it is right - somebody just asked.
      renderClipboardBar(surface, true);
      return;
    }

    var matches = matchesTarget(payload, surface);
    var editing = surface.mode === "edit";
    var value = surface.message.value.trim();
    var ours =
      surface.message.dataset.lsemsFilled === payload.id ||
      value === (payload.bbcode || "").trim();
    var foreignDraft = value.length > 0 && !ours;
    var where = describeKey(surface.pageKey);

    var state = {
      surface: surface,
      payload: payload,
      feature: payload.feature || "",
      subject: payload.subject || "",
      prefilled: fill(surface, payload).before,
      canUndo: true,
      status: fillStatus(surface, !surface.visible),
      statusClass: "ok",
      hint: "Post goes to " + where + ".",
    };
    if (!matches) {
      state.hint =
        "It was prepared for " +
        describeKey(targetKey(payload.url)) +
        ", and this is " +
        where +
        ".";
    } else if (editing) {
      state.hint = "This is an edit page, so it replaced what was in the editor.";
    } else if (foreignDraft) {
      state.hint = "It replaced the text that was already in the editor.";
    }
    void spendPost(payload);

    renderBar(state);
    placeCaret(surface);
  }

  function shadowBar() {
    return barHost && barHost.isConnected ? barHost : null;
  }

  // The shortcut and the popup ask for a fill: a page whose post was marked for
  // somewhere else, or one where nothing was prepared at all. A stale context
  // has no runtime to listen on, so this is skipped rather than thrown:
  // `chrome.runtime` is exactly what a reload takes away.
  if (LSEMS.isContextAlive()) {
    chrome.runtime.onMessage.addListener(function (message) {
      if (message && message.type === "lsems:fill-now") run();
    });
  }

  /**
   * Editors can appear long after load (a quick reply form, an AJAX composer),
   * and Copy & Open opens this tab before the app has stored the post, so keep
   * looking for a moment instead of checking once.
   */
  var LOOK_ATTEMPTS = 40;
  var WATCH_ATTEMPTS = 24;
  var looks = 0;
  var watched = 0;

  function boot() {
    looks += 1;
    if (findSurface()) {
      watch();
      return;
    }
    if (looks < LOOK_ATTEMPTS) setTimeout(boot, 500);
  }

  /**
   * A marked post this page was opened for, and no editor ever turned up. Silence
   * is the worst answer here: the member is looking at a page with nothing on it
   * and no way to tell whether the extension ran at all.
   */
  async function reportNoEditor() {
    if (!LSEMS.storageArea() || shadowBar()) return;
    var payload = await LSEMS.getPending();
    if (!payload || !payload.autoFill || payload.filledAt) return;
    // A post prepared for somewhere else is not this page's business, and the
    // member already knows why they opened this page.
    var here = targetKey(location.href);
    var wanted = targetKey(payload.url);
    if (!wanted) return;
    var sameTopic = topicId(here) && topicId(here) === topicId(wanted);
    if (!sameTopic && here !== wanted) return;
    renderBar(
      confirmState(
        null,
        payload,
        "This page has no editor, so the prepared post was not pasted.",
        "warn",
        "Open the reply form, then press <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> to paste it in.",
      ),
    );
  }

  /** Wait for a marked post until one has been pasted or the window passes. */
  function watch() {
    watched += 1;
    void autoFill().then(function (done) {
      if (done) return;
      if (watched >= WATCH_ATTEMPTS) {
        void reportNoEditor();
        return;
      }
      setTimeout(watch, 500);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
