import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
import { CALCULATOR_CATEGORIES } from '../../utils/calculatorData';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, onToggle }) {
  const [expandedCategories, setExpandedCategories] = useState(['valuation']);
  const location = useLocation();

  const toggleCategory = (id) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 
          bg-white dark:bg-surface-dark-primary 
          border-r border-surface-border dark:border-surface-dark-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          flex flex-col overflow-hidden`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-surface-dark-border">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-accent to-brand-accent-hover flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-gray-900 dark:text-white leading-tight">ValuePro</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider uppercase">India Edition</p>
            </div>
          </NavLink>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary transition-colors lg:block hidden"
          >
            {isOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {/* Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-lg">📊</span>
            <span>Dashboard</span>
          </NavLink>

          {/* Calculator Categories */}
          {CALCULATOR_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const Icon = category.icon;
            const hasActiveChild = category.calculators.some(
              (c) => location.pathname === `/calculator/${c.id}`
            );

            return (
              <div key={category.id} className="mt-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`nav-item w-full justify-between ${hasActiveChild ? 'text-brand-accent' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={category.color} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {category.name}
                    </span>
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
                      className="overflow-hidden ml-3"
                    >
                      {category.calculators.map((calc) => {
                        const CalcIcon = calc.icon;
                        return (
                          <NavLink
                            key={calc.id}
                            to={`/calculator/${calc.id}`}
                            className={({ isActive }) =>
                              `nav-item text-xs py-2 ${isActive ? 'active' : ''}`
                            }
                          >
                            <CalcIcon size={14} className="opacity-60" />
                            <span>{calc.name}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Portfolio & History */}
          <div className="pt-3 mt-3 border-t border-surface-border dark:border-surface-dark-border">
            <NavLink
              to="/portfolio"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="text-lg">💼</span>
              <span>Portfolio</span>
            </NavLink>
            <NavLink
              to="/history"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="text-lg">🕐</span>
              <span>History</span>
            </NavLink>
          </div>
        </nav>

        {/* Disclaimer footer */}
        <div className="px-4 py-3 border-t border-surface-border dark:border-surface-dark-border">
          <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-relaxed">
            For educational purposes only. Not investment advice. Data may be delayed or manually entered.
          </p>
        </div>
      </aside>
    </>
  );
}
