import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  BookOpen,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/GlassCard';
import { MOCK_QUESTIONS, MOCK_BANK_INFO } from '@/data/mockbank';
import type { IQuestion } from '@/data/mockbank';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const TYPE_LABELS: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题',
  essay: '问答题',
};

const TYPE_COLORS: Record<string, string> = {
  single: 'bg-primary/10 text-primary border-primary/20',
  multiple: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  judge: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  fill: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  essay: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
};

const ALL_TYPES: { value: string; label: string }[] = [
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'judge', label: '判断题' },
  { value: 'fill', label: '填空题' },
  { value: 'essay', label: '问答题' },
];

function highlightText(text: string, keyword: string) {
  if (!keyword.trim()) return text;
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i} className="bg-warning/30 text-foreground px-0.5 rounded font-semibold">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBank, setSelectedBank] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const navigate = useNavigate();

  const filteredQuestions = useMemo(() => {
    let result = [...MOCK_QUESTIONS];
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (q) =>
          q.stem.toLowerCase().includes(kw) ||
          q.options?.some((o) => o.content.toLowerCase().includes(kw)) ||
          q.analysis?.toLowerCase().includes(kw)
      );
    }
    if (selectedTypes.length > 0) {
      result = result.filter((q) => selectedTypes.includes(q.type));
    }
    if (selectedBank !== 'all') {
      result = result.filter((q) => q.bankId === selectedBank);
    }
    return result;
  }, [keyword, selectedTypes, selectedBank]);

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleClearKeyword = useCallback(() => {
    setKeyword('');
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedTypes([]);
    setSelectedBank('all');
  }, []);

  const handleQuestionClick = useCallback(
    (q: IQuestion) => {
      navigate(`/practice/${q.bankId}?qid=${q.id}`);
    },
    [navigate]
  );

  const hasActiveFilters = selectedTypes.length > 0 || selectedBank !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <span className="size-10 rounded-xl bg-gradient-to-br from-primary/90 to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Search className="size-5 text-primary-foreground" />
            </span>
            题目搜索
          </h1>
          <p className="text-sm text-muted-foreground">
            跨题库搜索题目，快速定位你需要的内容
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard variant="elevated" size="md" className="!p-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索题目关键词、选项或解析..."
                  className="h-12 pl-11 pr-10 bg-transparent border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                />
                {keyword && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearKeyword}
                    className="!absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full hover:bg-accent/60"
                    aria-label="清除"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'size-12 rounded-xl shrink-0',
                      hasActiveFilters && 'bg-primary/10 text-primary hover:bg-primary/15'
                    )}
                    aria-label="筛选"
                  >
                    <SlidersHorizontal className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] sm:w-[400px] border-l-0 bg-background/80 backdrop-blur-2xl">
                  <SheetHeader>
                    <SheetTitle className="text-lg font-bold">筛选条件</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    {/* 题库筛选 */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground">所属题库</Label>
                      <Select value={selectedBank} onValueChange={setSelectedBank}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="选择题库" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部题库</SelectItem>
                          <SelectItem value={MOCK_BANK_INFO.id}>{MOCK_BANK_INFO.name}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* 题型筛选 */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground">题型</Label>
                      <div className="space-y-2">
                        {ALL_TYPES.map((t) => (
                          <div key={t.value} className="flex items-center gap-3 py-1">
                            <Checkbox
                              id={`type-${t.value}`}
                              checked={selectedTypes.includes(t.value)}
                              onCheckedChange={(checked) => {
                                if (checked) handleTypeToggle(t.value);
                                else setSelectedTypes((prev) => prev.filter((v) => v !== t.value));
                              }}
                            />
                            <Label htmlFor={`type-${t.value}`} className="text-sm cursor-pointer flex-1">
                              {t.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <SheetFooter className="flex flex-row gap-3">
                    <Button variant="outline" onClick={handleResetFilters} className="flex-1">
                      重置
                    </Button>
                    <Button onClick={() => setFilterOpen(false)} className="flex-1">
                      确定
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            {/* Quick type chips */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 px-3 pt-2 pb-1 flex-wrap">
                {selectedBank !== 'all' && (
                  <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
                    <BookOpen className="size-3" />
                    {MOCK_BANK_INFO.name}
                    <button onClick={() => setSelectedBank('all')} className="ml-0.5 hover:text-destructive">
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                {selectedTypes.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className={cn('gap-1.5 px-2.5 py-1', TYPE_COLORS[t])}
                  >
                    {TYPE_LABELS[t]}
                    <button onClick={() => handleTypeToggle(t)} className="ml-0.5 opacity-70 hover:opacity-100">
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  清除全部
                </Button>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Result stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex items-center justify-between text-sm"
        >
          <span className="text-muted-foreground">
            {keyword || hasActiveFilters ? (
              <>
                找到 <span className="font-semibold text-foreground">{filteredQuestions.length}</span> 道相关题目
              </>
            ) : (
              <>共 <span className="font-semibold text-foreground">{MOCK_QUESTIONS.length}</span> 道题目</>
            )}
          </span>
        </motion.div>

        {/* Results */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredQuestions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard variant="subtle" size="lg" className="text-center">
                  <div className="py-12 space-y-4">
                    <div className="size-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center">
                      <Search className="size-7 text-muted-foreground/60" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground">未找到相关题目</h3>
                      <p className="text-sm text-muted-foreground">
                        {keyword ? '试试其他关键词，或调整筛选条件' : '调整筛选条件后再试试'}
                      </p>
                    </div>
                    {(keyword || hasActiveFilters) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setKeyword('');
                          handleResetFilters();
                        }}
                        className="mt-2"
                      >
                        清除筛选
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              filteredQuestions.map((q, i) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  layout
                >
                  <GlassCard
                    variant="default"
                    size="md"
                    hoverable
                    className="cursor-pointer group"
                    onClick={() => handleQuestionClick(q)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              'px-2.5 py-0.5 text-xs font-medium rounded-full border',
                              TYPE_COLORS[q.type]
                            )}
                          >
                            {TYPE_LABELS[q.type]}
                          </Badge>
                          <Badge variant="outline" className="px-2 py-0.5 text-[11px] font-normal rounded-full border-border/50 text-muted-foreground">
                            {q.chapter}
                          </Badge>
                        </div>
                        <p className="text-sm md:text-base text-foreground leading-relaxed line-clamp-2">
                          {highlightText(q.stem, keyword)}
                        </p>
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                            {q.options.slice(0, 4).map((opt) => (
                              <div key={opt.key} className="flex items-start gap-1.5">
                                <span className="font-medium text-foreground/70 shrink-0">{opt.key}.</span>
                                <span className="truncate">{highlightText(opt.content, keyword)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5">
                          <BookOpen className="size-3.5 shrink-0" />
                          <span className="truncate">{MOCK_BANK_INFO.name}</span>
                        </div>
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300 mt-1" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer spacer for mobile bottom tab */}
        <div className="h-20 md:h-8" />
      </main>
    </div>
  );
}
