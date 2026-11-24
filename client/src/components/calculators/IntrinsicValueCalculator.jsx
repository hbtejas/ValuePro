import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackUsage } from '../../features/calculatorSlice';
import CalculatorLayout from '../common/CalculatorLayout';
import InputField from '../common/InputField';
import ResultCard from '../common/ResultCard';
import { formatINR, formatPercent } from '../../utils/formatters';

function computeGraham({ eps, growthRate, gsecYield }) {
  if (gsecYield === 0) return null;
  return { value: Math.round(eps * (8.5 + 2 * growthRate) * 4.4 / gsecYield * 100) / 100, method: 'Graham' };
}
function computeLynch({ eps, growthRate }) {
  return { value: Math.round(eps * growthRate * 100) / 100, method: 'Lynch' };
}
function computeEPV({ adjustedEarnings, wacc }) {
  if (wacc === 0) return null;
  return { value: Math.round(adjustedEarnings / (wacc / 100) * 100) / 100, method: 'EPV' };
}

export default function IntrinsicValueCalculator() {
  const dispatch = useDispatch();
  const [method, setMethod] = useState('graham');
  const [inputs, setInputs] = useState({ eps: 50, growthRate: 15, gsecYield: 7.1, adjustedEarnings: 5000, wacc: 12 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('intrinsic-value')); }, []);

  useEffect(() => {
    switch (method) {
      case 'graham': setResult(computeGraham(inputs)); break;
      case 'lynch': setResult(computeLynch(inputs)); break;
      case 'epv': setResult(computeEPV(inputs)); break;
      default: setResult(null);
    }
  }, [inputs, method]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  const methods = [
    { id: 'graham', label: 'Graham', desc: 'Benjamin Graham formula' },
    { id: 'lynch', label: 'Peter Lynch', desc: 'PEG-based fair value' },
    { id: 'epv', label: 'EPV', desc: 'Earnings Power Value' },
    { id: 'dcf', label: 'DCF', desc: 'Full DCF → separate calculator' },
  ];

  return (
    <CalculatorLayout
      calculatorId="intrinsic-value"
      title="Intrinsic Value Calculator"
      description="Estimate the true value of a stock using multiple proven valuation methods."
      explanation={
        <div>
          <p className="mb-2"><strong>Graham Formula:</strong> IV = EPS × (8.5 + 2g) × 4.4 / Y — where g = expected growth %, Y = 10-year Indian G-Sec yield.</p>
          <p className="mb-2"><strong>Peter Lynch:</strong> Fair Value = EPS × Growth Rate (assumes PEG = 1 is fair).</p>
          <p><strong>EPV:</strong> Earnings Power Value = Adjusted Earnings / WACC — values the company based on its current earnings power.</p>
        </div>
      }
      inputs={inputs}
      outputs={result}
    >
      <div className="glass-card p-5 lg:p-6 space-y-4">
        {/* Method Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-sp-1 bg-surface-secondary rounded-sm p-sp-1">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              disabled={m.id === 'dcf'}
              className={`py-sp-3 px-sp-3 rounded-sm text-sm font-semibold transition-colors duration-150
                ${method === m.id ? 'bg-surface text-accent border border-accent/40' : 'text-muted hover:text-ink hover:bg-surface-secondary'}
                disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <InputField label="Earnings Per Share (EPS)" name="eps" value={inputs.eps} onChange={handleChange} prefix="₹" tooltip="Latest annual EPS from P&L statement" />
        
        {(method === 'graham' || method === 'lynch') && (
          <InputField label="Expected Growth Rate (%)" name="growthRate" value={inputs.growthRate} onChange={handleChange} suffix="%" tooltip="Expected EPS growth rate for next 7-10 years" />
        )}

        {method === 'graham' && (
          <InputField label="10-Year G-Sec Yield (%)" name="gsecYield" value={inputs.gsecYield} onChange={handleChange} suffix="%" tooltip="Current 10-year Indian Government Securities yield. Default ~7.1% — used as the risk-free rate reference in Graham's formula." />
        )}

        {method === 'epv' && (
          <>
            <InputField label="Adjusted Earnings (₹ Cr)" name="adjustedEarnings" value={inputs.adjustedEarnings} onChange={handleChange} prefix="₹" tooltip="Normalized earnings after removing one-time items" />
            <InputField label="WACC (%)" name="wacc" value={inputs.wacc} onChange={handleChange} suffix="%" tooltip="Weighted Average Cost of Capital" />
          </>
        )}
      </div>

      <div className="space-y-4">
        {result ? (
          <>
            <ResultCard label={`Intrinsic Value (${result.method})`} value={formatINR(result.value, true)} large color="green" tooltip={`Fair value per share using the ${result.method} method`} />
            <div className="glass-card p-4 text-xs text-muted">
              <p>💡 Compare this with the current market price to assess margin of safety. Use the <strong>Margin of Safety</strong> calculator for a detailed analysis.</p>
            </div>
          </>
        ) : (
          <div className="glass-card p-8 text-center text-muted">Enter valid inputs to see results</div>
        )}
      </div>
    </CalculatorLayout>
  );
}
