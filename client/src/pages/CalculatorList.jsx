import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CALCULATOR_CATEGORIES } from '../utils/calculatorData';

export default function CalculatorList() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <h1 className="text-2xl font-display font-bold">All Calculators</h1>

      {CALCULATOR_CATEGORIES.map((category) => {
        const CatIcon = category.icon;
        return (
          <section key={category.id}>
            <div className="flex items-center gap-3 mb-4">
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
                    <div>
                      <h3 className="text-sm font-semibold">{calc.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">{calc.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </motion.div>
  );
}
