(function () {
  "use strict";

  function show(elements) {
    elements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  }

  function setup(options) {
    options = options || {};
    var root = options.root || document;
    var elements = Array.from(root.querySelectorAll("[data-reveal]"));
    if (!elements.length) {
      return;
    }

    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!("IntersectionObserver" in window) || reducedMotion) {
      show(elements);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -7%", threshold: 0.12 });

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  window.AVENTURA_REVEAL = Object.freeze({
    setup: setup
  });
})();
