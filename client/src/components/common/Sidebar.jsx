import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, Clock, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import { CALCULATOR_CATEGORIES } from '../../utils/calculatorData';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, onToggle }) {
  const [expandedCategories, setExpandedCategories] = useState(['value-investing']);
  const location = useLocation();

  const toggleCategory = (id) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72
          bg-surface border-r border-surface-border
          transform transition-transform duration-150 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          flex flex-col overflow-hidden`}
      >
        {/* Identity */}
        <div className="flex items-center justify-between px-sp-6 py-sp-5 hairline">
          <NavLink to="/" className="flex items-center gap-sp-5 group">
            <div className="w-9 h-9 rounded-sm bg-accent flex items-center justify-center shrink-0">
              <span className="text-white font-mono font-bold text-lg leading-none">V</span>
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-semibold text-base leading-tight truncate">ValuePro</h1>
              <p className="font-mono text-xs uppercase tracking-wider text-muted leading-tight">India / Toolkit</p>
            </div>
          </NavLink>
          <button
            onClick={onToggle}
            className="btn-ghost !px-2 !py-2 hidden lg:inline-flex"
            aria-label="Toggle sidebar"
          >
            {isOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-sp-5 px-sp-5 space-y-sp-1">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} strokeWidth={1.75} />
            <span>Dashboard</span>
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
                  className={`nav-item w-full justify-between ${hasActiveChild ? 'text-accent' : ''}`}
                >
                  <div className="flex items-center gap-sp-5">
                    <Icon size={16} strokeWidth={1.75} className={category.color} />
                    <span className="font-mono text-xs uppercase tracking-wider">{category.name}</span>
                  </div>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-sp-6 border-l border-surface-border"
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
            <NavLink to="/screener" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Search size={16} strokeWidth={1.75} />
              <span>Screener</span>
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Clock size={16} strokeWidth={1.75} />
              <span>History</span>
            </NavLink>
          </div>
        </nav>

        <div className="px-sp-6 py-sp-5 hairline">
          <p className="font-mono text-xs leading-relaxed text-muted">
            Educational use only. Not investment advice.
          </p>
        </div>
      </aside>
    </>
  );
}
