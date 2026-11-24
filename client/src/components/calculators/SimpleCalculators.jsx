/* Generic Calculator Components — handles the simpler calculators with a shared pattern */
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackUsage } from '../../features/calculatorSlice';
import CalculatorLayout from '../common/CalculatorLayout';
import InputField from '../common/InputField';
import ResultCard from '../common/ResultCard';
import { formatINR, formatPercent } from '../../utils/formatters';

// ── Margin of Safety ──
export function MarginOfSafetyCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ intrinsicValue: 1200, currentPrice: 900 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('margin-of-safety')); }, []);
  useEffect(() => {
    if (inputs.intrinsicValue === 0) return setResult(null);
    const mos = ((inputs.intrinsicValue - inputs.currentPrice) / inputs.intrinsicValue) * 100;
    const mosR = Math.round(mos * 100) / 100;
    let verdict, color;
    if (mos >= 30) { verdict = 'Undervalued'; color = 'green'; }
    else if (mos >= -10) { verdict = 'Fairly Valued'; color = 'amber'; }
    else { verdict = 'Overvalued'; color = 'red'; }
    setResult({ mos: mosR, verdict, color });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="margin-of-safety" title="Margin of Safety" description="Compare intrinsic value to current price to find if a stock is undervalued." explanation="MoS % = ((Intrinsic Value − Current Price) / Intrinsic Value) × 100. Benjamin Graham recommended buying only when MoS ≥ 30% to provide a cushion against estimation errors." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Intrinsic Value" name="intrinsicValue" value={inputs.intrinsicValue} onChange={handleChange} prefix="₹" />
        <InputField label="Current Market Price" name="currentPrice" value={inputs.currentPrice} onChange={handleChange} prefix="₹" />
      </div>
      <div className="space-y-4">
        {result && (
          <>
            <ResultCard label="Margin of Safety" value={formatPercent(result.mos)} large color={result.color} subValue={result.verdict} />
            <div className="glass-card p-4">
              <div className="w-full h-4 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary overflow-hidden">
                <div className={`h-full rounded-full transition-all ${result.color === 'green' ? 'bg-gain' : result.color === 'red' ? 'bg-loss' : 'bg-neutral'}`}
                     style={{ width: `${Math.min(100, Math.max(0, result.mos))}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>Overvalued</span><span>30% (Buy zone)</span><span>Very Safe</span>
              </div>
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}

// ── P/E Fair Value ──
export function PEFairValueCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ eps: 50, industryPE: 25 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('pe-fair-value')); }, []);
  useEffect(() => { setResult({ fairPrice: Math.round(inputs.eps * inputs.industryPE * 100) / 100 }); }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="pe-fair-value" title="P/E Fair Value" description="Estimate fair price using industry average P/E ratio." explanation="Fair Price = EPS × Industry P/E. Simple but effective — compare the stock's current price against this to gauge relative valuation." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Earnings Per Share (EPS)" name="eps" value={inputs.eps} onChange={handleChange} prefix="₹" />
        <InputField label="Industry P/E Ratio" name="industryPE" value={inputs.industryPE} onChange={handleChange} tooltip="Average P/E of sector peers on NSE/BSE" />
      </div>
      <div>{result && <ResultCard label="Fair Price" value={formatINR(result.fairPrice, true)} large color="green" />}</div>
    </CalculatorLayout>
  );
}

// ── PEG Ratio ──
export function PEGRatioCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ peRatio: 25, epsGrowthRate: 20 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('peg-ratio')); }, []);
  useEffect(() => {
    if (inputs.epsGrowthRate === 0) return setResult({ peg: Infinity, verdict: 'N/A', color: 'amber' });
    const peg = Math.round((inputs.peRatio / inputs.epsGrowthRate) * 100) / 100;
    let verdict, color;
    if (peg < 1) { verdict = 'Undervalued'; color = 'green'; }
    else if (peg <= 1.5) { verdict = 'Fairly Valued'; color = 'amber'; }
    else { verdict = 'Overvalued'; color = 'red'; }
    setResult({ peg, verdict, color });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="peg-ratio" title="PEG Ratio" description="Price/Earnings to Growth — a PEG < 1 may indicate undervaluation." explanation="PEG = P/E Ratio / EPS Growth Rate. Peter Lynch popularized this: PEG < 1 suggests the stock is undervalued relative to its growth, PEG ≈ 1 is fair, PEG > 1 may be overpriced." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="P/E Ratio" name="peRatio" value={inputs.peRatio} onChange={handleChange} />
        <InputField label="EPS Growth Rate (%)" name="epsGrowthRate" value={inputs.epsGrowthRate} onChange={handleChange} suffix="%" />
      </div>
      <div>{result && <ResultCard label="PEG Ratio" value={result.peg === Infinity ? '∞' : result.peg.toString()} large color={result.color} subValue={result.verdict} />}</div>
    </CalculatorLayout>
  );
}

// ── EV/EBITDA ──
export function EVEBITDACalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ enterpriseValue: 50000, ebitda: 5000 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('ev-ebitda')); }, []);
  useEffect(() => {
    if (inputs.ebitda === 0) return setResult(null);
    setResult({ multiple: Math.round((inputs.enterpriseValue / inputs.ebitda) * 100) / 100 });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="ev-ebitda" title="EV/EBITDA" description="Enterprise Value to EBITDA multiple — widely used for comparing companies across capital structures." explanation="EV/EBITDA = Enterprise Value / EBITDA. A lower multiple may indicate undervaluation. Typical ranges: <8 cheap, 8-12 fair, >12 expensive (varies by sector)." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Enterprise Value (₹ Cr)" name="enterpriseValue" value={inputs.enterpriseValue} onChange={handleChange} prefix="₹" />
        <InputField label="EBITDA (₹ Cr)" name="ebitda" value={inputs.ebitda} onChange={handleChange} prefix="₹" />
      </div>
      <div>{result && <ResultCard label="EV/EBITDA Multiple" value={`${result.multiple}x`} large />}</div>
    </CalculatorLayout>
  );
}

// ── Price-to-Book ──
export function PriceToBookCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ sharePrice: 1500, bookValuePerShare: 500 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('price-to-book')); }, []);
  useEffect(() => {
    if (inputs.bookValuePerShare === 0) return setResult(null);
    setResult({ pb: Math.round((inputs.sharePrice / inputs.bookValuePerShare) * 100) / 100 });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="price-to-book" title="Price-to-Book Ratio" description="P/B = Share Price / Book Value Per Share. Especially useful for banks and financials." explanation="P/B ratio compares market price to book value. For banks/NBFCs, book value closely reflects asset value, making P/B a key metric. P/B < 1 may indicate undervaluation, but could also signal asset quality issues." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Share Price" name="sharePrice" value={inputs.sharePrice} onChange={handleChange} prefix="₹" />
        <InputField label="Book Value Per Share" name="bookValuePerShare" value={inputs.bookValuePerShare} onChange={handleChange} prefix="₹" />
      </div>
      <div className="space-y-3">
        {result && (
          <>
            <ResultCard label="P/B Ratio" value={`${result.pb}x`} large color={result.pb < 1 ? 'green' : result.pb < 3 ? 'amber' : 'red'} />
            <div className="glass-card p-3 text-xs text-accent bg-accent/5">
              🏦 P/B is especially relevant for banks, NBFCs, and financial companies where book value closely reflects asset value.
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}

// ── ROE ──
export function ROECalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ netProfit: 5000, shareholdersEquity: 25000 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('roe')); }, []);
  useEffect(() => {
    if (inputs.shareholdersEquity === 0) return setResult(null);
    const roe = Math.round((inputs.netProfit / inputs.shareholdersEquity) * 100 * 100) / 100;
    setResult({ roe, color: roe >= 15 ? 'green' : roe >= 10 ? 'amber' : 'red' });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="roe" title="Return on Equity (ROE)" description="Measures how effectively the company uses shareholders' equity to generate profit." explanation="ROE = (Net Profit / Shareholders' Equity) × 100. A consistently high ROE (>15%) indicates good management efficiency. Warren Buffett looks for ROE >15% sustained over 10 years." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Net Profit (₹ Cr)" name="netProfit" value={inputs.netProfit} onChange={handleChange} prefix="₹" />
        <InputField label="Shareholders' Equity (₹ Cr)" name="shareholdersEquity" value={inputs.shareholdersEquity} onChange={handleChange} prefix="₹" />
      </div>
      <div>{result && <ResultCard label="ROE" value={formatPercent(result.roe)} large color={result.color} subValue={result.roe >= 15 ? 'Excellent' : result.roe >= 10 ? 'Good' : 'Below Average'} />}</div>
    </CalculatorLayout>
  );
}

// ── ROCE ──
export function ROCECalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ ebit: 8000, totalAssets: 50000, currentLiabilities: 15000 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('roce')); }, []);
  useEffect(() => {
    const ce = inputs.totalAssets - inputs.currentLiabilities;
    if (ce === 0) return setResult(null);
    const roce = Math.round((inputs.ebit / ce) * 100 * 100) / 100;
    setResult({ roce, ce, color: roce >= 20 ? 'green' : roce >= 12 ? 'amber' : 'red' });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="roce" title="Return on Capital Employed (ROCE)" description="Measures profitability relative to total capital employed — better than ROE for comparing across capital structures." explanation="ROCE = EBIT / Capital Employed × 100, where Capital Employed = Total Assets − Current Liabilities. A ROCE > 20% is generally excellent for Indian companies." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="EBIT (₹ Cr)" name="ebit" value={inputs.ebit} onChange={handleChange} prefix="₹" />
        <InputField label="Total Assets (₹ Cr)" name="totalAssets" value={inputs.totalAssets} onChange={handleChange} prefix="₹" />
        <InputField label="Current Liabilities (₹ Cr)" name="currentLiabilities" value={inputs.currentLiabilities} onChange={handleChange} prefix="₹" />
      </div>
      <div className="space-y-3">
        {result && (
          <>
            <ResultCard label="ROCE" value={formatPercent(result.roce)} large color={result.color} subValue={result.roce >= 20 ? 'Excellent' : result.roce >= 12 ? 'Good' : 'Low'} />
            <ResultCard label="Capital Employed" value={formatINR(result.ce)} />
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}

// ── Debt-to-Equity ──
export function DebtToEquityCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ totalDebt: 5000, shareholdersEquity: 20000 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('debt-to-equity')); }, []);
  useEffect(() => {
    if (inputs.shareholdersEquity === 0) return setResult(null);
    const de = Math.round((inputs.totalDebt / inputs.shareholdersEquity) * 100) / 100;
    let risk, color;
    if (de < 0.5) { risk = 'Low Risk'; color = 'green'; }
    else if (de <= 1.5) { risk = 'Moderate Risk'; color = 'amber'; }
    else { risk = 'High Risk'; color = 'red'; }
    setResult({ de, risk, color });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="debt-to-equity" title="Debt-to-Equity Ratio" description="Assesses financial leverage — how much the company relies on debt vs equity." explanation="D/E = Total Debt / Shareholders' Equity. Lower is generally better. D/E < 0.5 = low risk, 0.5-1.5 = moderate, > 1.5 = high leverage risk. NBFCs/Banks naturally have higher D/E." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Total Debt (₹ Cr)" name="totalDebt" value={inputs.totalDebt} onChange={handleChange} prefix="₹" />
        <InputField label="Shareholders' Equity (₹ Cr)" name="shareholdersEquity" value={inputs.shareholdersEquity} onChange={handleChange} prefix="₹" />
      </div>
      <div>{result && <ResultCard label="D/E Ratio" value={result.de.toString()} large color={result.color} subValue={result.risk} />}</div>
    </CalculatorLayout>
  );
}

// ── Interest Coverage ──
export function InterestCoverageCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ ebit: 8000, interestExpense: 2000 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('interest-coverage')); }, []);
  useEffect(() => {
    if (inputs.interestExpense === 0) return setResult({ ratio: Infinity, verdict: 'No Debt', color: 'green' });
    const ratio = Math.round((inputs.ebit / inputs.interestExpense) * 100) / 100;
    let verdict, color;
    if (ratio < 1.5) { verdict = 'Risky'; color = 'red'; }
    else if (ratio <= 3) { verdict = 'Adequate'; color = 'amber'; }
    else { verdict = 'Safe'; color = 'green'; }
    setResult({ ratio, verdict, color });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="interest-coverage" title="Interest Coverage Ratio" description="Can the company comfortably pay its interest expenses?" explanation="Interest Coverage = EBIT / Interest Expense. A ratio < 1.5 means the company may struggle to service debt. > 3 is considered safe." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="EBIT (₹ Cr)" name="ebit" value={inputs.ebit} onChange={handleChange} prefix="₹" />
        <InputField label="Interest Expense (₹ Cr)" name="interestExpense" value={inputs.interestExpense} onChange={handleChange} prefix="₹" />
      </div>
      <div>{result && <ResultCard label="Coverage Ratio" value={result.ratio === Infinity ? '∞' : `${result.ratio}x`} large color={result.color} subValue={result.verdict} />}</div>
    </CalculatorLayout>
  );
}

// ── Free Cash Flow ──
export function FreeCashFlowCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ operatingCashFlow: 10000, capex: 3000 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('free-cash-flow')); }, []);
  useEffect(() => {
    const fcf = inputs.operatingCashFlow - Math.abs(inputs.capex);
    setResult({ fcf: Math.round(fcf * 100) / 100, color: fcf > 0 ? 'green' : 'red' });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="free-cash-flow" title="Free Cash Flow" description="Cash available after capital expenditures — the true cash-generating ability." explanation="FCF = Operating Cash Flow − CapEx. Positive and growing FCF is a strong sign of financial health." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Operating Cash Flow (₹ Cr)" name="operatingCashFlow" value={inputs.operatingCashFlow} onChange={handleChange} prefix="₹" />
        <InputField label="Capital Expenditure (₹ Cr)" name="capex" value={inputs.capex} onChange={handleChange} prefix="₹" />
      </div>
      <div>{result && <ResultCard label="Free Cash Flow" value={formatINR(result.fcf)} large color={result.color} subValue={result.fcf > 0 ? 'Positive FCF' : 'Negative FCF'} />}</div>
    </CalculatorLayout>
  );
}

// ── CAGR ──
export function CAGRCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ startValue: 100, endValue: 250, years: 5 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('cagr')); }, []);
  useEffect(() => {
    if (inputs.startValue <= 0 || inputs.years <= 0) return setResult(null);
    const rate = (Math.pow(inputs.endValue / inputs.startValue, 1 / inputs.years) - 1) * 100;
    setResult({ cagr: Math.round(rate * 100) / 100, color: rate >= 0 ? 'green' : 'red' });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="cagr" title="CAGR Calculator" description="Compound Annual Growth Rate — the smoothed annual return over a period." explanation="CAGR = (End Value / Start Value)^(1/years) − 1. Use this for Revenue CAGR, EPS CAGR, Profit CAGR, or any growth metric." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Start Value" name="startValue" value={inputs.startValue} onChange={handleChange} prefix="₹" />
        <InputField label="End Value" name="endValue" value={inputs.endValue} onChange={handleChange} prefix="₹" />
        <InputField label="Number of Years" name="years" value={inputs.years} onChange={handleChange} min={1} />
      </div>
      <div>{result && <ResultCard label="CAGR" value={formatPercent(result.cagr)} large color={result.color} />}</div>
    </CalculatorLayout>
  );
}

// ── Dividend Yield ──
export function DividendYieldCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ dividendPerShare: 10, sharePrice: 500 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('dividend-yield')); }, []);
  useEffect(() => {
    if (inputs.sharePrice === 0) return setResult(null);
    const yld = Math.round((inputs.dividendPerShare / inputs.sharePrice) * 100 * 100) / 100;
    setResult({ yield: yld, color: yld >= 3 ? 'green' : yld >= 1 ? 'amber' : 'red' });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="dividend-yield" title="Dividend Yield" description="Annual dividend as a percentage of share price." explanation="Yield = (Dividend Per Share / Share Price) × 100. A yield of 2-4% is typical for large-cap Indian dividend stocks." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Dividend Per Share" name="dividendPerShare" value={inputs.dividendPerShare} onChange={handleChange} prefix="₹" />
        <InputField label="Share Price" name="sharePrice" value={inputs.sharePrice} onChange={handleChange} prefix="₹" />
      </div>
      <div>{result && <ResultCard label="Dividend Yield" value={formatPercent(result.yield)} large color={result.color} />}</div>
    </CalculatorLayout>
  );
}

// ── TSR ──
export function TSRCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ startPrice: 500, endPrice: 650, totalDividends: 30 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('total-shareholder-return')); }, []);
  useEffect(() => {
    if (inputs.startPrice === 0) return setResult(null);
    const tsr = Math.round(((inputs.endPrice - inputs.startPrice + inputs.totalDividends) / inputs.startPrice) * 100 * 100) / 100;
    setResult({ tsr, color: tsr >= 0 ? 'green' : 'red' });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="total-shareholder-return" title="Total Shareholder Return (TSR)" description="Combines price appreciation and dividends for the true return." explanation="TSR = ((End Price − Start Price) + Total Dividends) / Start Price × 100. This captures the complete picture of returns including income." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Start Price" name="startPrice" value={inputs.startPrice} onChange={handleChange} prefix="₹" />
        <InputField label="End Price" name="endPrice" value={inputs.endPrice} onChange={handleChange} prefix="₹" />
        <InputField label="Total Dividends Received" name="totalDividends" value={inputs.totalDividends} onChange={handleChange} prefix="₹" />
      </div>
      <div>{result && <ResultCard label="Total Shareholder Return" value={formatPercent(result.tsr)} large color={result.color} />}</div>
    </CalculatorLayout>
  );
}

// ── Lump Sum ──
export function LumpSumCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ principal: 500000, expectedReturnRate: 12, years: 10 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('lump-sum')); }, []);
  useEffect(() => {
    const fv = inputs.principal * Math.pow(1 + inputs.expectedReturnRate / 100, inputs.years);
    setResult({ futureValue: Math.round(fv), gains: Math.round(fv - inputs.principal) });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="lump-sum" title="Lump Sum Investment" description="Calculate future value of a one-time investment." explanation="FV = P × (1 + r)^n. Shows the power of compounding for a single investment." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Investment Amount" name="principal" value={inputs.principal} onChange={handleChange} prefix="₹" />
        <InputField label="Expected Return (%)" name="expectedReturnRate" value={inputs.expectedReturnRate} onChange={handleChange} suffix="%" />
        <InputField label="Period (Years)" name="years" value={inputs.years} onChange={handleChange} min={1} />
      </div>
      <div className="space-y-3">
        {result && (
          <>
            <ResultCard label="Future Value" value={formatINR(result.futureValue)} large color="green" />
            <ResultCard label="Total Gains" value={formatINR(result.gains)} color="green" />
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}

// ── Inflation ──
export function InflationCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ presentCost: 100000, inflationRate: 6, years: 10 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('inflation')); }, []);
  useEffect(() => {
    const fc = inputs.presentCost * Math.pow(1 + inputs.inflationRate / 100, inputs.years);
    const erosion = ((fc - inputs.presentCost) / fc) * 100;
    setResult({ futureCost: Math.round(fc), erosion: Math.round(erosion * 100) / 100 });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="inflation" title="Inflation Impact Calculator" description="See how inflation erodes the purchasing power of your money." explanation="Future Cost = Present Cost × (1 + inflation)^years. India's CPI inflation has averaged ~5-6% over the past decade." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Present Cost" name="presentCost" value={inputs.presentCost} onChange={handleChange} prefix="₹" />
        <InputField label="Inflation Rate (%)" name="inflationRate" value={inputs.inflationRate} onChange={handleChange} suffix="%" tooltip="India CPI inflation (6% is a reasonable estimate)" />
        <InputField label="Years" name="years" value={inputs.years} onChange={handleChange} min={1} />
      </div>
      <div className="space-y-3">
        {result && (
          <>
            <ResultCard label="Future Cost" value={formatINR(result.futureCost)} large color="red" />
            <ResultCard label="Purchasing Power Erosion" value={formatPercent(result.erosion)} color="red" tooltip="Percentage of your money's value lost to inflation" />
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}

// ── Position Size ──
export function PositionSizeCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ portfolioSize: 1000000, riskPercent: 2, entryPrice: 500, stopLossPrice: 480 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('position-size')); }, []);
  useEffect(() => {
    if (inputs.entryPrice <= inputs.stopLossPrice) return setResult(null);
    const risk = inputs.portfolioSize * (inputs.riskPercent / 100);
    const rps = inputs.entryPrice - inputs.stopLossPrice;
    const shares = Math.floor(risk / rps);
    const total = shares * inputs.entryPrice;
    setResult({ riskAmount: Math.round(risk), riskPerShare: rps, sharesToBuy: shares, totalInvestment: Math.round(total), pctOfPortfolio: Math.round((total / inputs.portfolioSize) * 100 * 100) / 100 });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="position-size" title="Position Size Calculator" description="Calculate how many shares to buy based on your risk tolerance." explanation="Shares to Buy = (Portfolio × Risk%) / (Entry Price − Stop Loss). This ensures you never risk more than a fixed percentage on any single trade." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Portfolio Size" name="portfolioSize" value={inputs.portfolioSize} onChange={handleChange} prefix="₹" />
        <InputField label="Risk per Trade (%)" name="riskPercent" value={inputs.riskPercent} onChange={handleChange} suffix="%" />
        <InputField label="Entry Price" name="entryPrice" value={inputs.entryPrice} onChange={handleChange} prefix="₹" />
        <InputField label="Stop-Loss Price" name="stopLossPrice" value={inputs.stopLossPrice} onChange={handleChange} prefix="₹" />
      </div>
      <div className="space-y-3">
        {result && (
          <>
            <ResultCard label="Shares to Buy" value={result.sharesToBuy.toString()} large color="green" />
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Risk Amount" value={formatINR(result.riskAmount)} />
              <ResultCard label="Total Investment" value={formatINR(result.totalInvestment)} subValue={`${result.pctOfPortfolio}% of portfolio`} />
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}

// ── EPS Growth ──
export function EPSGrowthCalculator() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([{ year: 2020, eps: 30 }, { year: 2021, eps: 35 }, { year: 2022, eps: 42 }, { year: 2023, eps: 50 }, { year: 2024, eps: 58 }]);
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('eps-growth')); }, []);
  useEffect(() => {
    if (rows.length < 2) return;
    const growthRates = [];
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1].eps;
      const curr = rows[i].eps;
      growthRates.push({ year: rows[i].year, eps: curr, growth: prev === 0 ? 0 : Math.round(((curr - prev) / Math.abs(prev)) * 100 * 100) / 100 });
    }
    const first = rows[0]; const last = rows[rows.length - 1]; const yrs = last.year - first.year;
    const cagr = first.eps > 0 && yrs > 0 ? Math.round((Math.pow(last.eps / first.eps, 1 / yrs) - 1) * 100 * 100) / 100 : 0;
    setResult({ growthRates, cagr });
  }, [rows]);

  const updateRow = (idx, field, val) => setRows((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: parseFloat(val) || 0 } : r));

  return (
    <CalculatorLayout calculatorId="eps-growth" title="EPS Growth Calculator" description="Track year-over-year earnings per share growth." explanation="Enter multiple years of EPS data to see YoY growth rates and the overall CAGR." inputs={rows} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-2">EPS Data</h3>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <InputField label={i === 0 ? 'Year' : ''} name={`year-${i}`} value={row.year} onChange={(e) => updateRow(i, 'year', e.target.value)} />
            <InputField label={i === 0 ? 'EPS (₹)' : ''} name={`eps-${i}`} value={row.eps} onChange={(e) => updateRow(i, 'eps', e.target.value)} prefix="₹" />
          </div>
        ))}
        <button onClick={() => setRows([...rows, { year: (rows[rows.length - 1]?.year || 2024) + 1, eps: 0 }])} className="text-xs text-accent font-medium hover:underline">+ Add Year</button>
      </div>
      <div className="space-y-3">
        {result && (
          <>
            <ResultCard label="EPS CAGR" value={formatPercent(result.cagr)} large color={result.cagr >= 0 ? 'green' : 'red'} />
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3">YoY Growth</h3>
              {result.growthRates.map((g) => (
                <div key={g.year} className="flex justify-between py-1.5 border-b border-surface-border dark:border-surface-dark-border last:border-0 text-sm">
                  <span>{g.year}</span>
                  <span className="tabular-nums">₹{g.eps}</span>
                  <span className={`tabular-nums font-medium ${g.growth >= 0 ? 'text-positive' : 'text-accent'}`}>{formatPercent(g.growth)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}

// ── Retirement ──
export function RetirementCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ currentAge: 30, retirementAge: 60, monthlyExpenseToday: 50000, inflationRate: 6, expectedReturn: 12, postRetirementReturn: 8, lifeExpectancy: 80 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('retirement')); }, []);
  useEffect(() => {
    const ytr = inputs.retirementAge - inputs.currentAge;
    const ry = inputs.lifeExpectancy - inputs.retirementAge;
    if (ytr <= 0 || ry <= 0) return setResult(null);

    const annExp = inputs.monthlyExpenseToday * 12;
    const annExpRet = annExp * Math.pow(1 + inputs.inflationRate / 100, ytr);
    const rrr = ((1 + inputs.postRetirementReturn / 100) / (1 + inputs.inflationRate / 100)) - 1;
    const corpus = rrr === 0 ? annExpRet * ry : annExpRet * (1 - Math.pow(1 + rrr, -ry)) / rrr;
    const mr = inputs.expectedReturn / 100 / 12;
    const months = ytr * 12;
    const sip = mr === 0 ? corpus / months : corpus / (((Math.pow(1 + mr, months) - 1) / mr) * (1 + mr));

    setResult({ yearsToRetirement: ytr, retirementYears: ry, monthlyExpenseAtRetirement: Math.round(annExpRet / 12), requiredCorpus: Math.round(corpus), requiredMonthlySIP: Math.round(sip) });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="retirement" title="Retirement Planner" description="Calculate the corpus you need for a comfortable retirement and the SIP to get there." explanation="Computes the required retirement corpus as the PV of inflation-adjusted expenses over retirement years, then calculates the monthly SIP needed to accumulate that corpus." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Current Age" name="currentAge" value={inputs.currentAge} onChange={handleChange} />
          <InputField label="Retirement Age" name="retirementAge" value={inputs.retirementAge} onChange={handleChange} />
        </div>
        <InputField label="Monthly Expense Today" name="monthlyExpenseToday" value={inputs.monthlyExpenseToday} onChange={handleChange} prefix="₹" />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Inflation (%)" name="inflationRate" value={inputs.inflationRate} onChange={handleChange} suffix="%" />
          <InputField label="Pre-Retirement Return (%)" name="expectedReturn" value={inputs.expectedReturn} onChange={handleChange} suffix="%" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Post-Retirement Return (%)" name="postRetirementReturn" value={inputs.postRetirementReturn} onChange={handleChange} suffix="%" />
          <InputField label="Life Expectancy" name="lifeExpectancy" value={inputs.lifeExpectancy} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-3">
        {result && (
          <>
            <ResultCard label="Required Corpus" value={formatINR(result.requiredCorpus)} large color="amber" tooltip="Total retirement fund needed at retirement age" />
            <ResultCard label="Required Monthly SIP" value={formatINR(result.requiredMonthlySIP)} large color="green" tooltip="Monthly SIP to accumulate the required corpus" />
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Monthly Expense at Retirement" value={formatINR(result.monthlyExpenseAtRetirement)} />
              <ResultCard label="Years to Retirement" value={`${result.yearsToRetirement} yrs`} />
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}

// ── Asset Allocation ──
export function AssetAllocationCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ age: 30, riskProfile: 'Moderate' });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('asset-allocation')); }, []);
  useEffect(() => {
    const eqBase = Math.max(20, Math.min(80, 100 - inputs.age));
    const profiles = {
      Conservative: { eq: Math.max(20, eqBase - 15), gold: 15, nps: 10, cash: 10 },
      Moderate: { eq: eqBase, gold: 10, nps: 10, cash: 5 },
      Aggressive: { eq: Math.min(80, eqBase + 15), gold: 5, nps: 5, cash: 5 },
    };
    const p = profiles[inputs.riskProfile] || profiles.Moderate;
    p.fixedIncome = Math.max(0, 100 - p.eq - p.gold - p.nps - p.cash);
    setResult(p);
  }, [inputs]);

  return (
    <CalculatorLayout calculatorId="asset-allocation" title="Asset Allocation" description="Get a suggested asset mix based on your age and risk profile — tailored for Indian investors." explanation="Uses the '100 minus age' heuristic for equity allocation, adjusted by risk profile. Asset classes include Equity (Direct/MF), Gold (incl. SGB), Fixed Income (FD/Bonds/PPF), NPS, and Cash/Liquid Funds." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Age" name="age" value={inputs.age} onChange={(e) => setInputs((p) => ({ ...p, age: parseInt(e.target.value) || 0 }))} min={18} max={80} />
        <div>
          <label className="text-sm font-medium text-ink mb-2 block">Risk Profile</label>
          <div className="grid grid-cols-3 gap-2">
            {['Conservative', 'Moderate', 'Aggressive'].map((p) => (
              <button key={p} onClick={() => setInputs((prev) => ({ ...prev, riskProfile: p }))}
                className={`py-2.5 rounded-sm text-xs font-semibold transition-all ${inputs.riskProfile === p ? 'bg-accent text-onaccent shadow-lg' : 'bg-surface-secondary text-muted hover:bg-surface-border'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {result && (
          <>
            <ResultCard label="Equity (Stocks/MF)" value={`${result.eq}%`} color="green" />
            <ResultCard label="Gold (incl. SGB)" value={`${result.gold}%`} color="amber" />
            <ResultCard label="Fixed Income (FD/Bonds/PPF)" value={`${result.fixedIncome}%`} />
            <ResultCard label="NPS" value={`${result.nps}%`} />
            <ResultCard label="Cash / Liquid Funds" value={`${result.cash}%`} />
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}

// ── Altman Z-Score ──
export function AltmanZScoreCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({ workingCapital: 300, totalAssets: 1000, retainedEarnings: 400, ebit: 200, marketCap: 2000, totalLiabilities: 500, sales: 1500 });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('altman-z-score')); }, []);
  useEffect(() => {
    if (inputs.totalAssets === 0) return setResult(null);
    const A = inputs.workingCapital / inputs.totalAssets;
    const B = inputs.retainedEarnings / inputs.totalAssets;
    const C = inputs.ebit / inputs.totalAssets;
    const D = inputs.totalLiabilities === 0 ? 0 : inputs.marketCap / inputs.totalLiabilities;
    const E = inputs.sales / inputs.totalAssets;
    const z = 1.2 * A + 1.4 * B + 3.3 * C + 0.6 * D + 1.0 * E;
    const zR = Math.round(z * 100) / 100;
    let zone, color;
    if (z > 2.99) { zone = 'Safe Zone'; color = 'green'; }
    else if (z >= 1.81) { zone = 'Grey Zone'; color = 'amber'; }
    else { zone = 'Distress Zone'; color = 'red'; }
    setResult({ zScore: zR, zone, color });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout calculatorId="altman-z-score" title="Altman Z-Score" description="Predict bankruptcy risk using Altman's formula." explanation="Z = 1.2(WC/TA) + 1.4(RE/TA) + 3.3(EBIT/TA) + 0.6(MC/TL) + 1.0(Sales/TA). Z > 2.99 = Safe, 1.81-2.99 = Grey, < 1.81 = Distress Zone." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Working Capital (₹ Cr)" name="workingCapital" value={inputs.workingCapital} onChange={handleChange} prefix="₹" />
        <InputField label="Total Assets (₹ Cr)" name="totalAssets" value={inputs.totalAssets} onChange={handleChange} prefix="₹" />
        <InputField label="Retained Earnings (₹ Cr)" name="retainedEarnings" value={inputs.retainedEarnings} onChange={handleChange} prefix="₹" />
        <InputField label="EBIT (₹ Cr)" name="ebit" value={inputs.ebit} onChange={handleChange} prefix="₹" />
        <InputField label="Market Cap (₹ Cr)" name="marketCap" value={inputs.marketCap} onChange={handleChange} prefix="₹" />
        <InputField label="Total Liabilities (₹ Cr)" name="totalLiabilities" value={inputs.totalLiabilities} onChange={handleChange} prefix="₹" />
        <InputField label="Sales (₹ Cr)" name="sales" value={inputs.sales} onChange={handleChange} prefix="₹" />
      </div>
      <div>{result && <ResultCard label="Z-Score" value={result.zScore.toString()} large color={result.color} subValue={result.zone} tooltip="Z > 2.99 Safe, 1.81-2.99 Grey, < 1.81 Distress" />}</div>
    </CalculatorLayout>
  );
}

// ── Piotroski F-Score ──
export function PiotroskiFScoreCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({
    netIncome: 100, totalAssets: 1000, operatingCashFlow: 150,
    prevROA: 8, currentROA: 10, prevLeverage: 50, currentLeverage: 45,
    prevCurrentRatio: 1.5, currentCurrentRatio: 1.7, sharesIssued: false,
    prevGrossMargin: 40, currentGrossMargin: 42, prevAssetTurnover: 80, currentAssetTurnover: 85,
  });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('piotroski-f-score')); }, []);
  useEffect(() => {
    const tests = [
      { name: 'ROA > 0', passed: inputs.totalAssets > 0 && inputs.netIncome / inputs.totalAssets > 0 },
      { name: 'Operating CF > 0', passed: inputs.operatingCashFlow > 0 },
      { name: 'ΔROA > 0', passed: inputs.currentROA > inputs.prevROA },
      { name: 'CF > Net Income', passed: inputs.operatingCashFlow > inputs.netIncome },
      { name: 'ΔLeverage < 0', passed: inputs.currentLeverage < inputs.prevLeverage },
      { name: 'ΔCurrent Ratio > 0', passed: inputs.currentCurrentRatio > inputs.prevCurrentRatio },
      { name: 'No New Shares', passed: !inputs.sharesIssued },
      { name: 'ΔGross Margin > 0', passed: inputs.currentGrossMargin > inputs.prevGrossMargin },
      { name: 'ΔAsset Turnover > 0', passed: inputs.currentAssetTurnover > inputs.prevAssetTurnover },
    ];
    const score = tests.filter((t) => t.passed).length;
    let color = score >= 7 ? 'green' : score >= 4 ? 'amber' : 'red';
    let verdict = score >= 7 ? 'Strong' : score >= 4 ? 'Moderate' : 'Weak';
    setResult({ score, tests, color, verdict });
  }, [inputs]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs((p) => ({ ...p, [name]: type === 'checkbox' ? checked : parseFloat(value) || 0 }));
  };

  return (
    <CalculatorLayout calculatorId="piotroski-f-score" title="Piotroski F-Score" description="9-point test of financial strength — higher is better." explanation="Joseph Piotroski's F-Score tests 9 binary conditions across profitability, leverage, and efficiency. Score 7-9 = Strong, 4-6 = Moderate, 0-3 = Weak." inputs={inputs} outputs={result}>
      <div className="glass-card p-5 lg:p-6 space-y-3">
        <h3 className="text-sm font-semibold text-muted mb-2">Profitability</h3>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Net Income (₹ Cr)" name="netIncome" value={inputs.netIncome} onChange={handleChange} prefix="₹" />
          <InputField label="Total Assets (₹ Cr)" name="totalAssets" value={inputs.totalAssets} onChange={handleChange} prefix="₹" />
        </div>
        <InputField label="Operating Cash Flow (₹ Cr)" name="operatingCashFlow" value={inputs.operatingCashFlow} onChange={handleChange} prefix="₹" />
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Previous ROA (%)" name="prevROA" value={inputs.prevROA} onChange={handleChange} suffix="%" />
          <InputField label="Current ROA (%)" name="currentROA" value={inputs.currentROA} onChange={handleChange} suffix="%" />
        </div>
        <h3 className="text-sm font-semibold text-muted mt-4 mb-2">Leverage & Liquidity</h3>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Previous Leverage (%)" name="prevLeverage" value={inputs.prevLeverage} onChange={handleChange} suffix="%" />
          <InputField label="Current Leverage (%)" name="currentLeverage" value={inputs.currentLeverage} onChange={handleChange} suffix="%" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Prev Current Ratio" name="prevCurrentRatio" value={inputs.prevCurrentRatio} onChange={handleChange} />
          <InputField label="Current Ratio" name="currentCurrentRatio" value={inputs.currentCurrentRatio} onChange={handleChange} />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" name="sharesIssued" checked={inputs.sharesIssued} onChange={handleChange} className="rounded border-surface-border" />
          New shares issued this year?
        </label>
        <h3 className="text-sm font-semibold text-muted mt-4 mb-2">Efficiency</h3>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Prev Gross Margin (%)" name="prevGrossMargin" value={inputs.prevGrossMargin} onChange={handleChange} suffix="%" />
          <InputField label="Current Gross Margin (%)" name="currentGrossMargin" value={inputs.currentGrossMargin} onChange={handleChange} suffix="%" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <InputField label="Prev Asset Turnover (%)" name="prevAssetTurnover" value={inputs.prevAssetTurnover} onChange={handleChange} suffix="%" />
          <InputField label="Current Asset Turnover (%)" name="currentAssetTurnover" value={inputs.currentAssetTurnover} onChange={handleChange} suffix="%" />
        </div>
      </div>
      <div className="space-y-3">
        {result && (
          <>
            <ResultCard label="F-Score" value={`${result.score} / 9`} large color={result.color} subValue={result.verdict} />
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold mb-3">Test Results</h3>
              {result.tests.map((t, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-surface-border dark:border-surface-dark-border last:border-0 text-sm">
                  <span>{t.name}</span>
                  <span className={t.passed ? 'text-positive font-medium' : 'text-accent'}>{t.passed ? '✓ Pass' : '✗ Fail'}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}
