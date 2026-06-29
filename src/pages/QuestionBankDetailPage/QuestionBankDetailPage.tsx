import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Search,
  BookOpen,
  FileText,
  Target,
  TrendingUp,
  Plus,
  Filter,
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
import { useBankStore } from '@/store/bank-store';
import GlassCard from '@/components/GlassCard';
import ChapterSidebarSection from './sections/ChapterSidebarSection';
import QuestionListSection from './sections/QuestionListSection';
import PracticeSettingsDialog from '@/components/PracticeSettingsDialog';
import { MOCK_CHAPTERS, MOCK_QUESTIONS } from '@/data/question-bank-detail-page';
import type { IQuestion } from '@/data/question-bank-detail-page';
import { cn } from '@/lib/utils';

export default function QuestionBankDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings, updateSettings, currentBank, banks } = useBankStore();

  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // 使用 mock 数据作为当前题库题目（实际项目中从 store 获取）
  const questions = useMemo(() => MOCK_QUESTIONS, []);
  const chapters = useMemo(() => MOCK_CHAPTERS, []);

  const bankInfo = useMemo(() => {
    if (currentBank && currentBank.id === id) {
      return currentBank;
    }
    const found = banks.find((b) => b.id === id);
    if (found) return found;
    // Fallback mock info
    return {
      id: id || 'mock-bank-1',
      name: '计算机基础通关题库',
      description: '涵盖操作系统、计算机网络、数据结构等核心考点，适合备考复习',
      questionCount: questions.length,
      chapters: chapters.map((c) => c.name),
      createdAt: Date.now(),
      lastPracticeAt: Date.now() - 86400000 * 2,
      correctRate: 0.72,
      source: 'mock' as const,
      questions: questions as unknown as typeof questions & { source: string; createdAt: number }[],
    };
  }, [id, currentBank, banks, questions, chapters]);

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

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // 章节筛选
      if (selectedChapter !== 'all') {
        const chapter = chapters.find((c) => c.id === selectedChapter);
        if (chapter && q.chapter !== chapter.name) return false;
      }
      // 关键词搜索
      if (searchKeyword && !q.stem.includes(searchKeyword)) {
        return false;
      }
      // 状态筛选
      if (statusFilter !== 'all' && q.status !== statusFilter) {
        return false;
      }
      // 题型筛选
      if (typeFilter !== 'all' && q.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [questions, selectedChapter, searchKeyword, statusFilter, typeFilter, chapters]);

  const stats = useMemo(() => {
    const total = questions.length;
    const correct = questions.filter((q) => q.status === 'correct').length;
    const wrong = questions.filter((q) => q.status === 'wrong').length;
    const unattempted = questions.filter((q) => q.status === 'unattempted').length;
    const rate = total > 0 ? Math.round((correct / (correct + wrong || 1)) * 100) : 0;
    return { total, correct, wrong, unattempted, rate };
  }, [questions]);

  const handleStartPractice = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleStartFromSettings = useCallback(() => {
    if (id) {
      navigate(`/practice/${id}`);
    }
  }, [id, navigate]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Top bar */}
      <div className="sticky top-0 z-40 w-full border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="size-9 rounded-full hover:bg-accent/60 shrink-0"
            aria-label="返回"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-bold text-foreground truncate">
              {bankInfo.name}
            </h1>
            <p className="text-xs text-muted-foreground hidden md:block truncate">
              {bankInfo.description}
            </p>
          </div>
          <Button
            onClick={handleStartPractice}
            className="shrink-0 gap-1.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 transition-all"
          >
            <Play className="size-4 fill-current" />
            <span className="hidden sm:inline">开始刷题</span>
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
        >
          <StatCard
            icon={BookOpen}
            label="题目总数"
            value={stats.total}
            color="from-primary/20 to-primary/5"
            iconColor="text-primary"
          />
          <StatCard
            icon={Target}
            label="已做对"
            value={stats.correct}
            color="from-success/20 to-success/5"
            iconColor="text-success"
          />
          <StatCard
            icon={TrendingUp}
            label="正确率"
            value={`${stats.rate}%`}
            color="from-chart-2/20 to-chart-2/5"
            iconColor="text-chart-2"
          />
          <StatCard
            icon={FileText}
            label="章节数"
            value={chapters.length}
            color="from-chart-5/20 to-chart-5/5"
            iconColor="text-chart-5"
          />
        </motion.div>

        {/* Main content: sidebar + list */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Chapter sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-1 order-2 lg:order-1"
          >
            <div className="lg:sticky lg:top-24">
              <ChapterSidebarSection
                chapters={chapters}
                selectedChapter={selectedChapter}
                onSelectChapter={setSelectedChapter}
                totalQuestions={stats.total}
              />
            </div>
          </motion.div>

          {/* Right: Question list */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3 order-1 lg:order-2 space-y-4"
          >
            {/* Search & filter bar */}
            <GlassCard size="sm" variant="default" className="!p-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="搜索题目关键词..."
                    className="pl-9 bg-background/50 border-border/40 rounded-xl"
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[110px] bg-background/50 border-border/40 rounded-xl">
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
                    <SelectTrigger className="w-[110px] bg-background/50 border-border/40 rounded-xl">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="correct">已做对</SelectItem>
                      <SelectItem value="wrong">已做错</SelectItem>
                      <SelectItem value="unattempted">未做</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </GlassCard>

            {/* Result info */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="size-4" />
                <span>
                  共 <span className="font-semibold text-foreground">{filteredQuestions.length}</span> 道题目
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs rounded-lg"
                onClick={handleStartPractice}
              >
                <Plus className="size-3.5" />
                新增题目
              </Button>
            </div>

            {/* Question list */}
            <QuestionListSection
              questions={filteredQuestions}
              searchKeyword={searchKeyword}
            />
          </motion.div>
        </div>
      </main>

      {/* Practice settings dialog */}
      <PracticeSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={updateSettings}
        onStart={handleStartFromSettings}
        totalCount={stats.total}
        typeCounts={typeCounts as Record<'single' | 'multiple' | 'judge' | 'fill' | 'essay', number>}
      />
    </div>
  );
}

// ---------- Stat Card ----------

interface StatCardProps {
  icon: typeof BookOpen;
  label: string;
  value: number | string;
  color: string;
  iconColor: string;
}

function StatCard({ icon: Icon, label, value, color, iconColor }: StatCardProps) {
  return (
    <GlassCard size="sm" variant="default" hoverable className="!p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'size-11 rounded-xl flex items-center justify-center bg-gradient-to-br',
            color,
          )}
        >
          <Icon className={cn('size-5', iconColor)} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className="text-xl font-bold text-foreground tabular-nums tracking-tight">
            {value}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
