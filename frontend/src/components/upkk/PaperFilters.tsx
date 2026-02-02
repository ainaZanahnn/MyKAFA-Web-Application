/** @format */


interface PaperFiltersProps {
  selectedYear: string;
  selectedSubject: string;
  selectedType: string;
  onYearChange: (year: string) => void;
  onSubjectChange: (subject: string) => void;
  onTypeChange: (type: string) => void;
  onPageReset: () => void;
}

const PaperFilters: React.FC<PaperFiltersProps> = ({
  selectedYear,
  selectedSubject,
  selectedType,
  onYearChange,
  onSubjectChange,
  onTypeChange,
  onPageReset,
}) => {
  // Generate year options from 2026 down to 1997
  const yearOptions = [
    "semua",
    ...Array.from({ length: 2026 - 1997 + 1 }, (_, i) => (2026 - i).toString()),
  ];

  const subjectOptions = [
    "semua",
    "Aqidah",
    "Sirah",
    "Ibadah",
    "Al-Quran",
    "Jawi",
    "Bahasa Arab",
  ];

  const typeOptions = ["semua", "Tahun Lepas", "Percubaan", "Skema Jawapan"];

  const handleChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      onPageReset(); // Reset to page 1 when filters change
    };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label
          htmlFor="year-select"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Pilih Tahun
        </label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={handleChange(onYearChange)}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Pilih tahun"
        >
          <option value="semua">Semua Tahun</option>
          {yearOptions.slice(1).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="subject-select"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Pilih Subjek
        </label>
        <select
          id="subject-select"
          value={selectedSubject}
          onChange={handleChange(onSubjectChange)}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Pilih subjek"
        >
          <option value="semua">Semua Subjek</option>
          {subjectOptions.slice(1).map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="type-select"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Pilih Jenis
        </label>
        <select
          id="type-select"
          value={selectedType}
          onChange={handleChange(onTypeChange)}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Pilih jenis"
        >
          <option value="semua">Semua Jenis</option>
          {typeOptions.slice(1).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PaperFilters;
