import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trash2, Clock } from 'lucide-react';
import { historyAPI } from '../api';
import { CALCULATORS } from '../utils/calculatorData';
import { formatDate } from '../utils/formatters';

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
      // The record stays in the list when the request fails.
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="panel p-sp-9 max-w-xl">
        <Clock size={28} strokeWidth={1.5} className="text-accent mb-sp-5" />
        <h1 className="text-2xl font-display font-semibold">Calculation history</h1>
        <p className="text-sm text-muted mt-sp-3">Login to save and view your calculation history.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-sp-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-sp-8">
      <div className="flex items-end justify-between gap-sp-6">
        <div>
          <span className="mono-label !text-accent">// ARCHIVE</span>
          <h1 className="text-2xl font-display font-semibold mt-sp-3">Calculation history</h1>
        </div>
        <span className="font-mono text-xs text-muted">{String(history.length).padStart(2, '0')} RECORDS</span>
      </div>

      {history.length === 0 ? (
        <div className="panel p-sp-9 max-w-xl">
          <Clock size={28} strokeWidth={1.5} className="text-muted mb-sp-5" />
          <p className="text-base font-semibold">No saved calculations</p>
          <p className="text-sm text-muted mt-sp-3">Use any calculator and click “Save” to start tracking.</p>
        </div>
      ) : (
        <div className="panel divide-y divide-surface-border">
          {history.map((record) => {
            const calc = CALCULATORS[record.calculatorType];
            const Icon = calc?.icon;
            return (
              <div key={record._id} className="flex items-center gap-sp-6 p-sp-6 hover:bg-surface-secondary transition-colors duration-150">
                {Icon && (
                  <div className="w-9 h-9 rounded-sm bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon size={16} strokeWidth={1.75} className="text-accent" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-sp-3">
                    <h2 className="text-sm font-semibold truncate">{calc?.name || record.calculatorType}</h2>
                    {record.stockTicker && (
                      <span className="font-mono text-xs text-accent border border-accent/25 bg-accent/10 rounded-pill px-sp-3 py-0.5">
                        {record.stockTicker}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted mt-sp-1">{formatDate(record.createdAt)}</p>
                </div>
                <button
                  onClick={() => handleDelete(record._id)}
                  className="p-sp-3 rounded-sm text-muted hover:text-accent hover:bg-accent/10 transition-colors duration-150"
                  aria-label={`Delete ${calc?.name || 'record'}`}
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
