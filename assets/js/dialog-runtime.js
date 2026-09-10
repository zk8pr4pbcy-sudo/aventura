(function () {
  "use strict";

  function restoreFocus(dialog) {
    var trigger = dialog && dialog.__aventuraReturnFocus;
    if (dialog) {
      dialog.__aventuraReturnFocus = null;
    }
    if (trigger && document.contains(trigger) && typeof trigger.focus === "function") {
      window.setTimeout(function () { trigger.focus(); }, 0);
    }
  }

  function prepare(dialog, translate) {
    if (!dialog || dialog.__aventuraPrepared) {
      return;
    }
    dialog.__aventuraPrepared = true;
    dialog.addEventListener("close", function () { restoreFocus(dialog); });
    dialog.querySelectorAll(".dialog-close").forEach(function (button) {
      if (!button.hasAttribute("data-i18n-aria")) {
        button.setAttribute("data-i18n-aria", "collection.closeDetails");
      }
      if (typeof translate === "function") {
        button.setAttribute("aria-label", translate(button.getAttribute("data-i18n-aria")));
      }
    });
  }

  function open(dialog, trigger, translate) {
    if (!dialog || dialog.open) {
      return;
    }
    prepare(dialog, translate);
    dialog.__aventuraReturnFocus = trigger || document.activeElement;
    dialog.setAttribute("dir", document.documentElement.dir || "ltr");
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    window.setTimeout(function () {
      var target = dialog.querySelector("button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])");
      if (target && typeof target.focus === "function") {
        target.focus();
      }
    }, 0);
  }

  function close(dialog) {
    if (!dialog) {
      return;
    }
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
      return;
    }
    dialog.removeAttribute("open");
    restoreFocus(dialog);
  }

  window.AVENTURA_DIALOGS = Object.freeze({
    prepare: prepare,
    open: open,
    close: close
  });
}());
