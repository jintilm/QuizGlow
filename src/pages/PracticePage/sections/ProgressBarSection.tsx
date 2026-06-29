import { useMemo } from 'react';
import { Clock, Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ProgressBarSectionProps {
  currentIndex: number;
  total: number;
  mode: 'practice' | 'review' | 'exam' | 'challenge';
  timeRemaining?: number; // seconds
  answeredMap: Record<string, boolean>;
  correctMap: Record<string, boolean>;
  questionIds: string[];
  onJump: (index: number) => void;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ProgressBarSection({
  currentIndex,
  total,
  mode,
  timeRemaining = 0,
  answeredMap,
  correctMap,
  questionIds,
  onJump,
  onBack,
}: ProgressBarSectionProps) {
  const progress = useMemo(
    () => Math.round(((currentIndex + 1) / total) * 100),
    [currentIndex, total],
  );

  const answeredCount = useMemo(
    () => Object.values(answeredMap).filter(Boolean).length,
    [answeredMap],
  );

  const correctCount = useMemo(
    () => Object.values(correctMap).filter(Boolean).length,
    [correctMap],
  );

  const isExamMode = mode === 'exam' || mode === 'challenge';

  return (
    <div className="sticky top-0 z-30 w-full">
      <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(31_38_135_0.08)]">
        {/* 顶部光晕装饰 */}
        <div className="pointer-events-none absolute -top-16 left-1/2 h-24 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

        <div className="relative z-10 px-4 py-3 md:px-6 md:py-4">
          {/* 第一行：返回 + 进度文字 + 时间/答题卡 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="size-9 shrink-0 rounded-full hover:bg-accent/60"
                aria-label="返回"
              >
                <ChevronLeft className="size-5 text-foreground" />
              </Button>

              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    {currentIndex + 1}
                  </span>
                  <span className="text-sm text-muted-foreground">/ {total}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>已答 {answeredCount}</span>
                  {mode !== 'review' && answeredCount > 0 && (
                    <span className="text-success">
                      正确 {correctCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isExamMode && (
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium tabular-nums',
                    timeRemaining <= 60
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  <Clock className="size-4" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              )}

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 gap-1.5 rounded-full px-3"
                  >
                    <Grid3X3 className="size-4" />
                    <span className="text-xs font-medium">答题卡</span>
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[85vw] max-w-sm border-l-0 bg-background/80 backdrop-blur-2xl"
                >
                  <SheetHeader className="pb-4">
                    <SheetTitle className="flex items-center justify-between">
                      <span>答题卡</span>
                      <Badge variant="outline" className="font-normal">
                        共 {total} 题
                      </Badge>
                    </SheetTitle>
                  </SheetHeader>

                  <div className="space-y-4">
                    {/* 图例 */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="size-3 rounded-sm bg-primary" />
                        <span>当前</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-3 rounded-sm bg-success/80" />
                        <span>正确</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-3 rounded-sm bg-destructive/80" />
                        <span>错误</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="size-3 rounded-sm border border-border bg-background" />
                        <span>未答</span>
                      </div>
                    </div>

                    {/* 题号网格 */}
                    <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                      {questionIds.map((qid, i) => {
                        const isCurrent = i === currentIndex;
                        const answered = answeredMap[qid];
                        const correct = correctMap[qid];
                        let variant =
                          'border-border bg-background text-muted-foreground hover:bg-accent/50';
                        if (isCurrent) {
                          variant =
                            'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30';
                        } else if (answered && correct) {
                          variant =
                            'border-success/50 bg-success/15 text-success-foreground';
                        } else if (answered && !correct) {
                          variant =
                            'border-destructive/50 bg-destructive/15 text-destructive';
                        }

                        return (
                          <SheetClose asChild key={qid}>
                            <button
                              onClick={() => onJump(i)}
                              className={cn(
                                'flex h-10 w-full items-center justify-center rounded-lg border text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95',
                                variant,
                              )}
                            >
                              {i + 1}
                            </button>
                          </SheetClose>
                        );
                      })}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* 第二行：进度条 */}
          <div className="mt-3">
            <Progress
              value={progress}
              className="h-1.5 w-full bg-muted/60"
              indicatorClassName="bg-gradient-to-r from-primary via-primary/90 to-chart-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
