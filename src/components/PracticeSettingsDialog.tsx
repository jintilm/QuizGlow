import { useState, useEffect, useMemo } from 'react';
import { X, Check, Shuffle, ListOrdered, BookOpen, Moon, Zap, Heart, FileText, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { IPracticeSettings, PracticeScope, QuestionType, PracticeMode } from '@/store/bank-store';

interface PracticeSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: IPracticeSettings;
  onSettingsChange: (settings: Partial<IPracticeSettings>) => void;
  onStart: () => void;
  totalCount?: number;
  typeCounts?: Record<QuestionType, number>;
}

const SCOPE_OPTIONS: { value: PracticeScope; label: string; icon: typeof BookOpen }[] = [
  { value: 'all', label: '全库题目', icon: BookOpen },
  { value: 'favorite', label: '收藏题目', icon: Heart },
  { value: 'note', label: '笔记题目', icon: FileText },
  { value: 'wrong', label: '做错题目', icon: Eye },
  { value: 'unattempted', label: '未做题目', icon: EyeOff },
];

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'single', label: '单选' },
  { value: 'multiple', label: '多选' },
  { value: 'judge', label: '判断' },
  { value: 'fill', label: '填空' },
  { value: 'essay', label: '问答' },
];

const MODE_OPTIONS: { value: PracticeMode; label: string; desc: string }[] = [
  { value: 'practice', label: '刷题模式', desc: '正常答题，答完显示对错' },
  { value: 'review', label: '背题模式', desc: '直接显示答案，用于记忆' },
  { value: 'exam', label: '模拟考试', desc: '限时答题，模拟考试环境' },
  { value: 'challenge', label: '巅峰挑战', desc: '进阶挑战模式' },
];

const OTHER_TOGGLES: { key: keyof IPracticeSettings; label: string; icon: typeof Shuffle }[] = [
  { key: 'shuffleQuestions', label: '题目乱序', icon: Shuffle },
  { key: 'shuffleOptions', label: '选项乱序', icon: ListOrdered },
  { key: 'oneClickSelectAll', label: '一键全选', icon: Check },
  { key: 'showAnswerCompare', label: '答案比对', icon: Eye },
  { key: 'autoNext', label: '自动切题', icon: ChevronRight },
  { key: 'nightMode', label: '夜间模式', icon: Moon },
  { key: 'vibrate', label: '震动反馈', icon: Zap },
  { key: 'autoCollectWrong', label: '做错自动收藏', icon: Heart },
];

export default function PracticeSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  onStart,
  totalCount = 0,
  typeCounts = { single: 0, multiple: 0, judge: 0, fill: 0, essay: 0 },
}: PracticeSettingsDialogProps) {
  const [activeMode, setActiveMode] = useState<PracticeMode>(settings.mode);

  useEffect(() => {
    if (open) {
      setActiveMode(settings.mode);
    }
  }, [open, settings.mode]);

  const allTypesSelected = useMemo(
    () => settings.questionTypes.length === TYPE_OPTIONS.length,
    [settings.questionTypes]
  );

  const handleScopeChange = (scope: PracticeScope) => {
    onSettingsChange({ scope });
  };

  const handleTypeToggle = (type: QuestionType) => {
    const current = settings.questionTypes;
    const hasType = current.includes(type);
    const next = hasType ? current.filter((t) => t !== type) : [...current, type];
    if (next.length === 0) return;
    onSettingsChange({ questionTypes: next });
  };

  const handleToggleAllTypes = () => {
    if (allTypesSelected) {
      onSettingsChange({ questionTypes: ['single'] });
    } else {
      onSettingsChange({ questionTypes: TYPE_OPTIONS.map((t) => t.value) });
    }
  };

  const handleModeSelect = (mode: PracticeMode) => {
    setActiveMode(mode);
    onSettingsChange({ mode });
  };

  const handleToggle = (key: keyof IPracticeSettings) => {
    const current = settings[key] as boolean;
    onSettingsChange({ [key]: !current } as Partial<IPracticeSettings>);
  };

  const handleStart = () => {
    onStart();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-0 gap-0 border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="relative overflow-hidden rounded-[2rem]
            bg-white
            border border-border
            shadow-md"
        >
          {/* 装饰光晕 */}
          <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-primary/15 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-chart-3/10 blur-[80px]" />

          <div className="relative z-10">
            {/* Header */}
            <DialogHeader className="px-7 pt-7 pb-4 border-b border-dashed border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                    刷题设置
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    自定义你的刷题方式，提升学习效率
                  </DialogDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="size-9 rounded-full hover:bg-muted -mr-2 -mt-2"
                  aria-label="关闭"
                >
                  <X className="size-4.5" />
                </Button>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="px-7 py-5 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {/* 刷题范围 */}
              <SettingGroup title="刷题范围">
                <div className="flex flex-wrap gap-2">
                  {SCOPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = settings.scope === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleScopeChange(opt.value)}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                          active
                            ? 'bg-foreground text-background shadow-sm'
                            : 'bg-white text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20'
                        )}
                      >
                        <Icon className="size-4" />
                        {opt.label}
                      </motion.button>
                    );
                  })}
                </div>
              </SettingGroup>

              {/* 筛选题型 */}
              <SettingGroup title="筛选题型">
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleToggleAllTypes}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      allTypesSelected
                        ? 'bg-foreground text-background shadow-sm'
                        : 'bg-white text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20'
                    )}
                  >
                    <Check className="size-4" />
                    全部 ({totalCount})
                  </motion.button>
                  {TYPE_OPTIONS.map((opt) => {
                    const active = settings.questionTypes.includes(opt.value);
                    const count = typeCounts[opt.value] || 0;
                    return (
                      <motion.button
                        key={opt.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleTypeToggle(opt.value)}
                        className={cn(
                          'flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
                          active
                            ? 'bg-primary/20 text-foreground border border-primary/40'
                            : 'bg-white text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20'
                        )}
                      >
                        {opt.label}
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          active ? 'bg-primary/30 text-foreground' : 'bg-muted text-muted-foreground'
                        )}>
                          {count}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </SettingGroup>

              {/* 隐藏题目 */}
              <SettingGroup title="隐藏题目">
                <div className="flex flex-wrap gap-2">
                  <ToggleChip
                    active={settings.hideAllCorrectMultiple}
                    onClick={() => handleToggle('hideAllCorrectMultiple')}
                    label="全选的多选题"
                  />
                  <ToggleChip
                    active={settings.hideCorrectJudge}
                    onClick={() => handleToggle('hideCorrectJudge')}
                    label="正确的判断题"
                  />
                </div>
              </SettingGroup>

              {/* 刷题模式 */}
              <SettingGroup title="刷题模式">
                <div className="grid grid-cols-2 gap-3">
                  {MODE_OPTIONS.map((opt) => {
                    const active = activeMode === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleModeSelect(opt.value)}
                        className={cn(
                          'flex flex-col items-start gap-1 p-4 rounded-[1.25rem] text-left transition-all duration-200 border',
                          active
                            ? 'bg-foreground text-background border-foreground shadow-md'
                            : 'bg-white border-border hover:border-foreground/20'
                        )}
                      >
                        <span className={cn(
                          'text-sm font-semibold',
                          active ? 'text-background' : 'text-foreground'
                        )}>
                          {opt.label}
                        </span>
                        <span className={cn(
                          'text-xs leading-relaxed',
                          active ? 'text-background/70' : 'text-muted-foreground'
                        )}>
                          {opt.desc}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </SettingGroup>

              {/* 其他设置 */}
              <SettingGroup title="其他设置">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {OTHER_TOGGLES.map((toggle) => {
                    const Icon = toggle.icon;
                    const active = settings[toggle.key] as boolean;
                    return (
                      <motion.button
                        key={toggle.key as string}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleToggle(toggle.key)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-[1rem] text-sm font-medium transition-all duration-200 border',
                          active
                            ? 'bg-primary/20 text-foreground border-primary/40'
                            : 'bg-white text-muted-foreground hover:text-foreground border-border hover:border-foreground/20'
                        )}
                      >
                        <Icon className={cn('size-4', active ? 'text-foreground' : 'text-muted-foreground')} />
                        <span className="truncate">{toggle.label}</span>
                        <AnimatePresence>
                          {active && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="ml-auto size-4 rounded-full bg-foreground flex items-center justify-center shrink-0"
                            >
                              <Check className="size-3 text-background" strokeWidth={3} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </SettingGroup>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t border-dashed border-border/60 bg-muted/30">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                className="w-full h-12 rounded-full font-semibold text-base
                  bg-foreground
                  text-background
                  shadow-sm
                  hover:shadow-md
                  active:shadow-sm
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                <BookOpen className="size-5" />
                开始刷题
              </motion.button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <h3 className="text-xs font-bold italic underline uppercase decoration-primary underline-offset-4 tracking-wider text-foreground">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function ToggleChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
        active
          ? 'bg-primary/20 text-foreground border-primary/40'
          : 'bg-white text-muted-foreground hover:text-foreground border-border hover:border-foreground/20'
      )}
    >
      <span
        className={cn(
          'size-4 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          active ? 'bg-foreground border-foreground' : 'border-border/60'
        )}
      >
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="size-3 text-background" strokeWidth={3.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </span>
      {label}
    </motion.button>
  );
}
