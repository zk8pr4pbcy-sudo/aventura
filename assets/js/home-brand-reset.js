(function () {
  "use strict";

  var dictionaries = window.AVENTURA_I18N || (window.AVENTURA_I18N = {});
  var copy = {
    en: {
      "home.metaTitle": "AVENTURA | Private Experiences, Events & Guest Hospitality in Saudi Arabia",
      "home.metaDescription": "Private experiences, corporate events and guest hospitality designed across Jeddah and western Saudi Arabia.",
      "home.heroEyebrow": "Aventura, Jeddah",
      "home.heroTitle": "Private experiences and events in Jeddah",
      "home.heroDescription": "Private tours, hospitality for delegations, and special occasions. Share your date and guest count so we can prepare your proposal.",
      "home.heroPrimary": "Design your experience",
      "home.heroExplore": "Explore experiences",
      "home.heroLocation": "Al-Balad, Historic Jeddah",
      "home.pathExperienceTitle": "Private experiences",
      "home.pathExperienceText": "Historic Jeddah, the Red Sea, the desert and Taif",
      "home.pathCorporateTitle": "Companies and delegations",
      "home.pathCorporateText": "Corporate programs, hospitality and transfers",
      "home.pathPrivateTitle": "Special occasions",
      "home.pathPrivateText": "Venue, hospitality and event coordination",
      "home.introEyebrow": "The Aventura approach",
      "home.introTitle": "One brand. Different worlds. Every journey designed around the guest.",
      "home.introDescription": "From Historic Jeddah to the Red Sea, the desert and Taif, we design private days shaped around your guests.",
      "home.expEyebrow": "Aventura experiences",
      "home.expTitle": "Start with Historic Jeddah, then choose the world that fits your guests.",
      "home.expDescription": "Choose one setting or combine several into a private program designed around your time and guests.",
      "home.historicCode": "01 · Historic Jeddah",
      "home.collectionTitle": "Fragrance concepts, inspired by each experience.",
      "home.collectionDescription": "The boutique currently introduces Aventura’s fragrance concepts. Physical collections appear only after development and approval; Guest Services remain separate.",
      "home.altBoutique": "Aventura fragrance concepts"
    },
    ar: {
      "home.metaTitle": "أفنتورا | تجارب خاصة وفعاليات وضيافة ضيوف في السعودية",
      "home.metaDescription": "تجارب خاصة وفعاليات شركات وضيافة ضيوف تُصمم في جدة وغرب المملكة العربية السعودية.",
      "home.heroEyebrow": "أفنتورا، جدة",
      "home.heroTitle": "تجارب خاصة وفعاليات في جدة",
      "home.heroDescription": "جولات خاصة وضيافة للوفود وتنظيم للمناسبات. شاركنا الموعد وعدد الضيوف لنعدّ عرضك.",
      "home.heroPrimary": "صمّم تجربتك",
      "home.heroExplore": "استكشف التجارب",
      "home.heroLocation": "البلد، جدة التاريخية",
      "home.pathExperienceTitle": "تجربة خاصة",
      "home.pathExperienceText": "جدة التاريخية والبحر والصحراء والطائف",
      "home.pathCorporateTitle": "شركات ووفود",
      "home.pathCorporateText": "برامج عمل وضيافة وتنقّلات",
      "home.pathPrivateTitle": "مناسبة خاصة",
      "home.pathPrivateText": "تنسيق المكان والضيافة والتفاصيل",
      "home.introEyebrow": "أسلوب أفنتورا",
      "home.introTitle": "علامة واحدة، عوالم مختلفة، وكل رحلة تُصمم حول الضيف.",
      "home.introDescription": "من جدة التاريخية إلى البحر والصحراء والطائف، نصمّم أياماً خاصة تتشكل حول ضيوفك.",
      "home.expEyebrow": "تجارب أفنتورا",
      "home.expTitle": "ابدأ بجدة التاريخية، ثم اختر العالم الأنسب لضيوفك.",
      "home.expDescription": "اختر عالماً واحداً أو اجمع أكثر من تجربة في برنامج خاص مصمم وفق وقتك وضيوفك.",
      "home.historicCode": "01 · جدة التاريخية",
      "home.collectionTitle": "تصورات عطرية مستوحاة من كل تجربة.",
      "home.collectionDescription": "يعرض البوتيك حاليًا التصورات العطرية لأفنتورا. تظهر المجموعات المادية فقط بعد اكتمال التطوير والاعتماد، وتبقى خدمات الضيوف في مسار مستقل.",
      "home.altBoutique": "تصورات أفنتورا العطرية"
    },
    es: {
      "home.metaTitle": "AVENTURA | Experiencias privadas, eventos y hospitalidad en Arabia Saudí",
      "home.metaDescription": "Experiencias privadas, eventos corporativos y hospitalidad diseñados en Yeda y el oeste de Arabia Saudí.",
      "home.heroEyebrow": "Aventura, Yeda",
      "home.heroTitle": "Experiencias privadas y eventos en Yeda",
      "home.heroDescription": "Visitas privadas, hospitalidad para delegaciones y celebraciones. Indícanos la fecha y el número de invitados para preparar tu propuesta.",
      "home.heroPrimary": "Diseña tu experiencia",
      "home.heroExplore": "Explora las experiencias",
      "home.heroLocation": "Al-Balad, Yeda Histórica",
      "home.pathExperienceTitle": "Experiencias privadas",
      "home.pathExperienceText": "Yeda Histórica, el mar Rojo, el desierto y Taif",
      "home.pathCorporateTitle": "Empresas y delegaciones",
      "home.pathCorporateText": "Programas corporativos, hospitalidad y traslados",
      "home.pathPrivateTitle": "Ocasiones especiales",
      "home.pathPrivateText": "Espacio, hospitalidad y coordinación del evento",
      "home.introEyebrow": "El enfoque Aventura",
      "home.introTitle": "Una marca. Mundos diferentes. Cada viaje diseñado alrededor del huésped.",
      "home.introDescription": "Desde Yeda Histórica hasta el Mar Rojo, el desierto y Taif, diseñamos días privados que se adaptan a tus invitados.",
      "home.expEyebrow": "Experiencias Aventura",
      "home.expTitle": "Empieza por Yeda Histórica y elige después el mundo que mejor encaje con tus invitados.",
      "home.expDescription": "Elige un escenario o combina varios en un programa privado diseñado según tu tiempo y tus invitados.",
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
