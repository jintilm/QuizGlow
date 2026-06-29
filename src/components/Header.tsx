import { NavLink } from 'react-router-dom';
import { BookOpen, Moon, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', label: '题库', icon: BookOpen },
  { path: '/import', label: '导入', icon: BookOpen },
  { path: '/search', label: '搜索', icon: BookOpen },
  { path: '/favorites', label: '收藏', icon: BookOpen },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <TooltipProvider>
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b',
          'bg-background/70 backdrop-blur-xl',
          'border-border/50',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div
              className={cn(
                'size-9 rounded-full flex items-center justify-center',
                'bg-foreground text-primary',
                'shadow-lg shadow-foreground/10',
                'transition-transform duration-300 group-hover:scale-105',
              )}
            >
              <BookOpen className="size-4.5" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-foreground tracking-tight">
                智题识别
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                AI 题库 · 高效刷题
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          {!isMobile && (
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                          isActive
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                        )
                      }
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="size-9 rounded-full hover:bg-accent/60"
                  aria-label="切换主题"
                >
                  {theme === 'dark' ? (
                    <Sun className="size-[18px] text-foreground" />
                  ) : (
                    <Moon className="size-[18px] text-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{theme === 'dark' ? '浅色模式' : '深色模式'}</p>
              </TooltipContent>
            </Tooltip>

            <Avatar className="size-9 cursor-pointer ring-2 ring-border ring-offset-2 ring-offset-background transition-all hover:ring-primary/60">
              <AvatarImage src="" alt="用户头像" />
              <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
