import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackUsage } from '../../features/calculatorSlice';
import CalculatorLayout from '../common/CalculatorLayout';
import InputField from '../common/InputField';
import ResultCard from '../common/ResultCard';
import { formatINR } from '../../utils/formatters';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function computeDRIP({ initialShares, initialPrice, annualDividendPerShare, dividendGrowthRate, priceGrowthRate, years }) {
  let shares = initialShares, price = initialPrice, dps = annualDividendPerShare, totalDiv = 0;
  const data = [];
  for (let y = 1; y <= years; y++) {
    if (y > 1) { price *= (1 + priceGrowthRate / 100); dps *= (1 + dividendGrowthRate / 100); }
    const div = shares * dps;
    const addShares = price > 0 ? div / price : 0;
    shares += addShares;
    totalDiv += div;
    data.push({ year: y, shares: Math.round(shares * 100) / 100, value: Math.round(shares * price), dividendReceived: Math.round(div) });
  }
  return { endShares: Math.round(shares * 100) / 100, endValue: Math.round(shares * price), totalDiv: Math.round(totalDiv), initInvestment: Math.round(initialShares * initialPrice), data };
}

export default function DRIPCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ initialShares: 100, initialPrice: 500, annualDividendPerShare: 10, dividendGrowthRate: 5, priceGrowthRate: 10, years: 10 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('drip')); }, []);
  useEffect(() => { setResult(computeDRIP(inputs)); }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="drip" title="DRIP Simulator" description="Simulate dividend reinvestment — watch your share count compound year over year." explanation="DRIP (Dividend Reinvestment Plan) automatically uses dividends to buy additional shares at the current price, creating a compounding effect. This calculator simulates the year-by-year growth." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Initial Shares" name="initialShares" value={inputs.initialShares} onChange={handleChange} />
          <InputField label="Initial Price" name="initialPrice" value={inputs.initialPrice} onChange={handleChange} prefix="₹" />
        </div>
        <InputField label="Annual Dividend/Share" name="annualDividendPerShare" value={inputs.annualDividendPerShare} onChange={handleChange} prefix="₹" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Dividend Growth (%)" name="dividendGrowthRate" value={inputs.dividendGrowthRate} onChange={handleChange} suffix="%" />
          <InputField label="Price Growth (%)" name="priceGrowthRate" value={inputs.priceGrowthRate} onChange={handleChange} suffix="%" />
        </div>
        <InputField label="Years" name="years" value={inputs.years} onChange={handleChange} min={1} max={50} />
      </div>
      <div className="space-y-4">
        {result && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Ending Shares" value={result.endShares.toString()} large color="green" />
              <ResultCard label="Ending Value" value={formatINR(result.endValue)} large color="green" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Initial Investment" value={formatINR(result.initInvestment)} />
              <ResultCard label="Total Dividends Reinvested" value={formatINR(result.totalDiv)} color="green" />
            </div>
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4">Portfolio Growth</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={result.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [formatINR(v), '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={2} dot={{ fill: '#16A34A', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}
