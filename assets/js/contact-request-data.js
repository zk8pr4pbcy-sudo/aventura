(function () {
  "use strict";

  function createRequestId(options) {
    options = options || {};
    var date = options.date instanceof Date ? options.date : new Date();
    var randomValue = typeof options.random === "function" ? options.random() : Math.random();
    var token = Number(randomValue).toString(36).slice(2, 6).toUpperCase();
    return "AVE-" + date.toISOString().slice(0, 10).replace(/-/g, "") + "-" + token;
  }

  function buildMessage(options) {
    options = options || {};
    var form = options.form;
    var data = options.data;
    var translate = options.translate;
    var requestId = String(options.requestId || "");
    var name = String(options.name || "").trim();

    if (!form || !data || typeof translate !== "function") {
      throw new Error("Aventura contact request data dependencies are incomplete");
    }

    var selectedType = form.querySelector('[name="type"] option:checked');
    var typeText = selectedType ? selectedType.textContent.trim() : "";
    var lines = [
      translate("contact.requestIntro"),
      "",
      translate("contact.requestReference") + ": " + requestId,
      translate("contact.whatsappName") + ": " + name
    ];

    var optionalRows = [
      ["company", "contact.whatsappCompany"],
      ["phone", "contact.whatsappPhone"],
      ["email", "contact.whatsappEmail"]
    ];

    optionalRows.forEach(function (row) {
      var value = String(data.get(row[0]) || "").trim();
      if (value) {
        lines.push(translate(row[1]) + ": " + value);
      }
    });

    if (typeText) {
      lines.push(translate("contact.whatsappType") + ": " + typeText);
    }

    var dynamicSummary = {};
    Array.from(form.querySelectorAll("#dynamicRequestPanel [data-request-summary]")).forEach(function (field) {
      if (field.disabled || field.closest("[hidden]")) return;
      if ((field.type === "radio" || field.type === "checkbox") && !field.checked) return;
      if (!String(field.value || "").trim()) return;
      var summaryGroup = field.closest("[data-request-summary-label]");
      var label = summaryGroup ? summaryGroup.getAttribute("data-request-summary-label") : field.name;
      var value = String(field.value).trim();
      if (field.tagName === "SELECT") {
        var selectedOption = field.options[field.selectedIndex];
        value = selectedOption ? selectedOption.textContent.trim() : value;
      } else if (field.type === "radio" || field.type === "checkbox") {
        var optionLabel = field.closest("label");
        value = optionLabel ? optionLabel.textContent.trim() : value;
      }
      if (!dynamicSummary[label]) dynamicSummary[label] = [];
      dynamicSummary[label].push(value);
    });
    Object.keys(dynamicSummary).forEach(function (label) {
      lines.push(label + ": " + dynamicSummary[label].join(", "));
    });

    var selectedDuration = form.querySelector('[name="duration"] option:checked');
    if (selectedDuration && selectedDuration.value) {
      lines.push(translate("contact.whatsappDuration") + ": " + selectedDuration.textContent.trim());
    }

    [["date", "contact.whatsappDate"], ["time", "contact.whatsappTime"], ["guests", "contact.whatsappGuests"], ["message", "contact.whatsappMessage"]].forEach(function (row) {
      var value = String(data.get(row[0]) || "").trim();
      if (value) {
        lines.push(translate(row[1]) + ": " + value);
      }
    });

    var detailRows = [
      ["deliveryLocation", "contact.deliveryLocationLabel"],
      ["deliveryTime", "contact.deliveryTimeLabel"],
      ["personalization", "contact.personalizationLabel"],
      ["thobeLocation", "contact.serviceLocationLabel"],
      ["thobeCount", "contact.thobeCountLabel"],
      ["thobeVisit", "contact.visitTimeLabel"],
      ["thobeDelivery", "contact.requiredDeliveryLabel"],
      ["thobePreference", "contact.thobePreferenceLabel"],
      ["abayaLocation", "contact.serviceLocationLabel"],
      ["abayaVisit", "contact.contactVisitTimeLabel"],
      ["abayaDelivery", "contact.requiredDeliveryLabel"],
      ["abayaContact", "contact.preferredContactLabel"],
      ["preferredResponse", "contact.preferredContactLabel"],
      ["flowerRecipient", "contact.recipientLabel"],
      ["flowerOccasion", "contact.occasionLabel"],
      ["flowerSize", "contact.flowerSizeLabel"],
      ["flowerColors", "contact.flowerColorsLabel"],
      ["flowerLocation", "contact.deliveryLocationLabel"],
      ["flowerDelivery", "contact.deliveryTimeLabel"],
      ["flowerMessage", "contact.cardMessageLabel"]
    ];

    detailRows.forEach(function (row) {
      var field = form.querySelector('[name="' + row[0] + '"]');
      if (!field || field.closest("[data-request-details]") && field.closest("[data-request-details]").hidden) {
        return;
      }
      var value = String(data.get(row[0]) || "").trim();
      if (field.tagName === "SELECT" && field.value) {
        var selectedOption = field.options[field.selectedIndex];
        value = selectedOption ? selectedOption.textContent.trim() : value;
      }
      if (value) {
        var label = translate(row[1]);
        if (label === row[1] && field.id) {
          var fieldLabel = form.querySelector('label[for="' + field.id + '"]');
          label = fieldLabel ? fieldLabel.textContent.trim() : row[0];
        }
        lines.push(label + ": " + value);
      }
    });

    return lines.join("\n");
  }

  window.AVENTURA_CONTACT_REQUEST_DATA = Object.freeze({
    createRequestId: createRequestId,
    buildMessage: buildMessage
  });
}());
