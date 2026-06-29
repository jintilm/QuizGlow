import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_CHAPTERS } from '@/data/question-bank-detail-page';

interface ChapterSidebarSectionProps {
  selectedChapter: string | null;
  onSelectChapter: (chapterId: string | null) => void;
  totalCount?: number;
}

function ChapterSidebarSection({
  selectedChapter,
  onSelectChapter,
  totalCount,
}: ChapterSidebarSectionProps) {
  const computedTotal = useMemo(
    () =>
      totalCount ??
      MOCK_CHAPTERS.reduce((sum, ch) => sum + ch.questionCount, 0),
    [totalCount]
  );

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <aside className="w-full">
      <div
        className="rounded-2xl p-5
          bg-white/60 dark:bg-foreground/5 backdrop-blur-xl
          border border-white/40 dark:border-white/10
          shadow-[0_8px_32px_rgba(31_38_135_0.07)]"
      >
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border/30">
          <div
            className="size-8 rounded-lg flex items-center justify-center
              bg-gradient-to-br from-primary/90 to-primary/70
              shadow-md shadow-primary/20"
          >
            <Layers className="size-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">章节列表</h3>
            <p className="text-[11px] text-muted-foreground">
              共 {MOCK_CHAPTERS.length} 章 · {computedTotal} 题
            </p>
          </div>
        </div>

        <motion.ul
          variants={container}
          initial="hidden"
          animate="visible"
          className="space-y-1.5"
        >
          {/* 全部 */}
          <motion.li variants={item}>
            <button
              onClick={() => onSelectChapter(null)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200',
                selectedChapter === null
                  ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10'
                  : 'text-foreground hover:bg-accent/50'
              )}
            >
              <div
                className={cn(
                  'size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  selectedChapter === null
                    ? 'bg-primary/20'
                    : 'bg-muted/60'
                )}
              >
                <BookOpen className="size-3.5" />
              </div>
              <span className="flex-1 text-sm font-medium truncate">
                全部题目
              </span>
              <span
                className={cn(
                  'text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full',
                  selectedChapter === null
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {computedTotal}
              </span>
            </button>
          </motion.li>

          {MOCK_CHAPTERS.map((chapter, index) => {
            const isActive = selectedChapter === chapter.id;
            return (
              <motion.li key={chapter.id} variants={item} custom={index}>
                <button
                  onClick={() => onSelectChapter(chapter.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10'
                      : 'text-foreground hover:bg-accent/50'
                  )}
                >
                  <div
                    className={cn(
                      'size-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      isActive
                        ? 'bg-primary/20'
                        : 'bg-muted/60 group-hover:bg-muted/80'
                    )}
                  >
                    <span
                      className={cn(
                        'text-[10px] font-bold',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {index + 1}
                    </span>
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">
                    {chapter.name}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {chapter.questionCount}
                  </span>
                  <ChevronRight
                    className={cn(
                      'size-3.5 shrink-0 transition-all duration-200',
                      isActive
                        ? 'opacity-100 translate-x-0 text-primary'
                        : 'opacity-0 -translate-x-1 text-muted-foreground group-hover:opacity-100 group-hover:translate-x-0'
                    )}
                  />
                </button>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </aside>
  );
}

export default memo(ChapterSidebarSection);
