(function () {
  "use strict";

  var dictionaries = window.AVENTURA_I18N || (window.AVENTURA_I18N = {});
  var copy = {
    en: {
      "home.metaTitle": "AVENTURA | Private Experiences, Events & Guest Hospitality in Saudi Arabia",
      "home.metaDescription": "Private experiences, corporate events and guest hospitality designed across Jeddah and western Saudi Arabia.",
      "home.heroEyebrow": "Private experiences · Events · Guest hospitality",
      "home.heroTitle": "Experiences shaped around people, place and purpose.",
      "home.heroDescription": "Aventura designs private experiences, corporate programs, events and guest hospitality across Historic Jeddah, the Red Sea, the desert and Taif through one coordinated team.",
      "home.heroPrimary": "Explore experiences",
      "home.heroSecondary": "Plan with Aventura",
      "home.proof1Title": "Four distinct worlds",
      "home.proof1Text": "Historic Jeddah, the Red Sea, the desert and Taif",
      "home.proof2Title": "Private by design",
      "home.proof2Text": "Programs shaped around your guests, privacy and pace",
      "home.proof3Title": "One operating team",
      "home.proof3Text": "Planning, hospitality, transport and execution together",
      "home.introEyebrow": "The Aventura approach",
      "home.introTitle": "One brand. Different worlds. Every journey designed around the guest.",
      "home.introDescription": "Historic Jeddah is the first experience in our journey, while Aventura remains a wider platform for private tourism, events, corporate hosting and guest services across western Saudi Arabia.",
      "home.expEyebrow": "Aventura experiences",
      "home.expTitle": "Start with Historic Jeddah, then choose the world that fits your guests.",
      "home.expDescription": "Historic Jeddah appears first because it is a core Aventura experience—not because Aventura is limited to Al-Balad.",
      "home.historicCode": "01 · Historic Jeddah",
      "home.collectionTitle": "Fragrance concepts, inspired by each experience.",
      "home.collectionDescription": "The boutique currently introduces Aventura’s fragrance concepts. Physical collections appear only after development and approval; Guest Services remain separate.",
      "home.altBoutique": "Aventura fragrance concepts"
    },
    ar: {
      "home.metaTitle": "أفنتورا | تجارب خاصة وفعاليات وضيافة ضيوف في السعودية",
      "home.metaDescription": "تجارب خاصة وفعاليات شركات وضيافة ضيوف تُصمم في جدة وغرب المملكة العربية السعودية.",
      "home.heroEyebrow": "تجارب خاصة · فعاليات · ضيافة ضيوف",
      "home.heroTitle": "نصنع تجارب تُحكى.",
      "home.heroDescription": "تصمم أفنتورا تجارب خاصة وبرامج شركات وفعاليات وضيافة للضيوف في جدة التاريخية والبحر الأحمر والصحراء والطائف، عبر فريق واحد يدير الرحلة من الفكرة حتى التنفيذ.",
      "home.heroPrimary": "استكشف التجارب",
      "home.heroSecondary": "خطط مع أفنتورا",
      "home.proof1Title": "أربعة عوالم مختلفة",
      "home.proof1Text": "جدة التاريخية والبحر الأحمر والصحراء والطائف",
      "home.proof2Title": "خصوصية من أساس التصميم",
      "home.proof2Text": "برنامج يتشكل حول ضيوفك وخصوصيتهم وإيقاعهم",
      "home.proof3Title": "فريق تشغيل واحد",
      "home.proof3Text": "التخطيط والضيافة والنقل والتنفيذ تحت إدارة واحدة",
      "home.introEyebrow": "أسلوب أفنتورا",
      "home.introTitle": "علامة واحدة، عوالم مختلفة، وكل رحلة تُصمم حول الضيف.",
      "home.introDescription": "جولة جدة التاريخية هي أول تجارب أفنتورا وأحد ركائزها، لكن أفنتورا أوسع من البلد؛ فهي تقدم التجارب الخاصة والفعاليات واستضافة الشركات وخدمات الضيوف في جدة وغرب المملكة.",
      "home.expEyebrow": "تجارب أفنتورا",
      "home.expTitle": "ابدأ بجدة التاريخية، ثم اختر العالم الأنسب لضيوفك.",
      "home.expDescription": "تظهر جدة التاريخية أولاً لأنها تجربة أساسية في أفنتورا، لا لأن نشاط أفنتورا محصور في البلد.",
      "home.historicCode": "01 · جدة التاريخية",
      "home.collectionTitle": "تصورات عطرية مستوحاة من كل تجربة.",
      "home.collectionDescription": "يعرض البوتيك حاليًا التصورات العطرية لأفنتورا. تظهر المجموعات المادية فقط بعد اكتمال التطوير والاعتماد، وتبقى خدمات الضيوف في مسار مستقل.",
      "home.altBoutique": "تصورات أفنتورا العطرية"
    },
    es: {
      "home.metaTitle": "AVENTURA | Experiencias privadas, eventos y hospitalidad en Arabia Saudí",
      "home.metaDescription": "Experiencias privadas, eventos corporativos y hospitalidad diseñados en Yeda y el oeste de Arabia Saudí.",
      "home.heroEyebrow": "Experiencias privadas · Eventos · Hospitalidad",
      "home.heroTitle": "Creamos experiencias que merecen ser contadas.",
      "home.heroDescription": "Aventura diseña experiencias privadas, programas corporativos, eventos y hospitalidad en Yeda Histórica, el Mar Rojo, el desierto y Taif mediante un único equipo coordinado.",
      "home.heroPrimary": "Explorar experiencias",
      "home.heroSecondary": "Planificar con Aventura",
      "home.proof1Title": "Cuatro mundos distintos",
      "home.proof1Text": "Yeda Histórica, el Mar Rojo, el desierto y Taif",
      "home.proof2Title": "Privacidad desde el diseño",
      "home.proof2Text": "Programas adaptados a los invitados, la privacidad y el ritmo",
      "home.proof3Title": "Un solo equipo operativo",
      "home.proof3Text": "Planificación, hospitalidad, transporte y ejecución coordinados",
      "home.introEyebrow": "El enfoque Aventura",
      "home.introTitle": "Una marca. Mundos diferentes. Cada viaje diseñado alrededor del huésped.",
      "home.introDescription": "Yeda Histórica es la primera experiencia del recorrido, mientras Aventura sigue siendo una plataforma más amplia de turismo privado, eventos, hospitalidad corporativa y servicios al huésped.",
      "home.expEyebrow": "Experiencias Aventura",
      "home.expTitle": "Empieza por Yeda Histórica y elige después el mundo que mejor encaje con tus invitados.",
      "home.expDescription": "Yeda Histórica aparece primero porque es una experiencia esencial de Aventura, no porque Aventura se limite a Al-Balad.",
      "home.historicCode": "01 · Yeda Histórica",
      "home.collectionTitle": "Conceptos de fragancia inspirados en cada experiencia.",
      "home.collectionDescription": "La boutique presenta actualmente los conceptos de fragancia de Aventura. Las colecciones físicas aparecerán solo después del desarrollo y la aprobación; los Servicios para huéspedes permanecen separados.",
      "home.altBoutique": "Conceptos de fragancia de Aventura"
    }
  };

  Object.keys(copy).forEach(function (language) {
    dictionaries[language] = Object.assign({}, dictionaries[language] || {}, copy[language]);
  });
}());
