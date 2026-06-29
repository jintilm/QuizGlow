import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Edit3,
  FileText,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { capabilityClient } from '@lark-apaas/client-toolkit-lite';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import GlassCard from '@/components/GlassCard';
import { parseQuestionsFromText, normalizeQuestion } from '@/lib/question-parser';
import type { IQuestion } from '@/data/mockbank';

const TYPE_LABELS: Record<string, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题',
  essay: '问答题',
};

const TYPE_COLORS: Record<string, string> = {
  single: 'bg-primary/15 text-primary border-primary/20',
  multiple: 'bg-chart-2/15 text-chart-2 border-chart-2/20',
  judge: 'bg-chart-3/15 text-chart-3 border-chart-3/20',
  fill: 'bg-chart-4/15 text-chart-4 border-chart-4/20',
  essay: 'bg-chart-5/15 text-chart-5 border-chart-5/20',
};

interface ParseStep {
  key: 'parsing' | 'recognizing' | 'done';
  label: string;
  status: 'pending' | 'active' | 'done';
}

interface ParseResultSectionProps {
  file: File | null;
  onImportComplete: (questions: IQuestion[], bankName: string) => void;
}

export default function ParseResultSection({
  file,
  onImportComplete,
}: ParseResultSectionProps) {
  const [phase, setPhase] = useState<'idle' | 'parsing' | 'recognizing' | 'done' | 'error'>('idle');
  const [progressText, setProgressText] = useState('');
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<IQuestion | null>(null);
  const [bankName, setBankName] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  const steps: ParseStep[] = useMemo(
    () => [
      {
        key: 'parsing',
        label: '文档解析中',
        status:
          phase === 'parsing'
            ? 'active'
            : phase === 'recognizing' || phase === 'done'
              ? 'done'
              : 'pending',
      },
      {
        key: 'recognizing',
        label: '题目识别中',
        status:
          phase === 'recognizing'
            ? 'active'
            : phase === 'done'
              ? 'done'
              : 'pending',
      },
      {
        key: 'done',
        label: '识别完成',
        status: phase === 'done' ? 'done' : 'pending',
      },
    ],
    [phase],
  );

  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      single: 0,
      multiple: 0,
      judge: 0,
      fill: 0,
      essay: 0,
    };
    questions.forEach((q) => {
      counts[q.type] = (counts[q.type] || 0) + 1;
    });
    return counts;
  }, [questions]);

  const startParse = useCallback(async () => {
    if (!file) {
      toast.error('请先选择文件');
      return;
    }

    setPhase('parsing');
    setProgressText('正在解析文档内容...');
    setQuestions([]);

    try {
      // 阶段 1: 调用 doc-parser 插件解析文档
      const parseRes = (await capabilityClient
        .load('doc_parser_for_question_recognition_1')
        .call('parseDocToMarkdown', {
          document_file: [file],
        })) as { content?: string };

      const text = parseRes?.content || '';
      if (!text || text.trim().length === 0) {
        throw new Error('文档内容为空');
      }

      logger.info('文档解析成功，字符数:', String(text.length));

      // 先用本地正则解析做快速兜底展示
      const localParsed = parseQuestionsFromText(text);
      const bankId = `bank-${Date.now()}`;
      const localQuestions = localParsed.map((q, i) =>
        normalizeQuestion(q, i, bankId),
      );

      setPhase('recognizing');
      setProgressText('正在智能识别题目结构...');

      if (localQuestions.length > 0) {
        setQuestions(localQuestions);
        setBankName(file.name.replace(/\.(docx?|pdf)$/i, '') || '新建题库');
      }

      // 阶段 2: 调用 text-to-json 插件做 AI 智能识别
      try {
        const aiRes = (await capabilityClient
          .load('question_intelligent_recognition_1')
          .call('textToJson', {
            document_text: text.slice(0, 12000),
          })) as { question_list?: Array<Record<string, unknown>> };

        const aiList = aiRes?.question_list;
        if (Array.isArray(aiList) && aiList.length > 0) {
          const aiQuestions: IQuestion[] = aiList
            .map((item, idx) => {
              const type = String(item.type || 'single') as IQuestion['type'];
              const optionsRaw = Array.isArray(item.options) ? item.options : [];
              const options =
                type === 'single' || type === 'multiple'
                  ? optionsRaw.map((opt: unknown, i: number) => ({
                      key: String.fromCharCode(65 + i),
                      content: String(opt || ''),
                    }))
                  : [];

              let answer: string | string[] = String(item.answer || '');
              if (type === 'multiple' && typeof answer === 'string') {
                answer = answer.split(/[,，、\s]+/).filter(Boolean);
              }

              return {
                id: `ai-${Date.now()}-${idx}`,
                bankId,
                type,
                chapter: String(item.chapter || '未分类'),
                stem: String(item.stem || ''),
                options,
                answer,
                analysis: String(item.analysis || ''),
                source: 'imported' as const,
                createdAt: Date.now(),
              };
            })
            .filter((q) => q.stem.trim().length > 0);

          if (aiQuestions.length > localQuestions.length) {
            setQuestions(aiQuestions);
          }
        }
      } catch (aiErr) {
        logger.warn('AI 识别失败，使用本地解析结果:', String(aiErr));
      }

      setPhase('done');
      setProgressText('');

      if (questions.length === 0 && localQuestions.length === 0) {
        toast.warning('未识别到题目，请检查文档格式');
      } else {
        toast.success(`成功识别 ${questions.length || localQuestions.length} 道题目`);
      }
    } catch (err) {
      logger.error('文档解析失败:', String(err));
      setPhase('error');
      setProgressText('文档解析失败，请检查文件格式后重试');
      toast.error('文档解析失败');
    }
  }, [file, questions.length]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const startEdit = useCallback(
    (q: IQuestion) => {
      setEditingId(q.id);
      setEditDraft(JSON.parse(JSON.stringify(q)));
    },
    [],
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editDraft) return;
    setQuestions((prev) =>
      prev.map((q) => (q.id === editDraft.id ? editDraft : q)),
    );
    setEditingId(null);
    setEditDraft(null);
    toast.success('题目已更新');
  }, [editDraft]);

  const deleteQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast.success('已删除该题目');
  }, []);

  const addQuestion = useCallback(() => {
    const newQ: IQuestion = {
      id: `manual-${Date.now()}`,
      bankId: 'new',
      type: 'single',
      chapter: '未分类',
      stem: '',
      options: [
        { key: 'A', content: '' },
        { key: 'B', content: '' },
        { key: 'C', content: '' },
        { key: 'D', content: '' },
      ],
      answer: 'A',
      analysis: '',
      source: 'imported',
      createdAt: Date.now(),
    };
    setQuestions((prev) => [newQ, ...prev]);
    setEditingId(newQ.id);
    setEditDraft(newQ);
    setExpandedId(newQ.id);
  }, []);

  const handleImport = useCallback(async () => {
    if (questions.length === 0) {
      toast.error('没有可导入的题目');
      return;
    }
    if (!bankName.trim()) {
      toast.error('请输入题库名称');
      return;
    }

    setImporting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      onImportComplete(questions, bankName.trim());
      setImportDialogOpen(false);
      toast.success(`已导入 ${questions.length} 道题目到「${bankName}」`);
    } catch (err) {
      logger.error('导入失败:', String(err));
      toast.error('导入失败，请重试');
    } finally {
      setImporting(false);
    }
  }, [questions, bankName, onImportComplete]);

  const updateEditDraftField = useCallback(
    <K extends keyof IQuestion>(field: K, value: IQuestion[K]) => {
      setEditDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    [],
  );

  const updateOption = useCallback((index: number, content: string) => {
    setEditDraft((prev) => {
      if (!prev || !prev.options) return prev;
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], content };
      return { ...prev, options: newOptions };
    });
  }, []);

  // 空状态 / 初始态
  if (phase === 'idle' && !file) {
    return (
      <GlassCard variant="subtle" size="lg" className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <FileText className="size-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">识别结果预览</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          上传 Word 或 PDF 文档后，系统将自动识别题目并在此展示，支持逐题编辑和调整
        </p>
      </GlassCard>
    );
  }

  // 有文件但未开始解析
  if (phase === 'idle' && file) {
    return (
      <GlassCard variant="subtle" size="lg" className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="size-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">准备就绪</h3>
        <p className="text-sm text-muted-foreground mb-1">
          文件：<span className="font-medium text-foreground">{file.name}</span>
        </p>
        <p className="text-xs text-muted-foreground mb-5">
          {(file.size / 1024).toFixed(1)} KB
        </p>
        <Button onClick={startParse} size="lg" className="gap-2">
          <Sparkles className="size-4" />
          开始智能识别
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* 进度步骤 */}
      {(phase === 'parsing' || phase === 'recognizing' || phase === 'done') && (
        <GlassCard variant="subtle" size="md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              识别进度
            </h3>
            {phase === 'done' && (
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                完成
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`size-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      step.status === 'done'
                        ? 'bg-success text-success-foreground'
                        : step.status === 'active'
                          ? 'bg-primary text-primary-foreground animate-pulse'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.status === 'done' ? (
                      <Check className="size-4" />
                    ) : step.status === 'active' ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      step.status === 'done' || step.status === 'active'
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                      step.status === 'done' ? 'bg-success/60' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          {progressText && (
            <p className="text-xs text-muted-foreground mt-3">{progressText}</p>
          )}
        </GlassCard>
      )}

      {/* 错误状态 */}
      {phase === 'error' && (
        <GlassCard variant="subtle" size="md" className="border-destructive/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <X className="size-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-destructive">解析失败</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{progressText}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPhase('idle')}>
              重试
            </Button>
          </div>
        </GlassCard>
      )}

      {/* 识别结果统计 + 操作 */}
      {phase === 'done' && questions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-background/60 text-foreground">
              共 {questions.length} 题
            </Badge>
            {Object.entries(stats).map(
              ([type, count]) =>
                count > 0 && (
                  <Badge
                    key={type}
                    variant="outline"
                    className={`${TYPE_COLORS[type]} bg-opacity-50`}
                  >
                    {TYPE_LABELS[type]} {count}
                  </Badge>
                ),
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1.5">
              <Plus className="size-4" />
              新增题目
            </Button>
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Save className="size-4" />
                  确认导入
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>导入题库</DialogTitle>
                  <DialogDescription>
                    将识别到的 {questions.length} 道题目导入为新题库
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      题库名称 <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="请输入题库名称"
                    />
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {Object.entries(stats).map(
                      ([type, count]) =>
                        count > 0 && (
                          <div
                            key={type}
                            className="rounded-lg bg-muted/50 p-2"
                          >
                            <div className="text-lg font-bold text-foreground">
                              {count}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {TYPE_LABELS[type]}
                            </div>
                          </div>
                        ),
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setImportDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleImport} disabled={importing || !bankName.trim()}>
                    {importing && <Loader2 className="size-4 mr-2 animate-spin" />}
                    {importing ? '导入中...' : '确认导入'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {/* 题目列表 */}
      {phase === 'done' && questions.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <AnimatePresence initial={false}>
            {questions.map((q, idx) => {
              const isExpanded = expandedId === q.id;
              const isEditing = editingId === q.id;
              const displayQ = isEditing && editDraft ? editDraft : q;

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.3) }}
                >
                  <Card className="border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-md">
                    <CardHeader className="p-4 pb-3 cursor-pointer" onClick={() => !isEditing && toggleExpand(q.id)}>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono text-muted-foreground w-6 text-center">
                            {idx + 1}
                          </span>
                          <Badge
                            variant="outline"
                            className={`${TYPE_COLORS[q.type]} text-[11px] py-0 h-5`}
                          >
                            {TYPE_LABELS[q.type]}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                            {displayQ.stem || <span className="text-muted-foreground italic">（空题干）</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 hover:bg-primary/10 hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(q);
                                }}
                                aria-label="编辑"
                              >
                                <Edit3 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteQuestion(q.id);
                                }}
                                aria-label="删除"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                              {isExpanded ? (
                                <ChevronUp className="size-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="size-4 text-muted-foreground" />
                              )}
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 hover:bg-success/10 hover:text-success"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveEdit();
                                }}
                                aria-label="保存"
                              >
                                <Check className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEdit();
                                }}
                                aria-label="取消"
                              >
                                <X className="size-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {q.chapter && (
                        <div className="mt-2 pl-8">
                          <span className="text-[11px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                            {q.chapter}
                          </span>
                        </div>
                      )}
                    </CardHeader>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="overflow-hidden"
                        >
                          <CardContent className="p-4 pt-0 space-y-4">
                            {isEditing ? (
                              // 编辑模式
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="space-y-1.5 flex-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      题型
                                    </label>
                                    <Select
                                      value={editDraft?.type}
                                      onValueChange={(v) =>
                                        updateEditDraftField(
                                          'type',
                                          v as IQuestion['type'],
                                        )
                                      }
                                    >
                                      <SelectTrigger className="h-9">
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
                                  <div className="space-y-1.5 flex-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      章节
                                    </label>
                                    <Input
                                      className="h-9"
                                      value={editDraft?.chapter || ''}
                                      onChange={(e) =>
                                        updateEditDraftField('chapter', e.target.value)
                                      }
                                      placeholder="章节名称"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-muted-foreground">
                                    题干
                                  </label>
                                  <Textarea
                                    value={editDraft?.stem || ''}
                                    onChange={(e) =>
                                      updateEditDraftField('stem', e.target.value)
                                    }
                                    placeholder="请输入题目内容"
                                    rows={3}
                                  />
                                </div>

                                {(editDraft?.type === 'single' ||
                                  editDraft?.type === 'multiple') && (
                                  <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      选项
                                    </label>
                                    <div className="space-y-2">
                                      {editDraft?.options?.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-muted-foreground w-5 shrink-0 text-center">
                                            {opt.key}
                                          </span>
                                          <Input
                                            className="h-9"
                                            value={opt.content}
                                            onChange={(e) => updateOption(i, e.target.value)}
                                            placeholder={`选项 ${opt.key} 内容`}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-muted-foreground">
                                    正确答案
                                  </label>
                                  {editDraft?.type === 'multiple' ? (
                                    <Input
                                      className="h-9"
                                      value={
                                        Array.isArray(editDraft?.answer)
                                          ? (editDraft.answer as string[]).join('')
                                          : String(editDraft?.answer || '')
                                      }
                                      onChange={(e) =>
                                        updateEditDraftField(
                                          'answer',
                                          e.target.value.toUpperCase().split('').filter(Boolean),
                                        )
                                      }
                                      placeholder="如：ABC"
                                    />
                                  ) : editDraft?.type === 'judge' ? (
                                    <Select
                                      value={String(editDraft?.answer || '正确')}
                                      onValueChange={(v) =>
                                        updateEditDraftField('answer', v)
                                      }
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="正确">正确</SelectItem>
                                        <SelectItem value="错误">错误</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      className="h-9"
                                      value={String(editDraft?.answer || '')}
                                      onChange={(e) =>
                                        updateEditDraftField('answer', e.target.value)
                                      }
                                      placeholder="正确答案"
                                    />
                                  )}
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-muted-foreground">
                                    解析
                                  </label>
                                  <Textarea
                                    value={editDraft?.analysis || ''}
                                    onChange={(e) =>
                                      updateEditDraftField('analysis', e.target.value)
                                    }
                                    placeholder="答案解析（选填）"
                                    rows={2}
                                  />
                                </div>
                              </div>
                            ) : (
                              // 预览模式
                              <div className="space-y-3 pl-8">
                                {displayQ.options && displayQ.options.length > 0 && (
                                  <div className="space-y-2">
                                    {displayQ.options.map((opt) => (
                                      <div
                                        key={opt.key}
                                        className="flex items-start gap-2.5 text-sm"
                                      >
                                        <span className="size-5 shrink-0 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground mt-0.5">
                                          {opt.key}
                                        </span>
                                        <span className="text-foreground/90 leading-relaxed">
                                          {opt.content}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="rounded-xl bg-success/5 border border-success/15 p-3">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <Badge
                                      variant="outline"
                                      className="bg-success/10 text-success border-success/20 text-[11px] h-5"
                                    >
                                      正确答案
                                    </Badge>
                                  </div>
                                  <p className="text-sm font-medium text-success-foreground dark:text-success">
                                    {Array.isArray(displayQ.answer)
                                      ? displayQ.answer.join('、')
                                      : displayQ.answer}
                                  </p>
                                </div>

                                {displayQ.analysis && (
                                  <div className="rounded-xl bg-primary/5 border border-primary/15 p-3">
                                    <div className="text-xs font-medium text-primary mb-1.5">
                                      解析
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                      {displayQ.analysis}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 解析中 loading 占位 */}
      {(phase === 'parsing' || phase === 'recognizing') && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
          <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{progressText}</p>
            <p className="text-xs text-muted-foreground mt-1">请稍候，这可能需要几秒钟</p>
          </div>
        </div>
      )}
    </div>
  );
}
