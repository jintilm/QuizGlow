import { useState, useCallback } from 'react';
import { Heart, MessageSquare, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import GlassCard from '@/components/GlassCard';
import { cn } from '@/lib/utils';

export type QuestionType = 'single' | 'multiple' | 'judge' | 'fill' | 'essay';

export interface QuestionOption {
  key: string;
  content: string;
}

export interface QuestionCardProps {
  id: string;
  type: QuestionType;
  stem: string;
  chapter?: string;
  options?: QuestionOption[];
  answer: string | string[];
  analysis?: string;
  isFavorite?: boolean;
  hasNote?: boolean;
  noteContent?: string;
  showAnswer?: boolean;
  mode?: 'practice' | 'review' | 'exam';
  userAnswer?: string | string[];
  onAnswerChange?: (answer: string | string[]) => void;
  onToggleFavorite?: (id: string) => void;
  onNoteClick?: (id: string) => void;
  index?: number;
  total?: number;
  shuffleOptions?: boolean;
}

const TYPE_LABELS: Record<QuestionType, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题',
  essay: '问答题',
};

const TYPE_COLORS: Record<QuestionType, string> = {
  single: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  multiple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
  judge: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
  fill: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  essay: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function isCorrectAnswer(
  userAnswer: string | string[] | undefined,
  correctAnswer: string | string[],
): boolean | null {
  if (userAnswer === undefined || userAnswer === '' || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
    return null;
  }
  if (Array.isArray(correctAnswer)) {
    if (!Array.isArray(userAnswer)) return false;
    if (userAnswer.length !== correctAnswer.length) return false;
    const sortedUser = [...userAnswer].sort();
    const sortedCorrect = [...correctAnswer].sort();
    return sortedUser.every((v, i) => v === sortedCorrect[i]);
  }
  return userAnswer === correctAnswer;
}

export default function QuestionCard({
  id,
  type,
  stem,
  chapter,
  options = [],
  answer,
  analysis,
  isFavorite = false,
  hasNote = false,
  noteContent,
  showAnswer: controlledShowAnswer,
  mode = 'practice',
  userAnswer,
  onAnswerChange,
  onToggleFavorite,
  onNoteClick,
  index,
  total,
  shuffleOptions = false,
}: QuestionCardProps) {
  const [internalShowAnalysis, setInternalShowAnalysis] = useState(false);
  const [fillInput, setFillInput] = useState(
    typeof userAnswer === 'string' ? userAnswer : '',
  );
  const [essayInput, setEssayInput] = useState(
    typeof userAnswer === 'string' ? userAnswer : '',
  );

  const displayOptions = shuffleOptions ? shuffleArray(options) : options;

  const showAnswer = controlledShowAnswer ?? mode === 'review';

  const correct = isCorrectAnswer(userAnswer, answer);

  const handleSingleSelect = useCallback(
    (key: string) => {
      if (showAnswer && mode !== 'review') return;
      onAnswerChange?.(key);
    },
    [onAnswerChange, showAnswer, mode],
  );

  const handleMultipleToggle = useCallback(
    (key: string) => {
      if (showAnswer && mode !== 'review') return;
      const current = Array.isArray(userAnswer) ? [...userAnswer] : [];
      const idx = current.indexOf(key);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(key);
      }
      onAnswerChange?.(current);
    },
    [userAnswer, onAnswerChange, showAnswer, mode],
  );

  const handleJudgeSelect = useCallback(
    (val: string) => {
      if (showAnswer && mode !== 'review') return;
      onAnswerChange?.(val);
    },
    [onAnswerChange, showAnswer, mode],
  );

  const handleFillChange = useCallback(
    (val: string) => {
      setFillInput(val);
      onAnswerChange?.(val);
    },
    [onAnswerChange],
  );

  const handleEssayChange = useCallback(
    (val: string) => {
      setEssayInput(val);
      onAnswerChange?.(val);
    },
    [onAnswerChange],
  );

  const getOptionState = (key: string): 'idle' | 'selected' | 'correct' | 'wrong' => {
    if (!showAnswer) {
      if (Array.isArray(userAnswer)) {
        return userAnswer.includes(key) ? 'selected' : 'idle';
      }
      return userAnswer === key ? 'selected' : 'idle';
    }
    const isCorrectOption = Array.isArray(answer)
      ? answer.includes(key)
      : answer === key;
    const isUserSelected = Array.isArray(userAnswer)
      ? userAnswer.includes(key)
      : userAnswer === key;

    if (isCorrectOption) return 'correct';
    if (isUserSelected && !isCorrectOption) return 'wrong';
    return 'idle';
  };

  const optionClass = (state: ReturnType<typeof getOptionState>) => {
    const base =
      'group relative flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200';
    switch (state) {
      case 'selected':
        return cn(
          base,
          'border-primary/50 bg-primary/10 shadow-[0_4px_20px_rgba(37_99_235_0.1)]',
        );
      case 'correct':
        return cn(
          base,
          'border-green-500/50 bg-green-500/10 shadow-[0_4px_20px_rgba(34_197_94_0.1)]',
        );
      case 'wrong':
        return cn(
          base,
          'border-red-500/50 bg-red-500/10 shadow-[0_4px_20px_rgba(239_68_68_0.1)]',
        );
      default:
        return cn(
          base,
          'border-border/50 bg-white/40 dark:bg-white/5 hover:border-primary/30 hover:bg-primary/5',
        );
    }
  };

  const renderOptions = () => {
    if (type === 'judge') {
      const options = [
        { key: '正确', content: '正确 / 对 / √' },
        { key: '错误', content: '错误 / 错 / ×' },
      ];
      return (
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => {
            const state = getOptionState(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleJudgeSelect(opt.key)}
                disabled={showAnswer && mode !== 'review'}
                className={cn(
                  optionClass(state),
                  'flex flex-col items-center justify-center py-5',
                )}
              >
                <span
                  className={cn(
                    'text-lg font-bold mb-1',
                    state === 'correct' && 'text-green-600 dark:text-green-400',
                    state === 'wrong' && 'text-red-600 dark:text-red-400',
                    state === 'selected' && 'text-primary',
                    state === 'idle' && 'text-foreground',
                  )}
                >
                  {opt.key}
                </span>
                <span className="text-xs text-muted-foreground">{opt.content}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (type === 'fill') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              你的答案：
            </span>
            <Input
              value={fillInput}
              onChange={(e) => handleFillChange(e.target.value)}
              placeholder="请输入答案"
              className={cn(
                'flex-1 bg-white/50 dark:bg-white/5',
                showAnswer && correct === true && 'border-green-500/50 bg-green-500/5',
                showAnswer && correct === false && 'border-red-500/50 bg-red-500/5',
              )}
              disabled={showAnswer && mode !== 'review'}
            />
          </div>
          {showAnswer && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">正确答案：</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {answer as string}
              </span>
            </div>
          )}
        </div>
      );
    }

    if (type === 'essay') {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground shrink-0">
              你的答案：
            </span>
          </div>
          <Textarea
            value={essayInput}
            onChange={(e) => handleEssayChange(e.target.value)}
            placeholder="请输入你的答案..."
            className="min-h-[120px] bg-white/50 dark:bg-white/5 resize-y"
            disabled={showAnswer && mode !== 'review'}
          />
          {showAnswer && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">参考答案：</div>
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-sm leading-relaxed whitespace-pre-wrap">
                {answer as string}
              </div>
            </div>
          )}
        </div>
      );
    }

    // single / multiple
    return (
      <div className="space-y-3">
        {displayOptions.map((opt) => {
          const state = getOptionState(opt.key);
          const onClick =
            type === 'single'
              ? () => handleSingleSelect(opt.key)
              : () => handleMultipleToggle(opt.key);

          return (
            <button
              key={opt.key}
              type="button"
              onClick={onClick}
              disabled={showAnswer && mode !== 'review'}
              className={cn(optionClass(state), 'w-full text-left')}
            >
              <span
                className={cn(
                  'shrink-0 size-7 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-200',
                  state === 'correct' &&
                    'bg-green-500 border-green-500 text-white',
                  state === 'wrong' &&
                    'bg-red-500 border-red-500 text-white',
                  state === 'selected' &&
                    'bg-primary border-primary text-white',
                  state === 'idle' &&
                    'bg-white/70 dark:bg-white/10 border-border/60 text-foreground group-hover:border-primary/40 group-hover:text-primary',
                )}
              >
                {state === 'correct' ? (
                  <Check className="size-4" />
                ) : state === 'wrong' ? (
                  <X className="size-4" />
                ) : (
                  opt.key
                )}
              </span>
              <span
                className={cn(
                  'flex-1 text-sm leading-relaxed pt-0.5',
                  state === 'correct' && 'text-green-700 dark:text-green-300',
                  state === 'wrong' && 'text-red-700 dark:text-red-300',
                  state === 'selected' && 'text-primary-foreground/0 text-foreground',
                  state === 'idle' && 'text-foreground/90',
                )}
              >
                {opt.content}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <GlassCard variant="elevated" size="lg" className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge
            variant="outline"
            className={cn('font-medium', TYPE_COLORS[type])}
          >
            {TYPE_LABELS[type]}
          </Badge>
          {chapter && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="size-1 rounded-full bg-muted-foreground/40" />
              {chapter}
            </span>
          )}
          {index !== undefined && total !== undefined && (
            <span className="text-xs text-muted-foreground ml-auto">
              {index} / {total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'size-8 rounded-full transition-all',
              isFavorite
                ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-500/10'
                : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10',
            )}
            onClick={() => onToggleFavorite?.(id)}
            aria-label={isFavorite ? '取消收藏' : '收藏'}
          >
            <Heart
              className="size-[18px]"
              fill={isFavorite ? 'currentColor' : 'none'}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'size-8 rounded-full transition-all',
              hasNote
                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'
                : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10',
            )}
            onClick={() => onNoteClick?.(id)}
            aria-label="笔记"
          >
            <MessageSquare className="size-[18px]" />
          </Button>
        </div>
      </div>

      {/* Stem */}
      <div className="mb-6">
        <p className="text-base md:text-lg font-medium leading-relaxed text-foreground">
          {stem}
        </p>
      </div>

      {/* Options / Input */}
      <div className="mb-5">{renderOptions()}</div>

      {/* Result badge */}
      {showAnswer && correct !== null && type !== 'essay' && (
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm font-medium',
            correct
              ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
          )}
        >
          {correct ? (
            <>
              <Check className="size-4" />
              回答正确
            </>
          ) : (
            <>
              <X className="size-4" />
              回答错误
            </>
          )}
          {(type === 'single' || type === 'multiple') && (
            <span className="ml-auto text-xs opacity-80">
              正确答案：
              {Array.isArray(answer) ? answer.join('、') : answer}
            </span>
          )}
        </div>
      )}

      {/* Analysis */}
      {analysis && (showAnswer || mode === 'review') && (
        <div className="border-t border-border/40 pt-4">
          <button
            type="button"
            onClick={() => setInternalShowAnalysis((s) => !s)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors w-full"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            答案解析
            {internalShowAnalysis ? (
              <ChevronUp className="size-4 ml-auto" />
            ) : (
              <ChevronDown className="size-4 ml-auto" />
            )}
          </button>
          {internalShowAnalysis && (
            <div className="mt-3 p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm leading-relaxed text-foreground/90">
              {analysis}
            </div>
          )}
        </div>
      )}

      {/* Note preview */}
      {hasNote && noteContent && (showAnswer || mode === 'review') && (
        <div className="mt-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 mb-2">
            <MessageSquare className="size-4" />
            我的笔记
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {noteContent}
          </p>
        </div>
      )}
    </GlassCard>
  );
}
