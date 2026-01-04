import type { AdaptiveQuizSettings } from './AdaptiveQuizEngine';

export const defaultAdaptiveSettings: AdaptiveQuizSettings = {
  maxQuestions: 20,
  timeLimit: 30,
  difficultyAdjustment: 'moderate',
  enableAIFeedback: true,
  scoringRules: {
    correctPoints: 10,
    incorrectPenalty: 0,
    timeBonus: 5,
    hintPenalty: 2,
  },
  questionDistribution: {
    easy: 6,
    medium: 10,
    hard: 4,
  },
  hintThresholds: {
    lowAbility: 2,
    mediumAbility: 3,
    highAbility: 4,
  },
};
