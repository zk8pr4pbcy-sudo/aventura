(function () {
  "use strict";

  function setup(options) {
    options = options || {};
    var translate = options.translate;
    var dialogRuntime = options.dialogRuntime || window.AVENTURA_DIALOGS;
    var dialog = document.querySelector("[data-perfume-story-dialog]");

    if (!dialog) {
      return;
    }
    if (dialog.dataset.perfumeStoryReady === "true") {
      return;
    }
    if (typeof translate !== "function") {
      throw new Error("Aventura perfume story runtime requires translate");
    }
    if (!dialogRuntime || typeof dialogRuntime.prepare !== "function" || typeof dialogRuntime.open !== "function" || typeof dialogRuntime.close !== "function") {
      throw new Error("Aventura dialog runtime is unavailable");
    }

    dialog.dataset.perfumeStoryReady = "true";

    var image = dialog.querySelector("[data-perfume-story-image]");
    var title = dialog.querySelector("[data-perfume-story-title]");
    var activeTitleKey = "";

    function updateOpenStory() {
      if (!dialog.open || !activeTitleKey) {
        return;
      }
      if (title) {
        title.textContent = translate(activeTitleKey);
      }
      if (image) {
        image.alt = translate(activeTitleKey) + " — " + translate("collection.storyDialogEyebrow");
      }
    }

    dialogRuntime.prepare(dialog, translate);

    document.querySelectorAll("[data-perfume-story]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeTitleKey = button.getAttribute("data-story-title-key") || "collection.storyDialogTitle";
        if (image) {
          image.src = button.getAttribute("data-perfume-story") || "";
        }
        if (title) {
          title.textContent = translate(activeTitleKey);
        }
        if (image) {
          image.alt = translate(activeTitleKey) + " — " + translate("collection.storyDialogEyebrow");
        }
        dialogRuntime.open(dialog, button, translate);
      });
    });

    var closeButton = dialog.querySelector("[data-close-perfume-story]");
    if (closeButton) {
      closeButton.addEventListener("click", function () {
        dialogRuntime.close(dialog);
      });
    }

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialogRuntime.close(dialog);
      }
    });

    document.addEventListener("aventura:language", updateOpenStory);
  }

  window.AVENTURA_PERFUME_STORY = Object.freeze({
    setup: setup
  });
}());
