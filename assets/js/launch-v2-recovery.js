(function () {
  "use strict";

  var copy = {
    en: {
      "experiences.historicItem3": "Arabic coffee, dates and selected heritage stops",
      "experiences.readyHistoricText": "All walking formats include Arabic coffee, dates and a licensed guide. Any additional paid entries are confirmed separately.",
      "experiences.stbStep3Text": "A licensed guided walk with Arabic coffee, dates and selected heritage stops.",
      "world.historic.text": "Before the walk begins, your guide reads your interests and adjusts the pace, turning each alley into a personal way into Historic Jeddah.",
      "world.historic.note": "We do not rush the story. We leave room to notice the Roshan, stone, sounds and small details.",
      "world.historic.step1Title": "Meet your guide",
      "world.historic.step1Text": "Your guide is more than a voice telling stories; they are a living memory that knows every doorway by name and every alley by its story.",
      "world.historic.step2Title": "Read the Roshan",
      "world.historic.step2Text": "The Roshan is not understood from the street alone. Its shadows shift with the hours, and its carving holds a story left untold.",
      "world.historic.step3Text": "The walk ends where time—not the schedule—decides: a cup of Arabic coffee, a date, and enough quiet to hear the city."
    },
    ar: {
      "experiences.historicItem3": "القهوة العربية والتمر ومحطات تراثية مختارة",
      "experiences.readyHistoricText": "تشمل جميع جولات المشي القهوة العربية والتمر ومرشدًا سياحيًا مرخصًا، وتُؤكد أي رسوم دخول إضافية بشكل منفصل.",
      "experiences.stbStep3Text": "جولة مع مرشد سياحي مرخص تشمل القهوة العربية والتمر ومحطات تراثية مختارة.",
      "world.historic.text": "قبل أن تبدأ الجولة، يقرأ مرشدك اهتماماتك ويطوّع الإيقاع، ليتحوّل الزقاق إلى مدخل شخصي لجدة التاريخية.",
      "world.historic.note": "لا نستعجل الحكاية. نترك مساحة لملاحظة الروشان والحجر والأصوات والتفاصيل الصغيرة.",
      "world.historic.step1Title": "تعرّف إلى مرشدك",
      "world.historic.step1Text": "مرشدك ليس صوتًا يروي فقط، بل ذاكرة تعرف كل باب باسمه، وكل زقاق بحكايته.",
      "world.historic.step2Title": "اقرأ الروشان",
      "world.historic.step2Text": "الروشان لا يُرى من الشارع وحده. ظلاله تتبدّل مع الوقت، ونقشه يُخفي حكاية لا تُروى.",
      "world.historic.step3Text": "تختم الجولة حيث يشاء الوقت لا الجدول: فنجان قهوة، وتمرة، وصمت يكفي لسماع المدينة."
    },
    es: {
      "experiences.historicItem3": "Café árabe, dátiles y paradas patrimoniales seleccionadas",
      "experiences.readyHistoricText": "Todos los recorridos a pie incluyen café árabe, dátiles y un guía autorizado. Las entradas adicionales de pago se confirman por separado.",
      "experiences.stbStep3Text": "Paseo con guía autorizado, café árabe, dátiles y paradas patrimoniales seleccionadas.",
      "world.historic.text": "Antes de empezar, tu guía interpreta tus intereses y adapta el ritmo, haciendo de cada callejón una entrada personal a la Yeda Histórica.",
      "world.historic.note": "No apresuramos la historia. Dejamos espacio para observar el roshan, la piedra, los sonidos y los pequeños detalles.",
      "world.historic.step1Title": "Conoce a tu guía",
      "world.historic.step1Text": "Tu guía no es solo una voz que cuenta historias; es una memoria viva que conoce cada puerta por su nombre y cada callejón por su historia.",
      "world.historic.step2Title": "Lee el roshan",
      "world.historic.step2Text": "El roshan no se comprende solo desde la calle. Sus sombras cambian con las horas y sus tallas guardan una historia que queda sin contar.",
      "world.historic.step3Text": "El recorrido termina donde lo decide el tiempo, no el horario: una taza de café árabe, un dátil y el silencio suficiente para escuchar la ciudad."
    }
  };

  Object.keys(copy).forEach(function (language) {
    if (!window.AVENTURA_I18N || !window.AVENTURA_I18N[language]) return;
    Object.keys(copy[language]).forEach(function (key) {
      window.AVENTURA_I18N[language][key] = copy[language][key];
    });
  });

  function setupBoutiqueResultFocus() {
    var boutique = document.querySelector("[data-boutique]");
    if (!boutique) return;

    boutique.querySelectorAll("[data-boutique-filter], [data-boutique-type]").forEach(function (button) {
      button.addEventListener("click", function () {
        window.setTimeout(function () {
          var target = Array.from(boutique.querySelectorAll("[data-boutique-section]")).find(function (section) {
            return !section.hidden;
          });
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 20);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupBoutiqueResultFocus, { once: true });
  } else {
    setupBoutiqueResultFocus();
  }
}());
