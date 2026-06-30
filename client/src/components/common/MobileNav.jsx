import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, Search, Clock, User } from 'lucide-react';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/calculators', icon: Calculator, label: 'Calculate' },
  { to: '/screener', icon: Search, label: 'Screener' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/login', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-surface-dark-primary/95 
                     backdrop-blur-xl border-t border-surface-border dark:border-surface-dark-border"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors
                 ${isActive 
                   ? 'text-brand-accent' 
                   : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
