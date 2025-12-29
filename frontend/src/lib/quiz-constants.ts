import type { AdaptiveQuizSettings, Question } from './AdaptiveQuizEngine';

export const defaultAdaptiveSettings: AdaptiveQuizSettings = {
  maxQuestions: 10,
  timeLimit: 0.5, // 30 seconds per question
  difficultyAdjustment: 'moderate',
  enableAIFeedback: true,
  scoringRules: {
    correctPoints: 10,
    incorrectPenalty: 2,
    timeBonus: 5, // Bonus for answering within time
    hintPenalty: 1,
  },
};

export const sampleQuestionsWithHints: Question[] = [
  {
    id: 'q1',
    text: 'Apakah hasil daripada 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    difficulty: 'easy',
    topic: 'Matematik Asas',
    hints: [
      'Ini adalah operasi penambahan yang paling asas.',
      'Bayangkan anda mempunyai 2 epal, kemudian mendapat 2 epal lagi.'
    ],
    timeLimit: 30,
    points: 10
  },
  {
    id: 'q2',
    text: 'Berapakah nilai π (pi) sehingga 2 tempat perpuluhan?',
    options: ['3.14', '3.15', '3.16', '3.17'],
    correctAnswer: '3.14',
    difficulty: 'medium',
    topic: 'Matematik',
    hints: [
      'π adalah nisbah lilitan bulatan kepada diameternya.',
      'Nombor ini bermula dengan 3.14...'
    ],
    timeLimit: 45,
    points: 15
  },
  {
    id: 'q3',
    text: 'Apakah formula untuk mencari luas segitiga?',
    options: ['πr²', '(1/2) × base × height', 'length × width', 'side × side'],
    correctAnswer: '(1/2) × base × height',
    difficulty: 'medium',
    topic: 'Geometri',
    hints: [
      'Segitiga mempunyai 3 sisi.',
      'Formula melibatkan setengah daripada hasil darab tapak dengan tinggi.'
    ],
    timeLimit: 60,
    points: 15
  },
  {
    id: 'q4',
    text: 'Apakah unsur kimia dengan simbol "O"?',
    options: ['Oxygen', 'Gold', 'Silver', 'Iron'],
    correctAnswer: 'Oxygen',
    difficulty: 'easy',
    topic: 'Kimia',
    hints: [
      'Unsur ini penting untuk pernafasan.',
      'Ia membentuk 21% atmosfera bumi.'
    ],
    timeLimit: 30,
    points: 10
  },
  {
    id: 'q5',
    text: 'Berapakah jumlah sudut dalam segitiga sama sisi?',
    options: ['180°', '360°', '90°', '270°'],
    correctAnswer: '180°',
    difficulty: 'hard',
    topic: 'Geometri',
    hints: [
      'Jumlah sudut dalam mana-mana segitiga adalah sama.',
      'Sudut dalam segitiga sama sisi adalah 60° setiap satu.',
      '3 × 60° = 180°'
    ],
    timeLimit: 90,
    points: 20
  },
  {
    id: 'q6',
    text: 'Apakah nama saintifik untuk pokok teh?',
    options: ['Camellia sinensis', 'Thea sinensis', 'Camellia japonica', 'Thea japonica'],
    correctAnswer: 'Camellia sinensis',
    difficulty: 'hard',
    topic: 'Biologi',
    hints: [
      'Ia tergolong dalam famili Theaceae.',
      'Genusnya bermula dengan "C".',
      'Nama spesiesnya adalah "sinensis" yang bermaksud "dari China".'
    ],
    timeLimit: 120,
    points: 25
  }
];

export const sampleQuestions = sampleQuestionsWithHints;
