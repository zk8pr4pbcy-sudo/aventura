(function () {
  "use strict";

  /*
   * Legal copy is kept separately from the general UI dictionary because it is
   * longer, structured content that needs to remain readable in all three site
   * languages. It is rendered as text nodes, never as visitor-supplied HTML.
   */
  var documents = {
    ar: {
      privacy: {
        lead: "آخر تحديث: 9 أغسطس 2026",
        identity: [
          "جهة التحكم بالبيانات: مؤسسة أفنتورا لتنظيم وإدارة الفعاليات، منشأة سعودية مسجلة بالسجل التجاري رقم 4030583057.",
          "لأسئلة الخصوصية أو ممارسة الحقوق: contact@aventuraksa.com — يرجى كتابة «الخصوصية» في عنوان الرسالة."
        ],
        navigation: { privacy: "سياسة الخصوصية", terms: "الشروط والأحكام" },
        sections: [
          {
            heading: "1. نطاق هذه السياسة",
            blocks: [
              { type: "p", text: "توضح هذه السياسة كيف تجمع أفنتورا البيانات الشخصية وتعالجها عند استخدام الموقع أو إرسال طلب أو التواصل معنا عبر البريد الإلكتروني أو واتساب، أو عند تقديم طلب تعاون. وهي تنطبق على زوار الموقع، والضيوف، وممثلي العملاء من الشركات ووكالات السفر، والمتقدمين للتعاون." },
              { type: "callout", text: "أفنتورا منظّم ومدير للفعاليات والتجارب المحلية الخاصة. لا تبيع تذاكر طيران، ولا تنفذ حجوزات الفنادق أو التأشيرات. وأي تنسيق متعلق بمكان إقامة قائم يقتصر على الخدمة المحلية المؤكدة." }
            ]
          },
          {
            heading: "2. البيانات التي قد نجمعها",
            blocks: [
              { type: "p", text: "نجمع فقط البيانات التي تحتاجها أفنتورا للنظر في الطلب أو تقديم الخدمة، ومنها:" },
              { type: "list", items: [
                "بيانات التعريف والتواصل: الاسم، رقم الهاتف، البريد الإلكتروني، الجهة أو الشركة، وطريقة التواصل المفضلة.",
                "بيانات الطلب: نوع الخدمة، التاريخ والوقت، عدد الضيوف، اللغة، تفاصيل البرنامج أو الفعالية، التفضيلات، وخيارات النقل أو الضيافة التي تذكرها.",
                "بيانات خدمات الضيوف عند إدخالها: اسم المستلم، موقع الفندق أو التسليم، وقت الزيارة أو التسليم، رسالة البطاقة، وتفضيلات الثوب أو العباية أو الورد.",
                "بيانات التعاون: بيانات التواصل، نوع الخدمة، التراخيص أو الروابط المهنية التي تختار مشاركتها، اللغات، نطاق العمل والرسالة التعريفية.",
                "بيانات تقنية محدودة على جهازك: اختيار اللغة، اختيارات البوتيك، وتذكير عرض المنتجات. لا ننشئ حسابات للعملاء ولا نجمع بيانات دفع عبر الموقع حاليًا."
              ]},
              { type: "callout", text: "يرجى عدم إرسال أرقام الهوية أو الجوازات أو البيانات الصحية أو أي معلومات حساسة عبر نموذج الموقع أو واتساب. إذا وصلت إلينا بيانات لا نحتاجها، سنتخذ ما يلزم لحذفها أو تقليل استخدامها وفق النظام." }
            ]
          },
          {
            heading: "3. مصادر البيانات وطريقة جمعها",
            blocks: [
              { type: "p", text: "تصلنا البيانات مباشرة منك عبر نموذج الطلب، البريد الإلكتروني، واتساب أو نموذج التعاون. وقد تصلنا من شركة أو وكالة سفر أو جهة عمل تطلب خدمة محلية نيابة عن ضيوفها؛ ويتعين على تلك الجهة أن تكون مخولة بالمشاركة وأن تبلغ أصحاب البيانات عند الاقتضاء. وعند تلقّي بيانات من هذه الجهات، تُشعر أفنتورا صاحب البيانات بهذه السياسة أو تتيحها له في الوقت الذي يقتضيه النظام، ما لم يوجد استثناء نظامي." },
              { type: "p", text: "الحقول المطلوبة في النموذج محدودة بما يلزم لبدء الطلب. أما التفاصيل الإضافية، مثل موقع الفندق أو رسالة البطاقة، فهي اختيارية ما لم تكن ضرورية للخدمة التي طلبتها." }
            ]
          },
          {
            heading: "4. أغراض المعالجة",
            blocks: [
              { type: "list", items: [
                "استلام الطلب، التحقق من التوفر، إعداد عرض أو نطاق خدمة، والتواصل بشأنه.",
                "تنسيق وتنفيذ فعالية أو تجربة أو خدمة ضيف مؤكدة، بما في ذلك التواصل مع المورد المناسب بالقدر اللازم.",
                "إدارة العلاقة مع عملاء الشركات والشركاء، وحفظ السجلات التشغيلية والمالية والالتزامات النظامية.",
                "حماية الموقع وعمليات أفنتورا، ومعالجة الشكاوى أو النزاعات، وتحسين تجربة الطلب دون استخدام بيانات النموذج للتسويق المباشر.",
                "استخدام صور أو مقاطع ضيوف فقط عندما تمنح موافقة منفصلة ومحددة لهذا الغرض."
              ]},
              { type: "p", text: "لا نبيع البيانات الشخصية ولا نؤجرها ولا نستخدم بيانات نموذج الطلب لإرسال مواد تسويقية ما لم تطلب أنت ذلك بوضوح وبشكل منفصل." }
            ]
          },
          {
            heading: "5. المسوغات النظامية",
            blocks: [
              { type: "p", text: "تعالج أفنتورا البيانات عند الحاجة لاتخاذ خطوات بطلب منك قبل التعاقد أو لتنفيذ اتفاقية مؤكدة، وللوفاء بالتزامات نظامية مثل حفظ السجلات، ولتحقيق مصلحة مشروعة متوازنة كأمن العمليات ومنع إساءة الاستخدام. نعتمد على موافقة صريحة واختيارية للصور والمقاطع، أو لأي غرض لا يلزم لتقديم الخدمة. ولا يؤثر رفض موافقة الصور أو سحبها في الخدمة الأساسية." }
            ]
          },
          {
            heading: "6. الجهات التي قد تتلقى البيانات والنطاق الجغرافي",
            blocks: [
              { type: "p", text: "نفصح عن الحد الأدنى اللازم من البيانات فقط، ولأغراض محددة، إلى الجهات التالية عند الحاجة:" },
              { type: "list", items: [
                "FormSubmit عند اختيار إرسال الطلب عبر البريد من نموذج الموقع. يعالج مزود الخدمة بيانات الإرسال لإيصالها إلى أفنتورا، وتذكر وثائقه أن أرشيف الإرسالات يحتفظ به لمدة تصل إلى 30 يومًا.",
                "مقدمو البريد الإلكتروني وواتساب عندما تختار التواصل عبر تلك القنوات، وتخضع معالجة تلك الخدمات كذلك لسياساتها الخاصة.",
                "الموردون المختارون لتنفيذ خدمة مؤكدة أو إعداد عرض دقيق، مثل المرشدين المرخصين عند الحاجة، شركات النقل، المواقع، القوارب، المصورين، أو مزودي الورد والخياطة؛ ولا نشارك إلا البيانات اللازمة للخدمة.",
                "العميل من الشركة أو الوكالة الذي قدم الطلب نيابة عن الضيف، والجهات الحكومية أو القضائية متى تطلب النظام ذلك."
              ]},
              { type: "p", text: "قد تنطوي خدمات FormSubmit والبريد الإلكتروني وواتساب على معالجة أو وصول إلى البيانات من خارج المملكة العربية السعودية. عند حدوث نقل دولي، تعمل أفنتورا على أن يكون ذلك وفق المتطلبات والضمانات المطبقة في نظام حماية البيانات الشخصية." }
            ]
          },
          {
            heading: "7. التخزين المحلي وملفات الارتباط",
            blocks: [
              { type: "p", text: "لا يستخدم الموقع حاليًا ملفات تعريف ارتباط إعلانية أو أدوات تحليل خارجية أو بكسلات تسويقية. يحفظ على جهازك اختيار اللغة إلى أن تحذفه من المتصفح. كما يحتفظ باختيارات البوتيك وتذكيرات عرض المنتجات لمدة تصل إلى 30 يومًا، ثم يتوقف عن استخدامها. وتبقى أحداث التفاعل المجهّزة داخل المتصفح مجهولة ولا تتضمن الاسم أو الهاتف أو البريد أو محتوى الرسائل." }
            ]
          },
          {
            heading: "8. الحفظ والإتلاف والحماية",
            blocks: [
              { type: "list", items: [
                "أرشيف FormSubmit: حتى 30 يومًا وفق وثائق المزود.",
                "الطلبات غير المؤكدة والمراسلات ذات الصلة: حتى 12 شهرًا من آخر تواصل، ثم تُحذف أو تُخفى هويتها ما لم يوجد سبب مشروع للاحتفاظ بها مدة أطول.",
                "سجلات الخدمات المؤكدة والعروض المعتمدة: حتى 5 سنوات من انتهاء الخدمة، مع الاحتفاظ بالسجلات المالية للمدة التي يتطلبها النظام.",
                "طلبات التعاون: حتى 12 شهرًا من اكتمال المراجعة ما لم يبدأ تعاون فعلي.",
                "الصور غير المعتمدة للنشر: حتى 90 يومًا من تسليمها أو انتهاء الغرض التشغيلي. أما الصور المعتمدة للنشر فتُدار وفق القسم 9 أدناه."
              ]},
              { type: "p", text: "نطبق تدابير فنية وتنظيمية معقولة للحد من الوصول غير المصرح به، ونقصر الوصول على من يحتاجه للعمل. عند انتهاء مدة الحفظ، نحذف البيانات أو نتلفها بطريقة آمنة، ونطلب من الجهات التي أفصحنا لها عن البيانات الإتلاف عند الاقتضاء، مع مراعاة أي التزام نظامي بالاحتفاظ." }
            ]
          },
          {
            heading: "9. صور ومحتوى التجارب",
            blocks: [
              { type: "p", text: "لا تنشر أفنتورا صورة أو مقطعًا يمكن التعرف منه على الضيف في الموقع أو حسابات التواصل أو الإعلانات المدفوعة اعتمادًا على طلب الحجز وحده. بعد التجربة، نطلب موافقة اختيارية ومنفصلة للصور أو المقاطع المحددة، مع خيارات مستقلة للموقع، وحسابات التواصل، والإعلانات المدفوعة." },
              { type: "list", items: [
                "لا تتأثر الخدمة أو تسليم صور الضيف برفض الموافقة.",
                "لا تنشر صورة جماعية إلا بعد الحصول على موافقة من كل بالغ ظاهر ويمكن التعرف عليه؛ ولا تكفي موافقة منسق المجموعة عن البالغين الآخرين.",
                "صور القُصّر وضيوف الشركات وكبار الشخصيات لا تنشر كأصل إلا بموافقة موثقة من ولي الأمر أو الشخص المعني بحسب الحالة.",
                "يمكن سحب موافقة النشر في أي وقت عبر contact@aventuraksa.com. نوقف الاستخدام المستقبلي خلال مدة معقولة، ولا يؤثر السحب في المعالجة السابقة المشروعة.",
                "تظل الصور المنشورة حتى 24 شهرًا كحد أقصى أو حتى سحب الموافقة، أيهما أسبق؛ ونحتفظ بسجل الموافقة مدة 24 شهرًا بعد انتهائها أو سحبها لإثباتها عند الحاجة."
              ]}
            ]
          },
          {
            heading: "10. حقوقك والشكاوى",
            blocks: [
              { type: "p", text: "لك، وفق نظام حماية البيانات الشخصية، الحق في العلم بكيفية معالجة بياناتك، والوصول إليها، وطلب نسخة منها بصيغة مقروءة متى كان ذلك ممكنًا، وطلب تصحيحها، وطلب إتلافها في الحالات النظامية، والرجوع عن موافقتك. نتحقق من هوية مقدم الطلب بطريقة متناسبة قبل التنفيذ لحماية البيانات." },
              { type: "p", text: "أرسل طلبك إلى contact@aventuraksa.com بعنوان «طلب خصوصية». نستجيب خلال مدة لا تتجاوز 30 يومًا، ويجوز تمديدها بما لا يزيد على 30 يومًا إضافية في الحالات المسموح بها نظامًا مع إشعارك مسبقًا بالمبررات. إذا لم ترض عن معالجتنا للطلب، فيمكنك تقديم شكوى إلى الهيئة السعودية للبيانات والذكاء الاصطناعي عبر منصة حوكمة البيانات الوطنية." }
            ]
          },
          {
            heading: "11. تحديثات السياسة",
            blocks: [
              { type: "p", text: "قد نحدّث هذه السياسة عند تغير خدمات الموقع أو متطلباتنا النظامية. سننشر التاريخ الجديد هنا، وأي تغيير جوهري في غرض المعالجة سيُعرض قبل تطبيقه عندما يلزم ذلك." }
            ]
          }
        ]
      },
      terms: {
        lead: "آخر تحديث: 9 أغسطس 2026",
        identity: [
          "أفنتورا، منشأة سعودية لتنظيم وإدارة الفعاليات والتجارب الخاصة في جدة، سجل تجاري رقم 4030583057.",
          "للاستفسارات المتعلقة بالطلب أو الحجز: contact@aventuraksa.com"
        ],
        navigation: { privacy: "سياسة الخصوصية", terms: "الشروط والأحكام" },
        sections: [
          {
            heading: "1. القبول والنطاق",
            blocks: [
              { type: "p", text: "تنظم هذه الشروط استخدام موقع أفنتورا وتقديم طلبات الفعاليات والتجارب وخدمات الضيوف. استخدام الموقع أو إرسال طلب يعني اطلاعك على هذه الشروط وسياسة الخصوصية. ولا يُنشئ ذلك وحده حجزًا مؤكدًا أو التزامًا ماليًا." }
            ]
          },
          {
            heading: "2. دور أفنتورا وحدود الخدمات",
            blocks: [
              { type: "p", text: "أفنتورا منظّم ومدير للفعاليات والتجارب المحلية الخاصة في جدة. لا تعمل كوكالة سفر، ولا تبيع أو تحجز تذاكر الطيران أو الإقامة الفندقية أو التأشيرات. وأي تنسيق يتعلق بفندق أو منتجع أو مكان إقامة قائم هو تنسيق للجزء المحلي من الخدمة وليس حجزًا للإقامة." },
              { type: "p", text: "قد تتعاقد شركات أو وكالات سفر مع أفنتورا لتنفيذ الجزء المحلي من برنامج ضيوفهم. ويؤكد من يرسل الطلب نيابة عن الغير أنه مخول بذلك وأنه قدم للضيف المعلومات اللازمة عن مشاركة بياناته لتنفيذ الخدمة." }
            ]
          },
          {
            heading: "3. الطلب والعرض والتأكيد",
            blocks: [
              { type: "p", text: "نموذج الموقع أو رسالة واتساب أو البريد هو طلب أولي فقط. بعد مراجعة التاريخ وعدد الضيوف والتفاصيل والتوفر، قد ترسل أفنتورا عرضًا أو نطاقًا مقترحًا. لا يصبح أي برنامج أو فعالية أو خدمة مؤكدة إلا عند إصدار تأكيد مكتوب من أفنتورا بعد قبول العميل للعرض واستيفاء الدفعة المتفق عليها، إن وجدت." },
              { type: "p", text: "يتضمن تأكيد الحجز الخاص بالخدمة، بحسب الحالة، التاريخ والمدة والخدمات المشمولة وغير المشمولة والسعر والضريبة إن وجدت وجدول الدفعات وشروط التعديل والإلغاء والاسترداد وأي متطلبات للموردين. وفي حال التعارض، يسود تأكيد الحجز الخاص على هذه الشروط العامة." }
            ]
          },
          {
            heading: "4. الأسعار والمدفوعات",
            blocks: [
              { type: "p", text: "تُعد الأسعار لكل طلب بحسب النطاق والتاريخ وعدد الضيوف والتوفر والموردين المختارين، وتظهر بالريال السعودي ما لم ينص العرض على خلاف ذلك. لا يقبل الموقع مدفوعات إلكترونية حاليًا. توضح أفنتورا وسيلة الدفع والدفعة المطلوبة وموعد السداد في العرض أو تأكيد الحجز." },
              { type: "p", text: "يجوز أن يتغير السعر أو التوفر قبل التأكيد إذا تغيرت تكلفة المورد أو لم يعد العنصر متاحًا. وبعد التأكيد، لا تضاف مبالغ إلا بموافقة العميل أو وفق ما ينص عليه تأكيد الحجز." }
            ]
          },
          {
            heading: "5. التعديل والإلغاء والاسترداد",
            blocks: [
              { type: "p", text: "تُحدد شروط التعديل والإلغاء والاسترداد وأي دفعة مطلوبة للخدمة المحددة حصراً في العرض أو تأكيد الحجز المكتوب، وفق نطاق الخدمة وتاريخها وتوفر الموردين وشروطهم. لا تعتمد أفنتورا في هذه الشروط العامة نسبة عربون أو مهلة أو استرداداً ثابتاً لجميع الخدمات." },
              { type: "p", text: "يجب طلب أي تعديل كتابةً، ويظل خاضعًا للتوفر وأثره في السعر أو الدفعة. لا تؤثر هذه الشروط في أي حقوق إلزامية يمنحها النظام السعودي للمستهلك." }
            ]
          },
          {
            heading: "6. الطقس والظروف الخارجة عن السيطرة",
            blocks: [
              { type: "p", text: "إذا منع الطقس أو البحر أو عطل تشغيلي أو ظرف خارج عن السيطرة تنفيذ خدمة بحرية أو فعالية بأمان، تعمل أفنتورا أولًا على إعادة الجدولة أو تقديم بديل معقول. وعند تعذر ذلك، يعالج الاسترداد للجزء غير المنفذ وفق تأكيد الحجز، مع عدم تحمل تكاليف سفر أو إقامة أو التزامات لدى أطراف أخرى ما لم يوجب النظام خلاف ذلك." }
            ]
          },
          {
            heading: "7. مسؤوليات العميل والضيوف",
            blocks: [
              { type: "list", items: [
                "تقديم معلومات دقيقة وفي الوقت المناسب عن العدد والتوقيت والاحتياجات ذات الصلة بالخدمة، وإبلاغنا مبكرًا بأي متطلب قد يؤثر في التنفيذ الآمن أو المناسب.",
                "الحضور في الوقت والمكان المؤكدين والالتزام بتعليمات السلامة للمواقع والمرشدين ومقدمي النقل والقوارب والمنظمين.",
                "تكون مسؤولية القاصر على وليه أو ممثله المخول، ويجوز رفض مشاركة أي شخص عندما يكون ذلك ضروريًا للسلامة أو امتثالًا لتعليمات المورد أو النظام.",
                "عدم تقديم أرقام الهوية أو الجوازات أو البيانات الصحية عبر نموذج الموقع. إن احتاجت خدمة مؤكدة إلى معلومة خاصة بشكل نظامي، تطلب أفنتورا ذلك عبر قناة مناسبة وبالحد الأدنى اللازم."
              ]}
            ]
          },
          {
            heading: "8. الموردون والمرشدون",
            blocks: [
              { type: "p", text: "قد تنسق أفنتورا خدمات محلية مع موردين مستقلين مثل المواقع وشركات النقل والبحر والمصورين والخياطين ومزودي الورد. وعندما يتطلب النشاط مرشدًا أو ترخيصًا خاصًا، يتم استخدام مقدم خدمة أو مرشد مستوفٍ للمتطلبات ذات الصلة. وتُذكر أي شروط جوهرية للمورد في تأكيد الحجز." },
              { type: "p", text: "تدير أفنتورا التنسيق ضمن النطاق الذي أكدته، ولا تقيد هذه الشروط الحقوق النظامية للعميل أو الضيف تجاه أي طرف مسؤول." }
            ]
          },
          {
            heading: "9. الصور والمحتوى",
            blocks: [
              { type: "p", text: "لا يمنح الحجز أو المشاركة في تجربة أفنتورا حق استخدام صور الضيوف أو مقاطعهم للتسويق. ويخضع أي نشر في الموقع أو حسابات التواصل أو الإعلانات لموافقة منفصلة واختيارية ومحددة بعد التجربة، ويمكن سحبها وفق سياسة الخصوصية." }
            ]
          },
          {
            heading: "10. محتوى الموقع والملكية الفكرية",
            blocks: [
              { type: "p", text: "المحتوى المرئي والنصي والهوية والتصاميم المعروضة في الموقع مملوكة لأفنتورا أو مستخدمة بإذن، ولا يجوز نسخها أو إعادة استخدامها تجاريًا دون موافقة مكتوبة. الصور المعروضة تمثل اتجاهًا بصريًا، بينما تتحدد المواقع والتفاصيل والتجهيزات فعليًا في كل طلب مؤكد." }
            ]
          },
          {
            heading: "11. الخصوصية",
            blocks: [
              { type: "p", text: "تخضع البيانات الشخصية التي تعالجها أفنتورا لسياسة الخصوصية المنشورة في الموقع، والتي تعد جزءًا مكملاً لهذه الشروط." }
            ]
          },
          {
            heading: "12. النظام الواجب التطبيق والتحديثات",
            blocks: [
              { type: "p", text: "تخضع هذه الشروط لأنظمة المملكة العربية السعودية. تحاول أفنتورا معالجة أي شكوى مباشرة وبشكل منصف، مع بقاء حق الأطراف في اللجوء إلى الجهة أو المحكمة المختصة. وقد نحدّث هذه الشروط عند تغير خدماتنا أو المتطلبات النظامية؛ ويظهر تاريخ آخر تحديث في أعلى الصفحة." }
            ]
          }
        ]
      }
    },
    en: {
      privacy: {
        lead: "Last updated: 9 August 2026",
        identity: [
          "Data controller: Aventura Event Management Establishment, a Saudi establishment registered under Commercial Registration No. 4030583057.",
          "For privacy questions or rights requests: contact@aventuraksa.com — please use “Privacy” in the subject line."
        ],
        navigation: { privacy: "Privacy policy", terms: "Terms & conditions" },
        sections: [
          {
            heading: "1. Scope of this policy",
            blocks: [
              { type: "p", text: "This policy explains how Aventura collects and processes personal data when you use this website, send a request, contact us by email or WhatsApp, or submit a partnership request. It applies to website visitors, guests, representatives of corporate clients and travel agencies, and prospective partners." },
              { type: "callout", text: "Aventura organises and manages private local events and experiences. It does not sell air tickets, make hotel reservations, or arrange visas. Any coordination involving an existing accommodation is limited to the confirmed local service." }
            ]
          },
          {
            heading: "2. Personal data we may collect",
            blocks: [
              { type: "p", text: "We collect only the data Aventura needs to review a request or provide a service, including:" },
              { type: "list", items: [
                "Identity and contact data: name, phone number, email address, company or organisation, and preferred contact method.",
                "Request data: service type, date and time, guest count, language, event or itinerary details, preferences, and transport or hospitality choices you provide.",
                "Guest-service data when entered: recipient name, hotel or delivery location, visit or delivery time, card message, and thobe, abaya, or flower preferences.",
                "Partnership data: contact information, service type, licences or professional links you choose to share, languages, service coverage, and introduction message.",
                "Limited device data: language choice, boutique selections, and product-reminder preference. The website does not create customer accounts or collect payment information at this time."
              ]},
              { type: "callout", text: "Please do not send national ID numbers, passport numbers, health data, or other sensitive information through the website form or WhatsApp. If we receive data we do not need, we will take appropriate steps to delete it or limit its use in line with applicable law." }
            ]
          },
          {
            heading: "3. Sources and collection methods",
            blocks: [
              { type: "p", text: "We receive data directly from you through the request form, email, WhatsApp, or the partnership form. We may also receive it from a company, travel agency, or employer that requests a local service for its guests; that organisation must be authorised to share the data and notify the relevant people where required. When Aventura receives data this way, it will provide this policy to the relevant person or otherwise notify them when required by law, unless a legal exception applies." },
              { type: "p", text: "Required form fields are limited to what is needed to start the request. Extra details, such as a hotel location or gift-card message, are optional unless they are necessary for the service you request." }
            ]
          },
          {
            heading: "4. Why we use personal data",
            blocks: [
              { type: "list", items: [
                "To receive a request, check availability, prepare a proposal or scope of service, and communicate about it.",
                "To coordinate and deliver a confirmed event, experience, or guest service, including sharing the minimum necessary detail with the right provider.",
                "To manage relationships with corporate clients and partners, and maintain operational, financial, and legal records.",
                "To protect Aventura's website and operations, handle complaints or disputes, and improve the request experience without using form data for direct marketing.",
                "To use guest photos or videos only when you give separate, specific permission for that purpose."
              ]},
              { type: "p", text: "We do not sell or rent personal data. We do not use request-form data for marketing communications unless you separately and clearly ask us to." }
            ]
          },
          {
            heading: "5. Lawful grounds for processing",
            blocks: [
              { type: "p", text: "Aventura processes data where necessary to take steps you request before a contract or to perform a confirmed agreement, to meet legal obligations such as record keeping, and for balanced legitimate interests such as operational security and misuse prevention. We rely on separate, voluntary consent for photos and videos, or any purpose that is not needed to provide the service. Declining or withdrawing photo consent does not affect the core service." }
            ]
          },
          {
            heading: "6. Recipients and international processing",
            blocks: [
              { type: "p", text: "We disclose the minimum necessary data only, and for specific purposes, to the following parties where needed:" },
              { type: "list", items: [
                "FormSubmit when you choose to send a request by email through the website form. It processes the submission to deliver it to Aventura; its documentation says submission archives are retained for up to 30 days.",
                "Email and WhatsApp providers when you choose those channels. Their processing is also governed by their own privacy practices.",
                "Selected providers needed to quote accurately or deliver a confirmed service, such as suitably licensed guides where required, transport companies, venues, boats, photographers, florists, and tailoring providers. We share only what the service requires.",
                "The company or agency that submitted a request for its guest, and governmental or judicial bodies where required by law."
              ]},
              { type: "p", text: "FormSubmit, email, and WhatsApp services may involve processing or access to data from outside Saudi Arabia. Where an international transfer occurs, Aventura works to ensure it is made in accordance with the applicable Saudi Personal Data Protection Law requirements and safeguards." }
            ]
          },
          {
            heading: "7. Local storage and cookies",
            blocks: [
              { type: "p", text: "The website does not currently use advertising cookies, third-party analytics tools, or marketing pixels. It stores your language choice on your device until you clear it in your browser. Boutique selections and product-reminder preferences are stored for up to 30 days and then cease to be used. Interaction events prepared in the browser are anonymous and do not include names, phone numbers, emails, or message content." }
            ]
          },
          {
            heading: "8. Retention, deletion, and protection",
            blocks: [
              { type: "list", items: [
                "FormSubmit archive: up to 30 days, according to the provider's documentation.",
                "Unconfirmed requests and related correspondence: up to 12 months after the last contact, then deleted or anonymised unless a legitimate reason requires longer retention.",
                "Confirmed-service records and accepted proposals: up to 5 years after the service ends; financial records may be kept for any longer period required by law.",
                "Partnership requests: up to 12 months after the review is completed unless an active relationship begins.",
                "Photos not approved for publication: up to 90 days after delivery to the guest or the end of the operational purpose. Published media is handled under section 9."
              ]},
              { type: "p", text: "We apply reasonable technical and organisational safeguards and limit access to people who need the data for their work. At the end of a retention period, we securely delete or destroy data and, where appropriate, ask recipients to do the same, subject to any legal retention obligation." }
            ]
          },
          {
            heading: "9. Guest photos and experience content",
            blocks: [
              { type: "p", text: "Aventura does not publish an identifiable guest's photo or video on the website, social channels, or paid advertising merely because the guest made a booking. After the experience, we ask for separate, optional permission for specific selected images or clips, with distinct choices for the website, social media, and paid advertising." },
              { type: "list", items: [
                "The service and delivery of the guest's photos are not affected if consent is declined.",
                "A group image is not published unless every identifiable adult in it has agreed; a group coordinator cannot consent for other adults.",
                "Images of minors, corporate guests, and VIP guests are not published by default without documented consent from a parent, guardian, or the relevant person, as applicable.",
                "You may withdraw publication consent at any time through contact@aventuraksa.com. We will stop future use within a reasonable time; withdrawal does not affect earlier lawful processing.",
                "Published media remains live for no more than 24 months or until consent is withdrawn, whichever comes first. We retain the consent record for 24 months after it expires or is withdrawn where needed to evidence it."
              ]}
            ]
          },
          {
            heading: "10. Your rights and complaints",
            blocks: [
              { type: "p", text: "Subject to the Saudi Personal Data Protection Law, you have the right to be informed about processing, access your data, request a readable copy where technically possible, request correction, request destruction in the legally applicable cases, and withdraw consent. To protect data, we verify the identity of the requester in a proportionate way before acting." },
              { type: "p", text: "Email contact@aventuraksa.com with the subject “Privacy request”. We respond within no more than 30 days and may extend this by no more than a further 30 days in legally permitted cases, after notifying you in advance with the reasons. If you are not satisfied with our handling, you may submit a complaint to the Saudi Data and AI Authority through the National Data Governance Platform." }
            ]
          },
          {
            heading: "11. Policy updates",
            blocks: [
              { type: "p", text: "We may update this policy when the website's services or our legal requirements change. We will publish the new date here, and any material change of purpose will be presented before it is applied where required." }
            ]
          }
        ]
      },
      terms: {
        lead: "Last updated: 9 August 2026",
        identity: [
          "Aventura, a Saudi organisation for event management and private experiences in Jeddah, Commercial Registration No. 4030583057.",
          "For questions about a request or booking: contact@aventuraksa.com"
        ],
        navigation: { privacy: "Privacy policy", terms: "Terms & conditions" },
        sections: [
          {
            heading: "1. Acceptance and scope",
            blocks: [
              { type: "p", text: "These terms govern use of the Aventura website and requests for events, experiences, and guest services. Using the website or sending a request means you have reviewed these terms and the Privacy Policy. Neither action alone creates a confirmed booking or a financial commitment." }
            ]
          },
          {
            heading: "2. Aventura's role and service limits",
            blocks: [
              { type: "p", text: "Aventura organises and manages private local events and experiences in Jeddah. It is not a travel agency and does not sell or book airline tickets, hotel accommodation, or visas. Any coordination involving a hotel, resort, or existing accommodation relates only to the local service, not to an accommodation reservation." },
              { type: "p", text: "Companies and travel agencies may engage Aventura to deliver the local part of a guest programme. Anyone making a request for another person confirms that they are authorised to do so and that the guest has received any necessary information about the sharing of their data for service delivery." }
            ]
          },
          {
            heading: "3. Request, quotation, and confirmation",
            blocks: [
              { type: "p", text: "A website form, WhatsApp message, or email is an initial request only. After reviewing the date, guest count, details, and availability, Aventura may send a proposal or suggested scope. An event, experience, or service is confirmed only when Aventura issues written confirmation after the client accepts the proposal and completes any agreed payment." },
              { type: "p", text: "The booking confirmation may state the date, duration, included and excluded services, price, any applicable tax, payment timetable, cancellation and refund terms, and provider requirements. Where it conflicts with these general terms, the service-specific booking confirmation prevails." }
            ]
          },
          {
            heading: "4. Prices and payments",
            blocks: [
              { type: "p", text: "Prices are prepared for each request based on scope, date, guest count, availability, and selected providers, and are stated in Saudi riyals unless the proposal says otherwise. The website does not currently accept online payments. Aventura states the payment method, required deposit, and due dates in the proposal or booking confirmation." },
              { type: "p", text: "Availability or price may change before confirmation if supplier cost changes or an item is no longer available. After confirmation, no additional amount is charged without the client's approval or a term stated in the booking confirmation." }
            ]
          },
          {
            heading: "5. Changes, cancellations, and refunds",
            blocks: [
              { type: "p", text: "The payment, change, cancellation, and refund terms for a specific service are set only in its written proposal or booking confirmation, taking account of the service scope, date, provider availability, and provider terms. These general terms do not set a fixed deposit percentage, deadline, or refund outcome for every service." },
              { type: "p", text: "Any requested change must be made in writing and remains subject to availability and any effect on price or deposit. These terms do not affect any mandatory consumer rights under Saudi law." }
            ]
          },
          {
            heading: "6. Weather and circumstances beyond control",
            blocks: [
              { type: "p", text: "If weather, sea conditions, an operational fault, or another circumstance beyond reasonable control prevents a marine service or event from being delivered safely, Aventura will first work to reschedule it or offer a reasonable alternative. If this is not possible, any refund for the undelivered part is handled under the booking confirmation. Travel, accommodation, or third-party costs are not covered unless applicable law requires otherwise." }
            ]
          },
          {
            heading: "7. Client and guest responsibilities",
            blocks: [
              { type: "list", items: [
                "Provide accurate and timely information about guest count, timing, and service-related needs, and tell us early about anything that may affect safe or suitable delivery.",
                "Arrive at the confirmed time and place and follow safety instructions from venues, guides, transport providers, boat providers, and organisers.",
                "A minor is the responsibility of their parent, guardian, or authorised representative. Participation may be refused where necessary for safety or to comply with a provider's instruction or the law.",
                "Do not provide national ID numbers, passport numbers, or health data through the website form. If a confirmed service lawfully requires specific information, Aventura will request it through an appropriate channel and only to the minimum necessary extent."
              ]}
            ]
          },
          {
            heading: "8. Suppliers and guides",
            blocks: [
              { type: "p", text: "Aventura may coordinate local services with independent providers such as venues, transport companies, marine providers, photographers, tailors, and florists. Where an activity requires a licensed guide or another specific authorisation, an appropriately qualified provider is used. Any material supplier terms are stated in the booking confirmation." },
              { type: "p", text: "Aventura manages coordination within the confirmed scope. These terms do not limit any legal rights a client or guest has against a responsible party." }
            ]
          },
          {
            heading: "9. Photos and content",
            blocks: [
              { type: "p", text: "A booking or participation in an Aventura experience does not grant permission to use guest photos or videos for marketing. Any publication on the website, social media, or paid advertising requires separate, voluntary, specific consent after the experience and may be withdrawn as described in the Privacy Policy." }
            ]
          },
          {
            heading: "10. Website content and intellectual property",
            blocks: [
              { type: "p", text: "The visual and written content, identity, and designs on this website belong to Aventura or are used with permission. They may not be copied or commercially reused without written approval. Website images communicate a visual direction; actual venues, details, and setups are confirmed for each request." }
            ]
          },
          {
            heading: "11. Privacy",
            blocks: [
              { type: "p", text: "Personal data processed by Aventura is governed by the Privacy Policy published on this website, which forms part of these terms." }
            ]
          },
          {
            heading: "12. Governing law and updates",
            blocks: [
              { type: "p", text: "These terms are governed by the laws of the Kingdom of Saudi Arabia. Aventura will try to resolve a complaint directly and fairly, without limiting either party's right to approach the competent authority or court. We may update these terms as our services or legal requirements change; the latest date appears at the top of this page." }
            ]
          }
        ]
      }
    },
    es: {
      privacy: {
        lead: "Última actualización: 9 de agosto de 2026",
        identity: [
          "Responsable del tratamiento: Establecimiento Aventura de Gestión de Eventos, entidad saudí inscrita en el Registro Comercial n.º 4030583057.",
          "Para consultas de privacidad o ejercicio de derechos: contact@aventuraksa.com — indica «Privacidad» en el asunto."
        ],
        navigation: { privacy: "Política de privacidad", terms: "Términos y condiciones" },
        sections: [
          {
            heading: "1. Alcance de esta política",
            blocks: [
              { type: "p", text: "Esta política explica cómo Aventura recoge y trata datos personales cuando utilizas este sitio, envías una solicitud, nos escribes por correo o WhatsApp, o presentas una solicitud de colaboración. Se aplica a visitantes, huéspedes, representantes de clientes corporativos y agencias de viajes, y posibles colaboradores." },
              { type: "callout", text: "Aventura organiza y gestiona eventos y experiencias locales privadas. No vende billetes de avión, no realiza reservas hoteleras ni tramita visados. Cualquier coordinación relacionada con un alojamiento existente se limita al servicio local confirmado." }
            ]
          },
          {
            heading: "2. Datos personales que podemos recopilar",
            blocks: [
              { type: "p", text: "Solo recogemos los datos que Aventura necesita para estudiar una solicitud o prestar un servicio, entre ellos:" },
              { type: "list", items: [
                "Datos de identificación y contacto: nombre, teléfono, correo electrónico, empresa u organización y medio de contacto preferido.",
                "Datos de la solicitud: tipo de servicio, fecha y hora, número de huéspedes, idioma, detalles del programa o evento, preferencias y opciones de transporte u hospitalidad que indiques.",
                "Datos de servicios para huéspedes, cuando se introducen: nombre del destinatario, hotel o lugar de entrega, hora de visita o entrega, mensaje de tarjeta y preferencias de thobe, abaya o flores.",
                "Datos de colaboración: contacto, tipo de servicio, licencias o enlaces profesionales que decidas compartir, idiomas, cobertura y mensaje de presentación.",
                "Datos limitados del dispositivo: idioma elegido, selecciones de la boutique y preferencia de recordatorio de productos. El sitio no crea cuentas de clientes ni recoge datos de pago por ahora."
              ]},
              { type: "callout", text: "No envíes números de identidad, pasaporte, datos de salud u otra información sensible mediante el formulario o WhatsApp. Si recibimos datos que no necesitamos, tomaremos medidas adecuadas para eliminarlos o limitar su uso conforme a la ley aplicable." }
            ]
          },
          {
            heading: "3. Fuentes y formas de recogida",
            blocks: [
              { type: "p", text: "Recibimos datos directamente de ti mediante el formulario de solicitud, el correo, WhatsApp o el formulario de colaboración. También podemos recibirlos de una empresa, agencia de viajes o empleador que solicita un servicio local para sus huéspedes; esa entidad debe estar autorizada para compartir los datos e informar a las personas afectadas cuando corresponda. Cuando Aventura recibe datos de esta forma, facilitará esta política a la persona afectada o le informará de ella cuando la ley lo exija, salvo que exista una excepción legal." },
              { type: "p", text: "Los campos obligatorios se limitan a lo necesario para iniciar la solicitud. Los datos adicionales, como la ubicación del hotel o el mensaje de una tarjeta, son opcionales salvo que resulten necesarios para el servicio solicitado." }
            ]
          },
          {
            heading: "4. Para qué utilizamos los datos",
            blocks: [
              { type: "list", items: [
                "Recibir una solicitud, comprobar disponibilidad, preparar una propuesta o alcance y comunicarnos sobre ello.",
                "Coordinar y prestar un evento, experiencia o servicio para huéspedes confirmado, compartiendo el mínimo necesario con el proveedor adecuado.",
                "Gestionar relaciones con clientes corporativos y colaboradores, y conservar registros operativos, financieros y legales.",
                "Proteger el sitio y las operaciones de Aventura, gestionar quejas o controversias y mejorar la experiencia de solicitud sin usar los datos del formulario para marketing directo.",
                "Usar fotos o vídeos de huéspedes solo cuando otorgues una autorización separada y específica para ello."
              ]},
              { type: "p", text: "No vendemos ni alquilamos datos personales. No usamos los datos del formulario para comunicaciones de marketing salvo que lo solicites de forma separada y clara." }
            ]
          },
          {
            heading: "5. Bases legales del tratamiento",
            blocks: [
              { type: "p", text: "Aventura trata datos cuando es necesario para tomar medidas solicitadas antes de un contrato o para ejecutar un acuerdo confirmado, para cumplir obligaciones legales como la conservación de registros y para intereses legítimos equilibrados como la seguridad operativa y la prevención de usos indebidos. Para fotos, vídeos o finalidades no necesarias para prestar el servicio, contamos con un consentimiento separado y voluntario. Rechazarlo o retirarlo no afecta al servicio principal." }
            ]
          },
          {
            heading: "6. Destinatarios y tratamiento internacional",
            blocks: [
              { type: "p", text: "Solo comunicamos el mínimo de datos necesario y para fines concretos a las siguientes partes cuando es preciso:" },
              { type: "list", items: [
                "FormSubmit, cuando eliges enviar la solicitud por correo desde el formulario. Procesa el envío para entregarlo a Aventura; su documentación indica que conserva los archivos de solicitudes hasta 30 días.",
                "Proveedores de correo y WhatsApp cuando eliges esos canales. Su tratamiento también se rige por sus propias prácticas de privacidad.",
                "Proveedores seleccionados para cotizar con precisión o prestar un servicio confirmado, como guías debidamente autorizados cuando sea necesario, transportistas, espacios, embarcaciones, fotógrafos, floristas o sastres. Solo compartimos lo que exige el servicio.",
                "La empresa o agencia que haya presentado una solicitud para su huésped, y autoridades gubernamentales o judiciales cuando la ley lo exija."
              ]},
              { type: "p", text: "Los servicios de FormSubmit, correo y WhatsApp pueden implicar tratamiento o acceso a datos desde fuera de Arabia Saudita. Cuando exista una transferencia internacional, Aventura procura que se realice conforme a los requisitos y garantías aplicables de la Ley Saudí de Protección de Datos Personales." }
            ]
          },
          {
            heading: "7. Almacenamiento local y cookies",
            blocks: [
              { type: "p", text: "El sitio no usa actualmente cookies publicitarias, analítica de terceros ni píxeles de marketing. Guarda en tu dispositivo el idioma elegido hasta que lo elimines en el navegador. Las selecciones de la boutique y los recordatorios de productos se conservan hasta 30 días y después dejan de utilizarse. Los eventos de interacción preparados en el navegador son anónimos y no incluyen nombres, teléfonos, correos ni contenido de mensajes." }
            ]
          },
          {
            heading: "8. Conservación, eliminación y protección",
            blocks: [
              { type: "list", items: [
                "Archivo de FormSubmit: hasta 30 días, según la documentación del proveedor.",
                "Solicitudes no confirmadas y correspondencia relacionada: hasta 12 meses desde el último contacto; después se eliminan o anonimizan, salvo que exista una razón legítima para conservarlas más tiempo.",
                "Registros de servicios confirmados y propuestas aceptadas: hasta 5 años tras finalizar el servicio; los registros financieros pueden conservarse durante el plazo mayor exigido por la ley.",
                "Solicitudes de colaboración: hasta 12 meses después de terminar la revisión, salvo que comience una relación activa.",
                "Fotos no autorizadas para publicación: hasta 90 días después de la entrega al huésped o del final de la finalidad operativa. El contenido publicado se trata según la sección 9."
              ]},
              { type: "p", text: "Aplicamos medidas técnicas y organizativas razonables y limitamos el acceso a quienes necesitan los datos para su trabajo. Al terminar el plazo de conservación, eliminamos o destruimos los datos de forma segura y, cuando corresponde, pedimos a los destinatarios que hagan lo mismo, sin perjuicio de cualquier obligación legal de conservación." }
            ]
          },
          {
            heading: "9. Fotos de huéspedes y contenido de experiencias",
            blocks: [
              { type: "p", text: "Aventura no publica en el sitio, redes sociales o publicidad de pago una foto o vídeo en el que un huésped sea identificable únicamente por haber hecho una reserva. Tras la experiencia, solicitamos autorización opcional y separada para imágenes o clips concretos, con opciones distintas para el sitio, redes sociales y publicidad de pago." },
              { type: "list", items: [
                "El servicio y la entrega de las fotos del huésped no se ven afectados si se rechaza la autorización.",
                "No se publica una imagen grupal sin el acuerdo de cada adulto identificable; un coordinador de grupo no puede consentir en nombre de otros adultos.",
                "Las imágenes de menores, huéspedes corporativos y VIP no se publican por defecto sin consentimiento documentado de un padre, tutor o la persona correspondiente, según el caso.",
                "Puedes retirar el consentimiento de publicación en cualquier momento escribiendo a contact@aventuraksa.com. Detendremos el uso futuro en un plazo razonable; la retirada no afecta a tratamientos anteriores lícitos.",
                "El contenido publicado permanece activo un máximo de 24 meses o hasta retirar el consentimiento, lo que suceda antes. Conservamos el registro del consentimiento 24 meses después de su vencimiento o retirada cuando sea necesario para acreditarlo."
              ]}
            ]
          },
          {
            heading: "10. Tus derechos y reclamaciones",
            blocks: [
              { type: "p", text: "Conforme a la Ley Saudí de Protección de Datos Personales, tienes derecho a conocer el tratamiento, acceder a tus datos, solicitar una copia legible cuando sea técnicamente posible, pedir corrección, solicitar destrucción en los casos previstos por la ley y retirar el consentimiento. Para proteger los datos, verificamos la identidad de quien presenta la solicitud de forma proporcionada." },
              { type: "p", text: "Escribe a contact@aventuraksa.com con el asunto «Solicitud de privacidad». Respondemos en un máximo de 30 días y, en los casos legalmente permitidos, podemos ampliar el plazo hasta 30 días más tras avisarte previamente de los motivos. Si no quedas conforme con nuestra gestión, puedes presentar una reclamación ante la Autoridad Saudí de Datos e Inteligencia Artificial a través de la Plataforma Nacional de Gobernanza de Datos." }
            ]
          },
          {
            heading: "11. Actualizaciones de la política",
            blocks: [
              { type: "p", text: "Podemos actualizar esta política cuando cambien los servicios del sitio o nuestras obligaciones legales. Publicaremos aquí la nueva fecha y, cuando sea necesario, cualquier cambio material de finalidad se presentará antes de aplicarse." }
            ]
          }
        ]
      },
      terms: {
        lead: "Última actualización: 9 de agosto de 2026",
        identity: [
          "Aventura, entidad saudí de gestión de eventos y experiencias privadas en Yeda, Registro Comercial n.º 4030583057.",
          "Para consultas sobre una solicitud o reserva: contact@aventuraksa.com"
        ],
        navigation: { privacy: "Política de privacidad", terms: "Términos y condiciones" },
        sections: [
          {
            heading: "1. Aceptación y alcance",
            blocks: [
              { type: "p", text: "Estos términos regulan el uso del sitio de Aventura y las solicitudes de eventos, experiencias y servicios para huéspedes. Al usar el sitio o enviar una solicitud, confirmas que has revisado estos términos y la Política de privacidad. Ninguna de estas acciones crea por sí sola una reserva confirmada ni un compromiso económico." }
            ]
          },
          {
            heading: "2. Función de Aventura y límites del servicio",
            blocks: [
              { type: "p", text: "Aventura organiza y gestiona eventos y experiencias locales privadas en Yeda. No es una agencia de viajes y no vende ni reserva billetes de avión, alojamientos hoteleros o visados. Cualquier coordinación con un hotel, resort o alojamiento existente se refiere únicamente al servicio local, no a una reserva de alojamiento." },
              { type: "p", text: "Empresas y agencias de viajes pueden contratar a Aventura para ejecutar la parte local de un programa de huéspedes. Quien presente una solicitud para otra persona confirma que está autorizado y que el huésped ha recibido la información necesaria sobre el uso compartido de sus datos para prestar el servicio." }
            ]
          },
          {
            heading: "3. Solicitud, propuesta y confirmación",
            blocks: [
              { type: "p", text: "El formulario del sitio, un mensaje de WhatsApp o un correo son solo una solicitud inicial. Tras revisar fecha, número de huéspedes, detalles y disponibilidad, Aventura podrá enviar una propuesta o un alcance sugerido. Un evento, experiencia o servicio queda confirmado únicamente cuando Aventura emite una confirmación escrita después de que el cliente acepte la propuesta y complete el pago acordado, si lo hubiera." },
              { type: "p", text: "La confirmación de reserva puede indicar fecha, duración, servicios incluidos y excluidos, precio, impuestos aplicables, calendario de pagos, condiciones de cancelación y reembolso y requisitos de proveedores. Si existe conflicto con estos términos generales, prevalece la confirmación específica del servicio." }
            ]
          },
          {
            heading: "4. Precios y pagos",
            blocks: [
              { type: "p", text: "Los precios se preparan para cada solicitud según alcance, fecha, número de huéspedes, disponibilidad y proveedores seleccionados, y se expresan en riales saudíes salvo que la propuesta indique otra cosa. El sitio no acepta pagos en línea por ahora. Aventura indica el medio de pago, anticipo requerido y fechas de vencimiento en la propuesta o confirmación." },
              { type: "p", text: "La disponibilidad o el precio pueden cambiar antes de la confirmación si cambia el coste de un proveedor o un elemento deja de estar disponible. Tras la confirmación, no se cobrará importe adicional sin aprobación del cliente o sin que esté previsto en la confirmación." }
            ]
          },
          {
            heading: "5. Cambios, cancelaciones y reembolsos",
            blocks: [
              { type: "p", text: "Las condiciones de pago, cambio, cancelación y reembolso de un servicio concreto se establecen únicamente en su propuesta o confirmación escrita, teniendo en cuenta el alcance, la fecha, la disponibilidad y las condiciones de los proveedores. Estos términos generales no fijan un porcentaje de anticipo, un plazo ni un resultado de reembolso único para todos los servicios." },
              { type: "p", text: "Todo cambio solicitado debe hacerse por escrito y depende de disponibilidad y de su posible efecto en el precio o el anticipo. Estos términos no afectan a derechos obligatorios del consumidor conforme a la legislación saudí." }
            ]
          },
          {
            heading: "6. Clima y circunstancias fuera de control",
            blocks: [
              { type: "p", text: "Si el clima, las condiciones del mar, una incidencia operativa u otra circunstancia fuera de control razonable impide prestar con seguridad un servicio marítimo o evento, Aventura procurará primero reprogramarlo u ofrecer una alternativa razonable. Si no fuera posible, el reembolso de la parte no prestada se gestionará según la confirmación de reserva. No se cubren gastos de viaje, alojamiento o terceros salvo que la ley aplicable exija lo contrario." }
            ]
          },
          {
            heading: "7. Responsabilidades del cliente y los huéspedes",
            blocks: [
              { type: "list", items: [
                "Facilitar información exacta y a tiempo sobre número de huéspedes, horarios y necesidades relacionadas con el servicio, e informar con antelación de cualquier circunstancia que pueda afectar una prestación segura o adecuada.",
                "Acudir al lugar y hora confirmados y seguir las instrucciones de seguridad de espacios, guías, transportistas, proveedores de embarcaciones y organizadores.",
                "Un menor es responsabilidad de su padre, tutor o representante autorizado. La participación podrá denegarse cuando sea necesario por seguridad o para cumplir una instrucción de un proveedor o la ley.",
                "No proporcionar números de identidad, pasaporte o datos de salud mediante el formulario del sitio. Si un servicio confirmado requiere legalmente una información concreta, Aventura la solicitará mediante un canal apropiado y solo en la medida mínima necesaria."
              ]}
            ]
          },
          {
            heading: "8. Proveedores y guías",
            blocks: [
              { type: "p", text: "Aventura puede coordinar servicios locales con proveedores independientes, como espacios, transportistas, proveedores marítimos, fotógrafos, sastres y floristas. Cuando una actividad requiera un guía autorizado u otra habilitación específica, se utilizará un proveedor debidamente cualificado. Las condiciones relevantes de proveedores se indicarán en la confirmación de reserva." },
              { type: "p", text: "Aventura gestiona la coordinación dentro del alcance confirmado. Estos términos no limitan los derechos legales que un cliente o huésped pueda tener frente a una parte responsable." }
            ]
          },
          {
            heading: "9. Fotos y contenido",
            blocks: [
              { type: "p", text: "Una reserva o la participación en una experiencia de Aventura no autoriza el uso de fotos o vídeos de huéspedes con fines de marketing. Toda publicación en el sitio, redes sociales o publicidad de pago requiere consentimiento separado, voluntario y específico después de la experiencia, y puede retirarse como se describe en la Política de privacidad." }
            ]
          },
          {
            heading: "10. Contenido del sitio y propiedad intelectual",
            blocks: [
              { type: "p", text: "El contenido visual y escrito, la identidad y los diseños de este sitio pertenecen a Aventura o se utilizan con autorización. No pueden copiarse ni reutilizarse comercialmente sin autorización escrita. Las imágenes del sitio expresan una dirección visual; los lugares, detalles y montajes reales se confirman en cada solicitud." }
            ]
          },
          {
            heading: "11. Privacidad",
            blocks: [
              { type: "p", text: "Los datos personales tratados por Aventura se rigen por la Política de privacidad publicada en este sitio, que forma parte de estos términos." }
            ]
          },
          {
            heading: "12. Ley aplicable y actualizaciones",
            blocks: [
              { type: "p", text: "Estos términos se rigen por las leyes del Reino de Arabia Saudita. Aventura procurará resolver cualquier reclamación de forma directa y justa, sin limitar el derecho de las partes a acudir a la autoridad o tribunal competente. Podemos actualizar estos términos cuando cambien nuestros servicios o requisitos legales; la fecha más reciente aparece al inicio de la página." }
            ]
          }
        ]
      }
    }
  };

  function appendTextElement(parent, tag, className, text) {
    var element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function renderDocument(target) {
    var language = document.documentElement.lang || "en";
    var documentType = target.getAttribute("data-legal-document");
    var localized = documents[language] || documents.en;
    var content = localized[documentType] || documents.en[documentType];
    if (!content) {
      return;
    }

    target.replaceChildren();
    appendTextElement(target, "p", "lead", content.lead);

    var identity = document.createElement("aside");
    identity.className = "legal-identity";
    identity.setAttribute("aria-label", documentType === "privacy" ? content.navigation.privacy : content.navigation.terms);
    content.identity.forEach(function (line) {
      appendTextElement(identity, "p", "", line);
    });
    target.appendChild(identity);

    var navigation = document.createElement("nav");
    navigation.className = "legal-page-links";
    navigation.setAttribute("aria-label", documentType === "privacy" ? content.navigation.terms : content.navigation.privacy);
    [
      { href: "terms.html", label: content.navigation.terms, active: documentType === "terms" },
      { href: "privacy.html", label: content.navigation.privacy, active: documentType === "privacy" }
    ].forEach(function (link) {
      var anchor = document.createElement("a");
      anchor.href = link.href;
      anchor.textContent = link.label;
      if (link.active) {
        anchor.setAttribute("aria-current", "page");
      }
      navigation.appendChild(anchor);
    });
    target.appendChild(navigation);

    content.sections.forEach(function (section) {
      appendTextElement(target, "h2", "", section.heading);
      section.blocks.forEach(function (block) {
        if (block.type === "list") {
          var list = document.createElement("ul");
          block.items.forEach(function (item) {
            appendTextElement(list, "li", "", item);
          });
          target.appendChild(list);
          return;
        }
        appendTextElement(target, block.type === "callout" ? "aside" : "p", block.type === "callout" ? "legal-callout" : "", block.text);
      });
    });
  }

  function renderAll() {
    document.querySelectorAll("[data-legal-document]").forEach(renderDocument);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll, { once: true });
  } else {
    renderAll();
  }
  document.addEventListener("aventura:language", renderAll);
}());
