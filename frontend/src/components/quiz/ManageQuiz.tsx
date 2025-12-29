import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { QuizHeader } from './QuizHeader';
import { QuestionCard } from './QuestionCard';
import { AdaptiveSettings } from './AdaptiveSettings';
import type { AdaptiveQuizSettings } from '@/lib/AdaptiveQuizEngine';
import { defaultAdaptiveSettings } from '@/lib/quiz-constants';
import { MOCK_TOPICS_DATABASE } from '@/lib/quiz-config';
import type { QuizData, Question } from '@/components/admin/quiztable';

interface ManageQuizProps {
  onSave: (quizData: QuizData) => void;
  onCancel: () => void;
  initialQuiz?: QuizData;
  isEditing?: boolean;
}

export function ManageQuiz({ onSave, onCancel, initialQuiz, isEditing }: ManageQuizProps) {
  const [year, setYear] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [quizType, setQuizType] = useState('');
  const [bloomLevel, setBloomLevel] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'adaptive'>('questions');
  const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveQuizSettings>(defaultAdaptiveSettings);

  useEffect(() => {
    if (initialQuiz) {
      setYear(initialQuiz.year);
      setSubject(initialQuiz.subject);
      setTopic(initialQuiz.topic);
      setQuizType(initialQuiz.quizType);
      setBloomLevel(initialQuiz.bloomLevel);
      setQuestions(initialQuiz.questions);
      setAdaptiveSettings(initialQuiz.adaptiveSettings || defaultAdaptiveSettings);
    }
  }, [initialQuiz]);

  const availableTopics = year && subject
    ? MOCK_TOPICS_DATABASE.find(db => db.year === year && db.subject === subject)?.topics || []
    : [];

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Date.now(),
      questionText: '',
      options: ['', '', '', ''],
      correctAnswers: [],
      answerType: 'single',
      sentenceWithBlanks: '',
      answerPool: [],
      blankMapping: [],
      instruction: '',
      items: [],
      targets: [],
      mapping: [],
      difficulty: 'medium'
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleUpdateQuestion = (id: number, field: string, value: unknown) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };



  const handleSave = () => {
    const quizData: QuizData = {
      year,
      subject,
      topic,
      quizType,
      bloomLevel,
      questions,
      adaptiveSettings
    };
    onSave(quizData);
  };



  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">
          {isEditing ? "Sunting Kuiz" : "Cipta Kuiz Baharu"}
        </h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            {isEditing ? "Kemaskini Kuiz" : "Simpan Kuiz"}
          </Button>
        </div>
      </div>

      <QuizHeader
        year={year}
        subject={subject}
        topic={topic}
        quizType={quizType}
        bloomLevel={bloomLevel}
        availableTopics={availableTopics}
        onYearChange={setYear}
        onSubjectChange={setSubject}
        onTopicChange={setTopic}
        onQuizTypeChange={setQuizType}
        onBloomLevelChange={setBloomLevel}
      />

      {quizType && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Soalan ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('adaptive')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'adaptive'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              Tetapan Adaptif
            </button>
          </div>

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Soalan</h2>
                <Button onClick={handleAddQuestion} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Tambah Soalan
                </Button>
              </div>

              {questions.length === 0 && (
                <p className="text-center text-slate-500 italic p-8 bg-slate-50 rounded-lg">
                  Tiada soalan lagi. Klik butang di atas untuk menambah soalan.
                </p>
              )}

              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  quizType={quizType}
                  onRemoveQuestion={handleRemoveQuestion}
                  onUpdateQuestion={handleUpdateQuestion}
                />
              ))}
            </div>
          )}

          {/* Adaptive Settings Tab */}
          {activeTab === 'adaptive' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Tetapan Kuiz Adaptif</h2>
              <AdaptiveSettings
                settings={adaptiveSettings}
                onSettingsChange={setAdaptiveSettings}
              />
            </div>
          )}a
        </div>
      )}
    </div>
  );
}
