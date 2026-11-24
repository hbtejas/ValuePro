import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, Search, Clock, User } from 'lucide-react';

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calculators', icon: Calculator, label: 'Tools' },
  { to: '/screener', icon: Search, label: 'Screener' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/login', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-canvas/95 backdrop-blur border-t border-surface-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-sp-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-sp-1 px-sp-5 py-sp-2 border-t-2 border-transparent
                 transition-colors duration-150
                 ${isActive ? 'border-accent text-accent' : 'text-muted hover:text-ink'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="font-mono text-xs uppercase tracking-wider">{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
