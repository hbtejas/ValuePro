import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackUsage } from '../../features/calculatorSlice';
import CalculatorLayout from '../common/CalculatorLayout';
import InputField from '../common/InputField';
import ResultCard from '../common/ResultCard';
import { formatPercent } from '../../utils/formatters';
import { Plus, Trash2 } from 'lucide-react';

// Newton-Raphson XIRR (mirrors backend)
function computeXIRR(cashflows) {
  if (cashflows.length < 2) return null;
  const parsed = cashflows.map((cf) => {
    const parts = cf.date.split('/');
    if (parts.length !== 3) return null;
    return { date: new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])), amount: cf.amount };
  }).filter(Boolean);
  if (parsed.length < 2) return null;
  const hasNeg = parsed.some((c) => c.amount < 0);
  const hasPos = parsed.some((c) => c.amount > 0);
  if (!hasNeg || !hasPos) return { error: 'Need at least one investment (−) and one return (+)' };

  parsed.sort((a, b) => a.date - b.date);
  const d0 = parsed[0].date;
  const npv = (rate) => parsed.reduce((sum, cf) => {
    const years = (cf.date - d0) / (365.25 * 24 * 60 * 60 * 1000);
    return sum + cf.amount / Math.pow(1 + rate, years);
  }, 0);
  const npvD = (rate) => parsed.reduce((sum, cf) => {
    const years = (cf.date - d0) / (365.25 * 24 * 60 * 60 * 1000);
    return sum - years * cf.amount / Math.pow(1 + rate, years + 1);
  }, 0);

  let guess = 0.1;
  for (let i = 0; i < 100; i++) {
    const fx = npv(guess);
    const fxP = npvD(guess);
    if (Math.abs(fxP) < 1e-10) break;
    const next = guess - fx / fxP;
    if (Math.abs(next - guess) < 1e-7) return { xirr: Math.round(next * 100 * 100) / 100 };
    guess = Math.max(-0.99, Math.min(10, next));
  }
  return { xirr: Math.round(guess * 100 * 100) / 100, approx: true };
}

export default function XIRRCalculator() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([
    { date: '01/01/2020', amount: -100000 },
    { date: '01/06/2020', amount: -50000 },
    { date: '01/01/2021', amount: -75000 },
    { date: '01/01/2024', amount: 350000 },
  ]);
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('xirr')); }, []);
  useEffect(() => { setResult(computeXIRR(rows)); }, [rows]);

  const updateRow = (idx, field, val) => {
    setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: field === 'amount' ? (parseFloat(val) || 0) : val } : r));
  };
  const addRow = () => setRows([...rows, { date: '01/01/2025', amount: 0 }]);
  const removeRow = (idx) => rows.length > 2 && setRows(rows.filter((_, i) => i !== idx));

  return (
    <CalculatorLayout calculatorId="xirr" title="XIRR Calculator" description="Calculate annualized returns on irregular cashflows — investments and redemptions at arbitrary dates." explanation="XIRR (Extended Internal Rate of Return) solves for the discount rate that makes the NPV of all cashflows equal to zero. Use negative values for investments and positive for returns. Dates in DD/MM/YYYY format." inputs={rows} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Cashflows</h3>
          <button onClick={addRow} className="text-xs text-brand-accent font-medium flex items-center gap-1 hover:underline"><Plus size={14} /> Add Row</button>
        </div>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-gray-500 mb-1 px-1">
          <span>Date (DD/MM/YYYY)</span><span>Amount (₹)</span><span></span>
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <input value={row.date} onChange={(e) => updateRow(i, 'date', e.target.value)} className="input-field text-sm py-2" placeholder="DD/MM/YYYY" />
            <input type="number" value={row.amount} onChange={(e) => updateRow(i, 'amount', e.target.value)} className="input-field text-sm py-2 tabular-nums" placeholder="-100000" />
            <button onClick={() => removeRow(i)} className="p-2 rounded-lg text-gray-400 hover:text-loss hover:bg-loss/10 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <p className="text-[10px] text-gray-400 mt-2">💡 Use negative (−) for investments, positive (+) for returns/withdrawals</p>
      </div>
      <div className="space-y-3">
        {result?.error ? (
          <div className="glass-card p-5 text-center text-loss text-sm">{result.error}</div>
        ) : result?.xirr !== undefined ? (
          <ResultCard label="XIRR" value={formatPercent(result.xirr)} large color={result.xirr >= 0 ? 'green' : 'red'} subValue={result.approx ? 'Approximate' : undefined} tooltip="Annualized return accounting for irregular cash flow timing" />
        ) : (
          <div className="glass-card p-5 text-center text-gray-400 text-sm">Enter valid cashflows to compute XIRR</div>
        )}
      </div>
    </CalculatorLayout>
  );
}
