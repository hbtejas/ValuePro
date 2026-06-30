import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, AlertTriangle, ExternalLink, RefreshCw, X, ArrowRight, ShieldCheck, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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
  
  // Drawer states
  const [selectedStock, setSelectedStock] = useState(null);
  const [activeTab, setActiveTab] = useState('financials');
  const [activeFinancialTab, setActiveFinancialTab] = useState('balanceSheet');

  const [showFilters, setShowFilters] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        setStocks((prev) => {
          const filtered = prev.filter(s => s.ticker !== data.data.ticker);
          return [data.data, ...filtered];
        });
        setSearchQuery('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch stock details.');
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

  const filteredStocks = stocks.filter((stock) => {
    const mCapInCr = stock.marketCap / 10000000;
    if (selectedCap === 'Large Cap' && mCapInCr < 20000) return false;
    if (selectedCap === 'Mid Cap' && (mCapInCr < 5000 || mCapInCr >= 20000)) return false;
    if (selectedCap === 'Small Cap' && mCapInCr >= 5000) return false;
    if (maxPE && stock.peRatio && stock.peRatio > parseFloat(maxPE)) return false;
    const deVal = stock.debtToEquity > 10 ? stock.debtToEquity / 100 : stock.debtToEquity;
    if (maxDE && deVal > parseFloat(maxDE)) return false;
    return true;
  });

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

  // Generate mini price chart coordinates scaled by current price
  const generateChartData = (price) => {
    const base = price || 1000;
    return [
      { date: '2023', price: Math.round(base * 0.75) },
      { date: '2024', price: Math.round(base * 0.85) },
      { date: '2025', price: Math.round(base * 0.95) },
      { date: 'Current', price: Math.round(base) },
    ];
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
            Real-time financial statement reports, pros & cons, shareholding percentages, and credit ratings.
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
              placeholder="Search or add NSE stock (e.g. RELIANCE, TCS, HDFCBANK)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-surface-border dark:border-surface-dark-border
                         bg-white dark:bg-surface-dark-tertiary rounded-xl text-sm"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary py-2 text-sm shrink-0">
            Add
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

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-surface-border dark:border-surface-dark-border overflow-hidden"
            >
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Market Cap</label>
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
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Max P/E</label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  value={maxPE}
                  onChange={(e) => setMaxPE(e.target.value)}
                  className="input-field py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Max Debt/Equity (x)</label>
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

      {/* Screener Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary text-gray-500 font-semibold border-b border-surface-border dark:border-surface-dark-border">
                <th className="px-5 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('companyName')}>Company</th>
                <th className="px-5 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('currentPrice')}>Price</th>
                <th className="px-5 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('peRatio')}>P/E</th>
                <th className="px-5 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('debtToEquity')}>Debt/Equity</th>
                <th className="px-5 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('risk')}>Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {loading && stocks.length === 0 ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="skeleton h-16 w-full" />
                ))
              ) : sortedStocks.length > 0 ? (
                sortedStocks.map((stock) => {
                  const deVal = stock.debtToEquity > 10 ? stock.debtToEquity / 100 : stock.debtToEquity;
                  const mCapInCr = Math.round(stock.marketCap / 10000000);

                  return (
                    <tr
                      key={stock.ticker}
                      onClick={() => setSelectedStock(stock)}
                      className="hover:bg-surface-tertiary dark:hover:bg-surface-dark-tertiary cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{stock.companyName}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          <span className="font-mono bg-surface-tertiary dark:bg-surface-dark-tertiary px-1 py-0.5 rounded">{stock.ticker}</span>
                          <span> • {stock.sector} • {mCapInCr.toLocaleString('en-IN')} Cr</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold tabular-nums">{formatINR(stock.currentPrice, true)}</td>
                      <td className="px-5 py-4 tabular-nums">{stock.peRatio ? stock.peRatio.toFixed(1) : '—'}</td>
                      <td className="px-5 py-4 tabular-nums">{deVal ? `${deVal.toFixed(2)}x` : '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getRiskBadgeColor(stock.risk.category)}`}>
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

      {/* Stock Context Slide-out Drawer */}
      <AnimatePresence>
        {selectedStock && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStock(null)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-surface-dark-secondary z-50 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-start px-6 py-5 border-b border-surface-border dark:border-surface-dark-border bg-surface-tertiary dark:bg-surface-dark-tertiary">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {selectedStock.companyName}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <span className="font-mono bg-white dark:bg-surface-dark-secondary px-1.5 py-0.5 rounded border border-surface-border dark:border-surface-dark-border">{selectedStock.ticker}</span>
                    <span>• {selectedStock.sector}</span>
                    <span>• {selectedStock.dataSource}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="p-1.5 rounded-lg hover:bg-surface-border/50 dark:hover:bg-surface-dark-border transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Tabs */}
              <div className="flex border-b border-surface-border dark:border-surface-dark-border px-6 overflow-x-auto bg-surface-tertiary/30">
                {[
                  { id: 'financials', label: '📊 Financial Statements' },
                  { id: 'insights', label: '💡 Insights & Peers' },
                  { id: 'shareholding', label: '🤝 Shareholding' },
                  { id: 'news', label: '📰 News' },
                  { id: 'docs', label: '📄 Reports & Concalls' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap
                      ${activeTab === t.id ? 'border-brand-accent text-brand-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. FINANCIALS TAB */}
                {activeTab === 'financials' && (
                  <div className="space-y-6">
                    {/* Price Chart */}
                    <div className="glass-card p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Price Trend</h4>
                      <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={generateChartData(selectedStock.currentPrice)}>
                            <defs>
                              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Tooltip formatter={(v) => [formatINR(v, true), 'Price']} />
                            <Area type="monotone" dataKey="price" stroke="#16A34A" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Statement Sub-Tabs */}
                    <div className="flex gap-2 p-1 bg-surface-tertiary dark:bg-surface-dark-tertiary rounded-xl text-xs font-semibold max-w-sm">
                      {[
                        { id: 'balanceSheet', label: 'Balance Sheet' },
                        { id: 'profitAndLoss', label: 'Profit & Loss' },
                        { id: 'cashFlows', label: 'Cash Flows' },
                        { id: 'quarterly', label: 'Quarterly' }
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveFinancialTab(sub.id)}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-center transition-colors
                            ${activeFinancialTab === sub.id ? 'bg-white dark:bg-surface-dark-secondary text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>

                    {/* Statement Tables */}
                    <div className="overflow-x-auto border border-surface-border dark:border-surface-dark-border rounded-xl">
                      
                      {/* Balance Sheet Statement */}
                      {activeFinancialTab === 'balanceSheet' && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border dark:border-surface-dark-border">
                              <th className="p-3 font-semibold text-gray-500">Equity & Liabilities (₹ Cr)</th>
                              {selectedStock.financials.balanceSheet.map(statement => (
                                <th key={statement.year} className="p-3 font-semibold text-right">{statement.year}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            <tr>
                              <td className="p-3">Share Capital</td>
                              {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.shareCapital.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Reserves & Surplus</td>
                              {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.reserves.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3 font-medium">Borrowings (Total Debt)</td>
                              {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right font-medium tabular-nums">{s.totalDebt.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Other Liabilities</td>
                              {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.otherLiabilities.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr className="bg-surface-tertiary/20 font-bold">
                              <td className="p-3">Total Liabilities</td>
                              {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.totalLiabilities.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr className="bg-surface-tertiary/50"><td colSpan={5} className="p-1"></td></tr>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border">
                              <th className="p-3 font-semibold text-gray-500">Assets (₹ Cr)</th>
                              {selectedStock.financials.balanceSheet.map(statement => <th key={statement.year} className="p-3 text-right"></th>)}
                            </tr>
                            <tr>
                              <td className="p-3">Fixed Assets</td>
                              {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.fixedAssets.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Investments</td>
                              {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.investments.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Cash & Cash Equivalents</td>
                              {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.cash.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Other Assets</td>
                              {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.otherAssets.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr className="bg-surface-tertiary/20 font-bold">
                              <td className="p-3">Total Assets</td>
                              {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.totalAssets.toLocaleString('en-IN')}</td>)}
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {/* Profit & Loss Statement */}
                      {activeFinancialTab === 'profitAndLoss' && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border dark:border-surface-dark-border">
                              <th className="p-3 font-semibold text-gray-500">Profit & Loss Line (₹ Cr)</th>
                              {selectedStock.financials.profitAndLoss.map(pl => (
                                <th key={pl.year} className="p-3 font-semibold text-right">{pl.year}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            <tr>
                              <td className="p-3 font-semibold">Total Revenue</td>
                              {selectedStock.financials.profitAndLoss.map(s => <td key={s.year} className="p-3 text-right font-semibold tabular-nums">{s.totalRevenue.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Operating Profit (EBITDA)</td>
                              {selectedStock.financials.profitAndLoss.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.operatingProfit.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">EBITDA Margin (%)</td>
                              {selectedStock.financials.profitAndLoss.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.ebitdaMargin}%</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Depreciation</td>
                              {selectedStock.financials.profitAndLoss.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.depreciation.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Interest Costs</td>
                              {selectedStock.financials.profitAndLoss.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.interest.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Tax Expense</td>
                              {selectedStock.financials.profitAndLoss.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.tax.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr className="bg-surface-tertiary/20 font-bold">
                              <td className="p-3">Net Profit</td>
                              {selectedStock.financials.profitAndLoss.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.netProfit.toLocaleString('en-IN')}</td>)}
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {/* Cash Flow Statement */}
                      {activeFinancialTab === 'cashFlows' && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border dark:border-surface-dark-border">
                              <th className="p-3 font-semibold text-gray-500">Cash Flow Line (₹ Cr)</th>
                              {selectedStock.financials.cashFlows.map(cf => (
                                <th key={cf.year} className="p-3 font-semibold text-right">{cf.year}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            <tr>
                              <td className="p-3">Cash from Operating Activities</td>
                              {selectedStock.financials.cashFlows.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.operatingCashFlow.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Cash from Investing Activities</td>
                              {selectedStock.financials.cashFlows.map(s => <td key={s.year} className="p-3 text-right tabular-nums text-loss">({Math.abs(s.investingCashFlow).toLocaleString('en-IN')})</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Cash from Financing Activities</td>
                              {selectedStock.financials.cashFlows.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.financingCashFlow >= 0 ? s.financingCashFlow.toLocaleString('en-IN') : `(${Math.abs(s.financingCashFlow).toLocaleString('en-IN')})`}</td>)}
                            </tr>
                            <tr className="bg-surface-tertiary/20 font-bold">
                              <td className="p-3">Net Cash Flow</td>
                              {selectedStock.financials.cashFlows.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{s.netCashFlow >= 0 ? s.netCashFlow.toLocaleString('en-IN') : `(${Math.abs(s.netCashFlow).toLocaleString('en-IN')})`}</td>)}
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {/* Quarterly Results */}
                      {activeFinancialTab === 'quarterly' && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border dark:border-surface-dark-border">
                              <th className="p-3 font-semibold text-gray-500">Quarter Results (₹ Cr)</th>
                              {selectedStock.financials.quarterly.map(q => (
                                <th key={q.quarter} className="p-3 font-semibold text-right">{q.quarter}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            <tr>
                              <td className="p-3 font-semibold">Net Sales</td>
                              {selectedStock.financials.quarterly.map(s => <td key={s.quarter} className="p-3 text-right font-semibold tabular-nums">{s.sales.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3">Expenses</td>
                              {selectedStock.financials.quarterly.map(s => <td key={s.quarter} className="p-3 text-right tabular-nums">{s.expenses.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr>
                              <td className="p-3 font-medium">Operating Profit (EBITDA)</td>
                              {selectedStock.financials.quarterly.map(s => <td key={s.quarter} className="p-3 text-right font-medium tabular-nums">{s.operatingProfit.toLocaleString('en-IN')}</td>)}
                            </tr>
                            <tr className="bg-surface-tertiary/20 font-bold">
                              <td className="p-3">Net Profit</td>
                              {selectedStock.financials.quarterly.map(s => <td key={s.quarter} className="p-3 text-right tabular-nums">{s.netProfit.toLocaleString('en-IN')}</td>)}
                            </tr>
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. INSIGHTS & PEERS TAB */}
                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    {/* Pros and Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pros */}
                      <div className="p-4 rounded-xl border border-gain/15 bg-gain/5 space-y-2">
                        <h4 className="text-xs font-bold text-gain flex items-center gap-1.5 uppercase">
                          <CheckCircle size={14} /> Pros
                        </h4>
                        <ul className="text-xs space-y-1.5 list-disc pl-4 text-gray-700 dark:text-gray-300">
                          {selectedStock.pros.map((pro, idx) => <li key={idx}>{pro}</li>)}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div className="p-4 rounded-xl border border-loss/15 bg-loss/5 space-y-2">
                        <h4 className="text-xs font-bold text-loss flex items-center gap-1.5 uppercase">
                          <AlertCircle size={14} /> Cons
                        </h4>
                        <ul className="text-xs space-y-1.5 list-disc pl-4 text-gray-700 dark:text-gray-300">
                          {selectedStock.cons.map((con, idx) => <li key={idx}>{con}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Key Ratios Summary */}
                    <div className="glass-card p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Key Financial Ratios</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-3 rounded-lg bg-surface-tertiary/50">
                          <div className="text-[10px] text-gray-500 uppercase">ROE (FY26)</div>
                          <div className="text-sm font-bold mt-0.5 text-gain">{selectedStock.financials.ratios[3].roe}%</div>
                        </div>
                        <div className="p-3 rounded-lg bg-surface-tertiary/50">
                          <div className="text-[10px] text-gray-500 uppercase">ROCE (FY26)</div>
                          <div className="text-sm font-bold mt-0.5 text-gain">{selectedStock.financials.ratios[3].roce}%</div>
                        </div>
                        <div className="p-3 rounded-lg bg-surface-tertiary/50">
                          <div className="text-[10px] text-gray-500 uppercase">Interest Coverage</div>
                          <div className="text-sm font-bold mt-0.5">{selectedStock.financials.ratios[3].interestCoverage}x</div>
                        </div>
                      </div>
                    </div>

                    {/* Peer Comparison */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Peer Comparison</h4>
                      <div className="overflow-x-auto border border-surface-border dark:border-surface-dark-border rounded-xl">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border">
                              <th className="p-3 font-semibold">Symbol</th>
                              <th className="p-3 font-semibold text-right">Price (₹)</th>
                              <th className="p-3 font-semibold text-right">P/E Ratio</th>
                              <th className="p-3 font-semibold text-right">Debt/Equity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            {selectedStock.peers.map((peer) => (
                              <tr key={peer.ticker} className={peer.ticker === selectedStock.ticker ? 'bg-brand-accent/5 font-semibold' : ''}>
                                <td className="p-3 font-mono">{peer.ticker}</td>
                                <td className="p-3 text-right tabular-nums">{peer.price.toLocaleString('en-IN')}</td>
                                <td className="p-3 text-right tabular-nums">{peer.pe ? peer.pe.toFixed(1) : '—'}</td>
                                <td className="p-3 text-right tabular-nums">{peer.de.toFixed(2)}x</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SHAREHOLDING TAB */}
                {activeTab === 'shareholding' && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Ownership Breakdown</h4>
                    
                    {/* Shareholding Bars list */}
                    <div className="space-y-4">
                      {[
                        { label: 'Promoters', value: selectedStock.shareholding.promoter, color: 'bg-emerald-500' },
                        { label: 'Foreign Institutional Investors (FII)', value: selectedStock.shareholding.fii, color: 'bg-blue-500' },
                        { label: 'Domestic Institutional Investors (DII)', value: selectedStock.shareholding.dii, color: 'bg-violet-500' },
                        { label: 'Public & Retail Shareholders', value: selectedStock.shareholding.public, color: 'bg-amber-500' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{item.label}</span>
                            <span className="tabular-nums">{item.value.toFixed(2)}%</span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl border border-surface-border text-xs text-gray-500 mt-6">
                      💡 Promoters and FII holdings representing more than 70% indicate robust institutional and management commitment.
                    </div>
                  </div>
                )}

                {/* 4. NEWS TAB */}
                {activeTab === 'news' && (
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
                )}

                {/* 5. REPORTS & DOCUMENTS TAB */}
                {activeTab === 'docs' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Exchanges & Rating Disclosures</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedStock.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 rounded-xl border border-surface-border dark:border-surface-dark-border"
                        >
                          <div>
                            <span className="px-2 py-0.5 text-[9px] uppercase font-bold rounded bg-brand-navy/15 dark:bg-brand-navy-light/35 text-brand-navy dark:text-white block w-max">
                              {doc.type}
                            </span>
                            <span className="text-xs font-semibold mt-1.5 block text-gray-900 dark:text-white">{doc.name}</span>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-brand-accent hover:bg-surface-tertiary rounded-xl transition-all">
                            <Download size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
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
