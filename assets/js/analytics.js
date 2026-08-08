(function () {
  "use strict";

  function applyLaunchTheme() {
    var themeLink = document.getElementById("aventura-light-theme");
    if (!themeLink) {
      themeLink = document.createElement("link");
      themeLink.id = "aventura-light-theme";
      themeLink.rel = "stylesheet";
      themeLink.href = "assets/css/light-theme.css?v=20260728";
      document.head.appendChild(themeLink);
    }

    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", "#FFF9EF");
    }
  }

  var REQUEST_TYPES = {
    en: [["", "Choose one"], ["historic-jeddah", "Historic Jeddah experience"], ["sea", "Red Sea experience"], ["desert", "Desert experience"], ["taif", "Taif journey"], ["jeddah-day", "A complete Jeddah day"], ["corporate", "Corporate program"], ["private-event", "Private event or occasion"], ["vip-hosting", "VIP or delegation hosting"], ["guest-services", "Guest services"], ["custom-experience", "Design a custom experience"]],
    ar: [["", "اختر النوع"], ["historic-jeddah", "جولة جدة التاريخية"], ["sea", "تجربة بحرية"], ["desert", "تجربة صحراوية"], ["taif", "رحلة إلى الطائف"], ["jeddah-day", "يوم متكامل في جدة"], ["corporate", "برنامج شركات"], ["private-event", "فعالية أو مناسبة خاصة"], ["vip-hosting", "استضافة كبار الشخصيات أو الوفود"], ["guest-services", "خدمات الضيوف"], ["custom-experience", "تصميم تجربة خاصة"]],
    es: [["", "Elige una opción"], ["historic-jeddah", "Experiencia en Yeda Histórica"], ["sea", "Experiencia en el Mar Rojo"], ["desert", "Experiencia en el desierto"], ["taif", "Viaje a Taif"], ["jeddah-day", "Un día completo en Yeda"], ["corporate", "Programa corporativo"], ["private-event", "Evento u ocasión privada"], ["vip-hosting", "Atención VIP o delegaciones"], ["guest-services", "Servicios para huéspedes"], ["custom-experience", "Diseñar una experiencia a medida"]]
  };

  var FORM_TEXT = {
    en: {
      optional:"Useful additions",
      included:"Included",
      includedGuide:"A licensed tour guide is included in every Historic Jeddah tour.",
      guideLanguage:"Guide language",
      chooseLanguage:"Choose a language",
      languages:["Arabic","English","Spanish","French","German","Italian","Russian","Chinese","Japanese","Other"],
      questions:{
        seaMood:"What atmosphere suits the sea experience?", seaPrivate:"Relaxation and privacy", seaFamily:"Family atmosphere", seaTime:"Time by the sea",
        seaJourney:"Which sea experience would you like?", seaTour:"Private sea tour", seaSunset:"Sunset boat journey", seaBayadah:"Bayadah sea day",
        desertStyle:"How would you like the desert experience?", desertCalm:"A relaxed desert session", desertDunes:"A dune experience", desertMix:"A mix of both",
        desertHospitality:"Would you like a private hospitality setup?", yes:"Yes", no:"No",
        includedTaifGuide:"A licensed tour guide is included in every Taif journey.",
        jeddahStops:"Which stop matters most during the Jeddah day?", jeddahMalls:"Malls", jeddahCorniche:"Jeddah Corniche", jeddahMuseums:"Museums", jeddahCafes:"Cafés",
        jeddahTransport:"Transport type", jeddahStandardTransport:"Standard transport", jeddahVipTransport:"VIP transport",
        corporateGoal:"What outcome should the corporate program deliver?", corporateTeam:"Team building", corporateGuests:"Hosting guests or clients", corporateExecutive:"An executive program", corporateWorkplace:"Improving the work environment",
        corporateGuestType:"Who are the guests?", corporateEmployees:"Employees", corporateClients:"Clients", corporateDelegation:"An international delegation",
        eventType:"Occasion type", eventPrivate:"Private celebration", eventCorporate:"Corporate event", eventDinner:"Dinner or gathering",
        eventLocationStatus:"Venue status", eventLocationReady:"The venue is selected", eventLocationSuggest:"We need a venue recommendation",
        eventTone:"Desired atmosphere", eventFormal:"Formal", eventCelebratory:"Celebratory", eventPrivateTone:"Private",
        vipGuestType:"Guest type", vipIndividual:"Individual", vipFamily:"Family", vipDelegation:"Delegation",
        vipPriority:"What matters most?", vipArrival:"Smooth arrival and reception", vipProgram:"A private program", vipReservations:"Reservations and hospitality", vipFull:"Full visit coordination",
        guestService:"Which guest service do you need?", guestServicePlaceholder:"Choose a service",
        airportService:"Which airport service do you need?", airportArrival:"Meet and assist on arrival", airportDeparture:"Airport transfer on departure", arrivalDate:"Arrival date",
        transportNeed:"What type of transport do you need?", transportAirport:"Airport transfer", transportCity:"Transport between locations", transportDay:"Vehicle for the full program",
        diningNeed:"What arrangement do you need?", diningLunch:"Lunch reservation", diningDinner:"Dinner reservation", diningPrivate:"Private dining arrangement",
        hospitalityNeed:"What kind of hospitality do you need?", hospitalityArrival:"Arrival welcome", hospitalityProgram:"Hospitality within the program", hospitalityOccasion:"Hospitality for an occasion",
        hotelNeed:"What do you need from the hotel arrangement?", hotelBooking:"Hotel booking", hotelCoordination:"Coordinating an existing stay", hotelOther:"Another hotel request",
        customArea:"Which setting is closest?", customHistoric:"Historic Jeddah", customSea:"The sea", customDesert:"The desert", customTaif:"Taif", customMix:"A mix of settings",
        privacyLevel:"Privacy level", privacyRegular:"Private", privacyVery:"Very private", customDetails:"Tell us what you have in mind"
      },
      addons:{airport:"Airport meet and assist",transport:"Private transportation",dining:"Dining arrangements",photography:"Professional photography",resort:"Resort or private beach",hospitality:"Private hospitality setup",hotel:"Hotel arrangements",interpreter:"Interpreter",gifts:"Guest gifts",coordination:"Full event coordination",flowers:"Flowers and gifts",vipCar:"VIP vehicle",tailor:"Tailor at the hotel",abaya:"Abaya service",guide:"Licensed guide",concierge:"Concierge support"}
    },
    ar: {
      optional:"إضافات اختيارية",
      included:"مشمول",
      includedGuide:"تشمل كل جولة في جدة التاريخية مرشدًا سياحيًا مرخصًا.",
      guideLanguage:"لغة المرشد",
      chooseLanguage:"اختر اللغة",
      languages:["العربية","الإنجليزية","الإسبانية","الفرنسية","الألمانية","الإيطالية","الروسية","الصينية","اليابانية","لغة أخرى"],
      questions:{
        seaMood:"ما الأجواء المناسبة للتجربة البحرية؟", seaPrivate:"استرخاء وخصوصية", seaFamily:"أجواء عائلية", seaTime:"وقت على البحر",
        seaJourney:"ما نوع التجربة البحرية التي تفضلونها؟", seaTour:"جولة بحرية خاصة", seaSunset:"رحلة وقت الغروب", seaBayadah:"يوم بحري إلى بياضة",
        desertStyle:"كيف تحبون التجربة؟", desertCalm:"جلسة هادئة في الصحراء", desertDunes:"تجربة الكثبان الرملية", desertMix:"مزيج بينهما",
        desertHospitality:"هل ترغبون بجلسة ضيافة خاصة؟", yes:"نعم", no:"لا",
        includedTaifGuide:"تشمل كل رحلة إلى الطائف مرشدًا سياحيًا مرخصًا.",
        jeddahStops:"ما المحطة التي تهمكم أكثر في يوم جدة؟", jeddahMalls:"المولات", jeddahCorniche:"كورنيش جدة", jeddahMuseums:"المتاحف", jeddahCafes:"المقاهي",
        jeddahTransport:"نوع النقل", jeddahStandardTransport:"نقل عادي", jeddahVipTransport:"نقل VIP",
        corporateGoal:"ما النتيجة المطلوبة من البرنامج؟", corporateTeam:"بناء فريق", corporateGuests:"استقبال ضيوف أو عملاء", corporateExecutive:"برنامج تنفيذي", corporateWorkplace:"تحسين بيئة العمل",
        corporateGuestType:"نوع الضيوف", corporateEmployees:"موظفون", corporateClients:"عملاء", corporateDelegation:"وفد دولي",
        eventType:"نوع المناسبة", eventPrivate:"احتفال خاص", eventCorporate:"فعالية شركة", eventDinner:"عشاء أو لقاء",
        eventLocationStatus:"حالة الموقع", eventLocationReady:"تم اختيار الموقع", eventLocationSuggest:"نحتاج اقتراح موقع",
        eventTone:"الطابع المطلوب", eventFormal:"رسمي", eventCelebratory:"احتفالي", eventPrivateTone:"خاص",
        vipGuestType:"نوع الضيف", vipIndividual:"فرد", vipFamily:"عائلة", vipDelegation:"وفد",
        vipPriority:"ما الذي يهم أكثر؟", vipArrival:"وصول واستقبال سلس", vipProgram:"برنامج خاص", vipReservations:"حجوزات وضيافة", vipFull:"تنسيق كامل للزيارة",
        guestService:"الخدمة المطلوبة", guestServicePlaceholder:"اختر الخدمة",
        airportService:"نوع خدمة المطار", airportArrival:"استقبال ومساعدة عند الوصول", airportDeparture:"توصيل إلى المطار عند المغادرة", arrivalDate:"تاريخ الوصول",
        transportNeed:"نوع النقل المطلوب", transportAirport:"نقل من أو إلى المطار", transportCity:"تنقل بين المواقع", transportDay:"سيارة للبرنامج كامل",
        diningNeed:"نوع الترتيب المطلوب", diningLunch:"حجز غداء", diningDinner:"حجز عشاء", diningPrivate:"ترتيب عشاء خاص",
        hospitalityNeed:"نوع الضيافة", hospitalityArrival:"ضيافة عند الوصول", hospitalityProgram:"ضيافة ضمن البرنامج", hospitalityOccasion:"ضيافة لمناسبة",
        hotelNeed:"ما الذي تحتاجه في ترتيب الفندق؟", hotelBooking:"حجز فندق", hotelCoordination:"تنسيق إقامة قائمة", hotelOther:"طلب فندقي آخر",
        customArea:"المجال الأقرب", customHistoric:"جدة التاريخية", customSea:"البحر", customDesert:"الصحراء", customTaif:"الطائف", customMix:"مزيج بين أكثر من تجربة",
        privacyLevel:"مستوى الخصوصية", privacyRegular:"خاص", privacyVery:"خاص جدًا", customDetails:"صف لنا ما تتخيله لهذه التجربة"
      },
      addons:{airport:"استقبال ومساعدة في المطار",transport:"نقل خاص",dining:"ترتيبات المطاعم",photography:"تصوير احترافي",resort:"منتجع أو شاطئ خاص",hospitality:"جلسة ضيافة خاصة",hotel:"ترتيبات الفندق",interpreter:"مترجم",gifts:"هدايا للضيوف",coordination:"تنسيق كامل للفعالية",flowers:"ورد وهدايا",vipCar:"سيارة VIP",tailor:"خياط في الفندق",abaya:"خدمة العباية",guide:"مرشد سياحي مرخص",concierge:"دعم الكونسيرج"}
    },
    es: {
      optional:"Complementos útiles",
      included:"Incluido",
      includedGuide:"Todas las visitas a Yeda Histórica incluyen un guía turístico autorizado.",
      guideLanguage:"Idioma del guía",
      chooseLanguage:"Elige un idioma",
      languages:["Árabe","Inglés","Español","Francés","Alemán","Italiano","Ruso","Chino","Japonés","Otro"],
      questions:{
        seaMood:"¿Qué ambiente encaja con la experiencia marina?", seaPrivate:"Relajación y privacidad", seaFamily:"Ambiente familiar", seaTime:"Tiempo junto al mar",
        seaJourney:"¿Qué experiencia marina prefieres?", seaTour:"Paseo privado en el mar", seaSunset:"Paseo en barco al atardecer", seaBayadah:"Día de mar en Bayadah",
        desertStyle:"¿Cómo prefieren la experiencia del desierto?", desertCalm:"Una sesión tranquila en el desierto", desertDunes:"Una experiencia entre dunas", desertMix:"Una mezcla de ambas",
        desertHospitality:"¿Desean una sesión privada de hospitalidad?", yes:"Sí", no:"No",
        includedTaifGuide:"Todas las excursiones a Taif incluyen un guía turístico autorizado.",
        jeddahStops:"¿Qué parada importa más durante el día en Yeda?", jeddahMalls:"Centros comerciales", jeddahCorniche:"Corniche de Yeda", jeddahMuseums:"Museos", jeddahCafes:"Cafeterías",
        jeddahTransport:"Tipo de transporte", jeddahStandardTransport:"Transporte estándar", jeddahVipTransport:"Transporte VIP",
        corporateGoal:"¿Qué resultado debe ofrecer el programa corporativo?", corporateTeam:"Creación de equipo", corporateGuests:"Recibir invitados o clientes", corporateExecutive:"Un programa ejecutivo", corporateWorkplace:"Mejorar el entorno de trabajo",
        corporateGuestType:"¿Quiénes son los invitados?", corporateEmployees:"Empleados", corporateClients:"Clientes", corporateDelegation:"Una delegación internacional",
        eventType:"Tipo de ocasión", eventPrivate:"Celebración privada", eventCorporate:"Evento corporativo", eventDinner:"Cena o encuentro",
        eventLocationStatus:"Estado del lugar", eventLocationReady:"El lugar ya está elegido", eventLocationSuggest:"Necesitamos una recomendación de lugar",
        eventTone:"Ambiente deseado", eventFormal:"Formal", eventCelebratory:"Festivo", eventPrivateTone:"Privado",
        vipGuestType:"Tipo de huésped", vipIndividual:"Individual", vipFamily:"Familia", vipDelegation:"Delegación",
        vipPriority:"¿Qué importa más?", vipArrival:"Llegada y recepción fluida", vipProgram:"Un programa privado", vipReservations:"Reservas y hospitalidad", vipFull:"Coordinación completa de la visita",
        guestService:"Servicio para huéspedes", guestServicePlaceholder:"Elige un servicio",
        airportService:"Servicio de aeropuerto", airportArrival:"Recepción y asistencia a la llegada", airportDeparture:"Traslado al aeropuerto a la salida", arrivalDate:"Fecha de llegada",
        transportNeed:"¿Qué transporte necesitas?", transportAirport:"Traslado desde o hacia el aeropuerto", transportCity:"Traslado entre ubicaciones", transportDay:"Vehículo durante todo el programa",
        diningNeed:"¿Qué arreglo necesitas?", diningLunch:"Reserva de almuerzo", diningDinner:"Reserva de cena", diningPrivate:"Cena privada",
        hospitalityNeed:"Tipo de hospitalidad", hospitalityArrival:"Bienvenida a la llegada", hospitalityProgram:"Hospitalidad durante el programa", hospitalityOccasion:"Hospitalidad para una ocasión",
        hotelNeed:"¿Qué necesitas del hotel?", hotelBooking:"Reserva de hotel", hotelCoordination:"Coordinación de una estancia existente", hotelOther:"Otra solicitud de hotel",
        customArea:"¿Qué entorno es el más cercano?", customHistoric:"Yeda Histórica", customSea:"El mar", customDesert:"El desierto", customTaif:"Taif", customMix:"Una mezcla de experiencias",
        privacyLevel:"Nivel de privacidad", privacyRegular:"Privado", privacyVery:"Muy privado", customDetails:"Cuéntanos qué tienes en mente"
      },
      addons:{airport:"Recepción y asistencia en el aeropuerto",transport:"Transporte privado",dining:"Arreglos gastronómicos",photography:"Fotografía profesional",resort:"Resort o playa privada",hospitality:"Sesión privada de hospitalidad",hotel:"Arreglos de hotel",interpreter:"Intérprete",gifts:"Regalos para huéspedes",coordination:"Coordinación completa del evento",flowers:"Flores y regalos",vipCar:"Vehículo VIP",tailor:"Sastre en el hotel",abaya:"Servicio de abaya",guide:"Guía turístico acreditado",concierge:"Asistencia de concierge"}
    }
  };

  var REQUEST_CONFIG = {
    "historic-jeddah": {items:[
      {kind:"note", label:"included", text:"includedGuide"},
      {kind:"select", name:"guideLanguage", label:"guideLanguage", placeholder:"chooseLanguage", options:"languages", required:true},
      {kind:"addons", options:["transport","dining","photography"]}
    ]},
    sea: {items:[
      {kind:"choice", name:"seaJourney", label:"seaJourney", options:["seaTour","seaSunset","seaBayadah"], required:true},
      {kind:"choice", name:"seaMood", label:"seaMood", options:["seaPrivate","seaFamily","seaTime"]},
      {kind:"addons", options:["resort","transport","photography"]}
    ]},
    desert: {items:[
      {kind:"choice", name:"desertStyle", label:"desertStyle", options:["desertCalm","desertDunes","desertMix"]},
      {kind:"choice", name:"desertHospitality", label:"desertHospitality", options:["yes","no"]},
      {kind:"addons", options:["transport","photography"]}
    ]},
    taif: {items:[
      {kind:"note", label:"included", text:"includedTaifGuide"},
      {kind:"select", name:"guideLanguage", label:"guideLanguage", placeholder:"chooseLanguage", options:"languages", required:true}
    ]},
    "jeddah-day": {items:[
      {kind:"choice", name:"jeddahStops", label:"jeddahStops", options:["jeddahMalls","jeddahCorniche","jeddahMuseums","jeddahCafes"], required:true},
      {kind:"choice", name:"jeddahTransport", label:"jeddahTransport", options:["jeddahStandardTransport","jeddahVipTransport"], required:true},
      {kind:"addons", options:["dining","photography"]}
    ]},
    corporate: {items:[
      {kind:"choice", name:"corporateGoal", label:"corporateGoal", options:["corporateTeam","corporateGuests","corporateExecutive","corporateWorkplace"]},
      {kind:"choice", name:"corporateGuestType", label:"corporateGuestType", options:["corporateEmployees","corporateClients","corporateDelegation"]},
      {kind:"addons", options:["airport","hotel","interpreter","gifts"]}
    ]},
    "private-event": {items:[
      {kind:"choice", name:"eventType", label:"eventType", options:["eventPrivate","eventCorporate","eventDinner"]},
      {kind:"choice", name:"eventLocationStatus", label:"eventLocationStatus", options:["eventLocationReady","eventLocationSuggest"]},
      {kind:"choice", name:"eventTone", label:"eventTone", options:["eventFormal","eventCelebratory","eventPrivateTone"]},
      {kind:"addons", options:["coordination","flowers","photography"]}
    ]},
    "vip-hosting": {items:[
      {kind:"choice", name:"vipGuestType", label:"vipGuestType", options:["vipIndividual","vipFamily","vipDelegation"]},
      {kind:"choice", name:"vipPriority", label:"vipPriority", options:["vipArrival","vipProgram","vipReservations","vipFull"]},
      {kind:"addons", options:["airport","vipCar","hotel","dining","tailor","abaya"]}
    ]},
    "guest-services": {items:[
      {kind:"select", name:"guestService", label:"guestService", placeholder:"guestServicePlaceholder", options:["airport","transport","guide","dining","hospitality","hotel","tailor","abaya","flowers","concierge"], required:true},
      {kind:"choice", name:"airportService", label:"airportService", options:["airportArrival","airportDeparture"], dependsOn:"guestService:airport"},
      {kind:"input", name:"arrivalDate", label:"arrivalDate", inputType:"date", dependsOn:"guestService:airport"},
      {kind:"choice", name:"transportNeed", label:"transportNeed", options:["transportAirport","transportCity","transportDay"], dependsOn:"guestService:transport"},
      {kind:"select", name:"guideLanguage", label:"guideLanguage", placeholder:"chooseLanguage", options:"languages", required:true, dependsOn:"guestService:guide"},
      {kind:"choice", name:"diningNeed", label:"diningNeed", options:["diningLunch","diningDinner","diningPrivate"], dependsOn:"guestService:dining"},
      {kind:"choice", name:"hospitalityNeed", label:"hospitalityNeed", options:["hospitalityArrival","hospitalityProgram","hospitalityOccasion"], dependsOn:"guestService:hospitality"},
      {kind:"choice", name:"hotelNeed", label:"hotelNeed", options:["hotelBooking","hotelCoordination","hotelOther"], dependsOn:"guestService:hotel"}
    ]},
    "custom-experience": {items:[
      {kind:"choice", name:"customArea", label:"customArea", options:["customHistoric","customSea","customDesert","customTaif","customMix"]},
      {kind:"choice", name:"privacyLevel", label:"privacyLevel", options:["privacyRegular","privacyVery"]},
      {kind:"textarea", name:"customExperienceDetails", label:"customDetails"}
    ]}
  };

  function currentLanguage() {
    var lang = document.documentElement.lang || "en";
    return FORM_TEXT[lang] ? lang : "en";
  }

  function addDynamicStyles() {
    if (document.getElementById("aventura-dynamic-request-styles")) return;
    var style = document.createElement("style");
    style.id = "aventura-dynamic-request-styles";
    style.textContent = ".dynamic-request-panel{grid-column:1/-1;margin-top:.35rem;padding:1.25rem;border:1px solid rgba(22,38,54,.14);border-radius:18px;background:rgba(255,255,255,.72);animation:aventuraPanelIn .28s ease both}.dynamic-request-panel .dynamic-note{margin:0;padding:.8rem 1rem;border-radius:12px;background:rgba(201,168,106,.13)}.dynamic-request-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.dynamic-request-grid .full{grid-column:1/-1}.dynamic-choice{min-width:0;margin:0;padding:0;border:0}.dynamic-choice legend,.dynamic-addons legend{margin:0 0 .7rem;font-weight:700}.dynamic-choice-grid,.dynamic-addons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem}.dynamic-choice-grid label,.dynamic-addons label{display:flex;align-items:flex-start;gap:.65rem;padding:.8rem;border:1px solid rgba(22,38,54,.12);border-radius:12px;background:#fff;cursor:pointer}.dynamic-choice-grid input,.dynamic-addons input{margin-top:.18rem}.dynamic-addons{min-width:0;margin:0;padding:0;border:0}@keyframes aventuraPanelIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@media(max-width:720px){.dynamic-request-grid,.dynamic-choice-grid,.dynamic-addons{grid-template-columns:1fr}}";
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function textFor(key, text) {
    if (text.questions && text.questions[key]) return text.questions[key];
    if (text.addons && text.addons[key]) return text.addons[key];
    return text[key] || key;
  }

  function dependencyAttributes(item) {
    return item.dependsOn ? ' data-depends-on="' + escapeHtml(item.dependsOn) + '" hidden' : "";
  }

  function disabledAttribute(item) {
    return item.dependsOn ? " disabled" : "";
  }

  function optionEntries(item, text) {
    if (item.options === "languages") {
      return text.languages.map(function (label, index) { return [String(index), label]; });
    }
    return (item.options || []).map(function (key) { return [key, textFor(key, text)]; });
  }

  function selectMarkup(item, text) {
    var id = "request-" + item.name;
    var label = textFor(item.label, text);
    var html = '<div class="field full" data-request-summary-label="' + escapeHtml(label) + '"' + dependencyAttributes(item) + '><label for="' + id + '">' + escapeHtml(label) + (item.required ? " *" : "") + '</label><select id="' + id + '" name="' + item.name + '" data-request-summary' + (item.required ? " required" : "") + disabledAttribute(item) + '><option value="" selected disabled>' + escapeHtml(textFor(item.placeholder, text)) + "</option>";
    optionEntries(item, text).forEach(function (option) {
      html += '<option value="' + escapeHtml(option[0]) + '">' + escapeHtml(option[1]) + "</option>";
    });
    return html + "</select></div>";
  }

  function choiceMarkup(item, text) {
    var label = textFor(item.label, text);
    var html = '<fieldset class="dynamic-choice full" data-request-summary-label="' + escapeHtml(label) + '"' + dependencyAttributes(item) + "><legend>" + escapeHtml(label) + (item.required ? " *" : "") + '</legend><div class="dynamic-choice-grid">';
    optionEntries(item, text).forEach(function (option, index) {
      var id = "request-" + item.name + "-" + index;
      html += '<label for="' + id + '"><input id="' + id + '" type="radio" name="' + item.name + '" value="' + escapeHtml(option[0]) + '" data-request-summary' + (item.required ? " required" : "") + disabledAttribute(item) + "><span>" + escapeHtml(option[1]) + "</span></label>";
    });
    return html + "</div></fieldset>";
  }

  function inputMarkup(item, text) {
    var id = "request-" + item.name;
    var label = textFor(item.label, text);
    return '<div class="field full" data-request-summary-label="' + escapeHtml(label) + '"' + dependencyAttributes(item) + '><label for="' + id + '">' + escapeHtml(label) + (item.required ? " *" : "") + '</label><input id="' + id + '" name="' + item.name + '" type="' + (item.inputType || "text") + '" data-request-summary' + (item.required ? " required" : "") + disabledAttribute(item) + "></div>";
  }

  function textareaMarkup(item, text) {
    var id = "request-" + item.name;
    var label = textFor(item.label, text);
    return '<div class="field full" data-request-summary-label="' + escapeHtml(label) + '"' + dependencyAttributes(item) + '><label for="' + id + '">' + escapeHtml(label) + (item.required ? " *" : "") + '</label><textarea id="' + id + '" name="' + item.name + '" data-request-summary' + (item.required ? " required" : "") + disabledAttribute(item) + "></textarea></div>";
  }

  function addonsMarkup(item, text) {
    var html = '<fieldset class="dynamic-addons full" data-request-summary-label="' + escapeHtml(text.optional) + '"><legend>' + escapeHtml(text.optional) + '</legend><div class="dynamic-choice-grid">';
    item.options.forEach(function (addon, index) {
      var id = "request-addon-" + addon + "-" + index;
      html += '<label for="' + id + '"><input id="' + id + '" type="checkbox" name="addons[]" value="' + addon + '" data-request-summary><span>' + escapeHtml(textFor(addon, text)) + "</span></label>";
    });
    return html + "</div></fieldset>";
  }

  function itemMarkup(item, text) {
    if (item.kind === "note") return '<div class="dynamic-note full"><strong>' + escapeHtml(textFor(item.label, text)) + ":</strong> " + escapeHtml(textFor(item.text, text)) + "</div>";
    if (item.kind === "select") return selectMarkup(item, text);
    if (item.kind === "choice") return choiceMarkup(item, text);
    if (item.kind === "input") return inputMarkup(item, text);
    if (item.kind === "textarea") return textareaMarkup(item, text);
    if (item.kind === "addons") return addonsMarkup(item, text);
    return "";
  }

  var REQUEST_TYPE_BY_ITEM = {
    "historic-walk": "historic-jeddah",
    "historic-group": "historic-jeddah",
    "historic-transport": "historic-jeddah",
    "historic-vip": "historic-jeddah",
    "historic-dinner": "historic-jeddah",
    sea: "sea",
    "golden-hour": "sea",
    "bayadah-day": "sea",
    "bayadah-grand": "sea",
    desert: "desert",
    taif: "taif",
    "jeddah-day": "jeddah-day",
    "sea-to-balad": "jeddah-day",
    "private-event": "private-event",
    "executive-meeting": "private-event",
    "networking-dinner": "private-event",
    recognition: "private-event",
    "experience-day": "private-event",
    "team-program": "private-event",
    "vip-delegation": "vip-hosting",
    "international-guests": "vip-hosting",
    "executive-arrival": "vip-hosting",
    "executive-offsite": "corporate",
    "incentive-day": "corporate",
    "team-building": "corporate",
    "corporate-experience-day": "corporate",
    "leadership-half-day": "corporate",
    "team-discovery": "corporate",
    planning: "guest-services",
    "meet-assist": "guest-services",
    transport: "guest-services",
    guide: "guest-services",
    hospitality: "guest-services",
    destination: "guest-services",
    thobe: "guest-services",
    abaya: "guest-services",
    flower: "guest-services",
    "airport-welcome": "guest-services",
    "executive-transport": "guest-services",
    "meeting-setup": "guest-services",
    concierge: "guest-services"
  };

  var ADDON_BY_ITEM = {
    planning: "concierge",
    "meet-assist": "airport",
    transport: "transport",
    guide: "guide",
    hospitality: "hospitality",
    destination: "concierge",
    thobe: "tailor",
    abaya: "abaya",
    flower: "flowers",
    "airport-welcome": "airport",
    "executive-transport": "transport",
    concierge: "concierge"
  };

  var SEA_JOURNEY_BY_ITEM = {
    "golden-hour": "seaSunset",
    "bayadah-day": "seaBayadah",
    "bayadah-grand": "seaBayadah"
  };

  function isKnownRequestType(value) {
    return Boolean(value) && REQUEST_TYPES.en.some(function (item) { return item[0] === value; });
  }

  function requestTypeFromUrl() {
    var query = new URLSearchParams(window.location.search);
    var type = query.get("type") || "";
    var item = query.get("request") || query.get("service") || "";
    if (isKnownRequestType(type)) return type;
    if (REQUEST_TYPE_BY_ITEM[item]) return REQUEST_TYPE_BY_ITEM[item];
    if (type === "experience" || type === "other") return "custom-experience";
    if (type === "event") return "private-event";
    if (type === "corporate") return "corporate";
    if (type === "service") return "guest-services";
    if (type === "vip") return "vip-hosting";
    return "";
  }

  function requestedAddonFromUrl() {
    var query = new URLSearchParams(window.location.search);
    var item = query.get("request") || query.get("service") || "";
    return ADDON_BY_ITEM[item] || "";
  }

  function requestedSeaJourneyFromUrl() {
    var query = new URLSearchParams(window.location.search);
    var item = query.get("request") || query.get("service") || "";
    return SEA_JOURNEY_BY_ITEM[item] || "";
  }

  function updateConditionalFields(panel) {
    panel.querySelectorAll("[data-depends-on]").forEach(function (container) {
      var dependency = container.getAttribute("data-depends-on");
      var parts = dependency.split(":");
      var selected = panel.querySelector('[name="' + parts[0] + '"]:checked') || panel.querySelector('[name="' + parts[0] + '"]');
      var shouldShow = Boolean(selected && selected.value === parts[1]);
      container.hidden = !shouldShow;
      container.querySelectorAll("input, select, textarea").forEach(function (control) {
        control.disabled = !shouldShow;
      });
    });
  }

  function notifyRequestDetailsUpdated() {
    var form = document.querySelector("[data-contact-form]");
    if (form) form.dispatchEvent(new CustomEvent("aventura:request-details-updated"));
  }

  function setMinimumDate(panel) {
    var today = new Date();
    var localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    panel.querySelectorAll('input[type="date"]').forEach(function (field) { field.setAttribute("min", localDate); });
  }

  function renderDynamicRequestFields() {
    var select = document.getElementById("type");
    var secondGrid = document.querySelector('[data-request-step="2"] [data-request-step-grid]');
    if (!select || !secondGrid) return;

    var existing = document.getElementById("dynamicRequestPanel");
    if (existing) existing.remove();

    var config = REQUEST_CONFIG[select.value];
    if (!config) {
      notifyRequestDetailsUpdated();
      return;
    }

    var text = FORM_TEXT[currentLanguage()];
    var panel = document.createElement("section");
    panel.id = "dynamicRequestPanel";
    panel.className = "dynamic-request-panel";
    panel.setAttribute("aria-live", "polite");
    panel.innerHTML = '<div class="dynamic-request-grid">' + config.items.map(function (item) { return itemMarkup(item, text); }).join("") + "</div>";

    var requestedAddon = requestedAddonFromUrl();
    var requestedService = panel.querySelector('[name="guestService"]');
    if (requestedAddon && requestedService && Array.from(requestedService.options).some(function (option) { return option.value === requestedAddon; })) {
      requestedService.value = requestedAddon;
    }

    var requestedSeaJourney = requestedSeaJourneyFromUrl();
    var selectedSeaJourney = requestedSeaJourney && panel.querySelector('[name="seaJourney"][value="' + requestedSeaJourney + '"]');
    if (selectedSeaJourney) {
      selectedSeaJourney.checked = true;
    }

    var detailGroup = secondGrid.querySelector("[data-request-details]");
    var message = document.getElementById("message");
    var messageWrapper = message && message.closest(".field");
    var anchor = detailGroup || messageWrapper || secondGrid.querySelector(".request-step-actions");
    if (anchor) secondGrid.insertBefore(panel, anchor);
    else secondGrid.appendChild(panel);

    setMinimumDate(panel);
    updateConditionalFields(panel);
    panel.addEventListener("change", function () {
      updateConditionalFields(panel);
      notifyRequestDetailsUpdated();
    });
    notifyRequestDetailsUpdated();
  }

  function updateRequestTypeOptions(language) {
    var select=document.getElementById("type");
    if(!select||!document.body||document.body.getAttribute("data-page")!=="contact")return;
    var currentValue=select.value;
    var requestedValue=requestTypeFromUrl();
    var selectedValue=isKnownRequestType(currentValue)?currentValue:requestedValue;
    var options=REQUEST_TYPES[language]||REQUEST_TYPES.en;
    select.innerHTML="";
    options.forEach(function(item,index){var option=document.createElement("option");option.value=item[0];option.textContent=item[1];if(index===0)option.disabled=true;select.appendChild(option);});
    select.value=options.some(function(item){return item[0]===selectedValue;})?selectedValue:"";
    renderDynamicRequestFields();
  }

  function initializeRequestTypes() {
    addDynamicStyles();
    updateRequestTypeOptions(currentLanguage());
    var select=document.getElementById("type");
    if(select)select.addEventListener("change",function(){renderDynamicRequestFields();if(window.AVENTURA_TRACK)window.AVENTURA_TRACK("request_type_select",{requestType:select.value});});
    document.addEventListener("aventura:language",function(event){updateRequestTypeOptions((event.detail&&event.detail.language)||currentLanguage());});
    document.addEventListener("aventura:contact-wizard-ready",function(){updateRequestTypeOptions(currentLanguage());});
  }

  applyLaunchTheme();
  var SAFE_DETAIL_KEYS=["page","language","target","requestType","requestId","productId","quantity","source"];
  function cleanDetails(details){var clean={};details=details||{};SAFE_DETAIL_KEYS.forEach(function(key){if(details[key]!==undefined&&details[key]!==null&&details[key]!=="")clean[key]=String(details[key]).slice(0,120);});return clean;}
  function track(name,details){var event=Object.assign({event:"aventura_"+name,page:document.body?document.body.getAttribute("data-page")||"unknown":"unknown",language:document.documentElement.lang||"en"},cleanDetails(details));window.dataLayer=window.dataLayer||[];window.dataLayer.push(event);document.dispatchEvent(new CustomEvent("aventura:analytics",{detail:event}));}
  window.AVENTURA_TRACK=track;
  document.addEventListener("click",function(event){var control=event.target.closest("a, button");if(!control)return;var href=control.getAttribute("href")||"";if(href.indexOf("wa.me/")!==-1)track("whatsapp_open",{source:control.className||"link"});else if(control.matches("[data-experience-request]"))track("quote_start",{source:"experience",target:href});else if(control.matches("[data-quote-item]"))track("boutique_selection",{productId:control.getAttribute("data-quote-item")});else if(control.matches("[data-nav], [data-nav-alias]"))track("navigation",{target:href});else if(control.matches("[data-boutique-filter]"))track("boutique_filter",{target:control.getAttribute("data-boutique-filter")});else if(control.matches("[data-boutique-type]"))track("boutique_filter",{target:control.getAttribute("data-boutique-type")});});
  document.addEventListener("aventura:language",function(event){track("language_change",{language:event.detail&&event.detail.language});});
  function pageView(){initializeRequestTypes();track("page_view",{page:document.body?document.body.getAttribute("data-page"):"unknown",language:document.documentElement.lang});}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",pageView,{once:true});else pageView();
}());
