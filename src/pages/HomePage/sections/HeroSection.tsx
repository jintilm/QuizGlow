import { motion } from 'framer-motion';
import { Upload, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
      {/* 背景装饰光晕 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-10 -right-20 h-80 w-80 rounded-full bg-secondary/40 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/30 blur-[90px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          {/* 标签 */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
          >
            <Sparkles className="size-4" />
            <span>AI 智能识别 · 一键生成题库</span>
          </motion.div>

          {/* 主标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]"
          >
            智能题库识别
            <br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-chart-3 bg-clip-text text-transparent">
              让刷题更高效
            </span>
          </motion.h1>

          {/* 副标题 */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            支持上传 Word / PDF 文档，AI 自动识别题目并转换为在线答题形式。
            多种刷题模式、智能错题本、个性化设置，助你高效备考。
          </motion.p>

          {/* CTA 按钮组 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => navigate('/import')}
              className="h-12 px-8 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Upload className="size-5 mr-2" />
              上传文档创建题库
              <ArrowRight className="size-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/')}
              className="h-12 px-8 text-base font-medium rounded-xl bg-white/50 backdrop-blur-sm border-border/60 hover:bg-white/80 transition-all duration-300"
            >
              浏览示例题库
            </Button>
          </motion.div>

          {/* 特性标签 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex flex-wrap justify-center gap-3 md:gap-4"
          >
            {[
              { label: '5 种题型识别', icon: '📝' },
              { label: '智能错题本', icon: '📊' },
              { label: '5 大刷题模式', icon: '🎯' },
              { label: '深色模式', icon: '🌙' },
            ].map((item, i) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-xl border border-border/50 bg-white/40 backdrop-blur-md px-4 py-2.5 text-sm text-foreground/80 shadow-sm transition-all duration-300 hover:bg-white/60 hover:shadow-md"
                style={{ animationDelay: `${0.65 + i * 0.1}s` }}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
