import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { scopedStorage, logger } from '@lark-apaas/client-toolkit-lite';
import type { IQuestion } from '@/data/mockbank';
import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  type IQuestionBank,
  type IPracticeSettings,
  type IAnswerRecord,
  type INote,
  type IFavorite,
} from './bank-store';

// ---------- Context ----------

interface IBankStoreContext {
  // Banks
  banks: IQuestionBank[];
  currentBankId: string | null;
  currentBank: IQuestionBank | null;
  setCurrentBankId: (id: string | null) => void;
  addBank: (bank: IQuestionBank) => void;
  updateBank: (id: string, updates: Partial<IQuestionBank>) => void;
  deleteBank: (id: string) => void;
  addQuestionsToBank: (bankId: string, questions: IQuestion[]) => void;

  // Answer records
  answerRecords: IAnswerRecord[];
  addAnswerRecord: (record: IAnswerRecord) => void;
  getRecordForQuestion: (
    questionId: string,
    bankId: string,
  ) => IAnswerRecord | undefined;
  resetBankRecords: (bankId: string) => void;

  // Favorites
  favorites: IFavorite[];
  toggleFavorite: (questionId: string, bankId: string) => void;
  isFavorite: (questionId: string, bankId: string) => boolean;

  // Notes
  notes: INote[];
  saveNote: (questionId: string, bankId: string, content: string) => void;
  getNoteForQuestion: (
    questionId: string,
    bankId: string,
  ) => INote | undefined;

  // Settings
  settings: IPracticeSettings;
  updateSettings: (updates: Partial<IPracticeSettings>) => void;
  resetSettings: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const BankStoreContext = createContext<IBankStoreContext | null>(null);

// ---------- Helper: safe JSON parse ----------

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (err) {
    logger.error('Failed to parse storage value:', String(err));
    return fallback;
  }
}

// ---------- Provider ----------

interface BankStoreProviderProps {
  children: ReactNode;
  initialBanks?: IQuestionBank[];
}

export function BankStoreProvider({
  children,
  initialBanks = [],
}: BankStoreProviderProps) {
  // --- State ---
  const [banks, setBanks] = useState<IQuestionBank[]>(() => {
    const stored = scopedStorage.getItem(STORAGE_KEYS.BANKS);
    const parsed = safeParse<IQuestionBank[]>(stored, []);
    if (parsed.length > 0) return parsed;
    return initialBanks;
  });

  const [currentBankId, setCurrentBankIdState] = useState<string | null>(() => {
    return scopedStorage.getItem(STORAGE_KEYS.CURRENT_BANK_ID) ?? null;
  });

  const [answerRecords, setAnswerRecords] = useState<IAnswerRecord[]>(() => {
    const stored = scopedStorage.getItem(STORAGE_KEYS.ANSWER_RECORDS);
    return safeParse<IAnswerRecord[]>(stored, []);
  });

  const [favorites, setFavorites] = useState<IFavorite[]>(() => {
    const stored = scopedStorage.getItem(STORAGE_KEYS.FAVORITES);
    return safeParse<IFavorite[]>(stored, []);
  });

  const [notes, setNotes] = useState<INote[]>(() => {
    const stored = scopedStorage.getItem(STORAGE_KEYS.NOTES);
    return safeParse<INote[]>(stored, []);
  });

  const [settings, setSettings] = useState<IPracticeSettings>(() => {
    const stored = scopedStorage.getItem(STORAGE_KEYS.SETTINGS);
    const parsed = safeParse<Partial<IPracticeSettings>>(stored, {});
    return { ...DEFAULT_SETTINGS, ...parsed };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = scopedStorage.getItem(STORAGE_KEYS.THEME);
    return (stored as 'light' | 'dark') || 'light';
  });

  // --- Persist effects ---
  useEffect(() => {
    scopedStorage.setItem(STORAGE_KEYS.BANKS, JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    if (currentBankId) {
      scopedStorage.setItem(STORAGE_KEYS.CURRENT_BANK_ID, currentBankId);
    }
  }, [currentBankId]);

  useEffect(() => {
    scopedStorage.setItem(
      STORAGE_KEYS.ANSWER_RECORDS,
      JSON.stringify(answerRecords),
    );
  }, [answerRecords]);

  useEffect(() => {
    scopedStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    scopedStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    scopedStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    scopedStorage.setItem(STORAGE_KEYS.THEME, theme);
    // Apply to document
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // --- Derived ---
  const currentBank = useMemo(
    () => banks.find((b) => b.id === currentBankId) ?? null,
    [banks, currentBankId],
  );

  // --- Actions ---
  const setCurrentBankId = useCallback((id: string | null) => {
    setCurrentBankIdState(id);
  }, []);

  const addBank = useCallback((bank: IQuestionBank) => {
    setBanks((prev) => [...prev, bank]);
  }, []);

  const updateBank = useCallback(
    (id: string, updates: Partial<IQuestionBank>) => {
      setBanks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      );
    },
    [],
  );

  const deleteBank = useCallback((id: string) => {
    setBanks((prev) => prev.filter((b) => b.id !== id));
    setAnswerRecords((prev) => prev.filter((r) => r.bankId !== id));
    setFavorites((prev) => prev.filter((f) => f.bankId !== id));
    setNotes((prev) => prev.filter((n) => n.bankId !== id));
  }, []);

  const addQuestionsToBank = useCallback(
    (bankId: string, questions: IQuestion[]) => {
      setBanks((prev) =>
        prev.map((b) => {
          if (b.id !== bankId) return b;
          const newQuestions = [...b.questions, ...questions];
          const chapterSet = new Set(b.chapters);
          questions.forEach((q) => chapterSet.add(q.chapter));
          return {
            ...b,
            questions: newQuestions,
            questionCount: newQuestions.length,
            chapters: Array.from(chapterSet),
          };
        }),
      );
    },
    [],
  );

  const addAnswerRecord = useCallback((record: IAnswerRecord) => {
    setAnswerRecords((prev) => {
      const filtered = prev.filter(
        (r) =>
          !(
            r.questionId === record.questionId && r.bankId === record.bankId
          ),
      );
      return [...filtered, record];
    });
  }, []);

  const getRecordForQuestion = useCallback(
    (questionId: string, bankId: string) => {
      return answerRecords.find(
        (r) => r.questionId === questionId && r.bankId === bankId,
      );
    },
    [answerRecords],
  );

  const resetBankRecords = useCallback((bankId: string) => {
    setAnswerRecords((prev) => prev.filter((r) => r.bankId !== bankId));
  }, []);

  const toggleFavorite = useCallback(
    (questionId: string, bankId: string) => {
      setFavorites((prev) => {
        const exists = prev.find(
          (f) => f.questionId === questionId && f.bankId === bankId,
        );
        if (exists) {
          return prev.filter(
            (f) =>
              !(f.questionId === questionId && f.bankId === bankId),
          );
        }
        return [
          ...prev,
          { questionId, bankId, createdAt: Date.now() },
        ];
      });
    },
    [],
  );

  const isFavorite = useCallback(
    (questionId: string, bankId: string) => {
      return favorites.some(
        (f) => f.questionId === questionId && f.bankId === bankId,
      );
    },
    [favorites],
  );

  const saveNote = useCallback(
    (questionId: string, bankId: string, content: string) => {
      setNotes((prev) => {
        const existing = prev.find(
          (n) => n.questionId === questionId && n.bankId === bankId,
        );
        if (existing) {
          return prev.map((n) =>
            n.questionId === questionId && n.bankId === bankId
              ? { ...n, content, updatedAt: Date.now() }
              : n,
          );
        }
        return [
          ...prev,
          { questionId, bankId, content, updatedAt: Date.now() },
        ];
      });
    },
    [],
  );

  const getNoteForQuestion = useCallback(
    (questionId: string, bankId: string) => {
      return notes.find(
        (n) => n.questionId === questionId && n.bankId === bankId,
      );
    },
    [notes],
  );

  const updateSettings = useCallback(
    (updates: Partial<IPracticeSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // --- Context value ---
  const value = useMemo<IBankStoreContext>(
    () => ({
      banks,
      currentBankId,
      currentBank,
      setCurrentBankId,
      addBank,
      updateBank,
      deleteBank,
      addQuestionsToBank,
      answerRecords,
      addAnswerRecord,
      getRecordForQuestion,
      resetBankRecords,
      favorites,
      toggleFavorite,
      isFavorite,
      notes,
      saveNote,
      getNoteForQuestion,
      settings,
      updateSettings,
      resetSettings,
      theme,
      toggleTheme,
    }),
    [
      banks,
      currentBankId,
      currentBank,
      setCurrentBankId,
      addBank,
      updateBank,
      deleteBank,
      addQuestionsToBank,
      answerRecords,
      addAnswerRecord,
      getRecordForQuestion,
      resetBankRecords,
      favorites,
      toggleFavorite,
      isFavorite,
      notes,
      saveNote,
      getNoteForQuestion,
      settings,
      updateSettings,
      resetSettings,
      theme,
      toggleTheme,
    ],
  );

  return (
    <BankStoreContext.Provider value={value}>
      {children}
    </BankStoreContext.Provider>
  );
}

// ---------- Hook ----------

export function useBankStore() {
  const ctx = useContext(BankStoreContext);
  if (!ctx) {
    throw new Error('useBankStore must be used within BankStoreProvider');
  }
  return ctx;
}
