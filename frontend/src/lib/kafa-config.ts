export type Subject = {
  id: number;
  name: string;
  icon: string;
  color: string;
};

export const kafaSubjects: Subject[] = [
  { id: 1, name: "Al-Quran", icon: "📖", color: "bg-blue-500" },
  { id: 2, name: "Akidah", icon: "🕌", color: "bg-green-500" },
  { id: 3, name: "Ibadah", icon: "🤲", color: "bg-purple-500" },
  { id: 4, name: "Sirah", icon: "📚", color: "bg-orange-500" },
  { id: 5, name: "Adab", icon: "🌟", color: "bg-pink-500" },
  { id: 6, name: "Bahasa Arab", icon: "🔤", color: "bg-red-500" },
  { id: 7, name: "Jawi dan Khat", icon: "✍️", color: "bg-indigo-500" },
  { id: 8, name: "Tahfiz al-Quran", icon: "🎵", color: "bg-teal-500" },
];

export const yearLevels = ["Tahun 1", "Tahun 2", "Tahun 3", "Tahun 4", "Tahun 5", "Tahun 6"];
