import { cn } from '@/lib/utils';
import { Heart, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

type TabValue = 'favorites' | 'notes';

interface TabsSectionProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  favoriteCount?: number;
  noteCount?: number;
}

const TABS = [
  { value: 'favorites' as const, label: '收藏题目', icon: Heart },
  { value: 'notes' as const, label: '我的笔记', icon: FileText },
];

export default function TabsSection({
  activeTab,
  onTabChange,
  favoriteCount = 0,
  noteCount = 0,
}: TabsSectionProps) {
  const getCount = (value: TabValue) =>
    value === 'favorites' ? favoriteCount : noteCount;

  return (
    <section className="w-full">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div
          className={cn(
            'relative inline-flex items-center p-1.5 rounded-2xl w-full sm:w-auto',
            'bg-white/40 dark:bg-white/5 backdrop-blur-xl backdrop-saturate-150',
            'border border-white/50 dark:border-white/10',
            'shadow-[0_8px_32px_rgba(31_38_135_0.06)]'
          )}
        >
          {/* Glow */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />

          <div className="relative z-10 flex w-full sm:w-auto gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              const count = getCount(tab.value);

              return (
                <button
                  key={tab.value}
                  onClick={() => onTabChange(tab.value)}
                  className={cn(
                    'relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl',
                    'text-sm font-medium transition-all duration-300 ease-out',
                    'min-w-[120px]',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground/80'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="favorites-tab-active"
                      className="absolute inset-0 rounded-xl bg-primary/10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="size-4" strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full',
                        'transition-all duration-300',
                        isActive
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted/60 text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
