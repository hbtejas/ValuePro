import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackUsage } from '../../features/calculatorSlice';
import CalculatorLayout from '../common/CalculatorLayout';
import InputField from '../common/InputField';
import ResultCard from '../common/ResultCard';
import { formatINR } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

function computeSIP({ monthlyInvestment, expectedReturnRate, years }) {
  const months = years * 12;
  const mr = expectedReturnRate / 100 / 12;
  let fv = mr === 0 ? monthlyInvestment * months : monthlyInvestment * ((Math.pow(1 + mr, months) - 1) / mr) * (1 + mr);
  const invested = monthlyInvestment * months;
  const gains = fv - invested;

  const yearly = [];
  for (let y = 1; y <= years; y++) {
    const m = y * 12;
    const yFV = mr === 0 ? monthlyInvestment * m : monthlyInvestment * ((Math.pow(1 + mr, m) - 1) / mr) * (1 + mr);
    const yInv = monthlyInvestment * m;
    yearly.push({ year: `Y${y}`, invested: Math.round(yInv), gains: Math.round(yFV - yInv) });
  }

  return { futureValue: Math.round(fv), totalInvested: Math.round(invested), estimatedGains: Math.round(gains), yearly };
}

export default function SIPCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ monthlyInvestment: 25000, expectedReturnRate: 12, years: 20 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('sip')); }, []);
  useEffect(() => { setResult(computeSIP(inputs)); }, [inputs]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: parseFloat(e.target.value) || 0 }));
  };

  return (
    <CalculatorLayout
      calculatorId="sip"
      title="SIP Calculator"
      description="Calculate the future value of your Systematic Investment Plan with the power of compounding."
      explanation="SIP (Systematic Investment Plan) lets you invest a fixed amount every month in mutual funds or stocks. The formula accounts for monthly compounding: FV = P × [(1+r)^n − 1]/r × (1+r), where P = monthly investment, r = monthly return rate, n = total months."
      inputs={inputs}
      outputs={result}
    >
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Inputs</h3>
        <InputField label="Monthly Investment" name="monthlyInvestment" value={inputs.monthlyInvestment} onChange={handleChange} prefix="₹" tooltip="Amount you invest every month" />
        <InputField label="Expected Return Rate (%)" name="expectedReturnRate" value={inputs.expectedReturnRate} onChange={handleChange} suffix="%" tooltip="Expected annual return. Equity MFs have historically given 12-15% in India." />
        <InputField label="Investment Period (Years)" name="years" value={inputs.years} onChange={handleChange} min={1} max={50} tooltip="How long you plan to invest" />
      </div>

      <div className="space-y-4">
        {result && (
          <>
            <ResultCard label="Future Value" value={formatINR(result.futureValue)} large color="green" tooltip="Total value of your SIP at the end of the investment period" />
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Total Invested" value={formatINR(result.totalInvested)} tooltip="Total amount you put in over the period" />
              <ResultCard label="Estimated Gains" value={formatINR(result.estimatedGains)} color="green" tooltip="Returns earned on your investment (FV − Invested)" />
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4">Invested vs Gains Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.yearly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [formatINR(v), '']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar dataKey="invested" stackId="a" fill="#0B1F3A" name="Invested" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="gains" stackId="a" fill="#16A34A" name="Gains" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}
