/** @format */

export const ACTIVITY_TYPES = [
  {
    type: "mixAndMatch",
    titleEn: "Mix & Match",
    titleMy: "Padankan",
    titleJawi: "پادنکن",
    icon: "🎯",
    descriptionEn: "Match related items together",
    descriptionMy: "Padankan item yang berkaitan",
    descriptionJawi: "پادنکن آيتم يڠ برکايتن",
    color: "from-pink-400 to-rose-500",
  },
  {
    type: "dragDrop",
    titleEn: "Drag & Drop",
    titleMy: "Seret & Lepas",
    titleJawi: "سرت دن لپس",
    icon: "📍",
    descriptionEn: "Drag items to correct places",
    descriptionMy: "Seret item ke tempat yang betul",
    descriptionJawi: "سرت آيتم کي تمپت يڠ بتول",
    color: "from-blue-400 to-cyan-500",
  },
  {
    type: "fillBlanks",
    titleEn: "Fill in Blanks",
    titleMy: "Isi Tempat Kosong",
    titleJawi: "اسي تمپت کوسوڠ",
    icon: "✏️",
    descriptionEn: "Complete the missing words",
    descriptionMy: "Lengkapkan perkataan yang hilang",
    descriptionJawi: "لڠکپکن پرکتاآن يڠ هيلڠ",
    color: "from-amber-400 to-orange-500",
  },
  {
    type: "imagePairing",
    titleEn: "Image Pairing",
    titleMy: "Padanan Gambar",
    titleJawi: "پادنن ڬمبر",
    icon: "🖼️",
    descriptionEn: "Match images with words",
    descriptionMy: "Padankan gambar dengan perkataan",
    descriptionJawi: "پادنکن ڬمبر دڠن پرکتاآن",
    color: "from-green-400 to-emerald-500",
  },
  {
    type: "dictation",
    titleEn: "Dictation",
    titleMy: "Dengar & Tulis",
    titleJawi: "دڠر دن توليس",
    icon: "🎤",
    descriptionEn: "Listen and write what you hear",
    descriptionMy: "Dengarkan dan tulis apa yang anda dengar",
    descriptionJawi: "دڠركن دن توليس اڤا يڠ اندا دڠر",
    color: "from-purple-400 to-violet-500",
  },
  {
    type: "markWord",
    titleEn: "Mark the Word",
    titleMy: "Tandai Perkataan",
    titleJawi: "تندائي پرکتاآن",
    icon: "👆",
    descriptionEn: "Click the correct word",
    descriptionMy: "Klik perkataan yang betul",
    descriptionJawi: "کليک پرکتاآن يڠ بتول",
    color: "from-indigo-400 to-blue-500",
  },
  {
    type: "trueFalse",
    titleEn: "True or False",
    titleMy: "Benar atau Salah",
    titleJawi: "بنر اتاو سله",
    icon: "✔️",
    descriptionEn: "Decide if statements are true",
    descriptionMy: "Tentukan sama ada pernyataan itu benar",
    descriptionJawi: "تنتوکن ساما ادا پرنياتن ايتو بنر",
    color: "from-cyan-400 to-blue-500",
  },
];

export const SUBJECTS = [
  {
    nameEn: "Quran",
    nameMy: "Al-Quran",
    nameJawi: "القرآن",
    icon: "📖",
    color: "from-amber-400 to-orange-500", // AMBER/ORANGE
    bgColor: "bg-amber-100",
  },
  {
    nameEn: "Aqidah",
    nameMy: "Akidah",
    nameJawi: "العقيدة",
    icon: "🕌",
    color: "from-sky-400 to-blue-600", // BLUE
    bgColor: "bg-sky-100",
  },
  {
    nameEn: "Ibadah",
    nameMy: "Ibadah",
    nameJawi: "العبادة",
    icon: "🤲",
    color: "from-emerald-400 to-teal-600", // GREEN
    bgColor: "bg-emerald-100",
  },
  {
    nameEn: "Sirah",
    nameMy: "Sirah",
    nameJawi: "السيرة",
    icon: "📜",
    color: "from-violet-400 to-purple-600", // PURPLE (VIOLET FAMILY)
    bgColor: "bg-violet-100",
  },
  {
    nameEn: "Adab",
    nameMy: "Adab",
    nameJawi: "الأدب",
    icon: "🌟",
    color: "from-rose-400 to-pink-600", // LIME (DIFFERENT from emerald/green)
    bgColor: "bg-rose-100",
  },
  {
    nameEn: "Arabic Language",
    nameMy: "Bahasa Arab",
    nameJawi: "بهاسا عرب",
    icon: "🔤",
    color: "from-yellow-400 to-amber-600 ", // ROSE/PINK
    bgColor: "bg-yellow-100",
  },
  {
    nameEn: "Jawi and Khat",
    nameMy: "Jawi dan Khat",
    nameJawi: "جاوي و خط",
    icon: "✍️",
    color: "from-indigo-400 to-indigo-600", // INDIGO
    bgColor: "bg-indigo-100",
  },
  {
    nameEn: "Tahfiz Al-Quran",
    nameMy: "Tahfiz Al-Quran",
    nameJawi: "تحفيظ القرآن",
    icon: "🎵",
    color: "from-lime-400 to-green-500", // YELLOW (NOT same as Ibadah)
    bgColor: "bg-lime-100",
  },
];

export const YEARS = [1, 2, 3, 4, 5, 6];

export const TRANSLATIONS = {
  en: {
    letExplore: "Let's explore and have fun while learning!",
    whatsYear: "What's your year?",
    greatChoice: "Great choice! You selected",
    pickActivity: "Pick an activity",
    yourLearningPath: "Your Learning Path",
    changeSubject: "Change Subject",
    changeYear: "Change Year",
    level: "Level",
    back: "Back",
  },
  my: {
    letExplore: "Mari Kita Jelajahi dan Belajar Sambil Bermain!",
    whatsYear: "Tahun berapa anda?",
    greatChoice: "Pilihan bagus! Anda memilih",
    pickActivity: "Pilih aktiviti",
    yourLearningPath: "LALUANlajaran Anda",
    changeSubject: "Ubah Subjek",
    changeYear: "Ubah Tahun",
    level: "Tahap",
    back: "Kembali",
    lockedActivity: "Aktiviti Terkunci",
    unlockAtLevel: "Buka pada tahun",
    completeToUnlock: "Selesaikan aktiviti tahun sebelumnya untuk membuka ini",
  },
};
