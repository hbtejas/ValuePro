import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Search, Clock, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import { CALCULATOR_CATEGORIES } from '../../utils/calculatorData';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, collapsed, onToggleMobile, onToggleCollapse }) {
  const [expandedCategories, setExpandedCategories] = useState(['value-investing']);
  const location = useLocation();

  const toggleCategory = (id) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const compact = collapsed ? 'lg:justify-center lg:px-0' : '';
  const hidden = collapsed ? 'lg:hidden' : '';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            onClick={onToggleMobile}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72
          ${collapsed ? 'lg:w-16' : 'lg:w-72'}
          bg-surface border-r border-surface-border
          transform transition-[width,transform] duration-150 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          flex flex-col overflow-hidden`}
      >
        <div className={`flex items-center justify-between px-sp-6 py-sp-5 hairline ${collapsed ? 'lg:px-sp-5 lg:justify-center' : ''}`}>
          <NavLink to="/" className="flex items-center gap-sp-5 min-w-0" title="ValuePro home">
            <div className="w-9 h-9 rounded-sm bg-accent flex items-center justify-center shrink-0">
              <span className="text-onaccent font-mono font-semibold text-lg leading-none">V</span>
            </div>
            <div className={`min-w-0 ${hidden}`}>
              <h1 className="font-display font-semibold text-base leading-tight truncate">ValuePro</h1>
              <p className="font-mono text-xs uppercase tracking-wider text-muted leading-tight">India / Toolkit</p>
            </div>
          </NavLink>
          <button
            onClick={onToggleCollapse}
            className={`btn-ghost !px-2 !py-2 hidden lg:inline-flex ${collapsed ? 'absolute right-1 top-3' : ''}`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-sp-5 px-sp-5 space-y-sp-1">
          <NavLink to="/" end title="Home" className={({ isActive }) => `nav-item ${compact} ${isActive ? 'active' : ''}`}>
            <Home size={16} strokeWidth={1.75} className="shrink-0" />
            <span className={hidden}>Home</span>
          </NavLink>
          <NavLink to="/dashboard" end title="Dashboard" className={({ isActive }) => `nav-item ${compact} ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} strokeWidth={1.75} className="shrink-0" />
            <span className={hidden}>Dashboard</span>
          </NavLink>

          {CALCULATOR_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const Icon = category.icon;
            const hasActiveChild = category.calculators.some(
              (c) => location.pathname === `/calculator/${c.id}`
            );

            return (
              <div key={category.id} className="pt-sp-2">
                <button
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isExpanded}
                  title={category.name}
                  className={`nav-item w-full justify-between ${compact} ${hasActiveChild ? 'text-accent' : ''}`}
                >
                  <span className="flex items-center gap-sp-5 min-w-0">
                    <Icon size={16} strokeWidth={1.75} className={`${category.color} shrink-0`} />
                    <span className={`font-mono text-xs uppercase tracking-wider truncate ${hidden}`}>{category.name}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronDown size={14} className={`shrink-0 ${hidden}`} />
                  ) : (
                    <ChevronRight size={14} className={`shrink-0 ${hidden}`} />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`overflow-hidden ml-sp-6 border-l border-surface-border ${hidden}`}
                    >
                      {category.calculators.map((calc) => (
                        <NavLink
                          key={calc.id}
                          to={`/calculator/${calc.id}`}
                          className={({ isActive }) =>
                            `nav-item text-sm py-sp-2 ${isActive ? 'active' : ''}`
                          }
                        >
                          <span className="truncate">{calc.name}</span>
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <div className="pt-sp-5 mt-sp-5 hairline space-y-sp-1">
            <NavLink to="/screener" title="Screener" className={({ isActive }) => `nav-item ${compact} ${isActive ? 'active' : ''}`}>
              <Search size={16} strokeWidth={1.75} className="shrink-0" />
              <span className={hidden}>Screener</span>
            </NavLink>
            <NavLink to="/history" title="History" className={({ isActive }) => `nav-item ${compact} ${isActive ? 'active' : ''}`}>
              <Clock size={16} strokeWidth={1.75} className="shrink-0" />
              <span className={hidden}>History</span>
            </NavLink>
          </div>
        </nav>

        <div className={`px-sp-6 py-sp-5 hairline ${hidden}`}>
          <p className="font-mono text-xs leading-relaxed text-muted">
            Educational use only. Not investment advice.
          </p>
        </div>
      </aside>
    </>
  );
}
