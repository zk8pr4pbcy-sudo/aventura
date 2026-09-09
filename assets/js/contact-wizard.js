(function () {
  "use strict";

  function setup(options) {
    options = options || {};
    var form = options.form;
    var translate = options.translate;
    var typeField = options.typeField || null;
    var detailGroups = options.detailGroups || [];
    var firstPastTimingField = options.firstPastTimingField;

    if (!form || typeof translate !== "function" || typeof firstPastTimingField !== "function") {
      return false;
    }

    var originalGrid = form.querySelector(":scope > .form-grid");
    var originalActions = form.querySelector(":scope > .form-actions");
    var originalPrivacyNotice = form.querySelector(":scope > .form-privacy-notice");
    if (!originalGrid || !originalActions) {
      return false;
    }

    var progress = document.createElement("ol");
    progress.className = "request-progress";
    progress.setAttribute("aria-label", translate("contact.progressLabel"));
    progress.innerHTML = [1, 2, 3].map(function (number) {
      return '<li data-request-progress="' + number + '"><span>' + number + '</span><strong data-i18n="contact.step' + number + 'Short">Step ' + number + '</strong></li>';
    }).join("");

    var wizard = document.createElement("div");
    wizard.className = "request-wizard";
    var steps = {};

    function createStep(number, titleKey, textKey) {
      var step = document.createElement("section");
      step.className = "request-step";
      step.setAttribute("data-request-step", String(number));
      step.hidden = number !== 1;
      step.innerHTML = '<div class="request-step-heading"><span class="eyebrow" data-i18n="contact.step' + number + 'Short">Step ' + number + '</span><h3 data-i18n="' + titleKey + '">' + translate(titleKey) + '</h3><p data-i18n="' + textKey + '">' + translate(textKey) + '</p></div><div class="form-grid" data-request-step-grid></div>';
      steps[number] = step;
      wizard.appendChild(step);
      return step.querySelector("[data-request-step-grid]");
    }

    var firstGrid = createStep(1, "contact.step1Title", "contact.step1Text");
    var secondGrid = createStep(2, "contact.step2Title", "contact.step2Text");
    var thirdGrid = createStep(3, "contact.step3Title", "contact.step3Text");

    function moveField(name, target) {
      var field = form.querySelector('[name="' + name + '"]');
      var wrapper = field && field.closest(".field");
      if (wrapper) {
        target.appendChild(wrapper);
      }
    }

    ["type", "date", "time", "duration", "guests"].forEach(function (name) { moveField(name, firstGrid); });
    detailGroups.forEach(function (group) { secondGrid.appendChild(group); });
    moveField("message", secondGrid);
    ["name", "company", "phone", "email", "preferredResponse"].forEach(function (name) { moveField(name, thirdGrid); });

    var submissionChannel = form.querySelector("[data-submission-channel]");
    if (submissionChannel) {
      thirdGrid.appendChild(submissionChannel);
    }

    function controls(back, next, submit) {
      var row = document.createElement("div");
      row.className = "request-step-actions full";
      if (back) {
        row.insertAdjacentHTML("beforeend", '<button class="btn btn-outline-dark" type="button" data-request-back data-i18n="contact.backButton">Back</button>');
      }
      if (next) {
        row.insertAdjacentHTML("beforeend", '<button class="btn btn-dark" type="button" data-request-next data-i18n="contact.nextButton">Continue</button>');
      }
      if (submit) {
        row.appendChild(originalActions);
        if (originalPrivacyNotice) {
          row.appendChild(originalPrivacyNotice);
        }
      }
      return row;
    }

    firstGrid.appendChild(controls(false, true, false));
    secondGrid.appendChild(controls(true, true, false));
    thirdGrid.appendChild(controls(true, false, true));

    originalGrid.replaceWith(wizard);
    wizard.parentNode.insertBefore(progress, wizard);

    var success = document.createElement("div");
    success.className = "request-success";
    success.hidden = true;
    success.setAttribute("data-request-success", "");
    success.setAttribute("role", "status");
    success.innerHTML = '<span class="request-success-mark" aria-hidden="true">✓</span><div><strong data-request-success-title data-i18n="contact.successTitle">Your request is ready</strong><p data-request-success-text></p><div class="request-success-actions"><a class="text-link" data-request-send-link rel="noopener" data-i18n="contact.openWhatsappAgain">Open WhatsApp again</a><button class="text-link" type="button" data-copy-request data-i18n="contact.copyRequest">Copy request details</button></div></div>';
    form.appendChild(success);

    var currentStep = 1;

    function showStep(number) {
      currentStep = Math.max(1, Math.min(3, number));
      form.setAttribute("data-current-request-step", String(currentStep));
      Object.keys(steps).forEach(function (key) {
        steps[key].hidden = Number(key) !== currentStep;
      });
      progress.querySelectorAll("[data-request-progress]").forEach(function (item) {
        var stepNumber = Number(item.getAttribute("data-request-progress"));
        item.classList.toggle("is-active", stepNumber === currentStep);
        item.classList.toggle("is-complete", stepNumber < currentStep);
        item.setAttribute("aria-current", stepNumber === currentStep ? "step" : "false");
      });
      if (window.AVENTURA_TRACK) {
        window.AVENTURA_TRACK("request_step", {
          target: String(currentStep),
          requestType: typeField ? typeField.value : ""
        });
      }
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function firstMissingRequiredField(step) {
      var checkedRadioNames = {};
      return Array.from(step.querySelectorAll("[required]")).find(function (field) {
        if (!field.willValidate || field.disabled) {
          return false;
        }
        if (field.type === "radio") {
          if (checkedRadioNames[field.name]) {
            return false;
          }
          checkedRadioNames[field.name] = true;
          return !Array.from(step.querySelectorAll('input[type="radio"]')).some(function (radio) {
            return radio.name === field.name && radio.checked;
          });
        }
        return !field.checkValidity();
      }) || null;
    }

    wizard.addEventListener("click", function (event) {
      if (event.target.closest("[data-request-next]")) {
        if (currentStep === 1 && typeField && !typeField.value) {
          var status = form.querySelector("[data-form-status]");
          if (status) {
            status.textContent = translate("contact.stepTypeError");
          }
          typeField.focus();
          return;
        }

        var pastTimingField = firstPastTimingField(steps[currentStep]);
        if (pastTimingField) {
          var dateStatus = form.querySelector("[data-form-status]");
          if (dateStatus) {
            dateStatus.textContent = translate("contact.datePastError");
            dateStatus.classList.remove("is-success");
          }
          pastTimingField.focus();
          return;
        }

        var missingRequiredField = firstMissingRequiredField(steps[currentStep]);
        if (missingRequiredField) {
          var requiredStatus = form.querySelector("[data-form-status]");
          if (requiredStatus) {
            requiredStatus.textContent = translate("contact.stepRequiredError");
          }
          missingRequiredField.focus();
          return;
        }

        var statusNext = form.querySelector("[data-form-status]");
        if (statusNext) {
          statusNext.textContent = "";
        }
        showStep(currentStep + 1);
      }

      if (event.target.closest("[data-request-back]")) {
        showStep(currentStep - 1);
      }
    });

    form.addEventListener("aventura:request-success", function () {
      showStep(3);
      success.hidden = false;
    });

    form.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && event.target.tagName !== "TEXTAREA" && currentStep < 3) {
        event.preventDefault();
        var next = steps[currentStep].querySelector("[data-request-next]");
        if (next) {
          next.click();
        }
      }
    });

    showStep(1);
    return true;
  }

  window.AVENTURA_CONTACT_WIZARD = Object.freeze({ setup: setup });
}());
