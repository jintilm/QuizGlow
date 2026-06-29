import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Pencil,
  ClipboardList,
  Swords,
  RefreshCw,
  Search,
  Repeat,
  FolderPlus,
  Share2,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  BookOpen,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MOCK_HOME_FEATURES, MOCK_HOME_BANKS } from '@/data/home-page';
import { cn } from '@/lib/utils';

const FEATURE_ICONS: Record<string, typeof Pencil> = {
  Pencil,
  Clipboard: ClipboardList,
  Swords,
  Refresh: RefreshCw,
  Search,
  Repeat,
  FolderPlus,
  Share: Share2,
};

export default function HomePage() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const handleFeatureClick = (action: string) => {
    switch (action) {
      case 'practice':
      case 'exam':
      case 'challenge':
      case 'reset':
        navigate('/bank/mock-bank-1');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'update':
        navigate('/import?mode=update');
        break;
      case 'create':
        navigate('/import');
        break;
      case 'share':
        toast.info('题库分享功能即将上线');
        break;
      default:
        break;
    }
  };

  const handleBankClick = (bankId: string) => {
    navigate(`/bank/${bankId}`);
  };

  const totalQuestions = useMemo(
    () => MOCK_HOME_BANKS.reduce((sum, b) => sum + b.questionCount, 0),
    [],
  );

  return (
    <div className="min-h-screen">
      <main className="relative z-10 space-y-12 md:space-y-16 pb-20 md:pb-12">
        {/* Hero 区域 */}
        <section className="w-full pt-10 md:pt-16">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="relative overflow-hidden rounded-[2rem] bg-white border border-border shadow-sm"
            >
              {/* 装饰光晕 */}
              <div className="pointer-events-none absolute -top-32 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-chart-3/10 blur-[80px]" />

              <div className="relative z-10 px-6 py-10 md:px-12 md:py-16 lg:py-20">
                <div className="max-w-3xl">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background mb-6"
                  >
                    <Sparkles className="size-4 text-primary" />
                    <span>AI 智能识别 · 一键生成题库</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.6 }}
                    className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15] mb-5"
                  >
                    智能题库识别
                    <br />
                    <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-4 bg-clip-text text-transparent">
                      高效刷题备考
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-2xl"
                  >
                    上传 Word/PDF 文档，AI 自动识别题目并转换为在线答题形式。
                    支持单选、多选、判断、填空、问答五种题型，多种刷题模式助你高效备考。
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className="flex flex-wrap items-center gap-3"
                  >
                    <Button
                      size="lg"
                      onClick={() => navigate('/import')}
                      className="h-12 px-7 text-base font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <Upload className="size-5 mr-2" />
                      上传文档创建题库
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate('/bank/mock-bank-1')}
                      className="h-12 px-7 text-base font-medium rounded-full border-border bg-white hover:bg-muted transition-all duration-300"
                    >
                      <BookOpen className="size-5 mr-2" />
                      立即开始刷题
                    </Button>
                  </motion.div>

                  {/* 统计数据 */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-dashed border-border/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-muted flex items-center justify-center">
                        <BookOpen className="size-5 text-foreground" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground tabular-nums">
                          {MOCK_HOME_BANKS.length}
                        </div>
                        <div className="text-xs text-muted-foreground">题库数量</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-muted flex items-center justify-center">
                        <TrendingUp className="size-5 text-chart-4" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground tabular-nums">
                          {totalQuestions}
                        </div>
                        <div className="text-xs text-muted-foreground">题目总数</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-muted flex items-center justify-center">
                        <Clock className="size-5 text-chart-3" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground tabular-nums">
                          5
                        </div>
                        <div className="text-xs text-muted-foreground">题型支持</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 8 功能入口网格 */}
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-6"
            >
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  功能中心
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  多种刷题模式，满足不同学习场景
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-4 md:grid-cols-4 gap-3 md:gap-4"
            >
              {MOCK_HOME_FEATURES.map((feature, index) => {
                const Icon = FEATURE_ICONS[feature.iconKey] || Pencil;
                const isHovered = hoveredFeature === feature.id;

                return (
                  <motion.button
                    key={feature.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleFeatureClick(feature.action)}
                    onMouseEnter={() => setHoveredFeature(feature.id)}
                    onMouseLeave={() => setHoveredFeature(null)}
                    className={cn(
                      'group relative flex flex-col items-center justify-center gap-2.5 p-4 md:p-6 rounded-[1.5rem]',
                      'border border-border',
                      'bg-white',
                      'shadow-sm',
                      'transition-all duration-300 ease-out',
                      'hover:shadow-md hover:border-primary/30',
                      'overflow-hidden',
                    )}
                  >
                    {/* 悬停光晕 */}
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500',
                        'from-primary/8 via-transparent to-chart-4/8',
                        isHovered && 'opacity-100',
                      )}
                    />

                    <div
                      className={cn(
                        'relative z-10 size-10 md:size-12 rounded-2xl flex items-center justify-center',
                        'bg-muted transition-all duration-300',
                        index % 4 === 0 &&
                          'group-hover:bg-primary/20 text-foreground',
                        index % 4 === 1 &&
                          'group-hover:bg-chart-2/15 text-chart-2',
                        index % 4 === 2 &&
                          'group-hover:bg-chart-3/15 text-chart-3',
                        index % 4 === 3 &&
                          'group-hover:bg-chart-4/15 text-chart-4',
                      )}
                    >
                      <Icon className="size-5 md:size-6" strokeWidth={1.8} />
                    </div>

                    <span className="relative z-10 text-xs md:text-sm font-medium text-foreground text-center leading-tight">
                      {feature.name}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* 我的题库 */}
        <section className="w-full pb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-6"
            >
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  我的题库
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  共 {MOCK_HOME_BANKS.length} 个题库，{totalQuestions} 道题目
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/import')}
                className="text-foreground hover:text-foreground hover:bg-muted rounded-full"
              >
                <FolderPlus className="size-4 mr-1.5" />
                新建题库
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
            >
              {MOCK_HOME_BANKS.map((bank, index) => (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  whileHover={{ y: -6 }}
                  onClick={() => handleBankClick(bank.id)}
                  className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* 顶部渐变条 */}
                  <div
                    className={cn(
                      'h-1.5 w-full',
                      index % 3 === 0 && 'bg-gradient-to-r from-primary to-chart-4',
                      index % 3 === 1 && 'bg-gradient-to-r from-chart-2 to-chart-3',
                      index % 3 === 2 && 'bg-gradient-to-r from-chart-4 to-primary',
                    )}
                  />

                  {/* 悬停光晕 */}
                  <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-primary/15 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-semibold text-foreground truncate group-hover:text-foreground transition-colors">
                          {bank.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <BookOpen className="size-3.5" />
                          {bank.questionCount} 道题目
                        </p>
                      </div>
                      <ChevronRight className="size-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-0.5" />
                    </div>

                    {/* 正确率进度条 */}
                    {bank.correctRate > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">正确率</span>
                          <span className="font-semibold text-foreground tabular-nums">
                            {bank.correctRate}%
                          </span>
                        </div>
                        <Progress
                          value={bank.correctRate}
                          className="h-1.5 bg-muted/60"
                        />
                      </div>
                    )}

                    {/* 底部信息 */}
                    <div className="flex items-center justify-between pt-3 border-t border-dashed border-border/60">
                      {bank.lastPracticeAt ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {bank.lastPracticeAt}
                        </span>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs font-normal px-2 py-0.5 rounded-full border-foreground/10 bg-foreground text-background"
                        >
                          未开始
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-xs font-normal px-2 py-0.5 rounded-full"
                      >
                        {bank.correctRate > 0 ? '进行中' : '待练习'}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* 添加题库卡片 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: MOCK_HOME_BANKS.length * 0.08,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                whileHover={{ y: -6 }}
                onClick={() => navigate('/import')}
                className="group cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[180px] md:min-h-[200px] rounded-[1.5rem] border-2 border-dashed border-border/60 bg-white/30 hover:border-primary/50 hover:bg-primary/[0.05] transition-all duration-300"
              >
                <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-foreground group-hover:bg-primary/20 group-hover:text-foreground transition-all duration-300">
                  <FolderPlus className="size-6" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  创建新题库
                </span>
                <span className="text-xs text-muted-foreground/70">
                  上传 Word / PDF 文档
                </span>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
