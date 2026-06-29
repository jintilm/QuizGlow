import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Pencil,
  ClipboardList,
  Swords,
  RefreshCcw,
  Search,
  Repeat,
  FolderPlus,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import { MOCK_HOME_FEATURES } from '@/data/home-page';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ICON_MAP: Record<string, LucideIcon> = {
  Pencil,
  Clipboard: ClipboardList,
  Swords,
  Refresh: RefreshCcw,
  Search,
  Repeat,
  FolderPlus,
  Share: Share2,
};

const GRADIENT_MAP: Record<string, string> = {
  practice: 'from-sky-400/20 to-blue-500/20',
  exam: 'from-indigo-400/20 to-violet-500/20',
  challenge: 'from-rose-400/20 to-orange-500/20',
  reset: 'from-emerald-400/20 to-teal-500/20',
  search: 'from-cyan-400/20 to-sky-500/20',
  update: 'from-amber-400/20 to-orange-500/20',
  create: 'from-violet-400/20 to-purple-500/20',
  share: 'from-pink-400/20 to-rose-500/20',
};

const ICON_BG_MAP: Record<string, string> = {
  practice: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  exam: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  challenge: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  reset: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  search: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  update: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  create: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  share: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function FeaturesGridSection() {
  const navigate = useNavigate();

  const features = useMemo(() => MOCK_HOME_FEATURES, []);

  const handleAction = (action: string, name: string) => {
    switch (action) {
      case 'practice':
      case 'exam':
      case 'challenge':
      case 'reset':
        toast.info(`${name}功能即将开放`);
        break;
      case 'search':
        navigate('/search');
        break;
      case 'update':
      case 'create':
        navigate('/import');
        break;
      case 'share':
        toast.info('分享功能即将开放');
        break;
      default:
        break;
    }
  };

  return (
    <section className="w-full py-4">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-4 gap-2.5 sm:gap-3 md:gap-4"
        >
          {features.map((feature) => {
            const Icon = ICON_MAP[feature.iconKey] ?? Pencil;
            return (
              <motion.button
                key={feature.id}
                variants={itemVariants}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
                onClick={() => handleAction(feature.action, feature.name)}
                className={cn(
                  'group relative flex flex-col items-center justify-center gap-2 sm:gap-2.5',
                  'aspect-square rounded-2xl sm:rounded-3xl',
                  'bg-white/55 dark:bg-white/5 backdrop-blur-xl',
                  'border border-white/50 dark:border-white/10',
                  'shadow-[0_4px_20px_rgba(31_38_135_0.06)]',
                  'transition-all duration-300 ease-out',
                  'hover:shadow-[0_12px_32px_rgba(31_38_135_0.1)] hover:border-white/70 dark:hover:border-white/15',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  'overflow-hidden'
                )}
              >
                {/* Gradient glow background */}
                <div
                  className={cn(
                    'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                    'bg-gradient-to-br',
                    GRADIENT_MAP[feature.action] ?? 'from-primary/10 to-secondary/10'
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center',
                    'size-10 sm:size-11 md:size-12 rounded-xl sm:rounded-2xl',
                    ICON_BG_MAP[feature.action] ?? 'bg-primary/15 text-primary',
                    'transition-all duration-300 group-hover:scale-110'
                  )}
                >
                  <Icon className="size-5 sm:size-[22px] md:size-6" strokeWidth={1.8} />
                </div>

                {/* Label */}
                <span className="relative z-10 text-[11px] sm:text-xs md:text-sm font-medium text-foreground/90 leading-tight">
                  {feature.name}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
