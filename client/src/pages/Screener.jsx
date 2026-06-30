import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, AlertTriangle, ExternalLink, RefreshCw, X, ArrowUpDown, ShieldCheck } from 'lucide-react';
import api from '../api';
import { formatINR, formatPercent } from '../utils/formatters';

const DEFAULT_STOCKS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'SBIN.NS'];

export default function StockScreener() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCap, setSelectedCap] = useState('All');
  const [maxPE, setMaxPE] = useState('');
  const [maxDE, setMaxDE] = useState('');
  const [sortField, setSortField] = useState('risk');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedStock, setSelectedStock] = useState(null);
  const [activeTab, setActiveTab] = useState('news');
  const [showFilters, setShowFilters] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load default stock screener data on mount
  useEffect(() => {
    loadScreenerData();
  }, []);

  const loadScreenerData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const results = [];
      for (const ticker of DEFAULT_STOCKS) {
        try {
          const { data } = await api.get(`/screener?ticker=${ticker}`);
          if (data.success) {
            results.push(data.data);
          }
        } catch (err) {
          console.warn(`Screener load failed for ${ticker}`);
        }
      }
      setStocks(results);
    } catch (err) {
      setErrorMsg('Failed to load screener data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewTicker = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await api.get(`/screener?ticker=${searchQuery}`);
      if (data.success) {
        // Prevent duplicate tickers
        setStocks((prev) => {
          const filtered = prev.filter(s => s.ticker !== data.data.ticker);
          return [data.data, ...filtered];
        });
        setSearchQuery('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch stock details. Ensure ticker is valid (e.g. INFOSYS.NS).');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter logic
  const filteredStocks = stocks.filter((stock) => {
    // Cap filter based on Market Cap heuristic
    const mCapInCr = stock.marketCap / 10000000;
    if (selectedCap === 'Large Cap' && mCapInCr < 20000) return false;
    if (selectedCap === 'Mid Cap' && (mCapInCr < 5000 || mCapInCr >= 20000)) return false;
    if (selectedCap === 'Small Cap' && mCapInCr >= 5000) return false;

    // PE limit
    if (maxPE && stock.peRatio && stock.peRatio > parseFloat(maxPE)) return false;

    // DE limit (D/E from Yahoo is percentage, e.g. 150 = 1.5x)
    const deVal = stock.debtToEquity > 10 ? stock.debtToEquity / 100 : stock.debtToEquity;
    if (maxDE && deVal > parseFloat(maxDE)) return false;

    return true;
  });

  // Sort logic
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let valA, valB;
    if (sortField === 'risk') {
      valA = a.risk.aggregateScore;
      valB = b.risk.aggregateScore;
    } else {
      valA = a[sortField];
      valB = b[sortField];
    }

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getRiskBadgeColor = (category) => {
    switch (category) {
      case 'High': return 'bg-loss/10 text-loss border border-loss/20';
      case 'Medium': return 'bg-neutral/10 text-neutral border border-neutral/20';
      case 'Low': return 'bg-gain/10 text-gain border border-gain/20';
      default: return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🔍 Stock Screener & Risk Advisor
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Analyze Indian equities with live metrics, sentiment-based risk analysis, and regulator flags.
          </p>
        </div>
        <button
          onClick={loadScreenerData}
          className="btn-secondary text-sm flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Reload
        </button>
      </div>

      {/* Ticker add + Filters */}
      <div className="glass-card p-5 space-y-4">
        <form onSubmit={handleAddNewTicker} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Add Indian Stock Ticker (e.g. RELIANCE.NS, INFOSYS.NS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-surface-border dark:border-surface-dark-border
                         bg-white dark:bg-surface-dark-tertiary rounded-xl text-sm placeholder-gray-400"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary py-2 text-sm shrink-0">
            {loading ? 'Adding...' : 'Add Ticker'}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border flex items-center justify-center shrink-0 transition-colors
              ${showFilters ? 'bg-brand-accent/10 border-brand-accent text-brand-accent' : 'border-surface-border dark:border-surface-dark-border hover:bg-surface-tertiary'}`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </form>

        {errorMsg && <p className="text-xs text-loss">{errorMsg}</p>}

        {/* Collapsible Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-surface-border dark:border-surface-dark-border overflow-hidden"
            >
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Market Cap Category</label>
                <select
                  value={selectedCap}
                  onChange={(e) => setSelectedCap(e.target.value)}
                  className="input-field py-2 text-sm"
                >
                  <option>All</option>
                  <option>Large Cap</option>
                  <option>Mid Cap</option>
                  <option>Small Cap</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Max P/E Ratio</label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  value={maxPE}
                  onChange={(e) => setMaxPE(e.target.value)}
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Max Debt-to-Equity (x)</label>
                <input
                  type="number"
                  placeholder="e.g. 1.5"
                  step="0.1"
                  value={maxDE}
                  onChange={(e) => setMaxDE(e.target.value)}
                  className="input-field py-2 text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Grid/Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary text-gray-500 font-semibold border-b border-surface-border dark:border-surface-dark-border">
                <th className="px-5 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('companyName')}>Company / Ticker</th>
                <th className="px-5 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('currentPrice')}>Price</th>
                <th className="px-5 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('peRatio')}>P/E Ratio</th>
                <th className="px-5 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('debtToEquity')}>Debt/Equity</th>
                <th className="px-5 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('risk')}>Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {loading && stocks.length === 0 ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="skeleton h-16 w-full" />
                ))
              ) : sortedStocks.length > 0 ? (
                sortedStocks.map((stock) => {
                  const mCapInCr = Math.round(stock.marketCap / 10000000);
                  const deVal = stock.debtToEquity > 10 ? stock.debtToEquity / 100 : stock.debtToEquity;

                  return (
                    <tr
                      key={stock.ticker}
                      onClick={() => setSelectedStock(stock)}
                      className="hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{stock.companyName}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                          <span className="bg-surface-tertiary dark:bg-surface-dark-tertiary px-1.5 py-0.5 rounded font-mono font-medium">{stock.ticker}</span>
                          <span>• {stock.sector}</span>
                          <span>• {mCapInCr.toLocaleString('en-IN')} Cr Cap</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold tabular-nums">{formatINR(stock.currentPrice, true)}</td>
                      <td className="px-5 py-4 tabular-nums">{stock.peRatio ? stock.peRatio.toFixed(2) : '—'}</td>
                      <td className="px-5 py-4 tabular-nums">{deVal !== null && deVal !== undefined ? `${deVal.toFixed(2)}x` : '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getRiskBadgeColor(stock.risk.category)}`}>
                          {stock.risk.category} ({stock.risk.aggregateScore})
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">No stocks matching filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out side drawer */}
      <AnimatePresence>
        {selectedStock && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStock(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-surface-dark-secondary z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-start px-6 py-5 border-b border-surface-border dark:border-surface-dark-border">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {selectedStock.companyName}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <span className="font-mono">{selectedStock.ticker}</span>
                    <span>• {selectedStock.sector}</span>
                    <span className="text-[10px] text-gray-400 italic">({selectedStock.dataSource})</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="p-1.5 rounded-lg hover:bg-surface-tertiary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="flex border-b border-surface-border dark:border-surface-dark-border px-6">
                <button
                  onClick={() => setActiveTab('news')}
                  className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors
                    ${activeTab === 'news' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  📰 Recent News
                </button>
                <button
                  onClick={() => setActiveTab('risk')}
                  className={`py-3 px-4 text-sm font-semibold border-b-2 transition-colors
                    ${activeTab === 'risk' ? 'border-brand-accent text-brand-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  🛡️ Risk Profile
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'news' ? (
                  <div className="space-y-4">
                    {selectedStock.news.length > 0 ? (
                      selectedStock.news.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 rounded-xl border border-surface-border dark:border-surface-dark-border
                                     hover:border-brand-accent/50 hover:bg-surface-tertiary/20 transition-all group"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <h4 className="text-sm font-semibold group-hover:text-brand-accent transition-colors leading-snug">
                              {item.title}
                            </h4>
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0 mt-0.5" />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-2.5">
                            <span className="font-semibold">{item.publisher}</span>
                            <span>•</span>
                            <span>{new Date(item.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </a>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <p>No recent news articles found for this stock</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Risk Summary Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy-light text-white space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-brand-accent tracking-wider block">Risk Status</span>
                        <div className="text-2xl font-bold flex items-center gap-2 mt-1">
                          <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15`}>
                            {selectedStock.risk.category}
                          </span>
                          <span>{selectedStock.risk.aggregateScore} / 100</span>
                        </div>
                      </div>
                      
                      {/* Aggregate Gauge Meter */}
                      <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500
                            ${selectedStock.risk.category === 'High' ? 'bg-loss' : selectedStock.risk.category === 'Medium' ? 'bg-neutral' : 'bg-gain'}`}
                          style={{ width: `${selectedStock.risk.aggregateScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Multi-Factor Risk Breakdown */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Multi-Factor Risk Matrix</h3>
                      
                      {/* Solvency */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Solvency & Leverage (40%)</span>
                          <span>{selectedStock.risk.breakdown.solvency} / 40</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(selectedStock.risk.breakdown.solvency / 40) * 100}%` }} />
                        </div>
                      </div>

                      {/* Valuation */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Valuation Multiple (40%)</span>
                          <span>{selectedStock.risk.breakdown.valuation} / 40</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(selectedStock.risk.breakdown.valuation / 40) * 100}%` }} />
                        </div>
                      </div>

                      {/* Sentiment */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>News Sentiment Heat (20%)</span>
                          <span>{selectedStock.risk.breakdown.sentiment} / 20</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(selectedStock.risk.breakdown.sentiment / 20) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Warn list */}
                    {selectedStock.risk.warnings.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-surface-border dark:border-surface-dark-border">
                        <h4 className="text-xs font-semibold text-loss flex items-center gap-1.5">
                          <AlertTriangle size={14} /> Warnings & Alerts Triggered
                        </h4>
                        <ul className="space-y-2">
                          {selectedStock.risk.warnings.map((w, idx) => (
                            <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 pl-4 border-l-2 border-loss py-0.5">
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
