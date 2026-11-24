import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, X } from 'lucide-react';
import { CALCULATOR_CATEGORIES, CALCULATORS } from '../utils/calculatorData';
import { selectMostUsed } from '../features/calculatorSlice';
import TiltCard from '../components/common/TiltCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const recentlyUsed = useSelector((s) => s.calculator.recentlyUsed);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = CALCULATOR_CATEGORIES.map((category) => ({
    ...category,
    calculators: category.calculators.filter(
      (calc) =>
        calc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.calculators.length > 0);

  const totalResults = filteredCategories.reduce((sum, c) => sum + c.calculators.length, 0);

  return (
    <div className="space-y-sp-9">
      {/* Console hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.12 }}
        className="panel relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 console-grid grid-fade opacity-40" aria-hidden="true" />
        <div className="relative flex items-center justify-between px-sp-6 py-sp-3 bg-surface-secondary border-b border-surface-border">
          <span className="font-mono text-xs text-muted flex items-center gap-sp-3">
            <span className="w-sp-2 h-sp-2 rounded-full bg-accent" />
            valuepro / index
          </span>
          <span className="font-mono text-xs text-muted">v1.0 · INR</span>
        </div>

        <div className="relative px-sp-6 lg:px-sp-9 py-sp-9 lg:py-sp-9 grid lg:grid-cols-[1fr_auto] gap-sp-9 items-end">
          <div className="space-y-sp-6">
            <div className="section-rule"><span className="mono-label !text-accent">// INDIA EDITION</span></div>
            <h1 className="text-3xl lg:text-4xl font-display font-semibold tracking-tight max-w-3xl">
              Stock valuation &amp;<br />
              <span className="relative text-accent">
                investment toolkit.
                <span className="absolute left-0 -bottom-1 h-px w-full bg-accent/40" />
              </span>
            </h1>
            <p className="text-base text-muted max-w-2xl">
              Thirty professional-grade calculators for Indian retail investors. DCF, Graham, Piotroski,
              SIP, XIRR and more — with ₹ lakh / crore formatting throughout.
            </p>
            <div className="flex flex-wrap gap-x-sp-9 gap-y-sp-3 pt-sp-6 border-t border-surface-border font-mono text-xs text-muted">
              <span>30 CALCULATORS</span>
              <span>04 MODULES</span>
              <span>NSE · BSE</span>
              <span>₹ LAKH / CRORE</span>
            </div>
          </div>

          <div className="hidden lg:block w-64 panel bg-canvas/70 p-sp-6 space-y-sp-5 accent-glow">
            <span className="mono-label">// model spread</span>
            {[
              { label: 'GRAHAM', value: 78, tone: 'bg-accent' },
              { label: 'DCF', value: 92, tone: 'bg-positive' },
              { label: 'EPV', value: 64, tone: 'bg-warning' },
            ].map((model) => (
              <div key={model.label} className="space-y-sp-3">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted">{model.label}</span>
                  <span className="text-ink">{model.value}</span>
                </div>
                <div className="h-sp-2 bg-surface-secondary rounded-pill overflow-hidden">
                  <motion.div
                    className={`h-full rounded-pill ${model.tone}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${model.value}%` }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Index search */}
      <div className="relative max-w-xl">
        <Search size={16} className="absolute left-sp-6 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search calculators — DCF, SIP, tax..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search calculators"
          data-search="calculators"
          className="w-full h-12 pl-sp-9 pr-sp-9 rounded-sm bg-surface border border-surface-border
                     text-base placeholder:text-muted hover:border-muted/60
                     focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40
                     transition-colors duration-150"
        />
        {searchQuery ? (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-sp-6 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors duration-150"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        ) : (
          <kbd className="absolute right-sp-6 top-1/2 -translate-y-1/2 font-mono text-xs text-muted border border-surface-border rounded-sm px-sp-2 py-0.5">
            /
          </kbd>
        )}
      </div>

      {/* Recently used */}
      {!searchQuery && recentlyUsed.length > 0 && (
        <section>
          <h2 className="mono-label flex items-center gap-sp-3 mb-sp-5">
            Recently used <span className="text-accent">[{recentlyUsed.length}]</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-sp-5">
            {recentlyUsed.map((id) => {
              const calc = CALCULATORS[id];
              if (!calc) return null;
              const Icon = calc.icon;
              return (
                <TiltCard key={id} className="h-full" intensity={9}>
                  <Link
                    to={`/calculator/${id}`}
                    className="panel preserve-3d h-full p-sp-5 hover:border-accent/50 hover:shadow-lg transition-all duration-150 group"
                  >
                    <Icon size={16} className="text-accent mb-sp-3 depth-layer" strokeWidth={1.75} />
                    <p className="text-sm font-medium truncate">{calc.name}</p>
                  </Link>
                </TiltCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Calculator modules */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-sp-9"
        key={searchQuery}
      >
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const CatIcon = category.icon;
            return (
              <motion.section key={category.id} variants={itemVariants}>
                <div className="flex items-start justify-between gap-sp-6 mb-sp-5">
                  <div className="flex items-center gap-sp-5">
                    <div className={`w-9 h-9 rounded-sm ${category.bgColor} flex items-center justify-center shrink-0`}>
                      <CatIcon size={17} strokeWidth={1.75} className={category.color} />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold">{category.name}</h2>
                      <p className="text-sm text-muted">{category.description}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted shrink-0 pt-sp-2">
                    {String(category.calculators.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sp-5">
                  {category.calculators.map((calc) => {
                    const Icon = calc.icon;
                    return (
                      <TiltCard key={calc.id} className="h-full" intensity={7}>
                        <Link
                          to={`/calculator/${calc.id}`}
                          className="panel preserve-3d h-full p-sp-6 hover:border-accent/50 hover:shadow-lg transition-all duration-150 group flex items-start gap-sp-5"
                        >
                          <div className={`w-9 h-9 rounded-sm ${category.bgColor} flex items-center justify-center shrink-0 depth-layer`}>
                            <Icon size={16} strokeWidth={1.75} className={category.color} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold truncate pr-sp-2">{calc.name}</h3>
                            <p className="text-sm text-muted mt-sp-1 truncate">{calc.description}</p>
                            <div className="flex gap-sp-1 mt-sp-3">
                              {[...Array(calc.popularity)].map((_, i) => (
                                <span key={i} className="w-sp-2 h-sp-2 rounded-sm bg-accent/70" />
                              ))}
                            </div>
                          </div>
                          <ArrowRight size={14} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0 mt-sp-1" />
                        </Link>
                      </TiltCard>
                    );
                  })}
                </div>
              </motion.section>
            );
          })
        ) : (
          <div className="panel p-sp-9">
            <p className="font-mono text-sm text-accent">// no results for “{searchQuery}”</p>
            <p className="text-sm text-muted mt-sp-3">Try another keyword. {totalResults} tools are indexed.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
