import { Home, Upload, Search, Heart } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const TABS = [
  { path: '/', label: '题库', icon: Home, end: true },
  { path: '/import', label: '导入', icon: Upload, end: false },
  { path: '/search', label: '搜索', icon: Search, end: false },
  { path: '/favorites', label: '收藏', icon: Heart, end: false },
];

export default function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border
        bg-background/80 backdrop-blur-xl"
      aria-label="底部导航"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all duration-300 ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span
                    className={`text-[11px] font-medium transition-all duration-300 ${
                      isActive ? 'font-semibold' : ''
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
