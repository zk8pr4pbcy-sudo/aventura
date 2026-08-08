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
    en: {customize:"Add what suits your guests",optional:"Additions",includedGuide:"A licensed tour guide is included in every Historic Jeddah tour.",guideLanguage:"Guide language",chooseLanguage:"Choose a language",languages:["Arabic","English","Spanish","French","German","Italian","Russian","Chinese","Japanese","Other"],period:"Preferred period",periodOptions:["Morning","Sunset","Evening","Flexible"],seaDuration:"Sea experience duration",durationOptions:["One hour","Half day","Full day","Flexible"],companyCity:"City",eventType:"Occasion type",eventLocation:"Preferred location",arrivalDate:"Arrival date",customDetails:"Describe the experience you would like",included:"Included",addons:{airport:"Airport meet and assist",transport:"Private transportation",dining:"Dining arrangements",photography:"Professional photography",resort:"Resort or private beach",hospitality:"Private hospitality setup",hotel:"Hotel arrangements",interpreter:"Interpreter",gifts:"Guest gifts",coordination:"Full event coordination",flowers:"Flowers and gifts",vipCar:"VIP vehicle",tailor:"Tailor at the hotel",abaya:"Abaya service"}},
    ar: {customize:"أضف ما يناسب ضيوفك",optional:"إضافات",includedGuide:"تشمل كل جولة في جدة التاريخية مرشدًا سياحيًا مرخصًا.",guideLanguage:"لغة المرشد",chooseLanguage:"اختر اللغة",languages:["العربية","الإنجليزية","الإسبانية","الفرنسية","الألمانية","الإيطالية","الروسية","الصينية","اليابانية","لغة أخرى"],period:"الفترة المفضلة",periodOptions:["صباحية","وقت الغروب","مسائية","مرنة"],seaDuration:"مدة التجربة البحرية",durationOptions:["ساعة واحدة","نصف يوم","يوم كامل","مرنة"],companyCity:"المدينة",eventType:"نوع المناسبة",eventLocation:"الموقع المفضل",arrivalDate:"تاريخ الوصول",customDetails:"صف لنا التجربة التي ترغب بها",included:"مشمول",addons:{airport:"استقبال ومساعدة في المطار",transport:"نقل خاص",dining:"ترتيبات المطاعم",photography:"تصوير احترافي",resort:"منتجع أو شاطئ خاص",hospitality:"جلسة ضيافة خاصة",hotel:"ترتيبات الفندق",interpreter:"مترجم",gifts:"هدايا للضيوف",coordination:"تنسيق كامل للفعالية",flowers:"ورد وهدايا",vipCar:"سيارة VIP",tailor:"خياط في الفندق",abaya:"خدمة العباية"}},
    es: {customize:"Añade lo que mejor se adapte a tus invitados",optional:"Complementos",includedGuide:"Todas las visitas a Yeda Histórica incluyen un guía turístico autorizado.",guideLanguage:"Idioma del guía",chooseLanguage:"Elige un idioma",languages:["Árabe","Inglés","Español","Francés","Alemán","Italiano","Ruso","Chino","Japonés","Otro"],period:"Periodo preferido",periodOptions:["Mañana","Atardecer","Noche","Flexible"],seaDuration:"Duración de la experiencia marina",durationOptions:["Una hora","Medio día","Día completo","Flexible"],companyCity:"Ciudad",eventType:"Tipo de ocasión",eventLocation:"Lugar preferido",arrivalDate:"Fecha de llegada",customDetails:"Describe la experiencia que deseas",included:"Incluido",addons:{airport:"Recepción y asistencia en el aeropuerto",transport:"Transporte privado",dining:"Reservas gastronómicas",photography:"Fotografía profesional",resort:"Resort o playa privada",hospitality:"Hospitalidad privada",hotel:"Alojamiento en hotel",interpreter:"Intérprete",gifts:"Regalos para huéspedes",coordination:"Coordinación completa del evento",flowers:"Flores y regalos",vipCar:"Vehículo VIP",tailor:"Sastre en el hotel",abaya:"Servicio de abaya"}}
  };

  FORM_TEXT.en.serviceDetails = "Describe the guest service you need";
  FORM_TEXT.ar.serviceDetails = "صف لنا خدمة الضيف التي تحتاجها";
  FORM_TEXT.es.serviceDetails = "Describe el servicio para huéspedes que necesitas";
  FORM_TEXT.en.addons.guide = "Licensed guide";
  FORM_TEXT.ar.addons.guide = "مرشد سياحي مرخص";
  FORM_TEXT.es.addons.guide = "Guía turístico acreditado";
  FORM_TEXT.en.addons.concierge = "Concierge support";
  FORM_TEXT.ar.addons.concierge = "دعم الكونسيرج";
  FORM_TEXT.es.addons.concierge = "Asistencia de concierge";

  var OBJECTIVE_GROUP_BY_TYPE = {
    "historic-jeddah": "experience",
    sea: "experience",
    desert: "experience",
    taif: "experience",
    "jeddah-day": "experience",
    corporate: "corporate",
    "private-event": "event",
    "vip-hosting": "vip",
    "custom-experience": "custom"
  };

  var OBJECTIVE_CONFIG = {
    en: {
      experience: {label:"What are you looking for in this experience?",placeholder:"Choose the closest priority",options:[["privacy","Privacy and a relaxed pace"],["place","Discovering the place and its character"],["celebration","Celebrating an occasion"],["recommend","I would like Aventura to recommend"]]},
      corporate: {label:"What is the most important outcome of the corporate program?",placeholder:"Choose the closest outcome",options:[["hosting","Hosting guests or a delegation"],["team","Strengthening or rewarding the team"],["discovery","Introducing guests to Jeddah and local culture"],["recommend","I would like Aventura to recommend"]]},
      event: {label:"What is the main purpose of the event?",placeholder:"Choose the closest purpose",options:[["celebration","Celebrating an occasion"],["hosting","Hosting guests"],["team","Strengthening relationships or rewarding a team"],["recommend","I would like Aventura to recommend"]]},
      vip: {label:"What does the guest or delegation need most?",placeholder:"Choose the closest need",options:[["arrival","Coordinated arrival and transportation"],["program","A private program for the guest"],["hospitality","Hotel and dining arrangements"],["recommend","I would like Aventura to recommend"]]},
      custom: {label:"What would you like the experience to achieve?",placeholder:"Choose the closest outcome",options:[["privacy","Privacy and a relaxed pace"],["place","Discovering the place and its character"],["celebration","Celebrating an occasion"],["recommend","I would like Aventura to recommend"]]},
    },
    ar: {
      experience: {label:"ما الذي تبحث عنه في هذه التجربة؟",placeholder:"اختر الأولوية الأقرب",options:[["privacy","الخصوصية والراحة"],["place","اكتشاف المكان وطبيعته"],["celebration","الاحتفال بمناسبة"],["recommend","أرغب أن تقترح أفنتورا الأنسب"]]},
      corporate: {label:"ما النتيجة الأهم التي ينبغي أن يحققها برنامج الشركة؟",placeholder:"اختر النتيجة الأقرب",options:[["hosting","استضافة ضيوف أو وفد"],["team","تقوية الفريق أو مكافأته"],["discovery","تعريف الضيوف بجدة والثقافة المحلية"],["recommend","أرغب أن تقترح أفنتورا الأنسب"]]},
      event: {label:"ما الغرض الرئيسي من الفعالية؟",placeholder:"اختر الغرض الأقرب",options:[["celebration","الاحتفال بمناسبة"],["hosting","استضافة ضيوف"],["team","تقوية العلاقة أو مكافأة فريق"],["recommend","أرغب أن تقترح أفنتورا الأنسب"]]},
      vip: {label:"ما الذي يحتاجه الضيف أو الوفد أكثر؟",placeholder:"اختر الاحتياج الأقرب",options:[["arrival","استقبال وتنقل منسق"],["program","برنامج خاص للضيف"],["hospitality","ترتيبات الفندق والمطاعم"],["recommend","أرغب أن تقترح أفنتورا الأنسب"]]},
      custom: {label:"ما النتيجة التي ترغب أن تحققها التجربة؟",placeholder:"اختر النتيجة الأقرب",options:[["privacy","الخصوصية والراحة"],["place","اكتشاف المكان وطبيعته"],["celebration","الاحتفال بمناسبة"],["recommend","أرغب أن تقترح أفنتورا الأنسب"]]},
    },
    es: {
      experience: {label:"¿Qué buscas en esta experiencia?",placeholder:"Elige la prioridad más cercana",options:[["privacy","Privacidad y un ritmo relajado"],["place","Descubrir el lugar y su carácter"],["celebration","Celebrar una ocasión"],["recommend","Prefiero una recomendación de Aventura"]]},
      corporate: {label:"¿Cuál es el resultado más importante del programa corporativo?",placeholder:"Elige el resultado más cercano",options:[["hosting","Recibir invitados o una delegación"],["team","Fortalecer o reconocer al equipo"],["discovery","Presentar Yeda y la cultura local a los invitados"],["recommend","Prefiero una recomendación de Aventura"]]},
      event: {label:"¿Cuál es el objetivo principal del evento?",placeholder:"Elige el objetivo más cercano",options:[["celebration","Celebrar una ocasión"],["hosting","Recibir invitados"],["team","Fortalecer relaciones o reconocer a un equipo"],["recommend","Prefiero una recomendación de Aventura"]]},
      vip: {label:"¿Qué necesita más el huésped o la delegación?",placeholder:"Elige la necesidad más cercana",options:[["arrival","Llegada y transporte coordinados"],["program","Un programa privado para el huésped"],["hospitality","Arreglos de hotel y gastronomía"],["recommend","Prefiero una recomendación de Aventura"]]},
      custom: {label:"¿Qué te gustaría que lograra la experiencia?",placeholder:"Elige el resultado más cercano",options:[["privacy","Privacidad y un ritmo relajado"],["place","Descubrir el lugar y su carácter"],["celebration","Celebrar una ocasión"],["recommend","Prefiero una recomendación de Aventura"]]},
    }
  };

  var REQUEST_CONFIG = {
    "historic-jeddah": {guide:true,addons:["airport","transport","dining","photography"]},
    "sea": {period:true,seaDuration:true,addons:["resort","transport","photography"]},
    "desert": {period:true,addons:["transport","hospitality","photography"]},
    "taif": {addons:["transport","dining","photography"]},
    "jeddah-day": {addons:["transport","dining","photography"]},
    "corporate": {city:true,addons:["airport","hotel","interpreter","gifts"]},
    "private-event": {eventType:true,eventLocation:true,addons:["coordination","photography","flowers"]},
    "vip-hosting": {arrivalDate:true,addons:["airport","vipCar","hotel","dining","tailor","abaya"]},
    "guest-services": {serviceDetails:true,addons:["airport","transport","guide","dining","hospitality","hotel","tailor","abaya","flowers","concierge"]},
    "custom-experience": {customDetails:true,addons:[]}
  };

  function currentLanguage() {
    var lang = document.documentElement.lang || "en";
    return FORM_TEXT[lang] ? lang : "en";
  }

  function addDynamicStyles() {
    if (document.getElementById("aventura-dynamic-request-styles")) return;
    var style = document.createElement("style");
    style.id = "aventura-dynamic-request-styles";
    style.textContent = ".dynamic-request-panel{grid-column:1/-1;margin-top:.35rem;padding:1.25rem;border:1px solid rgba(22,38,54,.14);border-radius:18px;background:rgba(255,255,255,.72);animation:aventuraPanelIn .28s ease both}.dynamic-request-panel h3{margin:0 0 .35rem;font-size:1.15rem}.dynamic-request-panel .dynamic-note{margin:0 0 1rem;padding:.8rem 1rem;border-radius:12px;background:rgba(201,168,106,.13)}.dynamic-request-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.dynamic-request-grid .full{grid-column:1/-1}.dynamic-addons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem;margin-top:.75rem}.dynamic-addons label{display:flex;align-items:flex-start;gap:.65rem;padding:.8rem;border:1px solid rgba(22,38,54,.12);border-radius:12px;background:#fff;cursor:pointer}.dynamic-addons input{margin-top:.18rem}@keyframes aventuraPanelIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@media(max-width:720px){.dynamic-request-grid,.dynamic-addons{grid-template-columns:1fr}}";
    document.head.appendChild(style);
  }

  function fieldMarkup(id,name,label,type,required,full) {
    return '<div class="field'+(full?' full':'')+'"><label for="'+id+'">'+label+(required?' *':'')+'</label><input id="'+id+'" name="'+name+'" type="'+type+'"'+(required?' required':'')+'></div>';
  }

  function textareaMarkup(id,name,label) {
    return '<div class="field full"><label for="'+id+'">'+label+'</label><textarea id="'+id+'" name="'+name+'"></textarea></div>';
  }

  function selectMarkup(id,name,label,placeholder,options,required) {
    var html='<div class="field"><label for="'+id+'">'+label+(required?' *':'')+'</label><select id="'+id+'" name="'+name+'"'+(required?' required':'')+'><option value="" selected disabled>'+placeholder+'</option>';
    options.forEach(function(option){html+='<option value="'+option+'">'+option+'</option>';});
    return html+'</select></div>';
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

  function updateObjectiveField() {
    var typeSelect = document.getElementById("type");
    var objective = document.getElementById("objective");
    if (!typeSelect || !objective) return;
    var wrapper = objective.closest(".field");
    var group = OBJECTIVE_GROUP_BY_TYPE[typeSelect.value];
    var config = group && OBJECTIVE_CONFIG[currentLanguage()][group];
    if (!config) {
      if (wrapper) wrapper.hidden = true;
      objective.disabled = true;
      objective.value = "";
      objective.removeAttribute("data-request-type");
      return;
    }
    var preserveValue = objective.getAttribute("data-request-type") === typeSelect.value ? objective.value : "";
    var label = document.querySelector('label[for="objective"]');
    if (label) label.textContent = config.label;
    objective.innerHTML = '<option value="" selected disabled>'+config.placeholder+'</option>';
    config.options.forEach(function (option) {
      var item = document.createElement("option");
      item.value = option[0];
      item.textContent = option[1];
      objective.appendChild(item);
    });
    objective.value = config.options.some(function (option) { return option[0] === preserveValue; }) ? preserveValue : "";
    objective.disabled = false;
    objective.setAttribute("data-request-type", typeSelect.value);
    if (wrapper) wrapper.hidden = false;
  }

  function renderDynamicRequestFields() {
    var select=document.getElementById("type");
    var formGrid=select&&select.closest(".form-grid");
    if(!select||!formGrid)return;
    var existing=document.getElementById("dynamicRequestPanel");
    if(existing)existing.remove();
    var config=REQUEST_CONFIG[select.value];
    if(!config)return;
    var text=FORM_TEXT[currentLanguage()];
    var panel=document.createElement("section");
    panel.id="dynamicRequestPanel";
    panel.className="dynamic-request-panel";
    panel.setAttribute("aria-live","polite");
    var markup='<h3>'+text.customize+'</h3><div class="dynamic-request-grid">';
    if(config.guide){markup+='<div class="dynamic-note full"><strong>'+text.included+':</strong> '+text.includedGuide+'</div>';markup+=selectMarkup("guideLanguage","guideLanguage",text.guideLanguage,text.chooseLanguage,text.languages,true);}
    if(config.period)markup+=selectMarkup("experiencePeriod","experiencePeriod",text.period,text.period,text.periodOptions,false);
    if(config.seaDuration)markup+=selectMarkup("seaExperienceDuration","seaExperienceDuration",text.seaDuration,text.seaDuration,text.durationOptions,false);
    if(config.city)markup+=fieldMarkup("programCity","programCity",text.companyCity,"text",false,false);
    if(config.eventType)markup+=fieldMarkup("occasionType","occasionType",text.eventType,"text",false,false);
    if(config.eventLocation)markup+=fieldMarkup("eventLocation","eventLocation",text.eventLocation,"text",false,false);
    if(config.arrivalDate)markup+=fieldMarkup("arrivalDate","arrivalDate",text.arrivalDate,"date",false,false);
    if(config.activityType)markup+=fieldMarkup("businessActivity","businessActivity",text.activityType,"text",false,false);
    if(config.customDetails)markup+=textareaMarkup("customExperienceDetails","customExperienceDetails",text.customDetails);
    if(config.serviceDetails)markup+=textareaMarkup("guestServiceDetails","guestServiceDetails",text.serviceDetails);
    if(config.partnershipDetails)markup+=textareaMarkup("partnershipDetails","partnershipDetails",text.partnershipDetails);
    if(config.addons&&config.addons.length){markup+='<fieldset class="full"><legend>'+text.optional+'</legend><div class="dynamic-addons">';config.addons.forEach(function(addon){markup+='<label><input type="checkbox" name="addons[]" value="'+addon+'"><span>'+text.addons[addon]+'</span></label>';});markup+='</div></fieldset>';}
    panel.innerHTML=markup+'</div>';
    var requestedAddon = requestedAddonFromUrl();
    var requestedAddonInput = requestedAddon && panel.querySelector('[name="addons[]"][value="'+requestedAddon+'"]');
    if (requestedAddonInput) requestedAddonInput.checked = true;
    select.closest(".field").insertAdjacentElement("afterend",panel);
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
    updateObjectiveField();
  }

  function initializeRequestTypes() {
    addDynamicStyles();
    updateRequestTypeOptions(currentLanguage());
    var select=document.getElementById("type");
    if(select)select.addEventListener("change",function(){renderDynamicRequestFields();updateObjectiveField();if(window.AVENTURA_TRACK)window.AVENTURA_TRACK("request_type_select",{requestType:select.value});});
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
