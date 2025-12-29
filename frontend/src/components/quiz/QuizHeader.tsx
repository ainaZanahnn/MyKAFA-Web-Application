
import { SUBJECTS, YEARS, } from '@/lib/activitiesconfig';
import { QUIZ_TYPES } from '@/lib/quiz-config';

interface QuizHeaderProps {
  year: number | null;
  subject: string;
  topic: string;
  quizType: string;
  bloomLevel: string;
  availableTopics: string[];
  onYearChange: (year: number | null) => void;
  onSubjectChange: (subject: string) => void;
  onTopicChange: (topic: string) => void;
  onQuizTypeChange: (type: string) => void;
  onBloomLevelChange: (level: string) => void;
}

export function QuizHeader({
  year,
  subject,
  topic,
  quizType,
  availableTopics,
  onYearChange,
  onSubjectChange,
  onTopicChange,
  onQuizTypeChange,
}: QuizHeaderProps) {
  return (
    <div className="space-y-6 mb-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Tahun</label>
          <select
            value={year || ''}
            onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="">Pilih Tahun</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Subjek</label>
          <select
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          >
            <option value="">Pilih Subjek</option>
            {SUBJECTS.map((s) => (
              <option key={s.nameMy} value={s.nameMy}>
                {s.nameMy}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">Topik</label>
        {year && subject ? (
          availableTopics.length > 0 ? (
            <select
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">Pilih Topik</option>
              {availableTopics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-slate-500 italic p-3 bg-slate-100 rounded-lg">
              Tiada topik tersedia untuk kombinasi ini
            </p>
          )
        ) : (
          <p className="text-slate-500 italic p-3 bg-slate-100 rounded-lg">Sila pilih Tahun dan Subjek dahulu</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-3">Jenis Kuiz</label>
        <div className="grid grid-cols-3 gap-4">
          {QUIZ_TYPES.map((type) => (
            <button
              key={type.type}
              type="button"
              onClick={() => onQuizTypeChange(type.type)}
              className={`p-6 rounded-lg border-2 transition-all ${
                quizType === type.type
                  ? `border-slate-800 bg-gradient-to-r ${type.color} text-white shadow-lg`
                  : 'border-slate-200 bg-white hover:border-slate-400'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{type.icon}</div>
                <div className="font-bold text-lg mb-1">{type.nameMy}</div>
                <div className={`text-sm ${quizType === type.type ? 'text-white' : 'text-slate-600'}`}>
                  {type.descriptionMy}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>


    </div>
  );
}
