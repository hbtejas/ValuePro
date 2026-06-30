import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Save, ChevronDown, ChevronUp, Info, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackUsage } from '../../features/calculatorSlice';
import { historyAPI } from '../../api';
import { getCalculatorInfo } from '../../utils/calculatorData';
import Toast from './Toast';

export default function CalculatorLayout({ calculatorId, title, description, explanation, children, inputs, outputs }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [toast, setToast] = useState(null);
  const { isAuthenticated } = useSelector((s) => s.auth);
  const dispatch = useDispatch();

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
      setToast({ type: 'success', message: 'Calculation saved to history!' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save calculation' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {calcInfo?.categoryName && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-accent">
                  {calcInfo.categoryName}
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">{description}</p>
          </div>

          {/* Save button */}
          {outputs && (
            <button
              onClick={handleSave}
              className="btn-secondary text-sm flex items-center gap-2 shrink-0"
            >
              <Save size={16} />
              <span className="hidden sm:inline">Save</span>
            </button>
          )}
        </div>
      </div>

      {/* Calculator content — two-column on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children}
      </div>

      {/* Explanation accordion */}
      {explanation && (
        <div className="mt-6">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full glass-card px-5 py-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2.5">
              <Info size={18} className="text-brand-accent" />
              <span className="text-sm font-semibold">What does this mean?</span>
            </div>
            {showExplanation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showExplanation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="glass-card px-5 py-4 mt-1 rounded-t-none"
            >
              <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                {typeof explanation === 'string' ? <p>{explanation}</p> : explanation}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* SEBI Disclaimer */}
      <div className="mt-8 text-[10px] text-gray-400 dark:text-gray-500 text-center">
        For educational purposes only. Not investment advice. Always consult a SEBI-registered advisor before making investment decisions.
      </div>

      {/* Toast */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}
    </motion.div>
  );
}
