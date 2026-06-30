import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { CALCULATOR_CATEGORIES, CALCULATORS } from '../utils/calculatorData';
import { selectMostUsed } from '../features/calculatorSlice';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const recentlyUsed = useSelector((s) => s.calculator.recentlyUsed);
  const mostUsed = useSelector(selectMostUsed);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-brand-navy-light to-brand-navy 
                    px-6 lg:px-10 py-8 lg:py-10 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-brand-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-accent">India Edition</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-display font-bold mb-2">
            Stock Valuation & Investment Toolkit
          </h1>
          <p className="text-sm lg:text-base text-gray-300 max-w-xl">
            30 professional-grade calculators for Indian retail investors. 
            DCF, Graham, Piotroski, SIP, XIRR, and more — all with ₹ lakh/crore formatting.
          </p>
        </div>
        {/* Decorative gradient orbs */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-teal/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Recently Used (if any) */}
      {recentlyUsed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <TrendingUp size={14} />
            Recently Used
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentlyUsed.map((id) => {
              const calc = CALCULATORS[id];
              if (!calc) return null;
              const Icon = calc.icon;
              return (
                <Link
                  key={id}
                  to={`/calculator/${id}`}
                  className="glass-card p-3.5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <Icon size={18} className="text-brand-accent mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold truncate">{calc.name}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Calculator Categories */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {CALCULATOR_CATEGORIES.map((category) => {
          const CatIcon = category.icon;
          return (
            <motion.section key={category.id} variants={itemVariants}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                  <CatIcon size={18} className={category.color} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">{category.name}</h2>
                  <p className="text-xs text-gray-500">{category.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {category.calculators.map((calc) => {
                  const Icon = calc.icon;
                  return (
                    <Link
                      key={calc.id}
                      to={`/calculator/${calc.id}`}
                      className="glass-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex items-start gap-3"
                    >
                      <div className={`w-9 h-9 rounded-lg ${category.bgColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon size={16} className={category.color} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-semibold truncate">{calc.name}</h3>
                          <div className="flex gap-0.5">
                            {[...Array(calc.popularity)].map((_, i) => (
                              <span key={i} className="text-amber-400 text-[8px]">★</span>
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {calc.description}
                        </p>
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </motion.div>
    </div>
  );
}
