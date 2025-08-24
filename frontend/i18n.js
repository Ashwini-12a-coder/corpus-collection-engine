window.I18N = {
  en: {
    intro_title: "Preserve & Share Local Knowledge",
    intro_desc: "Choose a category, answer 10 short questions in your language, and help build open datasets for Indian languages, history, and culture.",
    status_offline: "Offline-first ready. Submissions will sync when online.",
    pick_category: "Pick a category",
    name_label: "Your name (optional)",
    answer_lang: "Answer language",
    timer_label: "Session timer",
    questions_title: "Questions",
    load_questions: "Load 10 Questions",
    agree_text: "I agree to contribute my answers under an open-license (CC BY 4.0).",
    submit_btn: "Submit Answers",
    privacy_note: "Your responses may be used to build open datasets for research and education. Avoid sharing private information."
  },
  hi: {
    intro_title: "स्थानीय ज्ञान को संजोएँ और साझा करें",
    intro_desc: "श्रेणी चुनें, अपनी भाषा में 10 छोटे प्रश्नों के उत्तर दें, और भारतीय भाषाओं व संस्कृति के लिए खुले डेटा बनाने में मदद करें।",
    status_offline: "ऑफ़लाइन-फर्स्ट तैयार। सबमिशन ऑनलाइन होते ही सिंक हो जाएंगे।",
    pick_category: "श्रेणी चुनें",
    name_label: "आपका नाम (वैकल्पिक)",
    answer_lang: "उत्तर की भाषा",
    timer_label: "सेशन टाइमर",
    questions_title: "प्रश्न",
    load_questions: "10 प्रश्न लोड करें",
    agree_text: "मैं सहमत हूँ कि मेरे उत्तर ओपन-लाइसेंस (CC BY 4.0) के तहत साझा किए जाएँ।",
    submit_btn: "उत्तर सबमिट करें",
    privacy_note: "आपके उत्तर शोध और शिक्षा के लिए खुले डेटासेट में उपयोग हो सकते हैं। निजी जानकारी साझा करने से बचें।"
  },
  te: {
    intro_title: "స్థానిక జ్ఞానాన్ని సంరక్షించి పంచండి",
    intro_desc: "ఒక వర్గాన్ని ఎంచుకొని, మీ భాషలో 10 ప్రశ్నలకు సమాధానాలు ఇవ్వండి. భారతీయ భాషలు, సంస్కృతి కోసం ఓపెన్ డేటాసెట్‌లకు తోడ్పడండి.",
    status_offline: "ఆఫ్‌లైన్-ఫస్ట్ సిద్ధం. ఆన్‌లైన్ కాగానే సమర్పణలు సింక్ అవుతాయి.",
    pick_category: "వర్గాన్ని ఎంచుకోండి",
    name_label: "మీ పేరు (ఐచ్చికం)",
    answer_lang: "సమాధాన భాష",
    timer_label: "సెషన్ టైమర్",
    questions_title: "ప్రశ్నలు",
    load_questions: "10 ప్రశ్నలు లోడ్ చేయండి",
    agree_text: "నా సమాధానాలు ఓపెన్ లైసెన్స్ (CC BY 4.0) కింద పంచబడటానికి నేను అంగీకరిస్తున్నాను.",
    submit_btn: "సమాధానాలు సమర్పించండి",
    privacy_note: "మీ సమాధానాలు పరిశోధన, విద్య కోసం ఓపెన్ డేటాసెట్‌లలో ఉపయోగించబడవచ్చు. వ్యక్తిగత సమాచారం పంచుకోవద్దు."
  }
};

(function() {
  const select = document.getElementById('langSelect');
  const apply = (lang) => {
    const dict = I18N[lang] || I18N.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });
  };
  select.addEventListener('change', () => apply(select.value));
  apply(select.value);
})();
