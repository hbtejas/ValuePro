import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Save, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { historyAPI } from '../../api';
import { getCalculatorInfo } from '../../utils/calculatorData';
import Toast from './Toast';

export default function CalculatorLayout({ calculatorId, title, description, explanation, children, inputs, outputs }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [toast, setToast] = useState(null);
  const { isAuthenticated } = useSelector((s) => s.auth);

  const calcInfo = getCalculatorInfo(calculatorId);

  const handleSave = async () => {
    if (!isAuthenticated) {
      setToast({ type: 'info', message: 'Please login to save calculations' });
      return;
    }
    try {
      await historyAPI.save({
        calculatorType: calculatorId,
        inputs: inputs || {},
        outputs: outputs || {},
      });
      setToast({ type: 'success', message: 'Calculation saved to history' });
    } catch {
      setToast({ type: 'error', message: 'Failed to save calculation' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="space-y-sp-8"
    >
      <div className="flex items-start justify-between gap-sp-8">
        <div className="min-w-0">
          <div className="flex items-center gap-sp-3 mb-sp-3">
            <span className="w-sp-3 h-sp-3 bg-accent rounded-sm shrink-0" />
            <span className="mono-label !text-accent">
              {calcInfo?.categoryName || 'Tool'}
            </span>
          </div>
          <h1 className="text-2xl font-display font-semibold tracking-tight">{title}</h1>
          <p className="text-base text-muted mt-sp-3 max-w-2xl">{description}</p>
        </div>

        {outputs && (
          <button onClick={handleSave} className="btn-secondary shrink-0">
            <Save size={15} />
            <span className="hidden sm:inline">Save</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-sp-8 items-start">
        {children}
      </div>

      {explanation && (
        <section className="panel">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            aria-expanded={showExplanation}
            className="w-full px-sp-6 py-sp-5 flex items-center justify-between text-left hover:bg-surface-secondary transition-colors duration-150"
          >
            <span className="flex items-center gap-sp-5 text-sm font-semibold">
              <Info size={16} className="text-accent" />
              What does this mean?
            </span>
            {showExplanation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showExplanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-t border-surface-border px-sp-6 py-sp-5"
            >
              <div className="text-base text-muted leading-relaxed max-w-3xl">
                {typeof explanation === 'string' ? <p>{explanation}</p> : explanation}
              </div>
            </motion.div>
          )}
        </section>
      )}

      <p className="mono-label border-t border-surface-border pt-sp-5">
        Educational use only. Not investment advice. Consult a SEBI-registered advisor.
      </p>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </motion.div>
  );
}
