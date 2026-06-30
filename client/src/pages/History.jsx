import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trash2, Filter, Clock } from 'lucide-react';
import { historyAPI } from '../api';
import { CALCULATORS } from '../utils/calculatorData';
import { formatDate, formatINR } from '../utils/formatters';

export default function History() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchHistory();
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    try {
      const { data } = await historyAPI.getAll({ limit: 50 });
      setHistory(data.data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await historyAPI.remove(id);
      setHistory((prev) => prev.filter((h) => h._id !== id));
    } catch {
      // handle error
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Clock size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Calculation History</h2>
        <p className="text-sm text-gray-500 mb-4">Login to save and view your calculation history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-display font-bold mb-6">Calculation History</h1>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Clock size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500">No saved calculations yet</p>
          <p className="text-xs text-gray-400 mt-1">Use any calculator and click "Save" to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => {
            const calc = CALCULATORS[record.calculatorType];
            const Icon = calc?.icon;
            return (
              <div key={record._id} className="glass-card p-4 flex items-center gap-4">
                {Icon && (
                  <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-brand-accent" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate">{calc?.name || record.calculatorType}</h3>
                    {record.stockTicker && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary">
                        {record.stockTicker}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {formatDate(record.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(record._id)}
                  className="p-2 rounded-lg hover:bg-loss/10 text-gray-400 hover:text-loss transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
