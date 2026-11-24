import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackUsage } from '../../features/calculatorSlice';
import CalculatorLayout from '../common/CalculatorLayout';
import InputField from '../common/InputField';
import ResultCard from '../common/ResultCard';
import { formatINR } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Cell } from 'recharts';

export default function CombinedFairValueCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({
    eps: 50, growthRate: 15, gsecYield: 7.1, industryPE: 25,
    bookValuePerShare: 400, currentPrice: 1200,
  });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('combined-fair-value')); }, []);
  useEffect(() => {
    const methods = [];
    // Graham
    if (inputs.gsecYield > 0) {
      const v = inputs.eps * (8.5 + 2 * inputs.growthRate) * 4.4 / inputs.gsecYield;
      methods.push({ method: 'Graham', value: Math.round(v * 100) / 100 });
    }
    // Lynch
    methods.push({ method: 'Lynch', value: Math.round(inputs.eps * inputs.growthRate * 100) / 100 });
    // P/E
    if (inputs.industryPE > 0) {
      methods.push({ method: 'P/E', value: Math.round(inputs.eps * inputs.industryPE * 100) / 100 });
    }
    // P/B (1x)
    if (inputs.bookValuePerShare > 0) {
      methods.push({ method: 'P/B (1x)', value: inputs.bookValuePerShare });
    }

    if (methods.length === 0) return setResult(null);

    const values = methods.map((m) => m.value);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];

    setResult({ methods, avg: Math.round(avg * 100) / 100, median: Math.round(median * 100) / 100, min: Math.min(...values), max: Math.max(...values) });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="combined-fair-value" title="Combined Fair Value" description="Run multiple valuation methods side-by-side and compare against current price." explanation="Compares Graham, Lynch, P/E, and P/B valuations. The average/median gives a composite fair value estimate. More spread = more uncertainty." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="EPS (₹)" name="eps" value={inputs.eps} onChange={handleChange} prefix="₹" />
        <InputField label="Expected Growth Rate (%)" name="growthRate" value={inputs.growthRate} onChange={handleChange} suffix="%" />
        <InputField label="G-Sec Yield (%)" name="gsecYield" value={inputs.gsecYield} onChange={handleChange} suffix="%" />
        <InputField label="Industry P/E" name="industryPE" value={inputs.industryPE} onChange={handleChange} />
        <InputField label="Book Value/Share (₹)" name="bookValuePerShare" value={inputs.bookValuePerShare} onChange={handleChange} prefix="₹" />
        <InputField label="Current Market Price (₹)" name="currentPrice" value={inputs.currentPrice} onChange={handleChange} prefix="₹" />
      </div>
      <div className="space-y-4">
        {result && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Average Fair Value" value={formatINR(result.avg, true)} large color={result.avg > inputs.currentPrice ? 'green' : 'red'} />
              <ResultCard label="Median Fair Value" value={formatINR(result.median, true)} large />
            </div>

            {/* Horizontal bar chart comparing methods against current price */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4">Valuation Comparison vs Current Price</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={result.methods} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--bc-border))" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="method" type="category" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(v) => [formatINR(v, true), 'Fair Value']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <ReferenceLine x={inputs.currentPrice} stroke="#F97316" strokeDasharray="5 5" label={{ value: `CMP ₹${inputs.currentPrice}`, fill: '#F97316', fontSize: 10 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {result.methods.map((m, i) => (
                      <Cell key={i} fill={m.value > inputs.currentPrice ? '#10B981' : '#F97316'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3">Method Breakdown</h3>
              {result.methods.map((m) => (
                <div key={m.method} className="flex justify-between py-1.5 border-b border-surface-border dark:border-surface-dark-border last:border-0 text-sm">
                  <span>{m.method}</span>
                  <span className={`tabular-nums font-medium ${m.value > inputs.currentPrice ? 'text-positive' : 'text-accent'}`}>
                    {formatINR(m.value, true)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}
