import { useState, useMemo } from 'react';
import { Heart, FileText, Trash2, Edit3, BookOpen, ChevronRight, Search, Filter, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { IQuestion } from '@/data/mockbank';
import type { IFavorite, INote } from '@/store/bank-store';

type TabType = 'favorites' | 'notes';

interface FavoritesListSectionProps {
  activeTab: TabType;
  favorites: IFavorite[];
  notes: INote[];
  banks: { id: string; name: string }[];
  getQuestion: (questionId: string, bankId: string) => IQuestion | undefined;
  onRemoveFavorite: (questionId: string, bankId: string) => void;
  onSaveNote: (questionId: string, bankId: string, content: string) => void;
  onQuestionClick?: (questionId: string, bankId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  single: '单选',
  multiple: '多选',
  judge: '判断',
  fill: '填空',
  essay: '问答',
};

const TYPE_COLORS: Record<string, string> = {
  single: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
  multiple: 'bg-purple-500/15 text-purple-600 dark:text-purple-300',
  judge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
  fill: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
  essay: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',
};

export default function FavoritesListSection({
  activeTab,
  favorites,
  notes,
  banks,
  getQuestion,
  onRemoveFavorite,
  onSaveNote,
  onQuestionClick,
}: FavoritesListSectionProps) {
  const [keyword, setKeyword] = useState('');
  const [filterBank, setFilterBank] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [editingNote, setEditingNote] = useState<{ questionId: string; bankId: string; content: string } | null>(null);

  const items = useMemo(() => {
    const list = activeTab === 'favorites' ? favorites : notes;
    return list
      .map((item) => {
        const q = getQuestion(item.questionId, item.bankId);
        if (!q) return null;
        return { ...item, question: q };
      })
      .filter((item): item is (IFavorite | INote) & { question: IQuestion } => item !== null)
      .filter((item) => {
        if (filterBank !== 'all' && item.bankId !== filterBank) return false;
        if (filterType !== 'all' && item.question.type !== filterType) return false;
        if (keyword && !item.question.stem.toLowerCase().includes(keyword.toLowerCase())) return false;
        return true;
      });
  }, [activeTab, favorites, notes, filterBank, filterType, keyword, getQuestion]);

  const handleSaveNote = () => {
    if (!editingNote) return;
    onSaveNote(editingNote.questionId, editingNote.bankId, editingNote.content);
    setEditingNote(null);
  };

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-muted/50">
          {activeTab === 'favorites' ? (
            <Heart className="size-10 text-muted-foreground/40" />
          ) : (
            <FileText className="size-10 text-muted-foreground/40" />
          )}
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {activeTab === 'favorites' ? '还没有收藏的题目' : '还没有笔记'}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {activeTab === 'favorites'
            ? '在答题时点击收藏按钮，题目会出现在这里'
            : '在答题时添加笔记，题目会出现在这里'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索题目内容..."
            className="pl-9 bg-white/50 dark:bg-white/5 backdrop-blur-sm border-border/50"
          />
          {keyword && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setKeyword('')}
              className="absolute right-1 top-1/2 size-7 -translate-y-1/2 rounded-full"
              aria-label="清除"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Select value={filterBank} onValueChange={setFilterBank}>
            <SelectTrigger className="w-[130px] bg-white/50 dark:bg-white/5 backdrop-blur-sm border-border/50">
              <Filter className="mr-2 size-3.5 text-muted-foreground" />
              <SelectValue placeholder="题库" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部题库</SelectItem>
              {banks.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[110px] bg-white/50 dark:bg-white/5 backdrop-blur-sm border-border/50">
              <SelectValue placeholder="题型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部题型</SelectItem>
              <SelectItem value="single">单选题</SelectItem>
              <SelectItem value="multiple">多选题</SelectItem>
              <SelectItem value="judge">判断题</SelectItem>
              <SelectItem value="fill">填空题</SelectItem>
              <SelectItem value="essay">问答题</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => {
            const q = item.question;
            const noteContent = 'content' in item ? item.content : undefined;
            const bankName = banks.find((b) => b.id === item.bankId)?.name ?? '未知题库';

            return (
              <motion.div
                key={`${item.bankId}-${item.questionId}-${activeTab}`}
                variants={item}
                layout
                className={cn(
                  'group relative overflow-hidden rounded-2xl border transition-all duration-300',
                  'bg-white/60 dark:bg-white/5 backdrop-blur-xl border-white/40 dark:border-white/10',
                  'hover:shadow-[0_12px_40px_-8px_rgba(31_38_135_0.12)] hover:-translate-y-0.5',
                  'cursor-pointer'
                )}
                onClick={() => onQuestionClick?.(item.questionId, item.bankId)}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    {/* Left icon */}
                    <div
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-xl',
                        activeTab === 'favorites'
                          ? 'bg-rose-500/10 text-rose-500'
                          : 'bg-amber-500/10 text-amber-500'
                      )}
                    >
                      {activeTab === 'favorites' ? (
                        <Heart className="size-4.5 fill-current" />
                      ) : (
                        <FileText className="size-4.5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'border-0 font-medium text-[11px]',
                            TYPE_COLORS[q.type]
                          )}
                        >
                          {TYPE_LABELS[q.type] || q.type}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BookOpen className="size-3" />
                          {bankName}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          · {q.chapter}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-foreground line-clamp-2 leading-relaxed">
                        {q.stem}
                      </p>

                      {noteContent && (
                        <div className="mt-3 rounded-xl bg-amber-500/8 dark:bg-amber-500/10 border border-amber-500/20 p-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
                            <Edit3 className="size-3" />
                            我的笔记
                          </div>
                          <p className="text-xs text-amber-800 dark:text-amber-200/80 line-clamp-2">
                            {noteContent}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {activeTab === 'favorites' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFavorite(item.questionId, item.bankId);
                          }}
                          className="size-8 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                          aria-label="取消收藏"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNote({
                              questionId: item.questionId,
                              bankId: item.bankId,
                              content: noteContent || '',
                            });
                          }}
                          className="size-8 rounded-full text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                          aria-label="编辑笔记"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                      )}
                      <ChevronRight className="size-4 text-muted-foreground/50 mx-auto mt-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Edit note dialog */}
      <Dialog
        open={!!editingNote}
        onOpenChange={(open) => !open && setEditingNote(null)}
      >
        <DialogContent className="sm:max-w-[480px">
          <DialogHeader>
            <DialogTitle>编辑笔记</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editingNote?.content || ''}
            onChange={(e) =>
              setEditingNote((prev) =>
                prev ? { ...prev, content: e.target.value } : prev
              )
            }
            placeholder="写下你的笔记、思路、易错点..."
            className="min-h-[160px] resize-none"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditingNote(null)}
            >
              取消
            </Button>
            <Button onClick={handleSaveNote}>
              <Check className="mr-1.5 size-4" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
