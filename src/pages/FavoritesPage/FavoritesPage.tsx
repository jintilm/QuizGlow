import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  FileText,
  Search,
  Filter,
  BookOpen,
  Trash2,
  Edit3,
  ChevronDown,
  Star,
  X,
  Check,
} from 'lucide-react';
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
import { useBankStore } from '@/store/bank-store';
import type { IQuestion } from '@/data/mockbank';
import { MOCK_QUESTIONS, MOCK_BANK_INFO } from '@/data/mockbank';

type TabType = 'favorites' | 'notes';

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

// Mock favorites data
const MOCK_FAVORITES: IQuestion[] = MOCK_QUESTIONS.slice(0, 6);

// Mock notes data
const MOCK_NOTES = MOCK_QUESTIONS.slice(2, 5).map((q) => ({
  ...q,
  noteContent:
    q.type === 'single'
      ? '这道题容易混淆，记住操作系统是核心系统软件，不是应用软件。'
      : q.type === 'multiple'
        ? '五大功能口诀：进设文存作（进程、设备、文件、存储、作业）'
        : '死锁四条件：互斥、请求保持、不剥夺、循环等待。',
}));

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('all');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    question: IQuestion;
    content: string;
  } | null>(null);
  const { favorites, toggleFavorite, notes, saveNote } = useBankStore();

  const favoriteQuestions = useMemo(() => {
    let list = MOCK_FAVORITES;
    if (searchKeyword) {
      list = list.filter((q) =>
        q.stem.toLowerCase().includes(searchKeyword.toLowerCase()),
      );
    }
    if (typeFilter !== 'all') {
      list = list.filter((q) => q.type === typeFilter);
    }
    return list;
  }, [searchKeyword, typeFilter]);

  const noteQuestions = useMemo(() => {
    let list = MOCK_NOTES;
    if (searchKeyword) {
      list = list.filter(
        (q) =>
          q.stem.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          (q as any).noteContent
            ?.toLowerCase()
            .includes(searchKeyword.toLowerCase()),
      );
    }
    if (typeFilter !== 'all') {
      list = list.filter((q) => q.type === typeFilter);
    }
    return list;
  }, [searchKeyword, typeFilter]);

  const handleEditNote = (question: IQuestion, content: string) => {
    setEditingNote({ question, content });
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (editingNote) {
      saveNote(editingNote.question.id, editingNote.question.bankId, editingNote.content);
      setNoteDialogOpen(false);
      setEditingNote(null);
    }
  };

  const handleRemoveFavorite = (id: string, bankId: string) => {
    toggleFavorite(id, bankId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -left-40 h-80 w-80 rounded-full bg-chart-2/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-chart-5/10 blur-3xl" />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            我的收藏与笔记
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            管理你的收藏题目和学习笔记，高效复习重点知识
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          <div
            className={cn(
              'relative flex p-1.5 rounded-2xl',
              'bg-white/60 dark:bg-foreground/5 backdrop-blur-xl backdrop-saturate-150',
              'border border-white/50 dark:border-white/10',
              'shadow-[0_8px_32px_rgba(31_38_135_0.08)]',
            )}
          >
            <button
              onClick={() => setActiveTab('favorites')}
              className={cn(
                'relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 z-10',
                activeTab === 'favorites'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Heart
                className={cn(
                  'size-4 transition-all duration-300',
                  activeTab === 'favorites' ? 'fill-current' : '',
                )}
              />
              收藏题目
              <Badge
                variant="secondary"
                className={cn(
                  'ml-1 text-xs px-1.5 py-0 transition-all duration-300',
                  activeTab === 'favorites'
                    ? 'bg-white/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {MOCK_FAVORITES.length}
              </Badge>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={cn(
                'relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 z-10',
                activeTab === 'notes'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <FileText className="size-4" />
              我的笔记
              <Badge
                variant="secondary"
                className={cn(
                  'ml-1 text-xs px-1.5 py-0 transition-all duration-300',
                  activeTab === 'notes'
                    ? 'bg-white/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {MOCK_NOTES.length}
              </Badge>
            </button>

            {/* Sliding indicator */}
            <motion.div
              layoutId="fav-tab-indicator"
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/30"
              animate={{
                x: activeTab === 'favorites' ? 6 : 'calc(100% + 6px)',
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索题目或笔记内容..."
              className="pl-10 h-11 bg-white/60 dark:bg-foreground/5 backdrop-blur-lg border-white/50 dark:border-white/10 rounded-xl focus-visible:ring-primary/30"
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[120px] h-11 bg-white/60 dark:bg-foreground/5 backdrop-blur-lg border-white/50 dark:border-white/10 rounded-xl">
                <SelectValue placeholder="题型" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-white/90 dark:bg-foreground/90 border-white/50">
                <SelectItem value="all">全部题型</SelectItem>
                <SelectItem value="single">单选题</SelectItem>
                <SelectItem value="multiple">多选题</SelectItem>
                <SelectItem value="judge">判断题</SelectItem>
                <SelectItem value="fill">填空题</SelectItem>
                <SelectItem value="essay">问答题</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bankFilter} onValueChange={setBankFilter}>
              <SelectTrigger className="w-[140px] h-11 bg-white/60 dark:bg-foreground/5 backdrop-blur-lg border-white/50 dark:border-white/10 rounded-xl">
                <SelectValue placeholder="题库" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-white/90 dark:bg-foreground/90 border-white/50">
                <SelectItem value="all">全部题库</SelectItem>
                <SelectItem value="mock-bank-1">{MOCK_BANK_INFO.name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Content List */}
        <AnimatePresence mode="wait">
          {activeTab === 'favorites' ? (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {favoriteQuestions.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="暂无收藏题目"
                  description="在答题时点击收藏按钮，将重点题目添加到这里"
                />
              ) : (
                favoriteQuestions.map((q, i) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -2 }}
                    className={cn(
                      'relative overflow-hidden rounded-2xl cursor-pointer group',
                      'bg-white/70 dark:bg-foreground/5 backdrop-blur-xl backdrop-saturate-150',
                      'border border-white/50 dark:border-white/10',
                      'shadow-[0_8px_32px_rgba(31_38_135_0.08)]',
                      'transition-all duration-300 hover:shadow-[0_16px_48px_rgba(31_38_135_0.12)]',
                    )}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              'px-2.5 py-0.5 text-xs font-semibold rounded-full border',
                              TYPE_COLORS[q.type],
                            )}
                          >
                            {TYPE_LABELS[q.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <BookOpen className="size-3" />
                            {q.chapter}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFavorite(q.id, q.bankId);
                            }}
                            aria-label="取消收藏"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-foreground text-sm md:text-base font-medium leading-relaxed line-clamp-2 mb-3">
                        {q.stem}
                      </p>
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {q.options.slice(0, 4).map((opt) => (
                            <div
                              key={opt.key}
                              className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
                                Array.isArray(q.answer)
                                  ? q.answer.includes(opt.key)
                                    ? 'bg-success/10 text-success-foreground'
                                    : 'bg-muted/50 text-muted-foreground'
                                  : q.answer === opt.key
                                    ? 'bg-success/10 text-success-foreground'
                                    : 'bg-muted/50 text-muted-foreground',
                              )}
                            >
                              <span className="font-semibold">{opt.key}.</span>
                              <span className="truncate">{opt.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-border/20">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Star className="size-3.5 text-warning fill-warning" />
                          <span>已收藏</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        >
                          开始练习
                          <ChevronDown className="size-3.5 -rotate-90 ml-0.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {noteQuestions.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="暂无笔记"
                  description="在答题时添加笔记，记录你的思考和总结"
                />
              ) : (
                noteQuestions.map((q: any, i: number) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: i * 0.05,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -2 }}
                    className={cn(
                      'relative overflow-hidden rounded-2xl cursor-pointer group',
                      'bg-white/70 dark:bg-foreground/5 backdrop-blur-xl backdrop-saturate-150',
                      'border border-white/50 dark:border-white/10',
                      'shadow-[0_8px_32px_rgba(31_38_135_0.08)]',
                      'transition-all duration-300 hover:shadow-[0_16px_48px_rgba(31_38_135_0.12)]',
                    )}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              'px-2.5 py-0.5 text-xs font-semibold rounded-full border',
                              TYPE_COLORS[q.type],
                            )}
                          >
                            {TYPE_LABELS[q.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <BookOpen className="size-3" />
                            {q.chapter}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNote(q, q.noteContent);
                          }}
                          aria-label="编辑笔记"
                        >
                          <Edit3 className="size-4" />
                        </Button>
                      </div>
                      <p className="text-foreground text-sm font-medium leading-relaxed line-clamp-2 mb-3">
                        {q.stem}
                      </p>
                      {/* Note preview */}
                      <div
                        className={cn(
                          'relative p-4 rounded-xl border-l-4',
                          'bg-chart-3/5 border-chart-3/30',
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <FileText className="size-4 text-chart-3 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-chart-3 mb-1">
                              我的笔记
                            </p>
                            <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 whitespace-pre-line">
                              {q.noteContent}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Note Edit Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 gap-0 border-0 bg-transparent shadow-none">
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
            <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-chart-3/20 blur-3xl" />
            <div className="relative z-10">
              <DialogHeader className="px-7 pt-7 pb-4 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
                    编辑笔记
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNoteDialogOpen(false)}
                    className="size-9 rounded-full hover:bg-accent/60 -mr-2 -mt-2"
                    aria-label="关闭"
                  >
                    <X className="size-4.5" />
                  </Button>
                </div>
              </DialogHeader>
              <div className="px-7 py-5 space-y-4">
                {editingNote && (
                  <>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/30">
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {editingNote.question.stem}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        笔记内容
                      </label>
                      <Textarea
                        value={editingNote.content}
                        onChange={(e) =>
                          setEditingNote({
                            ...editingNote,
                            content: e.target.value,
                          })
                        }
                        placeholder="记录你的思考、易错点、记忆口诀..."
                        className="min-h-[160px] resize-none bg-white/60 dark:bg-foreground/5 border-white/50 dark:border-white/10 rounded-xl focus-visible:ring-chart-3/30"
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter className="px-7 pb-7 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setNoteDialogOpen(false)}
                  className="rounded-xl"
                >
                  取消
                </Button>
                <Button
                  onClick={handleSaveNote}
                  className="rounded-xl bg-gradient-to-r from-chart-3 to-chart-3/90 hover:from-chart-3/90 hover:to-chart-3/80 shadow-lg shadow-chart-3/20"
                >
                  <Check className="size-4 mr-1.5" />
                  保存笔记
                </Button>
              </DialogFooter>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative overflow-hidden rounded-3xl py-16 px-8 text-center',
        'bg-white/50 dark:bg-foreground/5 backdrop-blur-xl',
        'border border-white/50 dark:border-white/10',
        'shadow-[0_8px_32px_rgba(31_38_135_0.06)]',
      )}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted/60 backdrop-blur-sm">
          <Icon className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
