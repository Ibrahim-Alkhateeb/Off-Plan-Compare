import type { Translations } from './en'

/**
 * Arabic counted nouns: one, two, a few (3–10) and many (11 and above) take different forms.
 * `formatted` is the number as it should be displayed.
 */
function counted(
  count: number,
  formatted: string,
  forms: { one: string; two: string; few: string; many: string },
): string {
  if (count === 1) return forms.one
  if (count === 2) return forms.two
  const lastTwo = count % 100
  return lastTwo >= 3 && lastTwo <= 10 ? `${formatted} ${forms.few}` : `${formatted} ${forms.many}`
}

const QUARTER_NAMES = ['الأول', 'الثاني', 'الثالث', 'الرابع']

/** Arabic interface strings. Mirrors the shape of the English file exactly. */
export const ar: Translations = {
  app: {
    name: 'مقارنة العقارات على المخطط',
    tagline: 'عروض دبي على المخطط، على أساس واحد',
    skipToContent: 'انتقل إلى المحتوى الرئيسي',
    mockNotice:
      'جميع البيانات المعروضة تجريبية وتوضيحية. تحقّق من كل رقم قبل اتخاذ أي قرار استثماري حقيقي.',
    language: {
      label: 'اللغة',
      en: 'EN',
      ar: 'العربية',
      enName: 'الإنجليزية',
      arName: 'العربية',
    },
  },

  format: {
    aed: (amount) => `${amount} درهم`,
    per: {
      sqft: 'للقدم المربعة',
      sqftYear: 'للقدم المربعة سنويًا',
      year: 'سنويًا',
    },
    sqft: (area) => `${area} قدم مربعة`,
    quarter: (quarter, year) => `الربع ${QUARTER_NAMES[quarter - 1]} ${year}`,
    months: (count, formatted) =>
      counted(count, formatted, { one: 'شهر واحد', two: 'شهران', few: 'أشهر', many: 'شهرًا' }),
    percentagePoints: (value) => `${value} نقطة مئوية`,
    unitType: { '1BR': 'غرفة نوم واحدة', '2BR': 'غرفتا نوم' },
    join: (parts) => parts.join(' · '),
  },

  stepper: {
    label: 'المراحل',
    steps: {
      shortlist: 'القائمة المختصرة',
      compare: 'المقارنة',
      decide: 'القرار',
    },
    current: 'المرحلة الحالية',
    completed: 'مكتملة',
    lockedSelect: 'اختر عقارين على الأقل أولًا',
    lockedCompare: 'افتح المقارنة أولًا',
  },

  shortlist: {
    title: 'القائمة المختصرة',
    intro: 'اختر عرضين أو ثلاثة من عروض الوكلاء لمقارنتها على أساس واحد.',
    labels: {
      developer: 'المطوّر',
      unit: 'الوحدة',
      price: 'السعر',
      handover: 'موعد التسليم المعلن',
    },
    addToComparison: 'أضف إلى المقارنة',
    columnPosition: (position) => `العمود ${position}`,
    asStated: 'الأرقام كما وردت في عرض كل وكيل، ولم يتم التحقق منها بشكل مستقل.',
    selectionLabel: 'العقارات المختارة',
    selectedCount: (count, max) => `تم اختيار ${count} من ${max}`,
    noneSelected: 'لم يتم اختيار أي عقار بعد',
    remove: (name) => `إزالة ${name} من المقارنة`,
    helperMin: 'اختر عقارين على الأقل',
    helperCanAdd: 'قارن هذين العقارين أو أضف عقارًا ثالثًا',
    helperMax: 'ثلاثة عقارات هي الحد الأقصى',
    compare: 'قارن',
    maxToast: 'يمكنك مقارنة ثلاثة عقارات كحد أقصى. أزل أحدها لإضافة عقار آخر.',
  },

  compare: {
    title: 'المقارنة',
    intro: 'الصفوف نفسها بالوحدات نفسها لكل عقار. يحمل كل رقم تسمية تبيّن مصدره.',
    criterion: 'المعيار',
    caption: 'مقارنة العقارات المختارة وفق ستة معايير',
    sections: {
      price: {
        index: 'أ',
        title: 'سعر القدم المربعة',
        short: 'السعر',
        description: 'تكلفة كل قدم مربعة، مقارنةً بسعر مرجعي للمنطقة نفسها.',
      },
      yield: {
        index: 'ب',
        title: 'العائد الإيجاري المتوقع',
        short: 'العائد',
        description: 'إيجار سنة كنسبة من السعر: رقم الوكيل، ورقم محسوب من إيجارات المنطقة.',
      },
      serviceCharges: {
        index: 'ج',
        title: 'رسوم الخدمات',
        short: 'الرسوم',
        description: 'الرسوم السنوية لتشغيل المبنى وصيانته، ويدفعها المالك.',
      },
      paymentPlan: {
        index: 'د',
        title: 'خطة الدفع',
        short: 'الدفع',
        description: 'مواعيد سداد السعر: أثناء الإنشاء وعند التسليم وبعده. رسوم التسجيل معروضة على حدة.',
      },
      handover: {
        index: 'هـ',
        title: 'موعد التسليم',
        short: 'التسليم',
        description: 'الموعد الذي يذكره العرض لتسليم الوحدة.',
      },
      developer: {
        index: 'و',
        title: 'سجل المطوّر',
        short: 'المطوّر',
        description: 'كيف سُلّمت مشاريع المطوّر السابقة، للسياق.',
      },
    },
    nav: {
      title: 'انتقل إلى',
      label: 'الانتقال إلى معيار',
      alerts: (count, formatted) =>
        counted(count, formatted, { one: 'تنبيه واحد', two: 'تنبيهان', few: 'تنبيهات', many: 'تنبيهًا' }),
    },
    points: {
      hint: 'اختر نقطة لعرضها في الجدول.',
    },
    view: {
      label: 'الصفوف المعروضة',
      key: 'الأرقام الرئيسية',
      all: 'كل الصفوف',
      keyHint: 'تُعرض الأرقام الرئيسية لكل معيار. اختر «كل الصفوف» لعرض المدخلات التي تستند إليها.',
      allHint: 'تُعرض كل الصفوف، ومنها المدخلات التي يستند إليها كل رقم رئيسي.',
    },
    rows: {
      price: 'السعر',
      unitArea: 'مساحة الوحدة',
      pricePerSqft: 'سعر القدم المربعة',
      benchmarkPricePerSqft: 'السعر المرجعي للقدم المربعة في المنطقة',
      benchmarkDiff: 'الفرق عن المرجع',
      agentYield: 'العائد الإجمالي كما ذكره الوكيل',
      areaRent: 'الإيجار السنوي المعتمد للمنطقة',
      yieldFromRent: 'العائد الإجمالي بحسب إيجار المنطقة',
      yieldAfterServiceCharges: 'العائد التقديري بعد رسوم الخدمات',
      serviceChargePerSqft: 'رسوم الخدمات للقدم المربعة سنويًا',
      annualServiceCharge: 'رسوم الخدمات السنوية',
      planConstruction: 'أثناء الإنشاء',
      planHandover: 'عند التسليم',
      planPostHandover: 'بعد التسليم',
      planShares: 'حصص الدفع',
      registrationFee: (pct) => `رسوم التسجيل (بافتراض ${pct})`,
      totalCommitment: 'إجمالي الالتزام التوضيحي',
      handover: 'موعد التسليم المعلن',
      projectsDelivered: 'المشاريع المسلَّمة',
      onTimeRate: 'نسبة التسليم في الموعد',
      avgDelay: 'متوسط التأخير السابق',
    },
    hints: {
      areaRent: 'إيجار مرجعي لنوع الوحدة نفسه في المنطقة',
      registrationFee: 'منفصلة عن دفعات المطوّر',
      totalCommitment: 'السعر مضافًا إليه رسوم التسجيل',
      handover: 'كما ورد في العرض، دون أي تعديل',
      onTimeRate: 'تُعرض ابتداءً من ثلاثة مشاريع مسلَّمة',
      avgDelay: 'للمشاريع المتأخرة فقط',
    },
    values: {
      none: 'لا يوجد',
      limitedRecord: 'سجل مشاريع محدود',
      noDelays: 'لا يوجد مشروع متأخر في السجل',
      benchmarkAbove: (pct, area) => `أعلى بنسبة ${pct} من مرجع ${area}`,
      benchmarkBelow: (pct, area) => `أقل بنسبة ${pct} من مرجع ${area}`,
      benchmarkLevel: (area) => `مطابق لمرجع ${area}`,
      avgDelayBasis: (delay, count, formatted) =>
        `${delay}، استنادًا إلى ${counted(count, formatted, {
          one: 'مشروع متأخر واحد',
          two: 'مشروعين متأخرين',
          few: 'مشاريع متأخرة',
          many: 'مشروعًا متأخرًا',
        })}`,
      postHandoverPeriod: (period) => `تُسدَّد على مدى ${period} بعد التسليم`,
      rentBasis: (unit, area) => `${unit}، ${area}`,
    },
    notAvailable: 'غير متوفر – يرجى سؤال الوكيل',
    tags: {
      highest: (count) => `الأعلى بين ${count}`,
      lowest: (count) => `الأدنى بين ${count}`,
    },
    notes: {
      yield:
        'العائد بعد رسوم الخدمات لا يشمل تكاليف التشغيل والتملك الأخرى. وهو ليس العائد الكامل على الاستثمار.',
      paymentPlan: (pct) =>
        `تواريخ الدفعات ونسبها افتراضات توضيحية، وليست شروط عقد حقيقي. رسوم التسجيل بنسبة ${pct} افتراض؛ تحقّق من الرسوم الفعلية ومن أي إعفاءات.`,
      developer: 'الأداء السابق معروض للسياق. وهو ليس توقعًا لموعد تسليم هذا المشروع.',
    },
    planSharesLabel: (construction, handover, postHandover) =>
      `${construction} أثناء الإنشاء، ${handover} عند التسليم، ${postHandover} بعد التسليم`,
    pointsToVerify: (count, formatted) =>
      counted(count, formatted, {
        one: 'نقطة واحدة للتحقق',
        two: 'نقطتان للتحقق',
        few: 'نقاط للتحقق',
        many: 'نقطة للتحقق',
      }),
    noPoints: 'لم يتم تجاوز أي حد تنبيه',
    thresholdNote: 'هذه حدود تجريبية خاصة بهذا النموذج الأولي، وليست معايير رسمية للسوق.',
    legend: {
      title: 'كيف تقرأ المقارنة',
      sources: 'تسميات المصدر',
      alerts: 'التنبيهات',
      verify: 'نقطة للتحقق منها مع الوكيل',
      info: 'معروضة للعلم',
      hint: 'اختر أي تسمية أو تنبيه في الجدول لعرض التفاصيل.',
      tags: 'وسما «الأعلى» و«الأدنى» يصفان الموقع بين العقارات المختارة، وليسا حكمًا عليها.',
    },
    back: 'العودة إلى القائمة المختصرة',
    continue: 'المتابعة إلى القرار',
  },

  sources: {
    labels: {
      agent: 'بيانات الوكيل',
      benchmark: 'مرجع المنطقة – بيانات تجريبية',
      developer: 'سجل المطوّر – بيانات تجريبية',
      calculated: 'رقم محسوب',
    },
    open: (label) => `${label}. اعرض مصدر هذا الرقم`,
    agent: 'وردت في عرض الوكيل. لم يتم التحقق منها بشكل مستقل.',
    benchmark: (area) => `مرجع توضيحي لمنطقة ${area}. بيانات تجريبية، وليست رقمًا سوقيًا موثّقًا.`,
    developer: 'سجل توضيحي للمطوّر. بيانات تجريبية، وليست سجلًا موثّقًا.',
    calculated: {
      formula: 'المعادلة',
      worked: 'بأرقام هذا العقار',
      inputs: 'المدخلات',
      unavailable: (missing) => `تعذّر الحساب لعدم توفر ${missing}.`,
    },
    formulas: {
      pricePerSqft: {
        words: 'السعر ÷ مساحة الوحدة',
        worked: (price, area, result) => `${price} ÷ ${area} = ${result}`,
        inputs: 'السعر ومساحة الوحدة من بيانات الوكيل.',
      },
      benchmarkDiff: {
        words: '(سعر القدم المربعة − مرجع المنطقة) ÷ مرجع المنطقة × 100',
        worked: (perSqft, benchmark, result) =>
          `(${perSqft} − ${benchmark}) ÷ ${benchmark} × 100 = ${result}`,
        inputs: 'سعر القدم المربعة محسوب من بيانات الوكيل. مرجع المنطقة بيانات تجريبية.',
      },
      yieldFromRent: {
        words: 'الإيجار السنوي للمنطقة ÷ السعر × 100',
        worked: (rent, price, result) => `${rent} ÷ ${price} × 100 = ${result}`,
        inputs: 'الإيجار السنوي للمنطقة مرجع للمنطقة (بيانات تجريبية). السعر من بيانات الوكيل.',
      },
      annualServiceCharge: {
        words: 'رسوم الخدمات للقدم المربعة × مساحة الوحدة',
        worked: (charge, area, result) => `${charge} × ${area} = ${result}`,
        inputs: 'رسوم الخدمات ومساحة الوحدة من بيانات الوكيل.',
      },
      yieldAfterServiceCharges: {
        words: '(الإيجار السنوي للمنطقة − رسوم الخدمات السنوية) ÷ السعر × 100',
        worked: (rent, charge, price, result) => `(${rent} − ${charge}) ÷ ${price} × 100 = ${result}`,
        inputs:
          'الإيجار السنوي للمنطقة مرجع للمنطقة (بيانات تجريبية). رسوم الخدمات والسعر من بيانات الوكيل.',
      },
      yieldGap: {
        words: 'العائد الذي ذكره الوكيل − العائد الإجمالي بحسب إيجار المنطقة',
        worked: (agentYield, areaYield, result) => `${agentYield} − ${areaYield} = ${result}`,
        inputs:
          'العائد المذكور من بيانات الوكيل. العائد بحسب إيجار المنطقة محسوب من مرجع للمنطقة (بيانات تجريبية).',
      },
      stageAmount: {
        words: 'السعر × نسبة المرحلة',
        worked: (price, share, result) => `${price} × ${share} = ${result}`,
        inputs: 'السعر ونسبة المرحلة من بيانات الوكيل.',
      },
      registrationFee: {
        words: (pct) => `السعر × ${pct} رسوم تسجيل مفترضة`,
        worked: (price, pct, result) => `${price} × ${pct} = ${result}`,
        inputs: (pct) => `السعر من بيانات الوكيل. نسبة ${pct} افتراض من هذه الأداة.`,
      },
      totalCommitment: {
        words: 'السعر + رسوم التسجيل',
        worked: (price, fee, result) => `${price} + ${fee} = ${result}`,
        inputs: 'السعر من بيانات الوكيل. رسوم التسجيل محسوبة بنسبة مفترضة.',
      },
      onTimeRate: {
        words: 'المشاريع المسلَّمة في الموعد ÷ المشاريع المسلَّمة × 100',
        worked: (onTime, delivered, result) => `${onTime} ÷ ${delivered} × 100 = ${result}`,
        inputs: 'أعداد المشاريع من سجل المطوّر (بيانات تجريبية).',
      },
    },
  },

  alerts: {
    severity: {
      verify: 'نقطة للتحقق',
      info: 'للعلم',
    },
    text: {
      1: 'اطلب المعلومة من الوكيل.',
      2: 'تحقّق من تقدير الإيجار.',
      3: 'راجع السعر مقارنةً بالمنطقة.',
      4: 'راجع سجل التسليم السابق.',
      5: 'سجل المطوّر محدود.',
      6: 'راجع رسوم الخدمات.',
      7: 'الالتزامات اللاحقة معروضة بشكل منفصل.',
    },
    rule: {
      missing: 'يظهر عندما لا تتوفر إحدى القيم.',
      yieldGap: (threshold) =>
        `يظهر عندما يزيد عائد الوكيل على العائد بحسب إيجار المنطقة بأكثر من ${threshold}.`,
      priceAboveBenchmark: (threshold) =>
        `يظهر عندما يزيد سعر القدم المربعة على مرجع المنطقة بأكثر من ${threshold}.`,
      historicalDelay: (threshold) => `يظهر عندما يتجاوز متوسط التأخير السابق للمطوّر ${threshold}.`,
      limitedRecord: (min) => `يظهر عندما يقل عدد مشاريع المطوّر المسلَّمة عن ${min}.`,
      serviceCharge: (threshold) => `يظهر عندما تزيد رسوم الخدمات على ${threshold}.`,
      postHandover: 'يظهر عندما يُستحق أي جزء من السعر بعد التسليم.',
    },
    detail: {
      missing: (item) => `لم يتوفر: ${item}.`,
      yieldGap: (agentYield, areaYield, gap) =>
        `عائد الوكيل البالغ ${agentYield} يزيد بمقدار ${gap} على العائد بحسب إيجار المنطقة البالغ ${areaYield}.`,
      priceAboveBenchmark: (difference) => `سعر القدم المربعة ${difference}.`,
      historicalDelay: (delay) =>
        `متوسط التأخير السابق ${delay}. هذا سجل سابق، وليس توقعًا لهذا المشروع.`,
      limitedRecord: (count, formatted, min) =>
        `في سجل المطوّر ${counted(count, formatted, {
          one: 'مشروع مسلَّم واحد',
          two: 'مشروعان مسلَّمان',
          few: 'مشاريع مسلَّمة',
          many: 'مشروعًا مسلَّمًا',
        })} فقط. تُعرض نسبة التسليم في الموعد ابتداءً من ${min} مشاريع مسلَّمة.`,
      serviceCharge: (charge, threshold) =>
        `رسوم الخدمات المذكورة ${charge}، وهي أعلى من الحد التجريبي البالغ ${threshold}.`,
      postHandover: (share, amount, period) =>
        period
          ? `${share} من السعر (${amount}) مستحقة بعد التسليم، وتُسدَّد على مدى ${period}.`
          : `${share} من السعر (${amount}) مستحقة بعد التسليم.`,
    },
    missingItems: {
      agentYield: 'العائد الإيجاري الإجمالي',
      areaRent: 'الإيجار السنوي للوحدات المماثلة في المنطقة',
      serviceCharge: 'رسوم الخدمات للقدم المربعة سنويًا',
      paymentPlan: 'خطة الدفع',
      handover: 'موعد التسليم',
    },
    questions: {
      missing: (item) => `هل يمكنك تأكيد ${item} كتابيًا؟`,
      yieldGap: (agentYield) =>
        `ما الإيجار السنوي الذي استندتَ إليه في عائد ${agentYield}، وما عقود الإيجار المماثلة التي تدعمه؟`,
      priceAboveBenchmark: (pct) => `ما الذي يبرّر سعرًا أعلى بنسبة ${pct} من مرجع المنطقة لهذه الوحدة؟`,
      historicalDelay: 'ما نسبة الإنجاز الحالية في أعمال الإنشاء، وماذا يترتب تعاقديًا إذا تأخر التسليم؟',
      limitedRecord: 'ما المشاريع التي أنجزها المطوّر، ومتى سُلّمت مقارنةً بالمواعيد الأصلية؟',
      serviceCharge: 'ماذا تغطي رسوم الخدمات، وهل المعدل المذكور تقديري أم معتمد؟',
      postHandover: 'ما التواريخ والشروط الدقيقة لدفعات ما بعد التسليم؟',
    },
  },

  decide: {
    title: 'القرار',
    intro: 'ما تُظهره المقارنة عن كل عقار، جنبًا إلى جنب. القرار وأسبابه لك وحدك.',
    advantagesTitle: 'المزايا النسبية',
    advantagesHint: 'مقارنةً بالعقارات المختارة فقط',
    watchPointsTitle: 'نقاط الانتباه',
    questionsTitle: 'أسئلة تُطرح على الوكيل',
    noAdvantage: 'لا توجد ميزة نسبية في المعايير المقيسة بين العقارات المختارة.',
    noWatchPoints: 'لم يتم تجاوز أي حد تنبيه. أرقام الوكيل لم يتم التحقق منها بشكل مستقل بعد.',
    noQuestions: 'لم تُنتج قواعد التنبيه أي سؤال. يمكنك مع ذلك أن تطلب من الوكيل تأكيد كل رقم كتابيًا.',
    more: (count) => `+${count} أخرى في المقارنة`,
    rating: {
      labels: {
        highest: 'الأعلى تقييمًا',
        average: 'متوسط',
        lowest: 'الأدنى تقييمًا',
      },
      open: (label) => `${label}. اعرض طريقة التقييم`,
      basisTitle: 'كيف حُدِّد هذا التقييم',
      basis: (advantages, points, net) =>
        `المزايا النسبية المذكورة (${advantages}) ناقص نقاط التحقق (${points}) = ${net}.`,
      tieBreak: 'عند تساوي عقارين، يُقدَّم العقار الأقل في نقاط التحقق.',
      scope: 'التقييم مقارنةً بالعقارات المختارة الأخرى فقط، وفق قاعدة تجريبية خاصة بهذا النموذج الأولي. وليس نصيحة.',
      note: 'التقييم يقارن العقارات المختارة فيما بينها: المزايا النسبية المذكورة ناقص نقاط التحقق. عند التساوي، يُقدَّم العقار الأقل في نقاط التحقق. قاعدة تجريبية خاصة بهذا النموذج الأولي، وليست نصيحة.',
    },
    scopeAll: (count) => (count === 2 ? 'بين العقارين' : 'بين العقارات الثلاثة'),
    scopePartial: (count) =>
      count === 2 ? 'بين العقارين اللذين يتوفر لهما هذا الرقم' : 'بين العقارات التي يتوفر لها هذا الرقم',
    advantages: {
      benchmarkDiff: (scope, value) => `أدنى سعر للقدم المربعة قياسًا بمرجع منطقته ${scope}: ${value}.`,
      yieldAfterServiceCharges: (scope, value) => `أعلى عائد تقديري بعد رسوم الخدمات ${scope}: ${value}.`,
      serviceCharge: (scope, value) => `أدنى رسوم خدمات ${scope}: ${value}.`,
      preHandoverShare: (scope, value) =>
        `أصغر حصة من السعر مستحقة قبل التسليم ${scope}: ${value} أثناء الإنشاء.`,
      handover: (scope, value) => `أقرب موعد تسليم معلن ${scope}: ${value}.`,
      onTimeRate: (scope, value) => `أعلى نسبة تسليم في الموعد للمطوّر ${scope}: ${value}.`,
    },
    decision: {
      title: 'سجّل قرارك',
      legend: 'ما الخيار الذي يعبّر عن قرارك؟',
      myPick: (name) => `اختياري: ${name}`,
      none: 'لا يناسبني أي من الخيارات',
      noneHint: 'عدم اختيار أي منها نتيجة مقبولة أيضًا.',
      record: 'سجّل قراري',
      recordHelper: 'اختر أحد الخيارات لتسجيل قرارك',
      notSaved: 'لا يُحفظ شيء ولا يُشارَك. تحديث الصفحة يمسح كل شيء.',
    },
    panel: {
      title: 'قرارك',
      why: 'لماذا هذا العقار دون غيره',
      risks: 'المخاطر التي تقبلها',
      unverified: 'ما لم يتم التحقق منه بعد',
      unverifiedHint: 'أسئلة تُطرح على الوكيل',
      noneTitle: 'لماذا لا يناسبني أي منها في الوقت الحالي',
      watchPoints: 'نقاط الانتباه',
      openQuestions: 'أسئلة مفتوحة',
      change: 'تغيير القرار',
      startNew: 'بدء مقارنة جديدة',
    },
    back: 'العودة إلى المقارنة',
  },
}
