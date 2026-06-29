import { useState, useMemo, type ChangeEvent } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type QuestionType = 'all' | 'single' | 'multiple' | 'judge' | 'fill' | 'essay';

interface SearchBarSectionProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  bankFilter: string;
  onBankFilterChange: (value: string) => void;
  typeFilter: QuestionType;
  onTypeFilterChange: (value: QuestionType) => void;
  banks: { id: string; name: string }[];
  resultCount?: number;
}

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'all', label: '全部题型' },
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'judge', label: '判断题' },
  { value: 'fill', label: '填空题' },
  { value: 'essay', label: '问答题' },
];

export default function SearchBarSection({
  keyword,
  onKeywordChange,
  bankFilter,
  onBankFilterChange,
  typeFilter,
  onTypeFilterChange,
  banks,
  resultCount,
}: SearchBarSectionProps) {
  const [focused, setFocused] = useState(false);

  const hasFilters = useMemo(
    () => bankFilter !== 'all' || typeFilter !== 'all' || keyword.length > 0,
    [bankFilter, typeFilter, keyword]
  );

  const handleClear = () => {
    onKeywordChange('');
    onBankFilterChange('all');
    onTypeFilterChange('all');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onKeywordChange(e.target.value);
  };

  return (
    <section className="w-full pt-10 pb-6">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-2">
            题目搜索
          </h1>
          <p className="text-sm text-muted-foreground">
            跨题库搜索，快速定位你想要的题目
          </p>
        </motion.div>

        {/* 搜索框 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'relative rounded-2xl transition-all duration-300',
            'bg-white/70 dark:bg-foreground/5 backdrop-blur-xl backdrop-saturate-150',
            'border border-white/50 dark:border-white/10',
            'shadow-[0_8px_32px_rgba(31_38_135_0.08)]',
            focused && 'shadow-[0_12px_48px_rgba(31_38_135_0.12)] ring-2 ring-primary/20'
          )}
        >
          {/* 光晕装饰 */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />

          <div className="relative z-10 p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              {/* 搜索图标 + 输入框 */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={keyword}
                  onChange={handleInputChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="输入关键词搜索题目..."
                  className={cn(
                    'h-12 pl-11 pr-10 rounded-xl',
                    'bg-background/60 dark:bg-background/30',
                    'border-border/50 focus-visible:ring-primary/30',
                    'text-base placeholder:text-muted-foreground/70'
                  )}
                />
                {keyword && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onKeywordChange('')}
                    className="!absolute right-1.5 top-1/2 z-20 h-8 w-8 -translate-y-1/2 rounded-full hover:bg-accent/60"
                    aria-label="清除搜索"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>

              {/* 筛选按钮（移动端） */}
              <div className="md:hidden">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 rounded-xl bg-secondary/60 hover:bg-secondary/80"
                  aria-label="筛选"
                >
                  <Filter className="size-5" />
                </Button>
              </div>

              {/* 筛选下拉（桌面端） */}
              <div className="hidden md:flex items-center gap-2">
                <Select value={bankFilter} onValueChange={onBankFilterChange}>
                  <SelectTrigger className="h-12 w-[160px] rounded-xl bg-secondary/50 border-border/50 hover:bg-secondary/70">
                    <SelectValue placeholder="选择题库" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-white/90 dark:bg-foreground/10 border-border/50">
                    <SelectItem value="all">全部题库</SelectItem>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={(v) => onTypeFilterChange(v as QuestionType)}>
                  <SelectTrigger className="h-12 w-[140px] rounded-xl bg-secondary/50 border-border/50 hover:bg-secondary/70">
                    <SelectValue placeholder="选择题型" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-white/90 dark:bg-foreground/10 border-border/50">
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 移动端筛选 chips */}
            <div className="flex md:hidden items-center gap-2 mt-3 overflow-x-auto pb-1">
              <Badge
                variant="outline"
                className={cn(
                  'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all',
                  bankFilter !== 'all'
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-muted/50 text-muted-foreground border-border/50'
                )}
              >
                {banks.find((b) => b.id === bankFilter)?.name ?? '全部题库'}
                <ChevronDown className="ml-1 size-3" />
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  'shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all',
                  typeFilter !== 'all'
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-muted/50 text-muted-foreground border-border/50'
                )}
              >
                {TYPE_OPTIONS.find((t) => t.value === typeFilter)?.label}
                <ChevronDown className="ml-1 size-3" />
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* 搜索结果统计 + 清除筛选 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex items-center justify-between mt-4 px-1"
        >
          <div className="text-sm text-muted-foreground">
            {resultCount !== undefined && (
              <>
                找到 <span className="font-semibold text-foreground">{resultCount}</span> 道相关题目
              </>
            )}
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 px-3 text-xs text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="mr-1 size-3.5" />
              清除筛选
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
