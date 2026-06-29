import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchX, BookOpen, ChevronRight, FileText, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBankStore } from '@/store/bank-store';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import type { IQuestion } from '@/data/mockbank';

interface SearchResultSectionProps {
  keyword: string;
  selectedBankId: string | 'all';
  selectedType: string;
}

const TYPE_LABELS: Record<string, string> = {
  single: '单选',
  multiple: '多选',
  judge: '判断',
  fill: '填空',
  essay: '问答',
};

const TYPE_COLORS: Record<string, string> = {
  single: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  multiple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
  judge: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
  fill: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  essay: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

function highlightKeyword(text: string, keyword: string) {
  if (!keyword.trim()) return text;
  const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i} className="bg-primary/25 text-primary font-semibold px-0.5 rounded-sm">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function getStatusIcon(status: 'unattempted' | 'correct' | 'wrong') {
  if (status === 'correct') return <CheckCircle2 className="size-4 text-success" />;
  if (status === 'wrong') return <XCircle className="size-4 text-destructive" />;
  return <MinusCircle className="size-4 text-muted-foreground/60" />;
}

export default function SearchResultSection({
  keyword,
  selectedBankId,
  selectedType,
}: SearchResultSectionProps) {
  const { banks, getRecordForQuestion } = useBankStore();
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!keyword.trim()) return [];
    const kw = keyword.toLowerCase();
    const list: Array<{ question: IQuestion; bankName: string; bankId: string }> = [];

    for (const bank of banks) {
      if (selectedBankId !== 'all' && bank.id !== selectedBankId) continue;
      for (const q of bank.questions) {
        if (selectedType !== 'all' && q.type !== selectedType) continue;
        if (
          q.stem.toLowerCase().includes(kw) ||
          q.options?.some((o) => o.content.toLowerCase().includes(kw)) ||
          (typeof q.answer === 'string' && q.answer.toLowerCase().includes(kw)) ||
          q.analysis?.toLowerCase().includes(kw)
        ) {
          list.push({ question: q, bankName: bank.name, bankId: bank.id });
        }
      }
    }
    return list;
  }, [keyword, selectedBankId, selectedType, banks]);

  const hasSearched = keyword.trim().length > 0;

  if (!hasSearched) {
    return (
      <GlassCard variant="subtle" size="lg" className="text-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <SearchX className="size-8 text-primary/60" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">输入关键词开始搜索</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              支持跨题库搜索题目题干、选项、答案与解析
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (results.length === 0) {
    return (
      <GlassCard variant="subtle" size="lg" className="text-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-2xl bg-muted/60 flex items-center justify-center">
            <SearchX className="size-8 text-muted-foreground/60" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">未找到相关题目</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              试试其他关键词，或调整筛选条件
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          找到 <span className="font-semibold text-foreground">{results.length}</span> 道相关题目
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {results.map(({ question, bankName, bankId }, idx) => {
          const record = getRecordForQuestion(question.id, bankId);
          const status: 'unattempted' | 'correct' | 'wrong' = record
            ? record.isCorrect
              ? 'correct'
              : 'wrong'
            : 'unattempted';

          return (
            <motion.div
              key={`${bankId}-${question.id}`}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard
                hoverable
                size="md"
                variant="default"
                className="cursor-pointer group"
                onClick={() => navigate(`/bank/${bankId}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 顶部标签行 */}
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium border',
                          TYPE_COLORS[question.type]
                        )}
                      >
                        {TYPE_LABELS[question.type] || question.type}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="size-3.5" />
                        <span className="truncate max-w-[160px]">{bankName}</span>
                      </span>
                      <span className="text-xs text-muted-foreground/70">
                        {question.chapter}
                      </span>
                    </div>

                    {/* 题干 */}
                    <p className="text-sm text-foreground leading-relaxed line-clamp-2 mb-2">
                      {highlightKeyword(question.stem, keyword)}
                    </p>

                    {/* 选项预览（仅单选多选） */}
                    {question.options && question.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {question.options.slice(0, 4).map((opt) => (
                          <span
                            key={opt.key}
                            className="text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md"
                          >
                            {opt.key}. {highlightKeyword(opt.content, keyword)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 右侧状态 + 箭头 */}
                  <div className="flex flex-col items-end justify-between h-full shrink-0 gap-2">
                    {getStatusIcon(status)}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
