import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { trackUsage } from '../../features/calculatorSlice';
import CalculatorLayout from '../common/CalculatorLayout';
import InputField from '../common/InputField';
import ResultCard from '../common/ResultCard';
import { formatINR } from '../../utils/formatters';

function computeTaxOldRegime(gross, standardDeduction, sec80C, sec80D, otherDeductions) {
  const totalDeductions = standardDeduction + Math.min(150000, sec80C) + Math.min(25000, sec80D) + otherDeductions;
  const taxableIncome = Math.max(0, gross - totalDeductions);

  let tax = 0;
  if (taxableIncome <= 250000) {
    tax = 0;
  } else if (taxableIncome <= 500000) {
    tax = (taxableIncome - 250000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = 12500 + (taxableIncome - 500000) * 0.20;
  } else {
    tax = 112500 + (taxableIncome - 1000000) * 0.30;
  }

  // Rebate under Sec 87A (taxable income <= 5L old regime)
  if (taxableIncome <= 500000) {
    tax = 0;
  }

  // Health and Education Cess @ 4%
  const cess = tax * 0.04;
  const totalTax = tax + cess;

  return { taxableIncome, taxBase: tax, cess, totalTax: Math.round(totalTax), deductions: totalDeductions };
}

function computeTaxNewRegime(gross, standardDeduction) {
  const taxableIncome = Math.max(0, gross - standardDeduction);

  let tax = 0;
  if (taxableIncome <= 300000) {
    tax = 0;
  } else if (taxableIncome <= 700000) {
    tax = (taxableIncome - 300000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax = 20000 + (taxableIncome - 700000) * 0.10;
  } else if (taxableIncome <= 1200000) {
    tax = 50000 + (taxableIncome - 1000000) * 0.15;
  } else if (taxableIncome <= 1500000) {
    tax = 80000 + (taxableIncome - 1200000) * 0.20;
  } else {
    tax = 140000 + (taxableIncome - 1500000) * 0.30;
  }

  // Rebate under Sec 87A (taxable income <= 7L new regime)
  if (taxableIncome <= 700000) {
    tax = 0;
  }

  // Health and Education Cess @ 4%
  const cess = tax * 0.04;
  const totalTax = tax + cess;

  return { taxableIncome, taxBase: tax, cess, totalTax: Math.round(totalTax), deductions: standardDeduction };
}

export default function IncomeTaxCalculator() {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState({
    grossSalary: 1200000,
    sec80C: 150000,
    sec80D: 25000,
    otherDeductions: 50000
  });
  const [result, setResult] = useState(null);

  useEffect(() => { dispatch(trackUsage('income-tax')); }, []);

  useEffect(() => {
    const oldRegime = computeTaxOldRegime(inputs.grossSalary, 50000, inputs.sec80C, inputs.sec80D, inputs.otherDeductions);
    const newRegime = computeTaxNewRegime(inputs.grossSalary, 75000);
    const savings = oldRegime.totalTax - newRegime.totalTax;
    
    setResult({
      oldRegime,
      newRegime,
      savings,
      betterRegime: savings > 0 ? 'New Regime' : savings < 0 ? 'Old Regime' : 'Both same',
      color: savings > 0 ? 'green' : savings < 0 ? 'amber' : 'gray'
    });
  }, [inputs]);

  const handleChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: parseFloat(e.target.value) || 0 }));

  return (
    <CalculatorLayout
      calculatorId="income-tax"
      title="Income Tax Calculator"
      description="Compare tax liability under the Old Regime vs. New Regime for FY 2024-25 (AY 2025-26)."
      explanation={
        <div>
          <p className="mb-2"><strong>New Regime (FY 2024-25):</strong> Higher tax slabs, rebate up to ₹7 Lakhs, and standard deduction of ₹75,000, but no deductions under 80C, 80D, or HRA are allowed.</p>
          <p><strong>Old Regime:</strong> Slower slabs, rebate up to ₹5 Lakhs, standard deduction of ₹50,000, and allows full deductions under Sec 80C (up to ₹1.5L), 80D (up to ₹25k), and HRA deductions.</p>
        </div>
      }
      inputs={inputs}
      outputs={result}
    >
      <div className="glass-card p-5 lg:p-6 space-y-4">
        <InputField label="Gross Annual Salary" name="grossSalary" value={inputs.grossSalary} onChange={handleChange} prefix="₹" tooltip="Gross income before standard deduction" />
        <InputField label="Section 80C Deductions" name="sec80C" value={inputs.sec80C} onChange={handleChange} prefix="₹" tooltip="PPF, ELSS, EPF, LIC premium etc. (Max deduction capped at ₹1.5L under Old Regime)" />
        <InputField label="Section 80D Deductions" name="sec80D" value={inputs.sec80D} onChange={handleChange} prefix="₹" tooltip="Health insurance premium (Max ₹25k for self/spouse/kids under Old Regime)" />
        <InputField label="Other Deductions (HRA, LTA etc.)" name="otherDeductions" value={inputs.otherDeductions} onChange={handleChange} prefix="₹" tooltip="Other tax exemptions allowed under Old Regime" />
      </div>

      <div className="space-y-4">
        {result && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Tax under New Regime" value={formatINR(result.newRegime.totalTax)} large color="green" subValue={`Taxable Income: ${formatINR(result.newRegime.taxableIncome)}`} />
              <ResultCard label="Tax under Old Regime" value={formatINR(result.oldRegime.totalTax)} large color="amber" subValue={`Taxable Income: ${formatINR(result.oldRegime.taxableIncome)}`} />
            </div>

            <ResultCard
              label="Recommendation"
              value={result.betterRegime}
              large
              color={result.color}
              subValue={result.savings > 0 ? `Save ${formatINR(result.savings)} with New Regime!` : result.savings < 0 ? `Save ${formatINR(Math.abs(result.savings))} with Old Regime!` : 'Regimes are equivalent'}
            />

            <div className="glass-card p-4 text-xs text-gray-500 dark:text-gray-400 space-y-2">
              <div className="flex justify-between font-bold border-b pb-1.5 mb-1.5">
                <span>Metric</span>
                <span>New Regime</span>
                <span>Old Regime</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Deduction:</span>
                <span>₹75,000</span>
                <span>₹50,000</span>
              </div>
              <div className="flex justify-between">
                <span>Total Deductions:</span>
                <span className="tabular-nums">{formatINR(result.newRegime.deductions)}</span>
                <span className="tabular-nums">{formatINR(result.oldRegime.deductions)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Base Tax (before Cess):</span>
                <span className="tabular-nums">{formatINR(result.newRegime.taxBase)}</span>
                <span className="tabular-nums">{formatINR(result.oldRegime.taxBase)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </CalculatorLayout>
  );
}
