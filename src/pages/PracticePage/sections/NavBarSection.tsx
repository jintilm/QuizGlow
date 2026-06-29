import { useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  StickyNote,
  Grid3X3,
  X,
  CheckCircle2,
  XCircle,
  Circle,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface AnswerStatus {
  questionId: string;
  status: 'unanswered' | 'correct' | 'wrong';
}

interface NavBarSectionProps {
  currentIndex: number;
  totalCount: number;
  answerStatuses: AnswerStatus[];
  isFavorite: boolean;
  hasNote: boolean;
  noteContent?: string;
  onPrev: () => void;
  onNext: () => void;
  onJumpTo: (index: number) => void;
  onToggleFavorite: () => void;
  onSaveNote: (content: string) => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

export default function NavBarSection({
  currentIndex,
  totalCount,
  answerStatuses,
  isFavorite,
  hasNote,
  noteContent = '',
  onPrev,
  onNext,
  onJumpTo,
  onToggleFavorite,
  onSaveNote,
  canGoPrev,
  canGoNext,
}: NavBarSectionProps) {
  const [cardOpen, setCardOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(noteContent);
  const isMobile = useIsMobile();

  const handleOpenNote = useCallback(() => {
    setNoteDraft(noteContent);
    setNoteOpen(true);
  }, [noteContent]);

  const handleSaveNote = useCallback(() => {
    onSaveNote(noteDraft);
    setNoteOpen(false);
  }, [noteDraft, onSaveNote]);

  const correctCount = answerStatuses.filter((s) => s.status === 'correct').length;
  const wrongCount = answerStatuses.filter((s) => s.status === 'wrong').length;
  const unansweredCount = answerStatuses.filter((s) => s.status === 'unanswered').length;

  const getStatusIcon = (status: AnswerStatus['status']) => {
    switch (status) {
      case 'correct':
        return <CheckCircle2 className="size-3.5 text-success" />;
      case 'wrong':
        return <XCircle className="size-3.5 text-destructive" />;
      default:
        return <Circle className="size-3.5 text-muted-foreground/50" />;
    }
  };

  const CardContent = (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-xl bg-success/10 p-3">
          <CheckCircle2 className="size-5 text-success" />
          <span className="text-lg font-bold text-success">{correctCount}</span>
          <span className="text-xs text-muted-foreground">正确</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-destructive/10 p-3">
          <XCircle className="size-5 text-destructive" />
          <span className="text-lg font-bold text-destructive">{wrongCount}</span>
          <span className="text-xs text-muted-foreground">错误</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 p-3">
          <Circle className="size-5 text-muted-foreground" />
          <span className="text-lg font-bold text-foreground">{unansweredCount}</span>
          <span className="text-xs text-muted-foreground">未答</span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {answerStatuses.map((s, i) => {
            const isCurrent = i === currentIndex;
            return (
              <motion.button
                key={s.questionId}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  onJumpTo(i);
                  setCardOpen(false);
                }}
                className={cn(
                  'relative aspect-square rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center',
                  isCurrent && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                  s.status === 'correct' && 'bg-success/15 text-success hover:bg-success/25',
                  s.status === 'wrong' && 'bg-destructive/15 text-destructive hover:bg-destructive/25',
                  s.status === 'unanswered' && 'bg-muted/50 text-muted-foreground hover:bg-muted/80'
                )}
              >
                {i + 1}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-success" />
          <span>正确</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="size-3.5 text-destructive" />
          <span>错误</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="size-3.5 text-muted-foreground/50" />
          <span>未答</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Bottom Nav Bar */}
      <div className="sticky bottom-0 left-0 right-0 z-30 border-t border-border/40 bg-background/70 backdrop-blur-xl backdrop-saturate-150">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Left: Prev */}
            <Button
              variant="ghost"
              onClick={onPrev}
              disabled={!canGoPrev}
              className="gap-1.5 px-3 hover:bg-accent/60"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">上一题</span>
            </Button>

            {/* Center: Actions + Progress */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFavorite}
                className={cn(
                  'size-10 rounded-full transition-all duration-300',
                  isFavorite
                    ? 'text-destructive bg-destructive/10 hover:bg-destructive/20'
                    : 'hover:bg-accent/60 text-muted-foreground hover:text-foreground'
                )}
                aria-label={isFavorite ? '取消收藏' : '收藏'}
              >
                <Heart className={cn('size-[18px]', isFavorite && 'fill-current')} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenNote}
                className={cn(
                  'size-10 rounded-full transition-all duration-300',
                  hasNote
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'hover:bg-accent/60 text-muted-foreground hover:text-foreground'
                )}
                aria-label="笔记"
              >
                <StickyNote className="size-[18px]" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCardOpen(true)}
                className="size-10 rounded-full hover:bg-accent/60 text-muted-foreground hover:text-foreground"
                aria-label="答题卡"
              >
                <Grid3X3 className="size-[18px]" />
              </Button>

              <Badge
                variant="outline"
                className="ml-1 sm:ml-2 px-2.5 py-1 text-xs font-medium bg-background/50"
              >
                {currentIndex + 1} / {totalCount}
              </Badge>
            </div>

            {/* Right: Next */}
            <Button
              variant="ghost"
              onClick={onNext}
              disabled={!canGoNext}
              className="gap-1.5 px-3 hover:bg-accent/60"
            >
              <span className="hidden sm:inline">下一题</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Answer Card Dialog (Desktop) */}
      {!isMobile && (
        <Dialog open={cardOpen} onOpenChange={setCardOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 gap-0 border-0 bg-transparent shadow-none">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-3xl
                bg-white/80 dark:bg-foreground/5 backdrop-blur-2xl backdrop-saturate-150
                border border-white/50 dark:border-white/10
                shadow-[0_24px_80px_-12px_rgba(31_38_135_0.15)]"
            >
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
              <div className="relative z-10 px-7 py-6">
                <DialogHeader className="mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <DialogTitle className="text-lg font-bold text-foreground">
                        答题卡
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground mt-1">
                        共 {totalCount} 道题，点击题号快速跳转
                      </DialogDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCardOpen(false)}
                      className="size-8 rounded-full hover:bg-accent/60 -mr-2 -mt-2"
                      aria-label="关闭"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </DialogHeader>
                {CardContent}
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}

      {/* Answer Card Sheet (Mobile) */}
      {isMobile && (
        <Sheet open={cardOpen} onOpenChange={setCardOpen}>
          <SheetContent side="bottom" className="p-0 border-0 bg-transparent">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden rounded-t-3xl
                bg-white/90 dark:bg-foreground/5 backdrop-blur-2xl backdrop-saturate-150
                border-t border-white/50 dark:border-white/10
                shadow-[0_-8px_40px_rgba(31_38_135_0.1)]"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="px-5 pb-6">
                <SheetHeader className="mb-4 text-left">
                  <SheetTitle className="text-lg font-bold">答题卡</SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground">
                    共 {totalCount} 道题
                  </SheetDescription>
                </SheetHeader>
                {CardContent}
              </div>
            </motion.div>
          </SheetContent>
        </Sheet>
      )}

      {/* Note Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 border-0 bg-transparent shadow-none">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-3xl
              bg-white/80 dark:bg-foreground/5 backdrop-blur-2xl backdrop-saturate-150
              border border-white/50 dark:border-white/10
              shadow-[0_24px_80px_-12px_rgba(31_38_135_0.15)]"
          >
            <div className="pointer-events-none absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative z-10 px-7 py-6">
              <DialogHeader className="mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
                      <StickyNote className="size-4.5 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-foreground">
                        我的笔记
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        记录你的学习心得与重点
                      </DialogDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNoteOpen(false)}
                    className="size-8 rounded-full hover:bg-accent/60 -mr-2 -mt-2"
                    aria-label="关闭"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="在这里记录你的笔记..."
                  className="min-h-[160px] resize-none rounded-xl bg-background/60 border-border/50 focus-visible:ring-primary/30"
                />

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setNoteOpen(false)}
                    className="hover:bg-accent/60"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSaveNote}
                    className="gap-1.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                  >
                    <BookOpen className="size-4" />
                    保存笔记
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
