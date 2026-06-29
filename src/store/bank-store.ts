import type { IQuestion } from '@/data/mockbank';

// ---------- Types ----------

export interface IQuestionBank {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  chapters: string[];
  createdAt: number;
  lastPracticeAt?: number;
  correctRate?: number;
  source: 'mock' | 'imported';
  questions: IQuestion[];
}

export type PracticeScope =
  | 'all'
  | 'favorite'
  | 'note'
  | 'wrong'
  | 'unattempted';

export type QuestionType =
  | 'single'
  | 'multiple'
  | 'judge'
  | 'fill'
  | 'essay';

export type PracticeMode = 'practice' | 'review' | 'exam' | 'challenge';

export interface IPracticeSettings {
  scope: PracticeScope;
  questionTypes: QuestionType[];
  hideAllCorrectMultiple: boolean;
  hideCorrectJudge: boolean;
  mode: PracticeMode;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  autoNext: boolean;
  autoCollectWrong: boolean;
  showAnswerCompare: boolean;
  oneClickSelectAll: boolean;
  nightMode: boolean;
  vibrate: boolean;
  embedCase: boolean;
}

export interface IAnswerRecord {
  questionId: string;
  bankId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  answeredAt: number;
}

export interface INote {
  questionId: string;
  bankId: string;
  content: string;
  updatedAt: number;
}

export interface IFavorite {
  questionId: string;
  bankId: string;
  createdAt: number;
}

// ---------- Storage Keys ----------

export const STORAGE_KEYS = {
  BANKS: 'qbank_banks',
  CURRENT_BANK_ID: 'qbank_current_bank_id',
  ANSWER_RECORDS: 'qbank_answer_records',
  FAVORITES: 'qbank_favorites',
  NOTES: 'qbank_notes',
  SETTINGS: 'qbank_settings',
  THEME: 'qbank_theme',
} as const;

// ---------- Default Settings ----------

export const DEFAULT_SETTINGS: IPracticeSettings = {
  scope: 'all',
  questionTypes: ['single', 'multiple', 'judge', 'fill', 'essay'],
  hideAllCorrectMultiple: false,
  hideCorrectJudge: false,
  mode: 'practice',
  shuffleQuestions: false,
  shuffleOptions: false,
  autoNext: false,
  autoCollectWrong: false,
  showAnswerCompare: true,
  oneClickSelectAll: false,
  nightMode: false,
  vibrate: false,
  embedCase: false,
};

// ---------- Re-exports from provider ----------

export { BankStoreProvider, useBankStore } from './bank-store-provider';
