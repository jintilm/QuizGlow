import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  FileText,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Settings,
  ArrowLeft,
  Clock,
  Check,
  X,
  BookOpen,
  PenLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { MOCK_PRACTICE_QUESTIONS, type IPracticeQuestion } from '@/data/practice-page';
import PracticeSettingsDialog from '@/components/PracticeSettingsDialog';
import type { IPracticeSettings } from '@/store/bank-store';
import { DEFAULT_SETTINGS } from '@/store/bank-store';

const TYPE_LABELS: Record<IPracticeQuestion['type'], string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题',
  essay: '问答题',
};

const TYPE_COLORS: Record<IPracticeQuestion['type'], string> = {
  single: 'bg-primary/20 text-foreground border-primary/30',
  multiple: 'bg-chart-2/15 text-chart-2 border-chart-2/25',
  judge: 'bg-chart-4/15 text-chart-4 border-chart-4/25',
  fill: 'bg-chart-3/15 text-chart-3 border-chart-3/25',
  essay: 'bg-muted text-foreground border-border',
};

function isAnswerCorrect(
  userAnswer: string | string[] | null,
  correctAnswer: string | string[],
): boolean {
  if (userAnswer === null) return false;
  if (Array.isArray(correctAnswer)) {
    if (!Array.isArray(userAnswer)) return false;
    if (userAnswer.length !== correctAnswer.length) return false;
    const sortedUser = [...userAnswer].sort();
    const sortedCorrect = [...correctAnswer].sort();
    return sortedUser.every((v, i) => v === sortedCorrect[i]);
  }
  return userAnswer === correctAnswer;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function PracticePage() {
  const { id = 'mock-bank-1' } = useParams();
  const navigate = useNavigate();

  const [questions] = useState<IPracticeQuestion[]>(MOCK_PRACTICE_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string | string[] | null>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [settings, setSettings] = useState<IPracticeSettings>(DEFAULT_SETTINGS);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [fillInput, setFillInput] = useState('');
  const [essayInput, setEssayInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const currentQuestion = questions[currentIndex];
  const totalCount = questions.length;
  const progress = ((currentIndex + 1) / totalCount) * 100;

  const userAnswer = userAnswers[currentQuestion?.id] ?? null;
  const isSubmitted = submitted[currentQuestion?.id] ?? false;
  const showAnswer = settings.mode === 'review' || isSubmitted;
  const isFav = favorites[currentQuestion?.id] ?? currentQuestion?.isFavorite ?? false;

  // Timer for exam mode
  useEffect(() => {
    if (settings.mode !== 'exam' || !isTimerRunning) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning('考试时间已到');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.mode, isTimerRunning]);

  // Reset inputs when question changes
  useEffect(() => {
    if (currentQuestion?.type === 'fill') {
      const ans = userAnswers[currentQuestion.id];
      setFillInput(typeof ans === 'string' ? ans : '');
    } else if (currentQuestion?.type === 'essay') {
      const ans = userAnswers[currentQuestion.id];
      setEssayInput(typeof ans === 'string' ? ans : '');
    }
    setShowAnalysis(false);
  }, [currentIndex, currentQuestion?.id, currentQuestion?.type, userAnswers]);

  const handleOptionClick = useCallback(
    (key: string) => {
      if (!currentQuestion) return;
      if (isSubmitted && settings.mode !== 'review') return;

      if (currentQuestion.type === 'single') {
        setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }));
        if (settings.mode === 'practice') {
          setSubmitted((prev) => ({ ...prev, [currentQuestion.id]: true }));
          setShowAnalysis(true);
        }
      } else if (currentQuestion.type === 'multiple') {
        setUserAnswers((prev) => {
          const current = Array.isArray(prev[currentQuestion.id])
            ? (prev[currentQuestion.id] as string[])
            : [];
          const has = current.includes(key);
          const next = has ? current.filter((k) => k !== key) : [...current, key];
          return { ...prev, [currentQuestion.id]: next };
        });
      }
    },
    [currentQuestion, isSubmitted, settings.mode],
  );

  const handleJudgeClick = useCallback(
    (value: string) => {
      if (!currentQuestion) return;
      if (isSubmitted && settings.mode !== 'review') return;
      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
      if (settings.mode === 'practice') {
        setSubmitted((prev) => ({ ...prev, [currentQuestion.id]: true }));
        setShowAnalysis(true);
      }
    },
    [currentQuestion, isSubmitted, settings.mode],
  );

  const handleSubmitAnswer = useCallback(() => {
    if (!currentQuestion) return;
    if (isSubmitted) return;

    if (currentQuestion.type === 'fill') {
      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: fillInput.trim() }));
    } else if (currentQuestion.type === 'essay') {
      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: essayInput.trim() }));
    }

    setSubmitted((prev) => ({ ...prev, [currentQuestion.id]: true }));
    setShowAnalysis(true);

    const answer = currentQuestion.type === 'fill' ? fillInput.trim() : essayInput.trim();
    const correct = isAnswerCorrect(answer, currentQuestion.answer);

    if (correct) {
      toast.success('回答正确！');
    } else {
      toast.error('回答错误');
      if (settings.autoCollectWrong) {
        setFavorites((prev) => ({ ...prev, [currentQuestion.id]: true }));
      }
    }
  }, [currentQuestion, isSubmitted, fillInput, essayInput, settings.autoCollectWrong]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      toast.success('已完成所有题目！');
    }
  }, [currentIndex, totalCount]);

  const handleJumpTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setShowAnswerSheet(false);
  }, []);

  const handleToggleFavorite = useCallback(() => {
    if (!currentQuestion) return;
    setFavorites((prev) => {
      const next = { ...prev, [currentQuestion.id]: !prev[currentQuestion.id] };
      toast.success(next[currentQuestion.id] ? '已收藏' : '已取消收藏');
      return next;
    });
  }, [currentQuestion]);

  const handleOpenNote = useCallback(() => {
    setNoteText(currentQuestion?.noteContent || '');
    setShowNoteDialog(true);
  }, [currentQuestion]);

  const handleSaveNote = useCallback(() => {
    toast.success('笔记已保存');
    setShowNoteDialog(false);
  }, []);

  const handleSettingsChange = useCallback((updates: Partial<IPracticeSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleStartPractice = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswers({});
    setSubmitted({});
    setShowSettings(false);
    toast.success('开始刷题！');
  }, []);

  const getQuestionStatus = (index: number): 'unanswered' | 'correct' | 'wrong' => {
    const q = questions[index];
    if (!submitted[q.id]) return 'unanswered';
    const ans = userAnswers[q.id];
    return isAnswerCorrect(ans, q.answer) ? 'correct' : 'wrong';
  };

  const isOptionCorrect = (key: string): boolean => {
    if (!currentQuestion) return false;
    if (Array.isArray(currentQuestion.answer)) {
      return currentQuestion.answer.includes(key);
    }
    return currentQuestion.answer === key;
  };

  const isOptionSelected = (key: string): boolean => {
    if (userAnswer === null) return false;
    if (Array.isArray(userAnswer)) return userAnswer.includes(key);
    return userAnswer === key;
  };

  const getOptionClass = (key: string) => {
    const selected = isOptionSelected(key);
    const correct = isOptionCorrect(key);
    const showResult = showAnswer && settings.mode !== 'review';

    if (showResult) {
      if (correct) {
        return 'border-success/60 bg-success/10 text-success ring-2 ring-success/30';
      }
      if (selected && !correct) {
        return 'border-destructive/60 bg-destructive/10 text-destructive ring-2 ring-destructive/30';
      }
      return 'border-border/40 bg-card/30 text-muted-foreground opacity-60';
    }

    if (selected) {
      return 'border-primary/60 bg-primary/10 text-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10';
    }

    return 'border-border/40 bg-card/30 hover:border-primary/30 hover:bg-primary/5 text-foreground';
  };

  const correctCount = useMemo(() => {
    return questions.filter((q, i) => getQuestionStatus(i) === 'correct').length;
  }, [questions, submitted, userAnswers]);

  const answeredCount = useMemo(() => {
    return Object.keys(submitted).filter((k) => submitted[k]).length;
  }, [submitted]);

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Top Bar */}
      <header
        className={cn(
          'sticky top-0 z-40 w-full border-b',
          'bg-background/80 backdrop-blur-xl',
          'border-border/50',
        )}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="size-9 rounded-full hover:bg-accent/60"
              aria-label="返回"
            >
              <ArrowLeft className="size-[18px]" />
            </Button>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">答题练习</span>
              <span className="text-[11px] text-muted-foreground">
                {answeredCount}/{totalCount} 题 · 正确率{' '}
                {answeredCount > 0
                  ? Math.round((correctCount / answeredCount) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {settings.mode === 'exam' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                <Clock className="size-3.5" />
                {formatTime(timeLeft)}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAnswerSheet(true)}
              className="size-9 rounded-full hover:bg-accent/60"
              aria-label="答题卡"
            >
              <Grid3X3 className="size-[18px]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="size-9 rounded-full hover:bg-accent/60"
              aria-label="设置"
            >
              <Settings className="size-[18px]" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
            <div className="h-1 w-full bg-muted">
          <motion.div
            className="h-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Glow backdrop */}
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-[80%] rounded-full bg-primary/15 blur-[80px]" />

            {/* Main card */}
            <div
              className={cn(
                'relative overflow-hidden rounded-[2rem]',
                'bg-white',
                'border border-border',
                'shadow-sm',
              )}
            >
              {/* Top bar: type + chapter + actions */}
              <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-dashed border-border/60">
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-3 py-1 text-xs font-semibold rounded-full border',
                      TYPE_COLORS[currentQuestion.type],
                    )}
                  >
                    {TYPE_LABELS[currentQuestion.type]}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <BookOpen className="size-3.5" />
                    {currentQuestion.chapter}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    className={cn(
                      'size-9 rounded-full transition-all duration-200',
                      isFav
                        ? 'text-destructive hover:bg-destructive/10'
                        : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5',
                    )}
                    aria-label="收藏"
                  >
                    <Heart
                      className="size-[18px]"
                      fill={isFav ? 'currentColor' : 'none'}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleOpenNote}
                    className={cn(
                      'size-9 rounded-full transition-all duration-200',
                      currentQuestion.hasNote
                        ? 'text-primary hover:bg-primary/10'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5',
                    )}
                    aria-label="笔记"
                  >
                    <PenLine className="size-[18px]" />
                  </Button>
                </div>
              </div>

              {/* Question stem */}
              <div className="px-7 py-6">
                <div className="flex gap-3">
                  <span className="shrink-0 flex items-center justify-center size-7 rounded-full bg-foreground text-background text-xs font-bold">
                    {currentIndex + 1}
                  </span>
                  <h2 className="text-base md:text-lg font-medium text-foreground leading-relaxed flex-1">
                    {currentQuestion.stem}
                  </h2>
                </div>
              </div>

              {/* Options / Input area */}
              <div className="px-7 pb-6 space-y-3">
                {/* Single / Multiple choice */}
                {(currentQuestion.type === 'single' ||
                  currentQuestion.type === 'multiple') &&
                  currentQuestion.options?.map((opt) => (
                    <motion.button
                      key={opt.key}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleOptionClick(opt.key)}
                      disabled={isSubmitted && settings.mode !== 'review'}
                      className={cn(
                         'w-full flex items-start gap-3 p-4 rounded-[1.25rem] border transition-all duration-200 text-left',
                        getOptionClass(opt.key),
                        isSubmitted &&
                          settings.mode !== 'review' &&
                          'cursor-default',
                      )}
                    >
                      <span
                        className={cn(
                          'shrink-0 flex items-center justify-center size-7 rounded-full text-sm font-bold border-2',
                          isOptionSelected(opt.key)
                            ? 'border-current bg-current text-background'
                            : 'border-current/30',
                        )}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1 pt-0.5 text-sm md:text-base leading-relaxed">
                        {opt.content}
                      </span>
                      {showAnswer && settings.mode !== 'review' && isOptionCorrect(opt.key) && (
                        <Check className="shrink-0 size-5 text-success mt-0.5" />
                      )}
                      {showAnswer &&
                        settings.mode !== 'review' &&
                        isOptionSelected(opt.key) &&
                        !isOptionCorrect(opt.key) && (
                          <X className="shrink-0 size-5 text-destructive mt-0.5" />
                        )}
                    </motion.button>
                  ))}

                {/* Judge */}
                {currentQuestion.type === 'judge' && (
                  <div className="grid grid-cols-2 gap-3">
                    {['正确', '错误'].map((val) => {
                      const selected = userAnswer === val;
                      const correct = currentQuestion.answer === val;
                      const showResult = showAnswer && settings.mode !== 'review';

                      let cls =
                        'border-border/40 bg-card/30 hover:border-primary/30 hover:bg-primary/5 text-foreground';
      if (selected) {
                         cls =
                           'bg-foreground text-background border-foreground';
                       }
                      if (showResult) {
                        if (correct) {
                          cls = 'border-success/60 bg-success/10 text-success ring-2 ring-success/30';
                        } else if (selected && !correct) {
                          cls =
                            'border-destructive/60 bg-destructive/10 text-destructive ring-2 ring-destructive/30';
                        }
                      }

                      return (
                        <motion.button
                          key={val}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleJudgeClick(val)}
                          disabled={isSubmitted && settings.mode !== 'review'}
                          className={cn(
                            'flex flex-col items-center justify-center gap-2 py-6 rounded-[1.25rem] border transition-all duration-200',
                            cls,
                          )}
                        >
                          {val === '正确' ? (
                            <Check className="size-6" />
                          ) : (
                            <X className="size-6" />
                          )}
                          <span className="text-sm font-medium">{val}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Fill in blank */}
                {currentQuestion.type === 'fill' && (
                  <div className="space-y-3">
                    <Input
                      value={fillInput}
                      onChange={(e) => setFillInput(e.target.value)}
                      placeholder="请输入答案..."
                      disabled={isSubmitted && settings.mode !== 'review'}
                      className={cn(
                         'h-12 rounded-full bg-white border-border',
                        isSubmitted &&
                          settings.mode !== 'review' &&
                          (isAnswerCorrect(fillInput, currentQuestion.answer)
                            ? 'border-success/60 bg-success/5'
                            : 'border-destructive/60 bg-destructive/5'),
                      )}
                    />
                    {!isSubmitted && settings.mode !== 'review' && (
                      <Button
                        onClick={handleSubmitAnswer}
                        className="w-full h-11 rounded-full"
                      >
                        提交答案
                      </Button>
                    )}
                  </div>
                )}

                {/* Essay */}
                {currentQuestion.type === 'essay' && (
                  <div className="space-y-3">
                    <Textarea
                      value={essayInput}
                      onChange={(e) => setEssayInput(e.target.value)}
                      placeholder="请输入你的回答..."
                      rows={5}
                      disabled={isSubmitted && settings.mode !== 'review'}
                      className="rounded-[1.25rem] bg-white border-border resize-none"
                    />
                    {!isSubmitted && settings.mode !== 'review' && (
                      <Button
                        onClick={handleSubmitAnswer}
                        className="w-full h-11 rounded-xl"
                      >
                        提交答案
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Answer & Analysis */}
              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-7 pb-6 border-t border-dashed border-border/60 pt-5 space-y-4">
                      {/* Correct answer */}
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 flex items-center justify-center size-7 rounded-full bg-success/15 text-success">
                          <Check className="size-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-success mb-1">
                            正确答案
                          </p>
                          <p className="text-sm text-foreground font-medium">
                            {Array.isArray(currentQuestion.answer)
                              ? currentQuestion.answer.join('、')
                              : currentQuestion.answer}
                          </p>
                        </div>
                      </div>

                      {/* Your answer (for fill/essay) */}
                      {settings.mode !== 'review' &&
                        (currentQuestion.type === 'fill' ||
                          currentQuestion.type === 'essay') &&
                        userAnswer && (
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                'shrink-0 flex items-center justify-center size-7 rounded-full',
                                isAnswerCorrect(userAnswer, currentQuestion.answer)
                                  ? 'bg-success/15 text-success'
                                  : 'bg-destructive/15 text-destructive',
                              )}
                            >
                              {isAnswerCorrect(userAnswer, currentQuestion.answer) ? (
                                <Check className="size-4" />
                              ) : (
                                <X className="size-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={cn(
                                  'text-xs font-semibold mb-1',
                                  isAnswerCorrect(userAnswer, currentQuestion.answer)
                                    ? 'text-success'
                                    : 'text-destructive',
                                )}
                              >
                                你的答案
                              </p>
                              <p className="text-sm text-foreground">{userAnswer}</p>
                            </div>
                          </div>
                        )}

                      {/* Analysis toggle */}
                      {currentQuestion.analysis && (
                        <div>
                          <button
                            onClick={() => setShowAnalysis((v) => !v)}
                            className="flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            <FileText className="size-3.5" />
                            答案解析
                            {showAnalysis ? (
                              <ChevronLeft className="size-3.5 rotate-[-90deg]" />
                            ) : (
                              <ChevronLeft className="size-3.5 rotate-90" />
                            )}
                          </button>
                          <AnimatePresence>
                            {showAnalysis && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                 <div className="mt-3 p-4 rounded-[1.25rem] bg-muted border border-border/60">
                                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                                    {currentQuestion.analysis}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Note preview */}
                      {currentQuestion.hasNote && currentQuestion.noteContent && (
                        <div className="p-4 rounded-[1.25rem] bg-warning/15 border border-warning/25">
                          <p className="text-xs font-semibold text-warning mb-1.5 flex items-center gap-1.5">
                            <PenLine className="size-3.5" />
                            我的笔记
                          </p>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {currentQuestion.noteContent}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation (desktop) */}
        <div className="hidden md:flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-2 rounded-full"
          >
            <ChevronLeft className="size-4" />
            上一题
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalCount}
          </span>
          <Button
            onClick={handleNext}
            disabled={currentIndex === totalCount - 1}
            className="gap-2 rounded-full"
          >
            下一题
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </main>

      {/* Bottom Nav (mobile) */}
       <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-between h-14 px-4 gap-3">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            size="sm"
            className="flex-1 gap-1 rounded-full"
          >
            <ChevronLeft className="size-4" />
            上一题
          </Button>
          <div className="text-xs text-muted-foreground font-medium whitespace-nowrap">
            {currentIndex + 1}/{totalCount}
          </div>
          <Button
            onClick={handleNext}
            disabled={currentIndex === totalCount - 1}
            size="sm"
            className="flex-1 gap-1 rounded-full"
          >
            下一题
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
      <PracticeSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onStart={handleStartPractice}
        totalCount={totalCount}
        typeCounts={{
          single: questions.filter((q) => q.type === 'single').length,
          multiple: questions.filter((q) => q.type === 'multiple').length,
          judge: questions.filter((q) => q.type === 'judge').length,
          fill: questions.filter((q) => q.type === 'fill').length,
          essay: questions.filter((q) => q.type === 'essay').length,
        }}
      />

      {/* Answer Sheet Sheet */}
      <Sheet open={showAnswerSheet} onOpenChange={setShowAnswerSheet}>
        <SheetContent side="right" className="w-[85vw] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>答题卡</SheetTitle>
            <SheetDescription>
              共 {totalCount} 题，已答 {answeredCount} 题，正确 {correctCount} 题
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 grid grid-cols-5 gap-2.5">
            {questions.map((q, i) => {
              const status = getQuestionStatus(i);
              const isCurrent = i === currentIndex;
              return (
                <motion.button
                  key={q.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleJumpTo(i)}
                  className={cn(
                     'aspect-square rounded-full text-sm font-semibold transition-all duration-200 border',
                    isCurrent && 'ring-2 ring-primary ring-offset-2',
                    status === 'correct' &&
                      'bg-success/15 text-success border-success/30',
                    status === 'wrong' &&
                      'bg-destructive/15 text-destructive border-destructive/30',
                    status === 'unanswered' &&
                      'bg-card/50 text-muted-foreground border-border/40 hover:border-primary/30',
                  )}
                >
                  {i + 1}
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-success/30" />
              <span className="text-muted-foreground">正确</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-destructive/30" />
              <span className="text-muted-foreground">错误</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-muted" />
              <span className="text-muted-foreground">未答</span>
            </div>
          </div>

          <SheetFooter className="mt-6">
            <Button onClick={() => setShowAnswerSheet(false)} className="w-full rounded-full">
              继续答题
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑笔记</DialogTitle>
            <DialogDescription>记录你的学习心得和重点</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="在这里写下你的笔记..."
              rows={6}
               className="resize-none rounded-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveNote}>保存笔记</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
