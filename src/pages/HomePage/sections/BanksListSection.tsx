import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, TrendingUp, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/GlassCard';
import { MOCK_HOME_BANKS, type IHomePageBank } from '@/data/home-page';
import { cn } from '@/lib/utils';
import { Image } from '@/components/ui/image';

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function BankCard({ bank, index }: { bank: IHomePageBank; index: number }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/bank/${bank.id}`);
  };

  return (
    <motion.div variants={item} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <GlassCard
        variant="default"
        size="lg"
        hoverable
        glow
        className="cursor-pointer h-full group"
        onClick={handleClick}
      >
        <div className="flex flex-col h-full gap-4">
          {/* 顶部：封面图 + 标签 */}
          <div className="relative h-28 -mx-2 -mt-2 rounded-2xl overflow-hidden">
            <Image
              src={bank.imageUrl}
              alt={bank.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-white font-bold text-lg leading-tight drop-shadow-sm">
                {bank.name}
              </h3>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="size-4 text-primary/70" />
              <span className="font-medium text-foreground">{bank.questionCount}</span>
              <span className="text-xs">题</span>
            </div>
            {bank.lastPracticeAt && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" />
                <span className="text-xs">{bank.lastPracticeAt}</span>
              </div>
            )}
          </div>

          {/* 正确率进度条 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <TrendingUp className="size-3.5 text-primary/70" />
                正确率
              </span>
              <span className="font-semibold text-foreground tabular-nums">
                {bank.correctRate}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                initial={{ width: 0 }}
                whileInView={{ width: `${bank.correctRate}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* 底部操作 */}
          <div className="mt-auto pt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">点击开始练习</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10 group-hover:translate-x-0.5 transition-transform"
            >
              进入
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function BanksListSection() {
  const navigate = useNavigate();

  const handleCreateBank = () => {
    navigate('/import');
  };

  return (
    <section className="w-full py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* 标题栏 */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              我的题库
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              共 {MOCK_HOME_BANKS.length} 个题库，点击卡片开始练习
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 border-primary/20 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            onClick={handleCreateBank}
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">创建题库</span>
            <span className="sm:hidden">新建</span>
          </Button>
        </div>

        {/* 题库卡片网格 */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className={cn(
            'grid gap-4 md:gap-6',
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {MOCK_HOME_BANKS.map((bank, index) => (
            <BankCard key={bank.id} bank={bank} index={index} />
          ))}

          {/* 新建题库卡片 */}
          <motion.div variants={item} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
            <GlassCard
              variant="subtle"
              size="lg"
              hoverable
              className="cursor-pointer h-full min-h-[280px] flex flex-col items-center justify-center gap-3 border-dashed border-2 border-primary/20 hover:border-primary/40"
              onClick={handleCreateBank}
            >
              <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                <Plus className="size-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">创建新题库</p>
                <p className="text-xs text-muted-foreground mt-1">
                  上传 Word / PDF 文档，智能识别题目
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
