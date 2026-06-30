import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { CALCULATOR_CATEGORIES } from '../utils/calculatorData';

export default function CalculatorList() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories and calculators based on search query
  const filteredCategories = CALCULATOR_CATEGORIES.map((category) => {
    const matchingCalcs = category.calculators.filter(
      (calc) =>
        calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, calculators: matchingCalcs };
  }).filter((category) => category.calculators.length > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-display font-bold">All Calculators</h1>
        
        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search all calculators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 rounded-xl border border-surface-border dark:border-surface-dark-border
                       bg-white dark:bg-surface-dark-secondary text-sm placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-brand-accent/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => {
          const CatIcon = category.icon;
          return (
            <section key={category.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                  <CatIcon size={18} className={category.color} />
                </div>
                <h2 className="text-lg font-bold">{category.name}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.calculators.map((calc) => {
                  const Icon = calc.icon;
                  return (
                    <Link
                      key={calc.id}
                      to={`/calculator/${calc.id}`}
                      className="glass-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all group flex gap-3"
                    >
                      <div className={`w-10 h-10 rounded-xl ${category.bgColor} flex items-center justify-center shrink-0`}>
                        <Icon size={18} className={category.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold truncate">{calc.name}</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{calc.description}</p>
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No calculators match "{searchQuery}"</p>
        </div>
      )}
    </motion.div>
  );
}
