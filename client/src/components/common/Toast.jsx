import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colors = {
  success: 'bg-gain/10 border-gain/30 text-gain',
  error: 'bg-loss/10 border-loss/30 text-loss',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
};

export default function Toast({ type = 'info', message, onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const Icon = icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-20 lg:bottom-auto lg:top-20 right-4 lg:right-6 z-50 
                     flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl
                     ${colors[type]}`}
      >
        <Icon size={18} />
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
