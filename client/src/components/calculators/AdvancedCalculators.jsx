import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackUsage } from '../../features/calculatorSlice';
import CalculatorLayout from '../common/CalculatorLayout';
import InputField from '../common/InputField';
import ResultCard from '../common/ResultCard';

export function ScreenerScoreCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ roe: 20, roce: 25, debtToEquity: 0.3, revenueGrowth: 15, epsGrowth: 20, peRatio: 20, pegRatio: 1, promoterHolding: 60 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('screener-score')); }, []);
  useEffect(() => {
    const s = {};
    s.roe = Math.min(10, Math.max(0, inputs.roe / 2));
    s.roce = Math.min(10, Math.max(0, inputs.roce / 2.5));
    s.debtToEquity = Math.max(0, 10 - inputs.debtToEquity * 5);
    s.revenueGrowth = Math.min(10, Math.max(0, inputs.revenueGrowth / 3));
    s.epsGrowth = Math.min(10, Math.max(0, inputs.epsGrowth / 3));
    s.peRatio = Math.max(0, 10 - (inputs.peRatio - 10) * (10 / 30));
    s.pegRatio = Math.max(0, Math.min(10, (2 - inputs.pegRatio) * (10 / 1.5)));
    s.promoterHolding = Math.min(10, Math.max(0, inputs.promoterHolding / 5));
    const total = Object.values(s).reduce((a, b) => a + b, 0);
    const score = Math.round((total / (Object.keys(s).length * 10)) * 100 * 100) / 100;
    let color = score >= 70 ? 'green' : score >= 40 ? 'amber' : 'red';
    let verdict = score >= 70 ? 'Strong' : score >= 40 ? 'Average' : 'Weak';
    setResult({ score, breakdown: s, color, verdict });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="screener-score" title="Screener Score" description="Weighted composite quality score from 0 to 100." explanation="Combines ROE, ROCE, D/E (inverse), Revenue Growth, EPS Growth, P/E (inverse), PEG (inverse), and Promoter Holding into a single 0-100 score." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <InputField label="ROE (%)" name="roe" value={inputs.roe} onChange={handleChange} suffix="%" />
          <InputField label="ROCE (%)" name="roce" value={inputs.roce} onChange={handleChange} suffix="%" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="D/E Ratio" name="debtToEquity" value={inputs.debtToEquity} onChange={handleChange} />
          <InputField label="Revenue Growth (%)" name="revenueGrowth" value={inputs.revenueGrowth} onChange={handleChange} suffix="%" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="EPS Growth (%)" name="epsGrowth" value={inputs.epsGrowth} onChange={handleChange} suffix="%" />
          <InputField label="P/E Ratio" name="peRatio" value={inputs.peRatio} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="PEG Ratio" name="pegRatio" value={inputs.pegRatio} onChange={handleChange} />
          <InputField label="Promoter Holding (%)" name="promoterHolding" value={inputs.promoterHolding} onChange={handleChange} suffix="%" />
        </div>
      </div>
      <div className="space-y-3">
        {result && (
          <>
            <ResultCard label="Screener Score" value={`${result.score}/100`} large color={result.color} subValue={result.verdict} />
            <div className="glass-card p-4">
              <div className="w-full h-5 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${result.color === 'green' ? 'bg-gain' : result.color === 'red' ? 'bg-loss' : 'bg-neutral'}`}
                     style={{ width: `${result.score}%` }} />
              </div>
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}

export function BeneishMScoreCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({
    receivables: 200, revenue: 1000, grossMargin: 40, totalAssets: 2000, ppe: 500, sgaExpense: 150, depreciation: 80, totalDebt: 600, netIncomeFromOps: 100, operatingCashFlow: 120,
    prevReceivables: 150, prevRevenue: 800, prevGrossMargin: 45, prevTotalAssets: 1800, prevPPE: 450, prevSGAExpense: 130, prevDepreciation: 70, prevTotalDebt: 550,
  });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('beneish-m-score')); }, []);
  useEffect(() => {
    const dsri = (inputs.prevRevenue && inputs.revenue) ? (inputs.receivables / inputs.revenue) / (inputs.prevReceivables / inputs.prevRevenue) : 1;
    const gmi = inputs.grossMargin > 0 ? inputs.prevGrossMargin / inputs.grossMargin : 1;
    const currAQ = 1 - ((inputs.receivables + inputs.ppe) / inputs.totalAssets);
    const prevAQ = 1 - ((inputs.prevReceivables + inputs.prevPPE) / inputs.prevTotalAssets);
    const aqi = prevAQ !== 0 ? currAQ / prevAQ : 1;
    const sgi = inputs.prevRevenue !== 0 ? inputs.revenue / inputs.prevRevenue : 1;
    const currDep = (inputs.ppe + inputs.depreciation) !== 0 ? inputs.depreciation / (inputs.ppe + inputs.depreciation) : 0;
    const prevDep = (inputs.prevPPE + inputs.prevDepreciation) !== 0 ? inputs.prevDepreciation / (inputs.prevPPE + inputs.prevDepreciation) : 0;
    const depi = currDep !== 0 ? prevDep / currDep : 1;
    const currSGAI = inputs.revenue !== 0 ? inputs.sgaExpense / inputs.revenue : 0;
    const prevSGAI = inputs.prevRevenue !== 0 ? inputs.prevSGAExpense / inputs.prevRevenue : 0;
    const sgai = prevSGAI !== 0 ? currSGAI / prevSGAI : 1;
    const currLev = inputs.totalAssets !== 0 ? inputs.totalDebt / inputs.totalAssets : 0;
    const prevLev = inputs.prevTotalAssets !== 0 ? inputs.prevTotalDebt / inputs.prevTotalAssets : 0;
    const lvgi = prevLev !== 0 ? currLev / prevLev : 1;
    const tata = inputs.totalAssets !== 0 ? (inputs.netIncomeFromOps - inputs.operatingCashFlow) / inputs.totalAssets : 0;

    const m = -4.84 + 0.92 * dsri + 0.528 * gmi + 0.404 * aqi + 0.892 * sgi + 0.115 * depi - 0.172 * sgai + 4.679 * tata - 0.327 * lvgi;
    const mR = Math.round(m * 100) / 100;
    const flag = m > -1.78;

    setResult({ mScore: mR, flag, color: flag ? 'red' : 'green', verdict: flag ? 'Possible Earnings Manipulation' : 'Unlikely Manipulation' });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="beneish-m-score" title="Beneish M-Score" description="Detect potential earnings manipulation using the 8-variable model." explanation="The Beneish M-Score combines 8 financial ratios (DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI, TATA) to flag possible earnings manipulation. M-Score > -1.78 indicates potential manipulation." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-3">
        <h3 className="text-xs font-semibold text-muted uppercase">Current Year</h3>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Receivables" name="receivables" value={inputs.receivables} onChange={handleChange} prefix="₹" />
          <InputField label="Revenue" name="revenue" value={inputs.revenue} onChange={handleChange} prefix="₹" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Gross Margin (%)" name="grossMargin" value={inputs.grossMargin} onChange={handleChange} suffix="%" />
          <InputField label="Total Assets" name="totalAssets" value={inputs.totalAssets} onChange={handleChange} prefix="₹" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="PPE" name="ppe" value={inputs.ppe} onChange={handleChange} prefix="₹" />
          <InputField label="SGA Expense" name="sgaExpense" value={inputs.sgaExpense} onChange={handleChange} prefix="₹" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Depreciation" name="depreciation" value={inputs.depreciation} onChange={handleChange} prefix="₹" />
          <InputField label="Total Debt" name="totalDebt" value={inputs.totalDebt} onChange={handleChange} prefix="₹" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Net Income (Ops)" name="netIncomeFromOps" value={inputs.netIncomeFromOps} onChange={handleChange} prefix="₹" />
          <InputField label="Operating CF" name="operatingCashFlow" value={inputs.operatingCashFlow} onChange={handleChange} prefix="₹" />
        </div>
        <h3 className="text-xs font-semibold text-muted uppercase mt-4">Previous Year</h3>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Prev Receivables" name="prevReceivables" value={inputs.prevReceivables} onChange={handleChange} prefix="₹" />
          <InputField label="Prev Revenue" name="prevRevenue" value={inputs.prevRevenue} onChange={handleChange} prefix="₹" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Prev Gross Margin (%)" name="prevGrossMargin" value={inputs.prevGrossMargin} onChange={handleChange} suffix="%" />
          <InputField label="Prev Total Assets" name="prevTotalAssets" value={inputs.prevTotalAssets} onChange={handleChange} prefix="₹" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Prev PPE" name="prevPPE" value={inputs.prevPPE} onChange={handleChange} prefix="₹" />
          <InputField label="Prev SGA Expense" name="prevSGAExpense" value={inputs.prevSGAExpense} onChange={handleChange} prefix="₹" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Prev Depreciation" name="prevDepreciation" value={inputs.prevDepreciation} onChange={handleChange} prefix="₹" />
          <InputField label="Prev Total Debt" name="prevTotalDebt" value={inputs.prevTotalDebt} onChange={handleChange} prefix="₹" />
        </div>
      </div>
      <div>{result && <ResultCard label="M-Score" value={result.mScore.toString()} large color={result.color} subValue={result.verdict} tooltip="M > -1.78 flags possible earnings manipulation" />}</div>
    </CalculatorLayout>
  );
}
