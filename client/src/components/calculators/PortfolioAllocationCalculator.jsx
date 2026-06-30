import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackUsage } from '../../features/calculatorSlice';
import CalculatorLayout from '../common/CalculatorLayout';
import InputField from '../common/InputField';
import ResultCard from '../common/ResultCard';
import { formatINR, formatPercent } from '../../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';

const COLORS = ['#E97B2C', '#0D9488', '#0B1F3A', '#16A34A', '#DC2626', '#D97706', '#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B'];

export default function PortfolioAllocationCalculator() {
  const dispatch = useDispatch();
  const [holdings, setHoldings] = useState([
    { stock: 'RELIANCE', sector: 'Oil & Gas', marketCapCategory: 'Large Cap', value: 150000 },
    { stock: 'TCS', sector: 'IT', marketCapCategory: 'Large Cap', value: 100000 },
    { stock: 'HDFCBANK', sector: 'Banking', marketCapCategory: 'Large Cap', value: 120000 },
    { stock: 'BAJFINANCE', sector: 'NBFC', marketCapCategory: 'Large Cap', value: 80000 },
    { stock: 'TITAN', sector: 'Consumer', marketCapCategory: 'Large Cap', value: 50000 },
  ]);
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('portfolio-allocation')); }, []);
  useEffect(() => {
    const totalValue = holdings.reduce((s, h) => s + h.value, 0);
    if (totalValue === 0) return setResult(null);

    const byStock = holdings.map((h) => ({ name: h.stock, value: h.value, pct: Math.round((h.value / totalValue) * 100 * 10) / 10 }));
    const sectorMap = {};
    holdings.forEach((h) => { sectorMap[h.sector] = (sectorMap[h.sector] || 0) + h.value; });
    const bySector = Object.entries(sectorMap).map(([name, value]) => ({ name, value, pct: Math.round((value / totalValue) * 100 * 10) / 10 }));
    const capMap = {};
    holdings.forEach((h) => { capMap[h.marketCapCategory] = (capMap[h.marketCapCategory] || 0) + h.value; });
    const byCap = Object.entries(capMap).map(([name, value]) => ({ name, value, pct: Math.round((value / totalValue) * 100 * 10) / 10 }));
    const warnings = byStock.filter((s) => s.pct > 25).map((s) => `${s.name} = ${s.pct}% — concentration risk!`);

    setResult({ totalValue, byStock, bySector, byCap, warnings });
  }, [holdings]);

  const updateHolding = (idx, field, val) => setHoldings((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: field === 'value' ? (parseFloat(val) || 0) : val } : h));
  const addHolding = () => setHoldings([...holdings, { stock: '', sector: '', marketCapCategory: 'Large Cap', value: 0 }]);
  const removeHolding = (idx) => holdings.length > 1 && setHoldings(holdings.filter((_, i) => i !== idx));

  return (
    <CalculatorLayout calculatorId="portfolio-allocation" title="Portfolio Allocation" description="Analyze your portfolio's sector, market-cap, and stock concentration." explanation="Enter your holdings to see pie charts showing allocation by stock, sector, and SEBI market-cap category. Concentration warnings trigger when any single position exceeds 25%." inputs={holdings} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Holdings</h3>
          <button onClick={addHolding} className="text-xs text-brand-accent font-medium flex items-center gap-1"><Plus size={14} /> Add</button>
        </div>
        {holdings.map((h, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              {i === 0 && <label className="text-[10px] text-gray-500">Stock / Sector</label>}
              <input value={h.stock} onChange={(e) => updateHolding(i, 'stock', e.target.value)} className="input-field text-sm py-2" placeholder="Stock" />
              <input value={h.sector} onChange={(e) => updateHolding(i, 'sector', e.target.value)} className="input-field text-sm py-2" placeholder="Sector" />
            </div>
            <div className="space-y-1">
              {i === 0 && <label className="text-[10px] text-gray-500">Cap / Value</label>}
              <select value={h.marketCapCategory} onChange={(e) => updateHolding(i, 'marketCapCategory', e.target.value)} className="input-field text-sm py-2">
                <option>Large Cap</option><option>Mid Cap</option><option>Small Cap</option>
              </select>
              <input type="number" value={h.value} onChange={(e) => updateHolding(i, 'value', e.target.value)} className="input-field text-sm py-2 tabular-nums" placeholder="₹ Value" />
            </div>
            <button onClick={() => removeHolding(i)} className="p-2 text-gray-400 hover:text-loss"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {result && (
          <>
            <ResultCard label="Total Portfolio Value" value={formatINR(result.totalValue)} large />

            {result.warnings.length > 0 && (
              <div className="glass-card p-4 border-l-4 border-loss bg-loss/5">
                <div className="flex items-center gap-2 text-loss text-sm font-semibold mb-1"><AlertTriangle size={16} />Concentration Warning</div>
                {result.warnings.map((w, i) => <p key={i} className="text-xs text-loss/80">{w}</p>)}
              </div>
            )}

            {/* Sector Pie */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3">By Sector</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={result.bySector} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2} label={({ name, pct }) => `${name} ${pct}%`}>
                    {result.bySector.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [formatINR(v), '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Market Cap Pie */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-3">By Market Cap (SEBI)</h3>
              <div className="space-y-2">
                {result.byCap.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm flex-1">{c.name}</span>
                    <span className="text-sm font-semibold tabular-nums">{c.pct}%</span>
                    <div className="w-24 h-2 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${c.pct}%`, backgroundColor: COLORS[i] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}
