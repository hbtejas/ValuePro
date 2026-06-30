import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackUsage } from '../../features/calculatorSlice';
import CalculatorLayout from '../common/CalculatorLayout';
import InputField from '../common/InputField';
import ResultCard from '../common/ResultCard';
import { formatINR, formatPercent } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Client-side DCF formula (mirrors backend)
function computeDCF({ baseFCF, growthRateY1to5, growthRateY6to10, discountRate, terminalGrowthRate, forecastPeriod, netDebt, sharesOutstanding }) {
  const dr = discountRate / 100;
  const tgr = terminalGrowthRate / 100;
  const gr1 = growthRateY1to5 / 100;
  const gr2 = (growthRateY6to10 || growthRateY1to5) / 100;
  if (dr <= tgr || sharesOutstanding <= 0) return null;

  const projectedFCF = [];
  let fcf = baseFCF;
  for (let year = 1; year <= forecastPeriod; year++) {
    const gr = year <= 5 ? gr1 : gr2;
    fcf = fcf * (1 + gr);
    const df = Math.pow(1 + dr, year);
    projectedFCF.push({ year, fcf: Math.round(fcf), pvFCF: Math.round(fcf / df) });
  }

  const tv = (fcf * (1 + tgr)) / (dr - tgr);
  const pvTV = tv / Math.pow(1 + dr, forecastPeriod);
  const sumPV = projectedFCF.reduce((s, y) => s + y.pvFCF, 0);
  const ev = sumPV + pvTV;
  const equity = ev - netDebt;
  const ivPerShare = equity / sharesOutstanding;

  return { projectedFCF, tv: Math.round(tv), pvTV: Math.round(pvTV), sumPV: Math.round(sumPV), ev: Math.round(ev), equity: Math.round(equity), ivPerShare: Math.round(ivPerShare * 100) / 100 };
}

export default function DCFCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({
    baseFCF: 1000, growthRateY1to5: 15, growthRateY6to10: 10,
    discountRate: 12, terminalGrowthRate: 3, forecastPeriod: 10,
    netDebt: 0, sharesOutstanding: 100,
  });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('dcf')); }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setInputs((prev) => {
      const next = { ...prev, [name]: parseFloat(value) || 0 };
      const r = computeDCF(next);
      setResult(r);
      return next;
    });
  }, []);

  useEffect(() => {
    setResult(computeDCF(inputs));
  }, []);

  return (
    <CalculatorLayout
      calculatorId="dcf"
      title="DCF Valuation"
      description="Discounted Cash Flow — project future free cash flows and discount them to present value to find intrinsic value per share."
      explanation={
        <div>
          <p className="mb-2"><strong>How DCF works:</strong> Project the company's Free Cash Flow (FCF) forward for a forecast period (typically 10 years), discount each year's FCF back to today using a discount rate (WACC), then add a terminal value representing all cash flows beyond the forecast period.</p>
          <p className="mb-2"><strong>Formula:</strong> Enterprise Value = Σ(FCF / (1+WACC)^t) + Terminal Value / (1+WACC)^n</p>
          <p><strong>Terminal Value (Gordon Growth):</strong> TV = FCF × (1+g) / (WACC − g), where g = long-term sustainable growth rate (typically 2-4% for India, reflecting GDP growth trends).</p>
        </div>
      }
      inputs={inputs}
      outputs={result}
    >
      {/* Inputs Panel */}
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Inputs</h3>
        <InputField label="Base FCF (₹ Cr)" name="baseFCF" value={inputs.baseFCF} onChange={handleChange} prefix="₹" tooltip="Most recent year's Free Cash Flow in ₹ Crores" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Growth Y1-5 (%)" name="growthRateY1to5" value={inputs.growthRateY1to5} onChange={handleChange} suffix="%" tooltip="Expected FCF growth rate for years 1-5" />
          <InputField label="Growth Y6-10 (%)" name="growthRateY6to10" value={inputs.growthRateY6to10} onChange={handleChange} suffix="%" tooltip="Expected FCF growth rate for years 6-10 (usually lower)" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Discount Rate (%)" name="discountRate" value={inputs.discountRate} onChange={handleChange} suffix="%" tooltip="WACC — Weighted Average Cost of Capital. Typically 10-14% for Indian companies." />
          <InputField label="Terminal Growth (%)" name="terminalGrowthRate" value={inputs.terminalGrowthRate} onChange={handleChange} suffix="%" tooltip="Long-term sustainable growth rate. Usually 2-4% (should not exceed India's long-term nominal GDP growth)." />
        </div>
        <InputField label="Forecast Period (years)" name="forecastPeriod" type="number" value={inputs.forecastPeriod} onChange={handleChange} min={1} max={30} />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Net Debt (₹ Cr)" name="netDebt" value={inputs.netDebt} onChange={handleChange} prefix="₹" tooltip="Total Debt minus Cash & Cash Equivalents" />
          <InputField label="Shares Outstanding (Cr)" name="sharesOutstanding" value={inputs.sharesOutstanding} onChange={handleChange} tooltip="Total shares outstanding in Crores" />
        </div>
      </div>

      {/* Results Panel */}
      <div className="space-y-4">
        {result ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Intrinsic Value / Share" value={formatINR(result.ivPerShare, true)} large color={result.ivPerShare > 0 ? 'green' : 'red'} tooltip="Fair value per share based on DCF model" />
              <ResultCard label="Enterprise Value" value={formatINR(result.ev)} tooltip="Sum of all discounted future cash flows including terminal value" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <ResultCard label="PV of FCFs" value={formatINR(result.sumPV)} />
              <ResultCard label="Terminal Value" value={formatINR(result.tv)} />
              <ResultCard label="Equity Value" value={formatINR(result.equity)} />
            </div>

            {/* FCF Projection Chart */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4">Projected FCF (₹ Cr)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.projectedFCF}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-border-opacity, #E2E8F0)" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="fcf" fill="#E97B2C" radius={[6, 6, 0, 0]} name="FCF" />
                  <Bar dataKey="pvFCF" fill="#0D9488" radius={[6, 6, 0, 0]} name="PV of FCF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="glass-card p-8 text-center text-gray-400">
            <p>Adjust inputs to see results</p>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}
