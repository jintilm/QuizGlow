import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  FileText,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Lightbulb,
  BookOpen,
  PenLine,
  HelpCircle,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { IPracticeQuestion } from '@/data/practice-page';

interface QuestionDisplaySectionProps {
  question: IPracticeQuestion;
  questionIndex: number;
  totalCount: number;
  mode: 'practice' | 'review' | 'exam' | 'challenge';
  showAnswer: boolean;
  userAnswer: string | string[] | null;
  onAnswerChange: (answer: string | string[]) => void;
  onSubmit: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  hasNote: boolean;
  noteContent?: string;
  onOpenNote: () => void;
}

const TYPE_LABELS: Record<IPracticeQuestion['type'], string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题',
  essay: '问答题',
};

const TYPE_COLORS: Record<IPracticeQuestion['type'], string> = {
  single: 'bg-primary/10 text-primary border-primary/20',
  multiple: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  judge: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  fill: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  essay: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
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

export default function QuestionDisplaySection({
  question,
  questionIndex,
  totalCount,
  mode,
  showAnswer,
  userAnswer,
  onAnswerChange,
  onSubmit,
  isFavorite,
  onToggleFavorite,
  hasNote,
  noteContent,
  onOpenNote,
}: QuestionDisplaySectionProps) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [fillInput, setFillInput] = useState('');
  const [essayInput, setEssayInput] = useState('');

  const isCorrect = useMemo(
    () => isAnswerCorrect(userAnswer, question.answer),
    [userAnswer, question.answer],
  );

  const handleOptionClick = useCallback(
    (key: string) => {
      if (showAnswer && mode !== 'review') return;
      if (question.type === 'single') {
        onAnswerChange(key);
      } else if (question.type === 'multiple') {
        const current = Array.isArray(userAnswer) ? userAnswer : [];
        const has = current.includes(key);
        const next = has ? current.filter((k) => k !== key) : [...current, key];
        onAnswerChange(next);
      }
    },
    [question.type, showAnswer, mode, userAnswer, onAnswerChange],
  );

  const handleJudgeClick = useCallback(
    (value: string) => {
      if (showAnswer && mode !== 'review') return;
      onAnswerChange(value);
    },
    [showAnswer, mode, onAnswerChange],
  );

  const handleFillSubmit = useCallback(() => {
    if (showAnswer && mode !== 'review') return;
    onAnswerChange(fillInput.trim());
  }, [fillInput, showAnswer, mode, onAnswerChange]);

  const handleEssaySubmit = useCallback(() => {
    if (showAnswer && mode !== 'review') return;
    onAnswerChange(essayInput.trim());
  }, [essayInput, showAnswer, mode, onAnswerChange]);

  const isOptionCorrect = (key: string): boolean => {
    if (Array.isArray(question.answer)) {
      return question.answer.includes(key);
    }
    return question.answer === key;
  };

  const isOptionSelected = (key: string): boolean => {
    if (userAnswer === null) return false;
    if (Array.isArray(userAnswer)) return userAnswer.includes(key);
    return userAnswer === key;
  };

  const getOptionClass = (key: string) => {
    const selected = isOptionSelected(key);
    const correct = isOptionCorrect(key);
    const showResult = showAnswer && mode !== 'review';

    if (showResult) {
      if (correct) {
        return 'border-success/60 bg-success/10 text-success-foreground ring-2 ring-success/30';
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

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-[80%] rounded-full bg-primary/10 blur-3xl" />

        {/* Main card */}
        <div
          className={cn(
            'relative overflow-hidden rounded-3xl',
            'bg-white/70 dark:bg-foreground/5 backdrop-blur-2xl backdrop-saturate-150',
            'border border-white/50 dark:border-white/10',
            'shadow-[0_20px_60px_-15px_rgba(31_38_135_0.15)]',
          )}
        >
          {/* Top bar: type + chapter + actions */}
          <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-border/20">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-full border',
                  TYPE_COLORS[question.type],
                )}
              >
                {TYPE_LABELS[question.type]}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <BookOpen className="size-3.5" />
                {question.chapter}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                className={cn(
                  'size-9 rounded-full transition-all duration-300',
                  isFavorite
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-muted-foreground hover:text-destructive hover:bg-destructive/5',
                )}
                aria-label={isFavorite ? '取消收藏' : '收藏题目'}
              >
                <Heart
                  className={cn('size-[18px] transition-all', isFavorite && 'fill-current')}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenNote}
                className={cn(
                  'size-9 rounded-full transition-all duration-300',
                  hasNote
                    ? 'text-primary hover:bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5',
                )}
                aria-label="笔记"
              >
                <FileText className="size-[18px]" />
              </Button>
            </div>
          </div>

          {/* Question stem */}
          <div className="px-7 py-6">
            <div className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 flex items-center justify-center size-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                {questionIndex + 1}
              </span>
              <h2 className="text-lg md:text-xl font-semibold text-foreground leading-relaxed flex-1">
                {question.stem}
              </h2>
            </div>
          </div>

          {/* Options / Answer area */}
          <div className="px-7 pb-6 space-y-3">
            {/* Single / Multiple choice */}
            {(question.type === 'single' || question.type === 'multiple') &&
              question.options && (
                <div className="space-y-3">
                  {question.options.map((opt, i) => (
                    <motion.button
                      key={opt.key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.05 }}
                      whileHover={
                        !showAnswer || mode === 'review'
                          ? { scale: 1.01, x: 4 }
                          : {}
                      }
                      whileTap={
                        !showAnswer || mode === 'review' ? { scale: 0.99 } : {}
                      }
                      onClick={() => handleOptionClick(opt.key)}
                      disabled={showAnswer && mode !== 'review'}
                      className={cn(
                        'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border',
                        'transition-all duration-200 ease-out text-left',
                        'disabled:cursor-default',
                        getOptionClass(opt.key),
                      )}
                    >
                      <span
                        className={cn(
                          'shrink-0 flex items-center justify-center size-8 rounded-full text-sm font-bold border transition-all',
                          isOptionSelected(opt.key)
                            ? 'border-current bg-current/10'
                            : 'border-current/20 bg-background/50',
                        )}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1 text-sm md:text-base leading-relaxed">
                        {opt.content}
                      </span>
                      {showAnswer &&
                        mode !== 'review' &&
                        isOptionCorrect(opt.key) && (
                          <Check className="shrink-0 size-5 text-success" />
                        )}
                      {showAnswer &&
                        mode !== 'review' &&
                        isOptionSelected(opt.key) &&
                        !isOptionCorrect(opt.key) && (
                          <X className="shrink-0 size-5 text-destructive" />
                        )}
                    </motion.button>
                  ))}
                </div>
              )}

            {/* Judge */}
            {question.type === 'judge' && (
              <div className="grid grid-cols-2 gap-4">
                {(['正确', '错误'] as const).map((val, i) => {
                  const selected = userAnswer === val;
                  const correctAnswer = question.answer as string;
                  const isCorrectOpt = val === correctAnswer;
                  const showResult = showAnswer && mode !== 'review';

                  let cls =
                    'border-border/40 bg-card/30 hover:border-primary/30 hover:bg-primary/5 text-foreground';
                  if (selected) {
                    cls =
                      'border-primary/60 bg-primary/10 text-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10';
                  }
                  if (showResult) {
                    if (isCorrectOpt) {
                      cls =
                        'border-success/60 bg-success/10 text-success-foreground ring-2 ring-success/30';
                    } else if (selected && !isCorrectOpt) {
                      cls =
                        'border-destructive/60 bg-destructive/10 text-destructive ring-2 ring-destructive/30';
                    } else {
                      cls =
                        'border-border/40 bg-card/30 text-muted-foreground opacity-60';
                    }
                  }

                  return (
                    <motion.button
                      key={val}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 + i * 0.08 }}
                      whileHover={
                        !showAnswer || mode === 'review'
                          ? { scale: 1.02, y: -2 }
                          : {}
                      }
                      whileTap={
                        !showAnswer || mode === 'review' ? { scale: 0.97 } : {}
                      }
                      onClick={() => handleJudgeClick(val)}
                      disabled={showAnswer && mode !== 'review'}
                      className={cn(
                        'flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border',
                        'transition-all duration-200 ease-out',
                        'disabled:cursor-default',
                        cls,
                      )}
                    >
                      {val === '正确' ? (
                        <Check className="size-8" strokeWidth={2.5} />
                      ) : (
                        <X className="size-8" strokeWidth={2.5} />
                      )}
                      <span className="text-base font-semibold">{val}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Fill in blank */}
            {question.type === 'fill' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-3"
              >
                <div className="flex gap-3">
                  <Input
                    value={fillInput}
                    onChange={(e) => setFillInput(e.target.value)}
                    placeholder="请输入答案..."
                    disabled={showAnswer && mode !== 'review'}
                    className={cn(
                      'h-12 rounded-xl border bg-card/40 backdrop-blur-sm text-base',
                      'focus-visible:ring-primary/40',
                      showAnswer &&
                        mode !== 'review' &&
                        (isCorrect
                          ? 'border-success/60 bg-success/5 focus-visible:ring-success/30'
                          : 'border-destructive/60 bg-destructive/5 focus-visible:ring-destructive/30'),
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFillSubmit();
                    }}
                  />
                  {(!showAnswer || mode === 'review') && (
                    <Button
                      onClick={handleFillSubmit}
                      className="h-12 px-5 rounded-xl"
                    >
                      <Send className="size-4 mr-2" />
                      提交
                    </Button>
                  )}
                </div>
                {showAnswer && mode !== 'review' && (
                  <div
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 rounded-xl text-sm',
                      isCorrect
                        ? 'bg-success/10 text-success-foreground'
                        : 'bg-destructive/10 text-destructive',
                    )}
                  >
                    {isCorrect ? (
                      <Check className="size-4 shrink-0" />
                    ) : (
                      <X className="size-4 shrink-0" />
                    )}
                    <span>
                      正确答案：
                      <span className="font-semibold">
                        {question.answer as string}
                      </span>
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Essay */}
            {question.type === 'essay' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-3"
              >
                <div className="relative">
                  <Textarea
                    value={essayInput}
                    onChange={(e) => setEssayInput(e.target.value)}
                    placeholder="请输入你的答案..."
                    disabled={showAnswer && mode !== 'review'}
                    className={cn(
                      'min-h-[140px] rounded-xl border bg-card/40 backdrop-blur-sm resize-none',
                      'focus-visible:ring-primary/40',
                    )}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                    {essayInput.length} 字
                  </div>
                </div>
                {(!showAnswer || mode === 'review') && (
                  <div className="flex justify-end">
                    <Button onClick={handleEssaySubmit} className="px-6 rounded-xl">
                      <PenLine className="size-4 mr-2" />
                      提交答案
                    </Button>
                  </div>
                )}
                {showAnswer && mode !== 'review' && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-2">
                      <Lightbulb className="size-4" />
                      参考答案
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                      {question.answer as string}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Submit button for choice questions */}
            {((question.type === 'single' && userAnswer) ||
              (question.type === 'multiple' &&
                Array.isArray(userAnswer) &&
                userAnswer.length > 0) ||
              (question.type === 'judge' && userAnswer)) &&
              !showAnswer &&
              mode !== 'review' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-2 flex justify-center"
                >
                  <Button
                    onClick={onSubmit}
                    size="lg"
                    className="px-10 rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                  >
                    <Check className="size-4 mr-2" />
                    确认答案
                  </Button>
                </motion.div>
              )}
          </div>

          {/* Result banner */}
          <AnimatePresence>
            {showAnswer && mode !== 'review' && (question.type === 'single' || question.type === 'multiple' || question.type === 'judge' || question.type === 'fill') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'px-7 py-4 border-t',
                  isCorrect
                    ? 'bg-success/5 border-success/20'
                    : 'bg-destructive/5 border-destructive/20',
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'size-10 rounded-full flex items-center justify-center shrink-0',
                      isCorrect ? 'bg-success/20' : 'bg-destructive/20',
                    )}
                  >
                    {isCorrect ? (
                      <Check className="size-5 text-success" strokeWidth={2.5} />
                    ) : (
                      <X className="size-5 text-destructive" strokeWidth={2.5} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        'text-base font-bold',
                        isCorrect ? 'text-success' : 'text-destructive',
                      )}
                    >
                      {isCorrect ? '回答正确！' : '回答错误'}
                    </p>
                    {!isCorrect &&
                      (question.type === 'single' || question.type === 'judge') && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          正确答案：
                          <span className="font-semibold text-foreground">
                            {question.answer as string}
                          </span>
                        </p>
                      )}
                    {!isCorrect && question.type === 'multiple' && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        正确答案：
                        <span className="font-semibold text-foreground">
                          {(question.answer as string[]).join('、')}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis toggle */}
          {(showAnswer || mode === 'review') && question.analysis && (
            <div className="px-7 pb-6 pt-2">
              <button
                onClick={() => setShowAnalysis((s) => !s)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors group"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lightbulb className="size-4 text-primary" />
                  答案解析
                </span>
                {showAnalysis ? (
                  <ChevronUp className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </button>
              <AnimatePresence>
                {showAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pb-1 px-4">
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {question.analysis}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Note preview */}
          {hasNote && noteContent && (
            <div className="px-7 pb-6">
              <div className="p-4 rounded-xl bg-chart-2/5 border border-chart-2/20">
                <div className="flex items-center gap-2 text-sm font-semibold text-chart-2 mb-2">
                  <FileText className="size-4" />
                  我的笔记
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                  {noteContent}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom hint for multiple choice */}
        {question.type === 'multiple' && !showAnswer && mode !== 'review' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-muted-foreground mt-4"
          >
            <HelpCircle className="size-3 inline mr-1 -mt-0.5" />
            多选题，请选择所有正确答案
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
