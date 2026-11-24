import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, AlertTriangle, ExternalLink, RefreshCw, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { ComposedChart, Area, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import api from '../api';
import { formatINR } from '../utils/formatters';

const DEFAULT_STOCKS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'SBIN.NS'];
const RANGE_OPTIONS = [
  { label: '1M', value: '1mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '3Y', value: '3y' },
  { label: '5Y', value: '5y' },
  { label: 'Max', value: 'max' },
];

export default function StockScreener() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCap, setSelectedCap] = useState('All');
  const [maxPE, setMaxPE] = useState('');
  const [maxDE, setMaxDE] = useState('');
  const [sortField, setSortField] = useState('risk');
  const [sortOrder, setSortOrder] = useState('desc');

  // Drawer
  const [selectedStock, setSelectedStock] = useState(null);
  const [activeTab, setActiveTab] = useState('financials');
  const [activeFinancialTab, setActiveFinancialTab] = useState('balanceSheet');

  // Chart
  const [chartData, setChartData] = useState([]);
  const [chartRange, setChartRange] = useState('1y');
  const [chartLoading, setChartLoading] = useState(false);

  // Autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const [showFilters, setShowFilters] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadScreenerData();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadScreenerData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const results = [];
      for (const ticker of DEFAULT_STOCKS) {
        try {
          const { data } = await api.get(`/screener?ticker=${ticker}`);
          if (data.success) results.push(data.data);
        } catch (err) {
          console.warn(`Screener load failed for ${ticker}`);
        }
      }
      setStocks(results);
    } catch (err) {
      setErrorMsg('Failed to load screener data.');
    } finally {
      setLoading(false);
    }
  };

  // ---- AUTOCOMPLETE ----
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    try {
      const { data } = await api.get(`/screener/autocomplete?q=${encodeURIComponent(query)}`);
      if (data.success) setSuggestions(data.data);
    } catch (err) {
      console.warn('Autocomplete failed');
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const selectSuggestion = async (suggestion) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setSuggestions([]);
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await api.get(`/screener?ticker=${suggestion.ticker}`);
      if (data.success) {
        setStocks((prev) => {
          const filtered = prev.filter(s => s.ticker !== data.data.ticker);
          return [data.data, ...filtered];
        });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch stock details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewTicker = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setShowSuggestions(false);
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
        setSuggestions([]);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to fetch stock details.');
    } finally {
      setLoading(false);
    }
  };

  // ---- CHART ----
  const loadChartData = useCallback(async (ticker, range) => {
    setChartLoading(true);
    try {
      const { data } = await api.get(`/screener/chart?ticker=${ticker}&range=${range}`);
      if (data.success) setChartData(data.data.points);
    } catch (err) {
      console.warn('Chart fetch failed');
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, []);

  // When a stock is selected or range changes, load chart
  useEffect(() => {
    if (selectedStock) {
      loadChartData(selectedStock.ticker, chartRange);
    }
  }, [selectedStock, chartRange, loadChartData]);

  // ---- SORT & FILTER ----
  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
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
    if (sortField === 'risk') { valA = a.risk.aggregateScore; valB = b.risk.aggregateScore; }
    else { valA = a[sortField]; valB = b[sortField]; }
    if (valA == null) return 1;
    if (valB == null) return -1;
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  const getRiskBadge = (cat) => {
    if (cat === 'High') return 'bg-accent/10 text-accent border border-accent/25';
    if (cat === 'Medium') return 'bg-warning/10 text-warning border border-warning/25';
    return 'bg-positive/10 text-positive border border-positive/25';
  };

  const formatVol = (v) => {
    if (v >= 1e7) return `${(v / 1e7).toFixed(1)}Cr`;
    if (v >= 1e5) return `${(v / 1e5).toFixed(1)}L`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(0)}K`;
    return v;
  };

  return (
    <div className="space-y-sp-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-sp-6">
        <div>
          <span className="mono-label !text-accent">// MARKET INTELLIGENCE</span>
          <h1 className="text-2xl font-display font-semibold mt-sp-3">Stock screener &amp; risk advisor</h1>
          <p className="text-sm text-muted mt-sp-3">
            Live charts, financial statements, shareholding, peer comparison &amp; risk analysis.
          </p>
        </div>
        <button onClick={loadScreenerData} className="btn-secondary self-start md:self-auto">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Reload
        </button>
      </div>

      {/* Search with Autocomplete + Filters */}
      <div className="panel p-sp-6 space-y-sp-5">
        <form onSubmit={handleAddNewTicker} className="flex gap-sp-3 max-w-2xl">
          <div className="relative flex-1" ref={searchRef}>
            <Search size={15} className="absolute left-sp-5 top-1/2 -translate-y-1/2 text-muted z-10" />
            <input
              type="text"
              placeholder="Type stock name or ticker — Reliance, TCS, HDFC..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              className="w-full pl-sp-9 pr-sp-5 py-sp-3 border border-surface-border bg-canvas rounded-sm
                         text-base placeholder:text-muted hover:border-muted/60
                         focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40
                         transition-colors duration-150"
              autoComplete="off"
            />

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 right-0 top-full mt-sp-3 panel shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto"
                >
                  {suggestions.map((s, idx) => (
                    <button
                      key={`${s.ticker}-${idx}`}
                      type="button"
                      onClick={() => selectSuggestion(s)}
                      className="w-full text-left px-sp-6 py-sp-5 hover:bg-surface-secondary transition-colors flex items-center justify-between gap-sp-5 border-b border-surface-border last:border-0"
                    >
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-ink truncate block">{s.name}</span>
                        <span className="text-xs text-muted block mt-sp-1 font-mono">{s.ticker} · {s.exchange}</span>
                      </div>
                      {s.source === 'local' && (
                        <span className="font-mono text-xs bg-positive/10 text-positive px-sp-3 py-0.5 rounded-sm uppercase">DB</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button type="submit" disabled={loading} className="btn-primary shrink-0">Add</button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
            aria-expanded={showFilters}
            className={`p-sp-3 rounded-sm border flex items-center justify-center shrink-0 transition-colors duration-150
              ${showFilters ? 'bg-accent/10 border-accent text-accent' : 'border-surface-border hover:bg-surface-secondary'}`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </form>

        {errorMsg && <p className="font-mono text-xs text-accent">! {errorMsg}</p>}

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-sp-6 pt-sp-5 hairline overflow-hidden"
            >
              <div>
                <label className="mono-label block mb-sp-3">Market cap</label>
                <select value={selectedCap} onChange={(e) => setSelectedCap(e.target.value)} className="input-field font-mono text-sm">
                  <option>All</option><option>Large Cap</option><option>Mid Cap</option><option>Small Cap</option>
                </select>
              </div>
              <div>
                <label className="mono-label block mb-sp-3">Max P/E</label>
                <input type="number" placeholder="e.g. 35" value={maxPE} onChange={(e) => setMaxPE(e.target.value)} className="input-field font-mono text-sm" />
              </div>
              <div>
                <label className="mono-label block mb-sp-3">Max debt / equity (x)</label>
                <input type="number" placeholder="e.g. 1.5" step="0.1" value={maxDE} onChange={(e) => setMaxDE(e.target.value)} className="input-field font-mono text-sm" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Screener Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-surface-secondary text-muted border-b border-surface-border">
                <th className="px-sp-6 py-sp-5 cursor-pointer hover:text-accent transition-colors duration-150 font-mono text-xs uppercase tracking-wider" onClick={() => handleSort('companyName')}>Company</th>
                <th className="px-sp-6 py-sp-5 cursor-pointer hover:text-accent transition-colors duration-150 font-mono text-xs uppercase tracking-wider" onClick={() => handleSort('currentPrice')}>Price</th>
                <th className="px-sp-6 py-sp-5 cursor-pointer hover:text-accent transition-colors duration-150 font-mono text-xs uppercase tracking-wider" onClick={() => handleSort('peRatio')}>P/E</th>
                <th className="px-sp-6 py-sp-5 cursor-pointer hover:text-accent transition-colors duration-150 font-mono text-xs uppercase tracking-wider" onClick={() => handleSort('debtToEquity')}>Debt / Equity</th>
                <th className="px-sp-6 py-sp-5 cursor-pointer hover:text-accent transition-colors duration-150 font-mono text-xs uppercase tracking-wider" onClick={() => handleSort('risk')}>Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {loading && stocks.length === 0 ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-5"><div className="skeleton h-4 w-32 rounded" /></td>
                    <td className="px-5 py-5"><div className="skeleton h-4 w-16 rounded" /></td>
                    <td className="px-5 py-5"><div className="skeleton h-4 w-12 rounded" /></td>
                    <td className="px-5 py-5"><div className="skeleton h-4 w-14 rounded" /></td>
                    <td className="px-5 py-5"><div className="skeleton h-4 w-20 rounded" /></td>
                  </tr>
                ))
              ) : sortedStocks.length > 0 ? (
                sortedStocks.map((stock) => {
                  const deVal = stock.debtToEquity > 10 ? stock.debtToEquity / 100 : stock.debtToEquity;
                  const mCapInCr = Math.round(stock.marketCap / 10000000);
                  return (
                    <tr key={stock.ticker} onClick={() => { setSelectedStock(stock); setActiveTab('financials'); setChartRange('1y'); }} className="hover:bg-surface-secondary cursor-pointer transition-colors duration-150">
                      <td className="px-sp-6 py-sp-5">
                        <div className="font-semibold text-ink">{stock.companyName}</div>
                        <div className="text-xs text-muted mt-sp-1">
                          <span className="font-mono bg-surface-secondary text-accent px-sp-2 py-0.5 rounded-sm">{stock.ticker}</span>
                          <span> · {stock.sector} · {mCapInCr.toLocaleString('en-IN')} Cr</span>
                        </div>
                      </td>
                      <td className="px-sp-6 py-sp-5 font-semibold tabular-nums font-mono">{formatINR(stock.currentPrice, true)}</td>
                      <td className="px-sp-6 py-sp-5 tabular-nums font-mono">{stock.peRatio ? stock.peRatio.toFixed(1) : '—'}</td>
                      <td className="px-sp-6 py-sp-5 tabular-nums font-mono">{deVal ? `${deVal.toFixed(2)}x` : '—'}</td>
                      <td className="px-sp-6 py-sp-5">
                        <span className={`px-sp-3 py-0.5 rounded-pill font-mono text-xs uppercase tracking-wider ${getRiskBadge(stock.risk.category)}`}>
                          {stock.risk.category} ({stock.risk.aggregateScore})
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="5" className="px-sp-6 py-sp-9 text-muted">No stocks matching filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== STOCK DETAIL DRAWER ===== */}
      <AnimatePresence>
        {selectedStock && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStock(null)} className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-surface-dark-secondary z-[70] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-start px-sp-6 py-sp-5 border-b border-surface-border bg-surface-secondary">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-ink truncate">{selectedStock.companyName}</h2>
                  <p className="text-xs text-muted mt-sp-2">
                    <span className="font-mono bg-surface border border-surface-border px-sp-3 py-0.5 rounded-sm text-accent">{selectedStock.ticker}</span>
                    <span> · {selectedStock.sector} · {selectedStock.dataSource}</span>
                  </p>
                </div>
                <button onClick={() => setSelectedStock(null)} className="btn-ghost !p-2 shrink-0" aria-label="Close stock details"><X size={18} /></button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-surface-border px-sp-5 overflow-x-auto bg-surface-secondary/40 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {[
                  { id: 'financials', label: 'Financials' },
                  { id: 'insights', label: 'Insights & Peers' },
                  { id: 'shareholding', label: 'Shareholding' },
                  { id: 'news', label: 'News' },
                  { id: 'docs', label: 'Docs' },
                ].map((t) => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`py-sp-5 px-sp-5 font-mono text-xs uppercase tracking-wider border-b-2 transition-colors duration-150 whitespace-nowrap
                      ${activeTab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'}`}
                  >{t.label}</button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* ======== FINANCIALS TAB ======== */}
                {activeTab === 'financials' && (
                  <div className="space-y-6">

                    {/* REAL PRICE CHART */}
                    <div className="panel p-sp-6 space-y-sp-5">
                      <div className="flex items-center justify-between gap-sp-5">
                        <h4 className="mono-label">Price chart / {selectedStock.ticker}</h4>
                        <div className="flex gap-sp-1">
                          {RANGE_OPTIONS.map((r) => (
                            <button key={r.value} onClick={() => setChartRange(r.value)}
                              className={`px-sp-3 py-sp-1 rounded-sm font-mono text-xs uppercase transition-colors duration-150
                                ${chartRange === r.value ? 'bg-accent text-onaccent' : 'bg-surface-secondary text-muted hover:text-ink'}`}
                            >{r.label}</button>
                          ))}
                        </div>
                      </div>

                      {chartLoading ? (
                        <div className="h-48 flex items-center justify-center text-muted text-sm">Loading chart...</div>
                      ) : chartData.length > 0 ? (
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                              <defs>
                                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.15}/>
                                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--bc-border))" opacity={0.6} />
                              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgb(var(--bc-muted))' }} tickFormatter={(d) => { const dt = new Date(d); return dt.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }); }} interval="preserveStartEnd" minTickGap={40} />
                              <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 9, fill: 'rgb(var(--bc-muted))' }} domain={['auto', 'auto']} tickFormatter={(v) => `₹${v}`} />
                              <YAxis yAxisId="volume" orientation="left" tick={{ fontSize: 8, fill: 'rgb(var(--bc-muted))' }} tickFormatter={formatVol} domain={[0, 'auto']} hide={false} />
                              <Tooltip
                                contentStyle={{ borderRadius: 4, fontSize: 11, border: '1px solid rgb(var(--bc-border))', background: 'rgb(var(--bc-surface))' }}
                                labelFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                formatter={(value, name) => {
                                  if (name === 'volume') return [formatVol(value), 'Volume'];
                                  return [`₹${value}`, name === 'close' ? 'Price' : name === 'ma50' ? '50 DMA' : '200 DMA'];
                                }}
                              />
                              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                              <Bar yAxisId="volume" dataKey="volume" fill="#F97316" opacity={0.25} name="Volume" barSize={2} />
                              <Area yAxisId="price" type="monotone" dataKey="close" stroke="#F97316" fill="url(#priceGrad)" strokeWidth={1.5} dot={false} name="Price on NSE" />
                              <Line yAxisId="price" type="monotone" dataKey="ma50" stroke="#F59E0B" strokeWidth={1.2} dot={false} name="50 DMA" connectNulls={false} />
                              <Line yAxisId="price" type="monotone" dataKey="ma200" stroke="#10B981" strokeWidth={1.2} dot={false} name="200 DMA" connectNulls={false} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-muted text-sm">No chart data available</div>
                      )}
                    </div>

                    {/* Sub-Tabs: Balance Sheet, P&L, Cash Flows, Quarterly */}
                    <div className="flex gap-sp-1 p-sp-1 bg-surface-secondary border border-surface-border rounded-sm overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                      {[
                        { id: 'balanceSheet', label: 'Balance Sheet' },
                        { id: 'profitAndLoss', label: 'Profit & Loss' },
                        { id: 'cashFlows', label: 'Cash Flows' },
                        { id: 'quarterly', label: 'Quarterly' },
                        { id: 'ratios', label: 'Ratios' }
                      ].map((sub) => (
                        <button key={sub.id} onClick={() => setActiveFinancialTab(sub.id)}
                          className={`flex-1 py-sp-3 px-sp-3 rounded-sm text-center transition-colors duration-150 font-mono text-xs whitespace-nowrap
                            ${activeFinancialTab === sub.id ? 'bg-surface border border-accent/40 text-accent' : 'text-muted hover:text-ink'}`}
                        >{sub.label}</button>
                      ))}
                    </div>

                    {/* Statement Tables */}
                    <div className="overflow-x-auto border border-surface-border rounded-sm">
                      {activeFinancialTab === 'balanceSheet' && selectedStock.financials?.balanceSheet && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border dark:border-surface-dark-border">
                              <th className="p-3 font-semibold text-muted">Particulars (₹ Cr)</th>
                              {selectedStock.financials.balanceSheet.map(s => <th key={s.year} className="p-3 font-semibold text-right">{s.year}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            {[
                              { label: 'Share Capital', key: 'shareCapital' },
                              { label: 'Reserves & Surplus', key: 'reserves' },
                              { label: 'Borrowings (Total Debt)', key: 'totalDebt', bold: true },
                              { label: 'Other Liabilities', key: 'otherLiabilities' },
                              { label: 'Total Liabilities', key: 'totalLiabilities', total: true },
                              { label: 'Fixed Assets', key: 'fixedAssets' },
                              { label: 'Investments', key: 'investments' },
                              { label: 'Cash & Equivalents', key: 'cash' },
                              { label: 'Other Assets', key: 'otherAssets' },
                              { label: 'Total Assets', key: 'totalAssets', total: true },
                            ].map(row => (
                              <tr key={row.key} className={row.total ? 'bg-surface-tertiary/20 font-bold' : row.bold ? 'font-medium' : ''}>
                                <td className="p-3">{row.label}</td>
                                {selectedStock.financials.balanceSheet.map(s => <td key={s.year} className="p-3 text-right tabular-nums">{(s[row.key] || 0).toLocaleString('en-IN')}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {activeFinancialTab === 'profitAndLoss' && selectedStock.financials?.profitAndLoss && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border">
                              <th className="p-3 font-semibold text-muted">P&L Line (₹ Cr)</th>
                              {selectedStock.financials.profitAndLoss.map(s => <th key={s.year} className="p-3 font-semibold text-right">{s.year}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            {[
                              { label: 'Total Revenue', key: 'totalRevenue', bold: true },
                              { label: 'Operating Profit (EBITDA)', key: 'operatingProfit' },
                              { label: 'EBITDA Margin (%)', key: 'ebitdaMargin', pct: true },
                              { label: 'Depreciation', key: 'depreciation' },
                              { label: 'Interest Costs', key: 'interest' },
                              { label: 'Tax Expense', key: 'tax' },
                              { label: 'Net Profit', key: 'netProfit', total: true },
                            ].map(row => (
                              <tr key={row.key} className={row.total ? 'bg-surface-tertiary/20 font-bold' : row.bold ? 'font-semibold' : ''}>
                                <td className="p-3">{row.label}</td>
                                {selectedStock.financials.profitAndLoss.map(s => (
                                  <td key={s.year} className="p-3 text-right tabular-nums">
                                    {row.pct ? `${s[row.key]}%` : (s[row.key] || 0).toLocaleString('en-IN')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {activeFinancialTab === 'cashFlows' && selectedStock.financials?.cashFlows && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border">
                              <th className="p-3 font-semibold text-muted">Cash Flow (₹ Cr)</th>
                              {selectedStock.financials.cashFlows.map(s => <th key={s.year} className="p-3 font-semibold text-right">{s.year}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            {[
                              { label: 'Operating Activities', key: 'operatingCashFlow' },
                              { label: 'Investing Activities', key: 'investingCashFlow' },
                              { label: 'Financing Activities', key: 'financingCashFlow' },
                              { label: 'Net Cash Flow', key: 'netCashFlow', total: true },
                            ].map(row => (
                              <tr key={row.key} className={row.total ? 'bg-surface-tertiary/20 font-bold' : ''}>
                                <td className="p-3">{row.label}</td>
                                {selectedStock.financials.cashFlows.map(s => {
                                  const v = s[row.key] || 0;
                                  return <td key={s.year} className={`p-3 text-right tabular-nums ${v < 0 ? 'text-accent' : ''}`}>{v < 0 ? `(${Math.abs(v).toLocaleString('en-IN')})` : v.toLocaleString('en-IN')}</td>;
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {activeFinancialTab === 'quarterly' && selectedStock.financials?.quarterly && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border">
                              <th className="p-3 font-semibold text-muted">Quarter (₹ Cr)</th>
                              {selectedStock.financials.quarterly.map(s => <th key={s.quarter} className="p-3 font-semibold text-right">{s.quarter}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            {[
                              { label: 'Net Sales', key: 'sales', bold: true },
                              { label: 'Expenses', key: 'expenses' },
                              { label: 'Operating Profit', key: 'operatingProfit' },
                              { label: 'Net Profit', key: 'netProfit', total: true },
                            ].map(row => (
                              <tr key={row.key} className={row.total ? 'bg-surface-tertiary/20 font-bold' : row.bold ? 'font-semibold' : ''}>
                                <td className="p-3">{row.label}</td>
                                {selectedStock.financials.quarterly.map(s => <td key={s.quarter} className="p-3 text-right tabular-nums">{(s[row.key] || 0).toLocaleString('en-IN')}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {activeFinancialTab === 'ratios' && selectedStock.financials?.ratios && (
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border">
                              <th className="p-3 font-semibold text-muted">Ratio</th>
                              {selectedStock.financials.ratios.map(s => <th key={s.year} className="p-3 font-semibold text-right">{s.year}</th>)}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            {[
                              { label: 'ROE (%)', key: 'roe', pct: true },
                              { label: 'ROCE (%)', key: 'roce', pct: true },
                              { label: 'Debt/Equity (x)', key: 'debtToEquity', suffix: 'x' },
                              { label: 'Interest Coverage (x)', key: 'interestCoverage', suffix: 'x' },
                              { label: 'Current Ratio', key: 'currentRatio', suffix: 'x' },
                            ].map(row => (
                              <tr key={row.key}>
                                <td className="p-3 font-medium">{row.label}</td>
                                {selectedStock.financials.ratios.map(s => (
                                  <td key={s.year} className="p-3 text-right tabular-nums">
                                    {row.pct ? `${s[row.key]}%` : `${s[row.key]}${row.suffix || ''}`}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* ======== INSIGHTS & PEERS ======== */}
                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    {/* Pros / Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-sm border border-positive/25 bg-positive/5 space-y-2">
                        <h4 className="text-xs font-bold text-positive flex items-center gap-1.5 uppercase"><CheckCircle size={14} /> Pros</h4>
                        <ul className="text-xs space-y-1.5 list-disc pl-4 text-ink">
                          {selectedStock.pros?.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                      <div className="p-4 rounded-sm border border-accent/25 bg-accent/5 space-y-2">
                        <h4 className="text-xs font-bold text-accent flex items-center gap-1.5 uppercase"><AlertCircle size={14} /> Cons</h4>
                        <ul className="text-xs space-y-1.5 list-disc pl-4 text-ink">
                          {selectedStock.cons?.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    </div>

                    {/* Risk Summary */}
                    <div className="panel p-sp-6 space-y-sp-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="mono-label !text-accent">Risk status</span>
                          <div className="text-xl font-mono font-semibold flex items-center gap-sp-3 mt-sp-2">
                            <span className="px-sp-3 py-0.5 rounded-pill font-mono text-xs uppercase bg-surface-secondary border border-surface-border">{selectedStock.risk.category}</span>
                            <span>{selectedStock.risk.aggregateScore} / 100</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-3 rounded-pill bg-surface-border overflow-hidden">
                        <div className={`h-full rounded-pill transition-all duration-500 ${selectedStock.risk.category === 'High' ? 'bg-accent' : selectedStock.risk.category === 'Medium' ? 'bg-warning' : 'bg-positive'}`}
                          style={{ width: `${selectedStock.risk.aggregateScore}%` }} />
                      </div>
                      <div className="grid grid-cols-3 gap-sp-3 font-mono text-xs">
                        <div><span className="block text-muted">Solvency</span><span className="font-semibold">{selectedStock.risk.breakdown.solvency}/40</span></div>
                        <div><span className="block text-muted">Valuation</span><span className="font-semibold">{selectedStock.risk.breakdown.valuation}/40</span></div>
                        <div><span className="block text-muted">Sentiment</span><span className="font-semibold">{selectedStock.risk.breakdown.sentiment}/20</span></div>
                      </div>
                    </div>

                    {/* Warnings */}
                    {selectedStock.risk.warnings?.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-accent flex items-center gap-1.5"><AlertTriangle size={14} /> Warnings</h4>
                        <ul className="space-y-1.5">
                          {selectedStock.risk.warnings.map((w, i) => <li key={i} className="text-xs text-muted pl-4 border-l-2 border-accent py-0.5">{w}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Peer Comparison (with names!) */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Peer Comparison</h4>
                      <div className="overflow-x-auto border border-surface-border rounded-sm">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-surface-tertiary dark:bg-surface-dark-tertiary border-b border-surface-border">
                              <th className="p-3 font-semibold">Company</th>
                              <th className="p-3 font-semibold text-right">Price (₹)</th>
                              <th className="p-3 font-semibold text-right">P/E</th>
                              <th className="p-3 font-semibold text-right">D/E</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                            {selectedStock.peers?.map((peer) => (
                              <tr key={peer.ticker} className={peer.ticker === selectedStock.ticker ? 'bg-accent/5 font-semibold' : ''}>
                                <td className="p-3">
                                  <div className="font-semibold text-ink">{peer.name}</div>
                                  <div className="text-xs text-muted font-mono mt-0.5">{peer.ticker}</div>
                                </td>
                                <td className="p-3 text-right tabular-nums">{typeof peer.price === 'number' ? peer.price.toLocaleString('en-IN') : '—'}</td>
                                <td className="p-3 text-right tabular-nums">{peer.pe ? peer.pe.toFixed(1) : '—'}</td>
                                <td className="p-3 text-right tabular-nums">{typeof peer.de === 'number' ? `${peer.de.toFixed(2)}x` : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ======== SHAREHOLDING ======== */}
                {activeTab === 'shareholding' && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Ownership Breakdown (% of Shares)</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Promoters', value: selectedStock.shareholding?.promoter, color: 'bg-positive' },
                        { label: 'Foreign Institutional Investors (FII)', value: selectedStock.shareholding?.fii, color: 'bg-accent' },
                        { label: 'Domestic Institutional Investors (DII)', value: selectedStock.shareholding?.dii, color: 'bg-warning' },
                        { label: 'Public & Retail Shareholders', value: selectedStock.shareholding?.public, color: 'bg-muted' },
                      ].map((item) => (
                        <div key={item.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{item.label}</span>
                            <span className="tabular-nums">{(item.value || 0).toFixed(2)}%</span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value || 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ======== NEWS ======== */}
                {activeTab === 'news' && (
                  <div className="space-y-4">
                    {selectedStock.news?.length > 0 ? selectedStock.news.map((item, idx) => (
                      <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer"
                        className="block p-4 rounded-sm border border-surface-border hover:border-accent/50 hover:bg-surface-secondary transition-all group">
                        <div className="flex justify-between items-start gap-3">
                          <h4 className="text-sm font-semibold group-hover:text-accent transition-colors leading-snug">{item.title}</h4>
                          <ExternalLink size={14} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted mt-2.5">
                          <span className="font-semibold">{item.publisher}</span>
                          <span>•</span>
                          <span>{new Date(item.time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </a>
                    )) : <div className="px-sp-6 py-sp-9 text-muted">No recent news articles</div>}
                  </div>
                )}

                {/* ======== DOCUMENTS ======== */}
                {activeTab === 'docs' && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Announcements, Annual Reports, Credit Ratings & Concalls</h4>
                    {selectedStock.documents?.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-sm border border-surface-border">
                        <div>
                          <span className="px-2 py-0.5 font-mono text-xs uppercase rounded-sm bg-surface-secondary border border-surface-border text-accent block w-max">{doc.type}</span>
                          <span className="text-xs font-semibold mt-1.5 block text-ink">{doc.name}</span>
                        </div>
                        <button className="p-2 text-muted hover:text-accent hover:bg-surface-secondary rounded-sm transition-all"><Download size={16} /></button>
                      </div>
                    ))}
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
