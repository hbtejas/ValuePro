import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const tones = {
  success: { icon: 'text-positive', border: 'border-l-positive' },
  error: { icon: 'text-accent', border: 'border-l-accent' },
  info: { icon: 'text-warning', border: 'border-l-warning' },
};

export default function Toast({ type = 'info', message, onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const Icon = icons[type];
  const tone = tones[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        className={`fixed bottom-20 lg:bottom-auto lg:top-20 right-sp-8 z-50
                    flex items-center gap-sp-5 pl-sp-5 pr-sp-3 py-sp-3
                    panel border-l-2 ${tone.border} shadow-xl`}
        role="status"
      >
        <Icon size={16} className={tone.icon} />
        <span className="font-mono text-sm">{message}</span>
        <button
          onClick={onClose}
          className="ml-sp-3 text-muted hover:text-ink transition-colors duration-150"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
