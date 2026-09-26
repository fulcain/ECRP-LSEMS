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

  /** Prefer a field the member can actually see: a page can carry two editors. */
  function firstMatch(selectors, root) {
    var scope = root || document;
    var found = null;
    for (var i = 0; i < selectors.length; i += 1) {
      var candidates = scope.querySelectorAll(selectors[i]);
      for (var j = 0; j < candidates.length; j += 1) {
        var el = candidates[j];
        if (el.offsetParent !== null || el.getClientRects().length > 0) return el;
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

  function findSurface() {
    var message = firstMatch(SELECTORS.message);
    if (!message) return null;
    var form = message.form || message.closest("form");
    var host = form || document;
    var action = (form && form.getAttribute("action")) || location.href;
    var params = new URLSearchParams(location.search);
    return {
      kind: location.pathname.indexOf("ucp.php") !== -1 ? "pm" : "post",
      mode: (new URL(action, location.href).searchParams.get("mode")) || params.get("mode") || "",
      quickReply: !!(form && /quickreply/i.test(form.id || "")),
      form: form,
      message: message,
      subject: firstMatch(SELECTORS.subject, host),
      recipient: firstMatch(SELECTORS.recipient, host),
      submit: firstMatch(SELECTORS.submit, host),
      pageKey: targetKey(action, location.href) || targetKey(location.href) || "",
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
      // what the app's own buttons had just done.
      '<div class="actions">',
      state.canFill ? '<button class="primary" data-act="fill">Fill</button>' : "",
      state.canUndo ? '<button data-act="undo">Undo</button>' : "",
      "</div>",
      '<div class="hint">' + state.hint + "</div>",
      "</div>",
    ].join("");

    var subjectNode = shadow.querySelector('[data-role="subject"]');
    if (subjectNode) subjectNode.textContent = state.subject;

    shadow.querySelector('[data-act="dismiss"]').addEventListener("click", function () {
      sessionStorage.setItem("lsems:barDismissed", state.payload.id);
      host.remove();
      barHost = null;
    });

    var fillButton = shadow.querySelector('[data-act="fill"]');
    if (fillButton) {
      fillButton.addEventListener("click", function () {
        var result = fill(state.surface, state.payload);
        state.prefilled = result.before;
        setStatus(
          shadow,
          result.wrote
            ? "Filled - review, then press Submit."
            : "Nothing to fill: the saved post is empty.",
          result.wrote ? "ok" : "warn",
        );
        fillButton.remove();
        addUndo(shadow, state);
        placeCaret(state.surface);
        void forgetWhenAsked();
      });
    }

    if (state.canUndo) addUndo(shadow, state);

    document.body.appendChild(host);
    barHost = host;
    return host;
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
      host.remove();
      barHost = null;
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
      sessionStorage.setItem("lsems:barDismissed", "clipboard");
      host.remove();
      barHost = null;
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

  /** Drop the prepared post once it is in the editor, if the member asked for that. */
  async function forgetWhenAsked() {
    var settings = await LSEMS.getSettings();
    if (!settings.clearAfterFill) return;
    await LSEMS.clearPending();
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
      return surface.pageKey.split(":")[2] === wanted.slice(6);
    }
    return wanted === surface.pageKey;
  }

  async function run(force) {
    var surface = findSurface();
    if (!surface) return;

    // The extension was reloaded or updated under this page, so this copy has
    // no storage and no way to get any. Saying so is all that can be done here.
    if (!LSEMS.storageArea()) {
      renderStaleBar(surface);
      return;
    }

    var payload = await LSEMS.getPending();
    if (!payload) {
      // Nothing was prepared for this page: the clipboard is the fallback, and
      // an edit page is never a paste target. Reading it on arrival was wrong:
      // a clipboard still holding an old post filled a page nobody asked to
      // fill, and a reload refilled it from the same stale copy. So the only
      // pass left is the one the shortcut or the bar's button requests.
      if (surface.mode === "edit" || shadowBar()) return;
      if (!force && sessionStorage.getItem("lsems:barDismissed") === "clipboard") return;
      renderClipboardBar(surface, force);
      return;
    }
    if (!force && sessionStorage.getItem("lsems:barDismissed") === payload.id) return;
    if (shadowBar()) return;

    var matches = matchesTarget(payload, surface);
    // Overwriting a live edit is never what someone meant to ask for.
    var editing = surface.mode === "edit";
    var value = surface.message.value.trim();
    var ours =
      surface.message.dataset.lsemsFilled === payload.id ||
      value === (payload.bbcode || "").trim();
    var foreignDraft = value.length > 0 && !ours;

    var state = {
      surface: surface,
      payload: payload,
      feature: payload.feature || "",
      prefilled: null,
      canFill: true,
      canUndo: false,
      subject: payload.subject || "",
      status: "",
      statusClass: "",
      hint:
        "Nothing to paste: it is already written in. Press <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> to fill any GOV page again.",
    };

    // Nothing is written into a page that did not ask for it. A prepared post
    // waits in storage until the bar's Fill button or the shortcut is pressed,
    // so a reload, a forum Preview, or the same page opened twice can never
    // touch what is in the editor. The shortcut is the one pass that ignores
    // every warning below, because that time the member asked for it outright.
    var filled = false;
    if (force) {
      state.prefilled = fill(surface, payload).before;
      filled = true;
      state.canFill = false;
      state.canUndo = true;
      void forgetWhenAsked();
    }

    var where = describeKey(surface.pageKey);
    if (filled) {
      state.status = surface.quickReply
        ? "Quick reply filled - review, then press Submit."
        : "Filled from the LSEMS app - review, then press Submit.";
      state.statusClass = "ok";
      state.hint += " Post goes to " + where + ".";
    } else if (!matches) {
      state.status =
        "Prepared for " + describeKey(targetKey(payload.url)) + ", and you are on " + where + ".";
      state.statusClass = "warn";
      state.hint = "Press Fill to use it here anyway.";
    } else if (editing) {
      state.status = "This is an edit page - Fill would replace the post.";
      state.statusClass = "warn";
      state.hint = "Press Fill only if you mean to overwrite it.";
    } else if (ours && value) {
      state.status = "This post is already in the editor.";
      state.hint = "Fill writes it in again; nothing was changed by opening the page.";
    } else if (foreignDraft) {
      state.status = "There is already text in this editor.";
      state.statusClass = "warn";
      state.hint = "Press Fill to replace it with the saved post.";
    } else {
      state.status = "Saved post for " + where + ".";
      state.hint = "Press Fill to put it in this editor.";
    }

    renderBar(state);

    if (filled) placeCaret(surface);
  }

  function shadowBar() {
    return barHost && barHost.isConnected ? barHost : null;
  }

  // The shortcut asks for a fill even where auto-fill was declined or dismissed.
  // A stale context has no runtime to listen on, so this is skipped rather than
  // thrown: `chrome.runtime` is exactly what a reload takes away.
  if (LSEMS.isContextAlive()) {
    chrome.runtime.onMessage.addListener(function (message) {
      if (message && message.type === "lsems:fill-now") {
        var bar = shadowBar();
        if (bar) bar.remove();
        run(true);
      }
    });
  }

  // Editors can appear long after load (a quick reply form, an AJAX composer),
  // so keep looking for a moment instead of only checking once.
  var attempts = 0;
  function boot() {
    attempts += 1;
    if (findSurface()) {
      run(false);
      return;
    }
    if (attempts < 40) setTimeout(boot, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
