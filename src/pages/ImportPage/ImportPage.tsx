import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Sparkles,
  FileCheck,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  FolderPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useBankStore, type IQuestionBank } from '@/store/bank-store';
import {
  parseQuestionsFromText,
  normalizeQuestion,
  type IQuestionRaw,
} from '@/lib/question-parser';
import type { IQuestion } from '@/data/mockbank';
import { MOCK_IMPORT_PAGES } from '@/data/import-page';
import { capabilityClient } from '@lark-apaas/client-toolkit-lite';

type ParseStep = 'idle' | 'uploading' | 'parsing' | 'recognizing' | 'done' | 'error';

const TYPE_LABELS: Record<IQuestionRaw['type'], string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题',
  fill: '填空题',
  essay: '问答题',
};

const TYPE_COLORS: Record<IQuestionRaw['type'], string> = {
  single: 'bg-primary/10 text-primary border-primary/20',
  multiple: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  judge: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
  fill: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  essay: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
};

const PARSE_STEPS = [
  { key: 'uploading', label: '上传文件', icon: Upload },
  { key: 'parsing', label: '文档解析', icon: FileText },
  { key: 'recognizing', label: '题目识别', icon: Sparkles },
  { key: 'done', label: '识别完成', icon: FileCheck },
];

export default function ImportPage() {
  const navigate = useNavigate();
  const { addBank, banks, addQuestionsToBank, setCurrentBankId } = useBankStore();
  const pageData = MOCK_IMPORT_PAGES[0];

  const [step, setStep] = useState<ParseStep>('idle');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<IQuestionRaw[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<IQuestionRaw | null>(null);
  const [bankName, setBankName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>('preview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chapters = useMemo(() => {
    const set = new Set(questions.map((q) => q.chapter).filter(Boolean));
    return Array.from(set);
  }, [questions]);

  const typeCounts = useMemo(() => {
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

  const currentStepIndex = useMemo(() => {
    const idx = PARSE_STEPS.findIndex((s) => s.key === step);
    return idx >= 0 ? idx : -1;
  }, [step]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validExts = ['.doc', '.docx', '.pdf'];
      const nameLower = file.name.toLowerCase();
      const isValid = validExts.some((ext) => nameLower.endsWith(ext));

      if (!isValid) {
        toast.error('不支持的文件格式', {
          description: '请上传 .doc、.docx 或 .pdf 格式的文件',
        });
        return;
      }

      setFileName(file.name);
      setFileSize(formatFileSize(file.size));
      setStep('uploading');
      setProgress(10);

      try {
        // Step 1: Upload & parse document
        setStep('parsing');
        setProgress(30);

        let docText = '';

        try {
          // Try real plugin first
          const parseResult = await capabilityClient
            .load('doc_parser_for_question_recognition_1')
            .call('parseDocToMarkdown', {
              document_file: [file],
            });
          docText = (parseResult as { content?: string })?.content || '';
          logger.info('Document parsed successfully, length:', String(docText.length));
        } catch (pluginErr) {
          logger.warn('Plugin parse failed, fallback to text extraction:', String(pluginErr));
          // Fallback: try to read as text for .txt-like files
          docText = await fallbackReadText(file);
        }

        if (!docText || docText.trim().length < 10) {
          throw new Error('文档内容为空或无法解析');
        }

        setProgress(55);
        setStep('recognizing');

        // Step 2: Try AI question extraction
        let extractedQuestions: IQuestionRaw[] = [];

        const callAiRecognition = async (text: string) => {
          const aiResult = await capabilityClient
            .load('question_intelligent_recognition_1')
            .call('textToJson', {
              document_text: text,
            });
          const aiData = aiResult as { question_list?: Array<Record<string, unknown>> };
          if (aiData?.question_list && Array.isArray(aiData.question_list)) {
            return aiData.question_list.map((item, idx) => ({
              type: (item.type as IQuestionRaw['type']) || 'single',
              stem: String(item.stem || ''),
              options: Array.isArray(item.options)
                ? (item.options as string[]).map((opt, i) => ({
                    key: String.fromCharCode(65 + i),
                    content: opt,
                  }))
                : [],
              answer: (item.answer as string | string[]) || '',
              analysis: String(item.analysis || ''),
              chapter: String(item.chapter || '未分类'),
            }));
          }
          return [];
        };

        try {
          // 截断文本避免超出模型上下文限制（约 8000 字符 ≈ 2000 tokens）
          const truncatedText =
            docText.length > 8000 ? docText.slice(0, 8000) : docText;
          logger.info(
            'Calling AI recognition, text length:',
            String(truncatedText.length),
          );

          let aiList: IQuestionRaw[] = [];
          // 最多重试 2 次
          for (let attempt = 0; attempt < 2 && aiList.length === 0; attempt++) {
            try {
              aiList = await callAiRecognition(truncatedText);
              if (aiList.length > 0) break;
            } catch (retryErr) {
              logger.warn(
                `AI recognition attempt ${attempt + 1} failed:`,
                String(retryErr),
              );
              if (attempt === 1) throw retryErr;
              // 第一次失败后稍等再重试
              await new Promise((r) => setTimeout(r, 800));
            }
          }

          if (aiList.length > 0) {
            extractedQuestions = aiList;
            logger.info(
              'AI extracted questions:',
              String(extractedQuestions.length),
            );
          }
        } catch (aiErr) {
          logger.warn('AI recognition failed, using regex fallback:', String(aiErr));
        }

        // Fallback to regex parser if AI didn't return results
        if (extractedQuestions.length === 0) {
          extractedQuestions = parseQuestionsFromText(docText);
          logger.info(
            'Regex fallback parsed questions:',
            String(extractedQuestions.length),
          );
        }

        if (extractedQuestions.length === 0) {
          throw new Error('未能从文档中识别出题目，请检查文档格式');
        }

        setQuestions(extractedQuestions);
        setBankName(file.name.replace(/\.[^.]+$/, '') + '题库');
        setProgress(100);
        setStep('done');

        toast.success('识别完成', {
          description: `成功识别 ${extractedQuestions.length} 道题目`,
        });
      } catch (err) {
        logger.error('Import failed:', String(err));
        setStep('error');
        toast.error('识别失败', {
          description: err instanceof Error ? err.message : '请稍后重试',
        });
      }
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleReset = useCallback(() => {
    setStep('idle');
    setFileName('');
    setFileSize('');
    setProgress(0);
    setQuestions([]);
    setEditingIndex(null);
    setEditForm(null);
    setBankName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleEditQuestion = useCallback((index: number) => {
    setEditingIndex(index);
    setEditForm({ ...questions[index] });
    setActiveTab('edit');
  }, [questions]);

  const handleSaveEdit = useCallback(() => {
    if (editingIndex === null || !editForm) return;
    setQuestions((prev) =>
      prev.map((q, i) => (i === editingIndex ? editForm : q)),
    );
    setEditingIndex(null);
    setEditForm(null);
    setActiveTab('preview');
    toast.success('已保存修改');
  }, [editingIndex, editForm]);

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditForm(null);
    setActiveTab('preview');
  }, []);

  const handleDeleteQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    toast.success('已删除该题');
  }, []);

  const handleAddQuestion = useCallback(() => {
    const newQ: IQuestionRaw = {
      type: 'single',
      stem: '',
      options: [
        { key: 'A', content: '' },
        { key: 'B', content: '' },
        { key: 'C', content: '' },
        { key: 'D', content: '' },
      ],
      answer: 'A',
      analysis: '',
      chapter: chapters[0] || '未分类',
    };
    setQuestions((prev) => [...prev, newQ]);
    setEditingIndex(questions.length);
    setEditForm(newQ);
    setActiveTab('edit');
  }, [chapters, questions.length]);

  const handleConfirmImport = useCallback(() => {
    if (questions.length === 0) {
      toast.error('没有可导入的题目');
      return;
    }
    setShowCreateDialog(true);
  }, [questions.length]);

  const handleCreateBank = useCallback(() => {
    if (!bankName.trim()) {
      toast.error('请输入题库名称');
      return;
    }

    const bankId = `bank-${Date.now()}`;
    const normalizedQuestions: IQuestion[] = questions.map((q, i) =>
      normalizeQuestion(q, i, bankId),
    );

    const chapterSet = new Set(
      normalizedQuestions.map((q) => q.chapter).filter(Boolean),
    );

    const newBank: IQuestionBank = {
      id: bankId,
      name: bankName.trim(),
      description: `从 ${fileName} 导入，共 ${normalizedQuestions.length} 道题`,
      questionCount: normalizedQuestions.length,
      chapters: Array.from(chapterSet),
      createdAt: Date.now(),
      source: 'imported',
      questions: normalizedQuestions,
    };

    addBank(newBank);
    setCurrentBankId(bankId);
    setShowCreateDialog(false);

    toast.success('导入成功', {
      description: `题库「${bankName}」已创建，共 ${normalizedQuestions.length} 道题`,
    });

    navigate(`/bank/${bankId}`);
  }, [bankName, questions, fileName, addBank, setCurrentBankId, navigate]);

  const handleAppendToBank = useCallback(
    (bankId: string) => {
      const bank = banks.find((b) => b.id === bankId);
      if (!bank) return;

      const normalizedQuestions: IQuestion[] = questions.map((q, i) =>
        normalizeQuestion(q, i, bankId),
      );

      addQuestionsToBank(bankId, normalizedQuestions);
      setShowCreateDialog(false);
      setCurrentBankId(bankId);

      toast.success('追加成功', {
        description: `已向「${bank.name}」追加 ${normalizedQuestions.length} 道题`,
      });

      navigate(`/bank/${bankId}`);
    },
    [banks, questions, addQuestionsToBank, setCurrentBankId, navigate],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4 mr-1" />
            返回题库
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            智能题目识别
          </h1>
          <p className="text-muted-foreground mt-2">
            上传 Word 或 PDF 文档，AI 自动识别题目并转换为在线答题形式
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div
              className={cn(
                'relative overflow-hidden rounded-3xl',
                'bg-white/60 dark:bg-foreground/5 backdrop-blur-xl backdrop-saturate-150',
                'border border-white/50 dark:border-white/10',
                'shadow-[0_8px_32px_rgba(31_38_135_0.07)]',
              )}
            >
              {/* Glow */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

              <div className="relative z-10 p-6">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {pageData.uploadTitle}
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  {pageData.uploadSubtitle}
                </p>

                {/* Upload Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300',
                    'flex flex-col items-center justify-center py-10 px-6',
                    isDragging
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : 'border-border/60 hover:border-primary/50 hover:bg-primary/[0.03]',
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx,.pdf"
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <motion.div
                    animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={cn(
                      'size-16 rounded-2xl flex items-center justify-center mb-4',
                      'bg-gradient-to-br from-primary/20 to-secondary/20',
                      'shadow-lg shadow-primary/10',
                    )}
                  >
                    <Upload className="size-7 text-primary" />
                  </motion.div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    点击或拖拽文件到此处上传
                  </p>
                  <p className="text-xs text-muted-foreground">
                    支持 {pageData.supportedFormats.join('、')} 格式
                  </p>
                </div>

                {/* File Info */}
                <AnimatePresence>
                  {fileName && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-border/30">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="size-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">{fileSize}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                          }}
                          className="size-8 rounded-full shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Steps */}
                <AnimatePresence>
                  {step !== 'idle' && step !== 'error' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-5"
                    >
                      <Progress value={progress} className="h-1.5 mb-4" />
                      <div className="flex items-center justify-between">
                        {PARSE_STEPS.map((s, i) => {
                          const Icon = s.icon;
                          const isActive = i <= currentStepIndex;
                          const isCurrent = i === currentStepIndex;
                          return (
                            <div key={s.key} className="flex flex-col items-center gap-1.5 flex-1">
                              <div
                                className={cn(
                                  'size-8 rounded-full flex items-center justify-center transition-all duration-300',
                                  isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'bg-muted text-muted-foreground',
                                  isCurrent && 'ring-4 ring-primary/20',
                                )}
                              >
                                {isActive && i === currentStepIndex && step !== 'done' ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : isActive ? (
                                  <CheckCircle2 className="size-4" />
                                ) : (
                                  <Icon className="size-4" />
                                )}
                              </div>
                              <span
                                className={cn(
                                  'text-[11px] font-medium transition-colors',
                                  isActive ? 'text-foreground' : 'text-muted-foreground',
                                )}
                              >
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error State */}
                <AnimatePresence>
                  {step === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-5 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive">识别失败</p>
                          <p className="text-xs text-destructive/70 mt-1">
                            请检查文件格式是否正确，或稍后重试
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleReset}
                            className="mt-3"
                          >
                            重新上传
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Format Tips */}
                <div className="mt-6 pt-5 border-t border-border/30">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    文档格式说明
                  </h3>
                  <ul className="space-y-2">
                    {pageData.formatTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5 text-success shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div
              className={cn(
                'relative overflow-hidden rounded-3xl h-full',
                'bg-white/60 dark:bg-foreground/5 backdrop-blur-xl backdrop-saturate-150',
                'border border-white/50 dark:border-white/10',
                'shadow-[0_8px_32px_rgba(31_38_135_0.07)]',
              )}
            >
              {/* Glow */}
              <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

              <div className="relative z-10">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-border/30 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      识别结果
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {questions.length > 0
                        ? `共识别 ${questions.length} 道题目，${chapters.length} 个章节`
                        : '上传文档后自动识别题目'}
                    </p>
                  </div>
                  {questions.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddQuestion}
                        className="gap-1.5"
                      >
                        <Plus className="size-4" />
                        新增题目
                      </Button>
                      <Button size="sm" onClick={handleConfirmImport} className="gap-1.5">
                        <Save className="size-4" />
                        确认导入
                      </Button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                {questions.length > 0 && (
                  <div className="px-6 py-4 border-b border-border/20 flex flex-wrap gap-2">
                    {Object.entries(typeCounts).map(([type, count]) => {
                      if (count === 0) return null;
                      return (
                        <Badge
                          key={type}
                          variant="outline"
                          className={cn(
                            'px-3 py-1 text-xs font-medium rounded-full',
                            TYPE_COLORS[type as IQuestionRaw['type']],
                          )}
                        >
                          {TYPE_LABELS[type as IQuestionRaw['type']]} {count}
                        </Badge>
                      );
                    })}
                  </div>
                )}

                {/* Tabs */}
                {questions.length > 0 && (
                  <div className="px-6 pt-4">
                    <Tabs
                      value={activeTab}
                      onValueChange={(v) => setActiveTab(v as 'preview' | 'edit')}
                    >
                      <TabsList className="bg-muted/50">
                        <TabsTrigger value="preview">预览列表</TabsTrigger>
                        <TabsTrigger value="edit" disabled={editingIndex === null}>
                          编辑题目
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="size-20 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-5">
                        <FileText className="size-10 text-primary/40" />
                      </div>
                      <h3 className="text-base font-medium text-foreground mb-2">
                        暂无识别结果
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        上传 Word 或 PDF 文档后，系统将自动识别其中的题目
                      </p>
                    </div>
                  ) : activeTab === 'preview' ? (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {questions.map((q, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          className={cn(
                            'group relative rounded-2xl border transition-all duration-200',
                            'bg-card/40 hover:bg-card/70 border-border/40 hover:border-primary/30',
                            'p-4 hover:shadow-md',
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="size-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'px-2.5 py-0.5 text-[11px] font-medium rounded-full',
                                    TYPE_COLORS[q.type],
                                  )}
                                >
                                  {TYPE_LABELS[q.type]}
                                </Badge>
                                {q.chapter && (
                                  <span className="text-[11px] text-muted-foreground">
                                    {q.chapter}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                                {q.stem || '(题干为空)'}
                              </p>
                              {q.options && q.options.length > 0 && (
                                <div className="mt-2 grid grid-cols-2 gap-1.5">
                                  {q.options.slice(0, 4).map((opt) => (
                                    <div
                                      key={opt.key}
                                      className="text-xs text-muted-foreground truncate"
                                    >
                                      <span className="font-medium text-foreground/70">
                                        {opt.key}.
                                      </span>{' '}
                                      {opt.content}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditQuestion(index)}
                                className="size-8 rounded-full hover:bg-primary/10 hover:text-primary"
                                aria-label="编辑"
                              >
                                <Edit3 className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteQuestion(index)}
                                className="size-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                aria-label="删除"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* Edit Form */
                    <div className="space-y-5">
                      {editForm && (
                        <>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
                              编辑第 {editingIndex !== null ? editingIndex + 1 : 0} 题
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                                取消
                              </Button>
                              <Button size="sm" onClick={handleSaveEdit} className="gap-1.5">
                                <Save className="size-4" />
                                保存
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-foreground">
                                题型
                              </label>
                              <Select
                                value={editForm.type}
                                onValueChange={(v) =>
                                  setEditForm({
                                    ...editForm,
                                    type: v as IQuestionRaw['type'],
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-foreground">
                                所属章节
                              </label>
                              <Select
                                value={editForm.chapter}
                                onValueChange={(v) =>
                                  setEditForm({ ...editForm, chapter: v })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {chapters.map((ch) => (
                                    <SelectItem key={ch} value={ch}>
                                      {ch}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="未分类">未分类</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">
                              题干
                            </label>
                            <Textarea
                              value={editForm.stem}
                              onChange={(e) =>
                                setEditForm({ ...editForm, stem: e.target.value })
                              }
                              placeholder="请输入题目内容"
                              className="min-h-[80px] resize-y"
                            />
                          </div>

                          {(editForm.type === 'single' || editForm.type === 'multiple') && (
                            <div className="space-y-2">
                              <label className="text-xs font-medium text-foreground">
                                选项
                              </label>
                              <div className="space-y-2">
                                {(editForm.options || []).map((opt, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <div className="size-8 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                                      {opt.key}
                                    </div>
                                    <Input
                                      value={opt.content}
                                      onChange={(e) => {
                                        const newOpts = [...(editForm.options || [])];
                                        newOpts[i] = { ...opt, content: e.target.value };
                                        setEditForm({ ...editForm, options: newOpts });
                                      }}
                                      placeholder={`选项 ${opt.key}`}
                                      className="flex-1"
                                    />
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const opts = editForm.options || [];
                                    const nextKey = String.fromCharCode(65 + opts.length);
                                    if (opts.length < 8) {
                                      setEditForm({
                                        ...editForm,
                                        options: [...opts, { key: nextKey, content: '' }],
                                      });
                                    }
                                  }}
                                  className="w-full"
                                >
                                  <Plus className="size-4 mr-1" />
                                  添加选项
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">
                              正确答案
                              <span className="text-muted-foreground font-normal ml-2">
                                {editForm.type === 'multiple'
                                  ? '多选题用逗号分隔多个选项，如 A,B,C'
                                  : editForm.type === 'judge'
                                    ? '请输入「正确」或「错误」'
                                    : '请输入正确答案'}
                              </span>
                            </label>
                            <Input
                              value={
                                Array.isArray(editForm.answer)
                                  ? editForm.answer.join(',')
                                  : editForm.answer
                              }
                              onChange={(e) => {
                                let val: string | string[] = e.target.value;
                                if (editForm.type === 'multiple') {
                                  val = val
                                    .split(/[,，、\s]+/)
                                    .map((s) => s.trim().toUpperCase())
                                    .filter(Boolean);
                                }
                                setEditForm({ ...editForm, answer: val });
                              }}
                              placeholder="请输入正确答案"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-foreground">
                              答案解析
                            </label>
                            <Textarea
                              value={editForm.analysis || ''}
                              onChange={(e) =>
                                setEditForm({ ...editForm, analysis: e.target.value })
                              }
                              placeholder="请输入答案解析（选填）"
                              className="min-h-[80px] resize-y"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Create Bank Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 border-0 bg-transparent shadow-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative overflow-hidden rounded-3xl',
              'bg-white/80 dark:bg-foreground/5 backdrop-blur-2xl backdrop-saturate-150',
              'border border-white/50 dark:border-white/10',
              'shadow-[0_24px_80px_-12px_rgba(31_38_135_0.15)]',
            )}
          >
            <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative z-10">
              <DialogHeader className="px-7 pt-7 pb-4 border-b border-border/30">
                <DialogTitle className="text-xl font-bold">导入题库</DialogTitle>
              </DialogHeader>
              <div className="px-7 py-5 space-y-5">
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

                <div className="p-4 rounded-xl bg-accent/30 border border-border/30">
                  <p className="text-sm font-medium text-foreground mb-1">
                    本次导入 {questions.length} 道题目
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Object.entries(typeCounts).map(([type, count]) => {
                      if (count === 0) return null;
                      return (
                        <Badge
                          key={type}
                          variant="outline"
                          className={cn(
                            'text-[11px]',
                            TYPE_COLORS[type as IQuestionRaw['type']],
                          )}
                        >
                          {TYPE_LABELS[type as IQuestionRaw['type']]} {count}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {banks.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      或追加到已有题库
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {banks.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => handleAppendToBank(bank.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card/30 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group"
                        >
                          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FolderPlus className="size-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {bank.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {bank.questionCount} 道题
                            </p>
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="px-7 pb-7 pt-2 border-t border-border/30">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  取消
                </Button>
                <Button onClick={handleCreateBank} className="gap-1.5">
                  <Plus className="size-4" />
                  创建新题库
                </Button>
              </DialogFooter>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function fallbackReadText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      resolve(text);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
