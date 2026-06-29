import { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Plus, ChevronRight, BookOpen, CheckCircle, XCircle, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import GlassCard from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { MOCK_QUESTIONS, type IQuestion } from '@/data/question-bank-detail-page';

const TYPE_LABELS: Record<IQuestion['type'], string> = {
  single: '单选',
  multiple: '多选',
  judge: '判断',
  fill: '填空',
  essay: '问答',
};

const TYPE_COLORS: Record<IQuestion['type'], string> = {
  single: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  multiple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
  judge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  fill: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
  essay: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

const STATUS_ICONS = {
  correct: CheckCircle,
  wrong: XCircle,
  unattempted: Circle,
};

const STATUS_COLORS = {
  correct: 'text-emerald-500',
  wrong: 'text-rose-500',
  unattempted: 'text-muted-foreground/50',
};

const STATUS_LABELS = {
  correct: '已答对',
  wrong: '已答错',
  unattempted: '未作答',
};

interface QuestionListSectionProps {
  selectedChapter?: string;
}

export default function QuestionListSection({ selectedChapter }: QuestionListSectionProps) {
  const [questions, setQuestions] = useState<IQuestion[]>(MOCK_QUESTIONS);
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingQ, setEditingQ] = useState<IQuestion | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (selectedChapter && selectedChapter !== 'all' && q.chapter !== selectedChapter) return false;
      if (typeFilter !== 'all' && q.type !== typeFilter) return false;
      if (statusFilter !== 'all' && q.status !== statusFilter) return false;
      if (keyword && !q.stem.toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [questions, selectedChapter, typeFilter, statusFilter, keyword]);

  const stats = useMemo(() => {
    const total = questions.length;
    const correct = questions.filter((q) => q.status === 'correct').length;
    const wrong = questions.filter((q) => q.status === 'wrong').length;
    const unattempted = questions.filter((q) => q.status === 'unattempted').length;
    return { total, correct, wrong, unattempted };
  }, [questions]);

  const handleEdit = (q: IQuestion) => {
    setEditingQ({ ...q });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingQ) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === editingQ.id ? editingQ : q))
    );
    setEditDialogOpen(false);
    toast.success('题目已更新');
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setDeleteTargetId(null);
    toast.success('题目已删除');
  };

  const handleAddOption = () => {
    if (!editingQ || !editingQ.options) return;
    const nextKey = String.fromCharCode(65 + editingQ.options.length);
    setEditingQ({
      ...editingQ,
      options: [...editingQ.options, { key: nextKey, content: '' }],
    });
  };

  const handleRemoveOption = (idx: number) => {
    if (!editingQ || !editingQ.options) return;
    const newOpts = editingQ.options.filter((_, i) => i !== idx);
    setEditingQ({
      ...editingQ,
      options: newOpts.map((o, i) => ({ ...o, key: String.fromCharCode(65 + i) })),
    });
  };

  const handleOptionChange = (idx: number, content: string) => {
    if (!editingQ || !editingQ.options) return;
    const newOpts = [...editingQ.options];
    newOpts[idx] = { ...newOpts[idx], content };
    setEditingQ({ ...editingQ, options: newOpts });
  };

  return (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '总题数', value: stats.total, color: 'text-foreground', icon: BookOpen },
          { label: '已答对', value: stats.correct, color: 'text-emerald-500', icon: CheckCircle },
          { label: '已答错', value: stats.wrong, color: 'text-rose-500', icon: XCircle },
          { label: '未作答', value: stats.unattempted, color: 'text-muted-foreground', icon: Circle },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <GlassCard key={item.label} variant="subtle" size="sm" className="flex items-center gap-3">
              <div className={cn('size-9 rounded-lg flex items-center justify-center bg-white/50 dark:bg-white/5', item.color)}>
                <Icon className="size-4.5" />
              </div>
              <div>
                <div className={cn('text-xl font-bold tabular-nums', item.color)}>{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <GlassCard variant="subtle" size="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索题目关键词..."
              className="bg-white/50 dark:bg-white/5 pl-9 h-10 border-border/50"
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[110px] h-10 bg-white/50 dark:bg-white/5 border-border/50">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[110px] h-10 bg-white/50 dark:bg-white/5 border-border/50">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="correct">已答对</SelectItem>
                <SelectItem value="wrong">已答错</SelectItem>
                <SelectItem value="unattempted">未作答</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="h-10 gap-1.5">
              <Plus className="size-4" />
              新增
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Question List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard variant="subtle" size="lg" className="text-center py-12">
                <div className="size-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                  <Search className="size-7 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground">暂无匹配的题目</p>
                <p className="text-sm text-muted-foreground/70 mt-1">试试调整筛选条件</p>
              </GlassCard>
            </motion.div>
          ) : (
            filtered.map((q, i) => {
              const StatusIcon = STATUS_ICONS[q.status];
              return (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                >
                  <GlassCard
                    variant="default"
                    size="md"
                    hoverable
                    className="group cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className={cn('mt-0.5 shrink-0', STATUS_COLORS[q.status])}>
                        <StatusIcon className="size-5" strokeWidth={q.status === 'unattempted' ? 1.5 : 2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn('text-[11px] font-medium px-2 py-0.5', TYPE_COLORS[q.type])}
                          >
                            {TYPE_LABELS[q.type]}
                          </Badge>
                          <span className="text-xs text-muted-foreground/70">{q.chapter}</span>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed line-clamp-2">
                          {q.stem}
                        </p>
                        {q.options && q.options.length > 0 && (
                          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                            {q.options.slice(0, 4).map((opt) => (
                              <div
                                key={opt.key}
                                className="text-xs text-muted-foreground/80 flex items-start gap-1.5"
                              >
                                <span className="shrink-0 font-medium text-foreground/60">{opt.key}.</span>
                                <span className="truncate">{opt.content}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleEdit(q)}
                          aria-label="编辑"
                        >
                          <Edit2 className="size-4" />
                        </Button>
                        <AlertDialog
                          open={deleteTargetId === q.id}
                          onOpenChange={(open) => !open && setDeleteTargetId(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteTargetId(q.id)}
                              aria-label="删除"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-sm border-0 bg-white/90 backdrop-blur-xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>确认删除</AlertDialogTitle>
                              <AlertDialogDescription>
                                删除后无法恢复，确定要删除这道题目吗？
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDelete(q.id)}
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto border-0 bg-white/90 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">编辑题目</DialogTitle>
          </DialogHeader>

          {editingQ && (
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>题型</Label>
                  <Select
                    value={editingQ.type}
                    onValueChange={(v) =>
                      setEditingQ({ ...editingQ, type: v as IQuestion['type'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">单选题</SelectItem>
                      <SelectItem value="multiple">多选题</SelectItem>
                      <SelectItem value="judge">判断题</SelectItem>
                      <SelectItem value="fill">填空题</SelectItem>
                      <SelectItem value="essay">问答题</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>所属章节</Label>
                  <Input
                    value={editingQ.chapter}
                    onChange={(e) => setEditingQ({ ...editingQ, chapter: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>题干</Label>
                <Textarea
                  value={editingQ.stem}
                  onChange={(e) => setEditingQ({ ...editingQ, stem: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {(editingQ.type === 'single' || editingQ.type === 'multiple') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>选项</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={handleAddOption}
                    >
                      <Plus className="size-3.5" />
                      添加选项
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {editingQ.options?.map((opt, idx) => (
                      <div key={opt.key} className="flex items-center gap-2">
                        <span className="w-6 text-sm font-medium text-muted-foreground shrink-0">
                          {opt.key}.
                        </span>
                        <Input
                          value={opt.content}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          className="h-9"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0"
                          onClick={() => handleRemoveOption(idx)}
                          aria-label="删除选项"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>正确答案</Label>
                {editingQ.type === 'judge' ? (
                  <Select
                    value={editingQ.answer as string}
                    onValueChange={(v) => setEditingQ({ ...editingQ, answer: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="正确">正确</SelectItem>
                      <SelectItem value="错误">错误</SelectItem>
                    </SelectContent>
                  </Select>
                ) : editingQ.type === 'multiple' ? (
                  <Input
                    value={Array.isArray(editingQ.answer) ? editingQ.answer.join(', ') : ''}
                    onChange={(e) =>
                      setEditingQ({
                        ...editingQ,
                        answer: e.target.value
                          .split(/[,，\s]+/)
                          .map((s) => s.trim().toUpperCase())
                          .filter(Boolean),
                      })
                    }
                    placeholder="多个答案用逗号分隔，如 A, B, D"
                  />
                ) : (
                  <Input
                    value={editingQ.answer as string}
                    onChange={(e) => setEditingQ({ ...editingQ, answer: e.target.value })}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>答案解析</Label>
                <Textarea
                  value={editingQ.analysis || ''}
                  onChange={(e) => setEditingQ({ ...editingQ, analysis: e.target.value })}
                  rows={3}
                  className="resize-none"
                  placeholder="选填"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>保存修改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
