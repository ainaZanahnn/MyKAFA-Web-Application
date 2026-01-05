import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Plus, Settings } from 'lucide-react';
import { QuizHeader } from './QuizHeader';
import { QuestionCard } from './QuestionCard';
import { AdaptiveSettings } from './AdaptiveSettings';
import type { AdaptiveQuizSettings } from '../../lib/AdaptiveQuizEngine';
import { defaultAdaptiveSettings } from '../../lib/quiz-constants';
import type { QuizData, Question } from '../../components/admin/quiztable';
import quizService from '@/services/quizService';
import lessonService from '../../services/lessonService';
import { toast } from 'react-toastify';

interface ManageQuizProps {
  onSave: (quizData: QuizData) => Promise<void>;
  onCancel: () => void;
  initialQuiz?: QuizData;
  isEditing?: boolean;
}

export const ManageQuiz: React.FC<ManageQuizProps> = ({ onSave, onCancel, initialQuiz, isEditing }) => {
  const [year, setYear] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [quizType, setQuizType] = useState('mcq');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'adaptive'>('questions');
  const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveQuizSettings>(defaultAdaptiveSettings);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialQuiz) {
      setYear(initialQuiz.year);
      setSubject(initialQuiz.subject);
      setTopic(initialQuiz.topic);
      setQuizType(initialQuiz.quizType || 'mcq');
      setQuestions(initialQuiz.questions);
      setAdaptiveSettings(initialQuiz.adaptiveSettings || defaultAdaptiveSettings);
    }
  }, [initialQuiz]);

  // Fetch available topics when subject or year changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (year && subject) {
        try {
          const yearLevel = `Year ${year}`;
          const topics = await lessonService.getTopics(subject, yearLevel);
          setAvailableTopics(topics);
        } catch (error) {
          console.error('Error fetching topics:', error);
          setAvailableTopics([]);
        }
      } else {
        setAvailableTopics([]);
      }
    };

    fetchTopics();
  }, [year, subject]);

  // Filter available topics to exclude those that already have quizzes
  const [existingQuizTopics, setExistingQuizTopics] = useState<string[]>([]);

  useEffect(() => {
    const fetchExistingQuizTopics = async () => {
      if (year && subject && !isEditing) {
        try {
          const response = await quizService.getQuizzes();
          const existingTopics = response.quizzes
            .filter((quiz: { year: number; subject: string; topic: string }) =>
              quiz.year === year && quiz.subject === subject
            )
            .map((quiz: { year: number; subject: string; topic: string }) => quiz.topic);
          setExistingQuizTopics(existingTopics);
        } catch (error) {
          console.error('Error fetching existing quiz topics:', error);
          setExistingQuizTopics([]);
        }
      } else {
        setExistingQuizTopics([]);
      }
    };

    fetchExistingQuizTopics();
  }, [year, subject, isEditing]);

  // Filter available topics to exclude those with existing quizzes
  const filteredAvailableTopics = availableTopics.filter(topic => !existingQuizTopics.includes(topic));

  const handleAddQuestion = () => {
    const generateOptionId = () => `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newQuestion: Question = {
      id: Date.now(),
      questionText: '',
      options: [
        { id: generateOptionId(), text: '' },
        { id: generateOptionId(), text: '' },
        { id: generateOptionId(), text: '' },
        { id: generateOptionId(), text: '' }
      ],
      correctAnswers: [],
      answerType: 'single',
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

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const quizData: QuizData = {
        year: year || 0,
        subject,
        topic,
        quizType: quizType,
        questions,
        adaptiveSettings
      };
      await onSave(quizData);
      toast.success(isEditing ? 'Kuiz berjaya dikemaskini!' : 'Kuiz berjaya disimpan!');
    } catch (error: unknown) {
      console.error('Error saving quiz:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Gagal menyimpan kuiz. Sila cuba lagi.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
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
          <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            {isSaving ? "Menyimpan..." : (isEditing ? "Kemaskini Kuiz" : "Simpan Kuiz")}
          </Button>
        </div>
      </div>

      <QuizHeader
        year={year}
        subject={subject}
        topic={topic}
        quizType={quizType}
        availableTopics={filteredAvailableTopics}
        onYearChange={setYear}
        onSubjectChange={setSubject}
        onTopicChange={setTopic}
        onQuizTypeChange={setQuizType}
      />

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
                  key={`question-${index}`}
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
          )}
        </div>
    </div>
  );
}
