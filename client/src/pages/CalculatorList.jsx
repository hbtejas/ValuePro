import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { CALCULATOR_CATEGORIES } from '../utils/calculatorData';

export default function CalculatorList() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = CALCULATOR_CATEGORIES.map((category) => ({
    ...category,
    calculators: category.calculators.filter(
      (calc) =>
        calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.calculators.length > 0);

  const total = filteredCategories.reduce((sum, c) => sum + c.calculators.length, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-sp-9">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-sp-6">
        <div>
          <span className="mono-label !text-accent">// INDEX</span>
          <h1 className="text-2xl font-display font-semibold mt-sp-3">All calculators</h1>
        </div>
        <span className="font-mono text-xs text-muted">{String(total).padStart(2, '0')} TOOLS</span>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-sp-6 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Filter the index..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Filter calculators"
          className="w-full h-11 pl-sp-9 pr-sp-9 rounded-sm bg-surface border border-surface-border
                     text-base placeholder:text-muted hover:border-muted/60
                     focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40
                     transition-colors duration-150"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-sp-6 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors duration-150"
            aria-label="Clear filter"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => {
          const CatIcon = category.icon;
          return (
            <section key={category.id} className="space-y-sp-5">
              <div className="flex items-center gap-sp-5">
                <div className={`w-9 h-9 rounded-sm ${category.bgColor} flex items-center justify-center shrink-0`}>
                  <CatIcon size={17} strokeWidth={1.75} className={category.color} />
                </div>
                <h2 className="text-base font-semibold">{category.name}</h2>
                <span className="font-mono text-xs text-muted">{String(category.calculators.length).padStart(2, '0')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sp-5">
                {category.calculators.map((calc, index) => {
                  const Icon = calc.icon;
                  return (
                    <Link
                      key={calc.id}
                      to={`/calculator/${calc.id}`}
                      className="panel p-sp-6 hover:border-accent/50 hover:-translate-y-px hover:shadow-lg transition-all duration-150 group flex gap-sp-5"
                    >
                      <span className="font-mono text-xs text-muted w-6 shrink-0 pt-sp-1">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className={`w-9 h-9 rounded-sm ${category.bgColor} flex items-center justify-center shrink-0`}>
                        <Icon size={16} strokeWidth={1.75} className={category.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold truncate">{calc.name}</h3>
                        <p className="text-sm text-muted mt-sp-1 line-clamp-2">{calc.description}</p>
                      </div>
                      <ArrowRight size={14} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 mt-sp-1" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      ) : (
        <div className="panel p-sp-9">
          <p className="font-mono text-sm text-accent">// no tools match “{searchQuery}”</p>
        </div>
      )}
    </motion.div>
  );
}
