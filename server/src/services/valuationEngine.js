/**
 * ValuePro India — Valuation Engine
 * 
 * All 30 calculator formula implementations as pure functions.
 * No side effects, no DB calls — fully unit-testable.
 * 
 * Each function takes a plain object of inputs and returns a plain object of outputs.
 * This file is mirrored on the frontend as formulas.js for instant client-side preview.
 */

// ============================================================================
// 1. INTRINSIC VALUE CALCULATOR (dispatches to sub-methods)
// ============================================================================

/**
 * Graham Formula: IV = EPS × (8.5 + 2g) × 4.4 / Y
 * g = expected growth rate (%), Y = 10-year Indian G-Sec yield (%)
 */
function grahamIntrinsicValue({ eps, growthRate, gsecYield = 7.1 }) {
  if (eps === undefined || eps === null || isNaN(eps) || growthRate === undefined || growthRate === null || isNaN(growthRate)) {
    return { error: 'EPS and Growth Rate are required' };
  }
  if (gsecYield === 0) return { intrinsicValue: 0, error: 'G-Sec yield cannot be zero' };
  const iv = (eps * (8.5 + 2 * growthRate) * 4.4) / gsecYield;
  return { intrinsicValue: Math.round(iv * 100) / 100, method: 'Graham' };
}

/**
 * Peter Lynch Fair Value: FV = EPS × Growth Rate (PEG=1 basis)
 */
function lynchFairValue({ eps, growthRate }) {
  if (eps === undefined || eps === null || isNaN(eps) || growthRate === undefined || growthRate === null || isNaN(growthRate)) {
    return { error: 'EPS and Growth Rate are required' };
  }
  const fairValue = eps * growthRate;
  return { fairValue: Math.round(fairValue * 100) / 100, method: 'Lynch' };
}

/**
 * Earnings Power Value: EPV = Adjusted Earnings / WACC
 */
function earningsPowerValue({ adjustedEarnings, wacc }) {
  if (adjustedEarnings === undefined || adjustedEarnings === null || isNaN(adjustedEarnings) || wacc === undefined || wacc === null || isNaN(wacc)) {
    return { error: 'Adjusted Earnings and WACC are required' };
  }
  if (wacc === 0) return { epv: 0, error: 'WACC cannot be zero' };
  const epv = adjustedEarnings / (wacc / 100);
  return { epv: Math.round(epv * 100) / 100, method: 'EPV' };
}


/**
 * Intrinsic Value — dispatcher for 4 methods
 */
function intrinsicValue({ method, ...inputs }) {
  switch (method) {
    case 'graham': return grahamIntrinsicValue(inputs);
    case 'lynch': return lynchFairValue(inputs);
    case 'epv': return earningsPowerValue(inputs);
    case 'dcf': return dcfValuation(inputs);
    default: return { error: `Unknown method: ${method}` };
  }
}

// ============================================================================
// 2. MARGIN OF SAFETY CALCULATOR
// ============================================================================

function marginOfSafety({ intrinsicValue, currentPrice }) {
  if (intrinsicValue === 0) return { mosPercent: 0, verdict: 'N/A' };
  const mos = ((intrinsicValue - currentPrice) / intrinsicValue) * 100;
  const mosRounded = Math.round(mos * 100) / 100;

  let verdict, color;
  if (mos >= 30) {
    verdict = 'Undervalued';
    color = 'green';
  } else if (mos >= -10) {
    verdict = 'Fairly Valued';
    color = 'amber';
  } else {
    verdict = 'Overvalued';
    color = 'red';
  }

  return { mosPercent: mosRounded, verdict, color };
}

// ============================================================================
// 3. DCF CALCULATOR
// ============================================================================

function dcfValuation({
  baseFCF,
  growthRateY1to5 = 15,
  growthRateY6to10 = 10,
  discountRate = 12,
  terminalGrowthRate = 3,
  forecastPeriod = 10,
  netDebt = 0,
  sharesOutstanding = 1,
}) {
  const dr = discountRate / 100;
  const tgr = terminalGrowthRate / 100;
  const gr1 = growthRateY1to5 / 100;
  const gr2 = growthRateY6to10 / 100;

  if (dr <= tgr) return { error: 'Discount rate must be greater than terminal growth rate' };
  if (sharesOutstanding <= 0) return { error: 'Shares outstanding must be positive' };

  const projectedFCF = [];
  let fcf = baseFCF;

  for (let year = 1; year <= forecastPeriod; year++) {
    const growthRate = year <= 5 ? gr1 : gr2;
    fcf = fcf * (1 + growthRate);
    const discountFactor = Math.pow(1 + dr, year);
    const pvFCF = fcf / discountFactor;
    projectedFCF.push({
      year,
      fcf: Math.round(fcf * 100) / 100,
      discountFactor: Math.round(discountFactor * 10000) / 10000,
      pvFCF: Math.round(pvFCF * 100) / 100,
    });
  }

  // Terminal Value
  const terminalFCF = fcf * (1 + tgr);
  const terminalValue = terminalFCF / (dr - tgr);
  const pvTerminalValue = terminalValue / Math.pow(1 + dr, forecastPeriod);

  const sumPvFCF = projectedFCF.reduce((sum, y) => sum + y.pvFCF, 0);
  const enterpriseValue = sumPvFCF + pvTerminalValue;
  const equityValue = enterpriseValue - netDebt;
  const ivPerShare = equityValue / sharesOutstanding;

  return {
    projectedFCF,
    terminalValue: Math.round(terminalValue * 100) / 100,
    pvTerminalValue: Math.round(pvTerminalValue * 100) / 100,
    sumPvFCF: Math.round(sumPvFCF * 100) / 100,
    enterpriseValue: Math.round(enterpriseValue * 100) / 100,
    equityValue: Math.round(equityValue * 100) / 100,
    ivPerShare: Math.round(ivPerShare * 100) / 100,
    method: 'DCF',
  };
}

// ============================================================================
// 4. P/E FAIR VALUE CALCULATOR
// ============================================================================

function peFairValue({ eps, industryPE }) {
  const fairPrice = eps * industryPE;
  return { fairPrice: Math.round(fairPrice * 100) / 100 };
}

// ============================================================================
// 5. PEG RATIO CALCULATOR
// ============================================================================

function pegRatio({ peRatio, epsGrowthRate }) {
  if (epsGrowthRate === 0) return { peg: Infinity, verdict: 'N/A' };
  const peg = peRatio / epsGrowthRate;
  const pegRounded = Math.round(peg * 100) / 100;

  let verdict, color;
  if (peg < 1) {
    verdict = 'Undervalued';
    color = 'green';
  } else if (peg <= 1.5) {
    verdict = 'Fairly Valued';
    color = 'amber';
  } else {
    verdict = 'Overvalued';
    color = 'red';
  }

  return { peg: pegRounded, verdict, color };
}

// ============================================================================
// 6. EV/EBITDA CALCULATOR
// ============================================================================

function evToEbitda({ enterpriseValue, ebitda, peers = [] }) {
  if (ebitda === 0) return { multiple: Infinity, error: 'EBITDA cannot be zero' };
  const multiple = enterpriseValue / ebitda;
  const multipleRounded = Math.round(multiple * 100) / 100;

  const peerComparison = peers.map((p) => ({
    name: p.name,
    multiple: p.ebitda === 0 ? 'N/A' : Math.round((p.ev / p.ebitda) * 100) / 100,
  }));

  return { multiple: multipleRounded, peerComparison };
}

// ============================================================================
// 7. PRICE-TO-BOOK CALCULATOR
// ============================================================================

function priceToBook({ sharePrice, bookValuePerShare }) {
  if (bookValuePerShare === 0) return { pbRatio: Infinity };
  const pb = sharePrice / bookValuePerShare;
  return {
    pbRatio: Math.round(pb * 100) / 100,
    note: 'P/B ratio is especially relevant for banks, NBFCs, and financial companies where book value closely reflects asset value.',
  };
}

// ============================================================================
// 8. ROE CALCULATOR
// ============================================================================

function returnOnEquity({ netProfit, shareholdersEquity, historicalData = [] }) {
  if (shareholdersEquity === 0) return { roe: 0, error: 'Equity cannot be zero' };
  const roe = (netProfit / shareholdersEquity) * 100;

  const trend = historicalData.map((d) => ({
    year: d.year,
    roe: d.equity === 0 ? 0 : Math.round((d.netProfit / d.equity) * 100 * 100) / 100,
  }));

  return { roe: Math.round(roe * 100) / 100, trend };
}

// ============================================================================
// 9. ROCE CALCULATOR
// ============================================================================

function returnOnCapitalEmployed({ ebit, totalAssets, currentLiabilities }) {
  const capitalEmployed = totalAssets - currentLiabilities;
  if (capitalEmployed === 0) return { roce: 0, error: 'Capital employed cannot be zero' };
  const roce = (ebit / capitalEmployed) * 100;
  return {
    roce: Math.round(roce * 100) / 100,
    capitalEmployed: Math.round(capitalEmployed * 100) / 100,
  };
}

// ============================================================================
// 10. DEBT-TO-EQUITY CALCULATOR
// ============================================================================

function debtToEquity({ totalDebt, shareholdersEquity }) {
  if (shareholdersEquity === 0) return { deRatio: Infinity, risk: 'Critical' };
  const de = totalDebt / shareholdersEquity;
  const deRounded = Math.round(de * 100) / 100;

  let risk, color;
  if (de < 0.5) {
    risk = 'Low Risk';
    color = 'green';
  } else if (de <= 1.5) {
    risk = 'Moderate Risk';
    color = 'amber';
  } else {
    risk = 'High Risk';
    color = 'red';
  }

  return { deRatio: deRounded, risk, color };
}

// ============================================================================
// 11. INTEREST COVERAGE CALCULATOR
// ============================================================================

function interestCoverage({ ebit, interestExpense }) {
  if (interestExpense === 0) return { ratio: Infinity, verdict: 'No Debt' };
  const ratio = ebit / interestExpense;
  const ratioRounded = Math.round(ratio * 100) / 100;

  let verdict, color;
  if (ratio < 1.5) {
    verdict = 'Risky';
    color = 'red';
  } else if (ratio <= 3) {
    verdict = 'Adequate';
    color = 'amber';
  } else {
    verdict = 'Safe';
    color = 'green';
  }

  return { ratio: ratioRounded, verdict, color };
}

// ============================================================================
// 12. FREE CASH FLOW CALCULATOR
// ============================================================================

function freeCashFlow({ operatingCashFlow, capex, historicalData = [] }) {
  const fcf = operatingCashFlow - Math.abs(capex);
  const trend = historicalData.map((d) => ({
    year: d.year,
    fcf: d.operatingCashFlow - Math.abs(d.capex),
  }));

  return {
    fcf: Math.round(fcf * 100) / 100,
    trend,
  };
}

// ============================================================================
// 13. CAGR CALCULATOR
// ============================================================================

function cagr({ startValue, endValue, years }) {
  if (startValue <= 0 || years <= 0) return { cagr: 0, error: 'Start value and years must be positive' };
  const rate = (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  return { cagr: Math.round(rate * 100) / 100 };
}

// ============================================================================
// 14. EPS GROWTH CALCULATOR
// ============================================================================

function epsGrowth({ epsData }) {
  // epsData: [{ year, eps }] sorted by year ascending
  if (!epsData || epsData.length < 2) return { growthRates: [], error: 'Need at least 2 years of data' };

  const growthRates = [];
  for (let i = 1; i < epsData.length; i++) {
    const prev = epsData[i - 1].eps;
    const curr = epsData[i].eps;
    const growth = prev === 0 ? 0 : ((curr - prev) / Math.abs(prev)) * 100;
    growthRates.push({
      year: epsData[i].year,
      eps: curr,
      growth: Math.round(growth * 100) / 100,
    });
  }

  // Multi-year CAGR
  const first = epsData[0];
  const last = epsData[epsData.length - 1];
  const years = last.year - first.year;
  let multiYearCAGR = 0;
  if (first.eps > 0 && years > 0) {
    multiYearCAGR = (Math.pow(last.eps / first.eps, 1 / years) - 1) * 100;
  }

  return {
    growthRates,
    multiYearCAGR: Math.round(multiYearCAGR * 100) / 100,
  };
}

// ============================================================================
// 15. DIVIDEND YIELD CALCULATOR
// ============================================================================

function dividendYield({ dividendPerShare, sharePrice }) {
  if (sharePrice === 0) return { yield: 0, error: 'Share price cannot be zero' };
  const yld = (dividendPerShare / sharePrice) * 100;
  return { yield: Math.round(yld * 100) / 100 };
}

// ============================================================================
// 16. TOTAL SHAREHOLDER RETURN (TSR) CALCULATOR
// ============================================================================

function totalShareholderReturn({ startPrice, endPrice, totalDividends = 0 }) {
  if (startPrice === 0) return { tsr: 0, error: 'Start price cannot be zero' };
  const tsr = ((endPrice - startPrice + totalDividends) / startPrice) * 100;
  return {
    tsr: Math.round(tsr * 100) / 100,
    capitalGain: Math.round(((endPrice - startPrice) / startPrice) * 100 * 100) / 100,
    dividendReturn: Math.round((totalDividends / startPrice) * 100 * 100) / 100,
  };
}

// ============================================================================
// 17. PORTFOLIO ALLOCATION CALCULATOR
// ============================================================================

function portfolioAllocation({ holdings }) {
  if (!holdings || holdings.length === 0) return { error: 'No holdings provided' };

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  if (totalValue === 0) return { error: 'Total portfolio value is zero' };

  // By stock
  const byStock = holdings.map((h) => ({
    name: h.stock,
    value: h.value,
    percentage: Math.round((h.value / totalValue) * 100 * 100) / 100,
  }));

  // By sector
  const sectorMap = {};
  holdings.forEach((h) => {
    const sector = h.sector || 'Unknown';
    sectorMap[sector] = (sectorMap[sector] || 0) + h.value;
  });
  const bySector = Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / totalValue) * 100 * 100) / 100,
  }));

  // By market cap (SEBI classification)
  const capMap = {};
  holdings.forEach((h) => {
    const cap = h.marketCapCategory || 'Unknown';
    capMap[cap] = (capMap[cap] || 0) + h.value;
  });
  const byMarketCap = Object.entries(capMap).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / totalValue) * 100 * 100) / 100,
  }));

  // Concentration warnings
  const warnings = byStock
    .filter((s) => s.percentage > 25)
    .map((s) => `${s.name} constitutes ${s.percentage}% of your portfolio — concentration risk!`);

  return { totalValue, byStock, bySector, byMarketCap, warnings };
}

// ============================================================================
// 18. POSITION SIZE CALCULATOR
// ============================================================================

function positionSize({ portfolioSize, riskPercent, entryPrice, stopLossPrice }) {
  if (entryPrice <= stopLossPrice) return { error: 'Entry price must be greater than stop-loss price' };
  const riskAmount = portfolioSize * (riskPercent / 100);
  const riskPerShare = entryPrice - stopLossPrice;
  const sharesToBuy = Math.floor(riskAmount / riskPerShare);
  const totalInvestment = sharesToBuy * entryPrice;

  return {
    riskAmount: Math.round(riskAmount * 100) / 100,
    riskPerShare: Math.round(riskPerShare * 100) / 100,
    sharesToBuy,
    totalInvestment: Math.round(totalInvestment * 100) / 100,
    percentOfPortfolio: Math.round((totalInvestment / portfolioSize) * 100 * 100) / 100,
  };
}

// ============================================================================
// 19. ASSET ALLOCATION CALCULATOR
// ============================================================================

function assetAllocation({ age, riskProfile = 'Moderate', customAllocation = null }) {
  if (customAllocation) {
    // Validate custom allocation sums to 100
    const total = Object.values(customAllocation).reduce((s, v) => s + v, 0);
    return {
      allocation: customAllocation,
      totalPercent: Math.round(total * 100) / 100,
      isValid: Math.abs(total - 100) < 0.01,
    };
  }

  // Indian asset classes: Equity, Gold (incl. SGB), Fixed Income (FD/Bonds/PPF), NPS, Cash/Liquid
  const equityBase = Math.max(20, Math.min(80, 100 - age));

  const profiles = {
    Conservative: {
      equity: Math.max(20, equityBase - 15),
      gold: 15,
      fixedIncome: 0, // computed as remainder
      nps: 10,
      cash: 10,
    },
    Moderate: {
      equity: equityBase,
      gold: 10,
      fixedIncome: 0,
      nps: 10,
      cash: 5,
    },
    Aggressive: {
      equity: Math.min(80, equityBase + 15),
      gold: 5,
      fixedIncome: 0,
      nps: 5,
      cash: 5,
    },
  };

  const alloc = profiles[riskProfile] || profiles.Moderate;
  // Fixed income gets the remainder
  alloc.fixedIncome = 100 - alloc.equity - alloc.gold - alloc.nps - alloc.cash;
  if (alloc.fixedIncome < 0) {
    alloc.equity += alloc.fixedIncome; // reduce equity if overallocated
    alloc.fixedIncome = 0;
  }

  return {
    allocation: {
      'Equity (Stocks/MF)': alloc.equity,
      'Gold (incl. SGB)': alloc.gold,
      'Fixed Income (FD/Bonds/PPF)': alloc.fixedIncome,
      'NPS': alloc.nps,
      'Cash/Liquid Funds': alloc.cash,
    },
    ageBasedEquity: equityBase,
    riskProfile,
  };
}

// ============================================================================
// 20. SIP CALCULATOR
// ============================================================================

function sipCalculator({ monthlyInvestment, expectedReturnRate, years }) {
  const months = years * 12;
  const monthlyRate = expectedReturnRate / 100 / 12;

  let futureValue;
  if (monthlyRate === 0) {
    futureValue = monthlyInvestment * months;
  } else {
    futureValue = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  }

  const totalInvested = monthlyInvestment * months;
  const estimatedGains = futureValue - totalInvested;

  // Yearly breakdown for chart
  const yearlyBreakdown = [];
  for (let y = 1; y <= years; y++) {
    const m = y * 12;
    let fv;
    if (monthlyRate === 0) {
      fv = monthlyInvestment * m;
    } else {
      fv = monthlyInvestment * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
    }
    const invested = monthlyInvestment * m;
    yearlyBreakdown.push({
      year: y,
      invested: Math.round(invested),
      futureValue: Math.round(fv),
      gains: Math.round(fv - invested),
    });
  }

  return {
    futureValue: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    estimatedGains: Math.round(estimatedGains),
    yearlyBreakdown,
  };
}

// ============================================================================
// 21. LUMP SUM INVESTMENT CALCULATOR
// ============================================================================

function lumpSumCalculator({ principal, expectedReturnRate, years }) {
  const rate = expectedReturnRate / 100;
  const futureValue = principal * Math.pow(1 + rate, years);
  const totalGains = futureValue - principal;

  const yearlyBreakdown = [];
  for (let y = 1; y <= years; y++) {
    const fv = principal * Math.pow(1 + rate, y);
    yearlyBreakdown.push({
      year: y,
      value: Math.round(fv),
      gain: Math.round(fv - principal),
    });
  }

  return {
    futureValue: Math.round(futureValue),
    totalGains: Math.round(totalGains),
    yearlyBreakdown,
  };
}

// ============================================================================
// 22. RETIREMENT CALCULATOR
// ============================================================================

function retirementCalculator({
  currentAge,
  retirementAge,
  monthlyExpenseToday,
  inflationRate = 6,
  expectedReturn = 12,
  postRetirementReturn = 8,
  lifeExpectancy = 80,
}) {
  const yearsToRetirement = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;

  if (yearsToRetirement <= 0) return { error: 'Retirement age must be greater than current age' };
  if (retirementYears <= 0) return { error: 'Life expectancy must be greater than retirement age' };

  // Monthly expense at retirement (adjusted for inflation)
  const annualExpenseToday = monthlyExpenseToday * 12;
  const annualExpenseAtRetirement = annualExpenseToday * Math.pow(1 + inflationRate / 100, yearsToRetirement);

  // Required corpus — PV of inflation-adjusted expenses over retirement years
  // Using real return rate = ((1 + nominal) / (1 + inflation)) - 1
  const realReturnRate = ((1 + postRetirementReturn / 100) / (1 + inflationRate / 100)) - 1;

  let requiredCorpus;
  if (realReturnRate === 0) {
    requiredCorpus = annualExpenseAtRetirement * retirementYears;
  } else {
    requiredCorpus = annualExpenseAtRetirement * (1 - Math.pow(1 + realReturnRate, -retirementYears)) / realReturnRate;
  }

  // Monthly SIP required to reach corpus
  const monthlyRate = expectedReturn / 100 / 12;
  const months = yearsToRetirement * 12;

  let requiredMonthlySIP;
  if (monthlyRate === 0) {
    requiredMonthlySIP = requiredCorpus / months;
  } else {
    requiredMonthlySIP = requiredCorpus / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate));
  }

  return {
    yearsToRetirement,
    retirementYears,
    annualExpenseAtRetirement: Math.round(annualExpenseAtRetirement),
    monthlyExpenseAtRetirement: Math.round(annualExpenseAtRetirement / 12),
    requiredCorpus: Math.round(requiredCorpus),
    requiredMonthlySIP: Math.round(requiredMonthlySIP),
  };
}

// ============================================================================
// 23. INFLATION CALCULATOR
// ============================================================================

function inflationCalculator({ presentCost, inflationRate, years }) {
  const futureCost = presentCost * Math.pow(1 + inflationRate / 100, years);
  const purchasingPowerErosion = ((futureCost - presentCost) / futureCost) * 100;

  return {
    futureCost: Math.round(futureCost * 100) / 100,
    purchasingPowerErosion: Math.round(purchasingPowerErosion * 100) / 100,
    realValueOf100: Math.round((100 / Math.pow(1 + inflationRate / 100, years)) * 100) / 100,
  };
}

// ============================================================================
// 24. XIRR CALCULATOR — Newton-Raphson with bisection fallback
// ============================================================================

function xirr({ cashflows }) {
  // cashflows: [{ date: 'DD/MM/YYYY' or Date, amount: number }]
  // At least one negative and one positive cashflow required
  if (!cashflows || cashflows.length < 2) return { error: 'Need at least 2 cashflows' };

  const parsed = cashflows.map((cf) => {
    let d;
    if (typeof cf.date === 'string') {
      // Parse DD/MM/YYYY
      const parts = cf.date.split('/');
      d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      d = new Date(cf.date);
    }
    return { date: d, amount: cf.amount };
  });

  const hasNeg = parsed.some((cf) => cf.amount < 0);
  const hasPos = parsed.some((cf) => cf.amount > 0);
  if (!hasNeg || !hasPos) return { error: 'Need at least one negative and one positive cashflow' };

  // Sort by date
  parsed.sort((a, b) => a.date - b.date);
  const d0 = parsed[0].date;

  // NPV function
  const npv = (rate) => {
    return parsed.reduce((sum, cf) => {
      const years = (cf.date - d0) / (365.25 * 24 * 60 * 60 * 1000);
      return sum + cf.amount / Math.pow(1 + rate, years);
    }, 0);
  };

  // NPV derivative
  const npvDerivative = (rate) => {
    return parsed.reduce((sum, cf) => {
      const years = (cf.date - d0) / (365.25 * 24 * 60 * 60 * 1000);
      return sum - years * cf.amount / Math.pow(1 + rate, years + 1);
    }, 0);
  };

  // Newton-Raphson
  let guess = 0.1;
  const maxIter = 100;
  const tolerance = 1e-7;

  for (let i = 0; i < maxIter; i++) {
    const fx = npv(guess);
    const fxPrime = npvDerivative(guess);

    if (Math.abs(fxPrime) < 1e-10) break;

    const newGuess = guess - fx / fxPrime;

    if (Math.abs(newGuess - guess) < tolerance) {
      return { xirr: Math.round(newGuess * 100 * 100) / 100 };
    }
    guess = newGuess;

    // Guard against divergence
    if (guess < -0.99) guess = -0.99;
    if (guess > 10) guess = 10;
  }

  // Bisection fallback
  let low = -0.99;
  let high = 10;
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    const val = npv(mid);

    if (Math.abs(val) < tolerance) {
      return { xirr: Math.round(mid * 100 * 100) / 100 };
    }

    if (npv(low) * val < 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return { xirr: Math.round(guess * 100 * 100) / 100, warning: 'Approximate result' };
}

// ============================================================================
// 25. STOCK SCREENER SCORE CALCULATOR
// ============================================================================

function screenerScore({ metrics, weights = null }) {
  const defaultWeights = {
    roe: 15,
    roce: 15,
    debtToEquity: 10,
    revenueGrowth: 10,
    epsGrowth: 10,
    fcf: 10,
    peRatio: 10,
    pegRatio: 5,
    promoterHolding: 10,
    marketCapStability: 5,
  };

  const w = weights || defaultWeights;

  // Normalize each metric to a 0–10 score
  const scores = {};

  // ROE: 0% → 0, 20%+ → 10
  scores.roe = Math.min(10, Math.max(0, (metrics.roe || 0) / 2));

  // ROCE: 0% → 0, 25%+ → 10
  scores.roce = Math.min(10, Math.max(0, (metrics.roce || 0) / 2.5));

  // D/E inverse: 0 → 10, 2+ → 0
  scores.debtToEquity = Math.max(0, 10 - (metrics.debtToEquity || 0) * 5);

  // Revenue growth: 0% → 0, 30%+ → 10
  scores.revenueGrowth = Math.min(10, Math.max(0, (metrics.revenueGrowth || 0) / 3));

  // EPS growth: 0% → 0, 30%+ → 10
  scores.epsGrowth = Math.min(10, Math.max(0, (metrics.epsGrowth || 0) / 3));

  // FCF positive → base 5, higher → up to 10 (normalized to market cap)
  scores.fcf = metrics.fcf > 0 ? Math.min(10, 5 + (metrics.fcfYield || 0) * 50) : 0;

  // P/E inverse: lower is better, 10 → 10, 40+ → 0
  scores.peRatio = Math.max(0, 10 - ((metrics.peRatio || 30) - 10) * (10 / 30));

  // PEG inverse: 0.5 → 10, 2+ → 0
  scores.pegRatio = Math.max(0, Math.min(10, (2 - (metrics.pegRatio || 1.5)) * (10 / 1.5)));

  // Promoter Holding: 50%+ → 10, 0 → 0
  scores.promoterHolding = Math.min(10, Math.max(0, (metrics.promoterHolding || 0) / 5));

  // Market cap stability: binary 0 or 10
  scores.marketCapStability = metrics.marketCapStability ? 10 : 5;

  // Weighted composite
  let totalScore = 0;
  let totalWeight = 0;
  for (const [key, weight] of Object.entries(w)) {
    if (scores[key] !== undefined) {
      totalScore += scores[key] * weight;
      totalWeight += weight;
    }
  }

  const compositeScore = totalWeight > 0 ? (totalScore / totalWeight) * 10 : 0;

  return {
    compositeScore: Math.round(Math.min(100, compositeScore) * 100) / 100,
    breakdown: scores,
    weights: w,
  };
}

// ============================================================================
// 26. PIOTROSKI F-SCORE CALCULATOR
// ============================================================================

function piotroskiFScore({
  netIncome, totalAssets, operatingCashFlow,
  prevROA, currentROA,
  prevLeverage, currentLeverage,
  prevCurrentRatio, currentCurrentRatio,
  sharesIssued = false,
  prevGrossMargin, currentGrossMargin,
  prevAssetTurnover, currentAssetTurnover,
}) {
  const tests = [];

  // Profitability (4 tests)
  const roa = totalAssets > 0 ? netIncome / totalAssets : 0;
  tests.push({ name: 'ROA > 0', passed: roa > 0 });
  tests.push({ name: 'Operating CF > 0', passed: operatingCashFlow > 0 });
  tests.push({ name: 'ΔROA > 0', passed: currentROA > prevROA });
  tests.push({ name: 'CF > Net Income', passed: operatingCashFlow > netIncome });

  // Leverage & Liquidity (3 tests)
  tests.push({ name: 'ΔLeverage < 0', passed: currentLeverage < prevLeverage });
  tests.push({ name: 'ΔCurrent Ratio > 0', passed: currentCurrentRatio > prevCurrentRatio });
  tests.push({ name: 'No New Shares Issued', passed: !sharesIssued });

  // Efficiency (2 tests)
  tests.push({ name: 'ΔGross Margin > 0', passed: currentGrossMargin > prevGrossMargin });
  tests.push({ name: 'ΔAsset Turnover > 0', passed: currentAssetTurnover > prevAssetTurnover });

  const score = tests.filter((t) => t.passed).length;

  let verdict, color;
  if (score >= 7) {
    verdict = 'Strong';
    color = 'green';
  } else if (score >= 4) {
    verdict = 'Moderate';
    color = 'amber';
  } else {
    verdict = 'Weak';
    color = 'red';
  }

  return { score, maxScore: 9, tests, verdict, color };
}

// ============================================================================
// 27. ALTMAN Z-SCORE CALCULATOR
// ============================================================================

function altmanZScore({
  workingCapital, totalAssets, retainedEarnings,
  ebit, marketCap, totalLiabilities, sales,
}) {
  if (totalAssets === 0) return { zScore: 0, error: 'Total assets cannot be zero' };

  const A = workingCapital / totalAssets;
  const B = retainedEarnings / totalAssets;
  const C = ebit / totalAssets;
  const D = totalLiabilities === 0 ? 0 : marketCap / totalLiabilities;
  const E = sales / totalAssets;

  const z = 1.2 * A + 1.4 * B + 3.3 * C + 0.6 * D + 1.0 * E;
  const zRounded = Math.round(z * 100) / 100;

  let zone, color;
  if (z > 2.99) {
    zone = 'Safe Zone';
    color = 'green';
  } else if (z >= 1.81) {
    zone = 'Grey Zone';
    color = 'amber';
  } else {
    zone = 'Distress Zone';
    color = 'red';
  }

  return {
    zScore: zRounded,
    zone,
    color,
    components: {
      A: Math.round(A * 10000) / 10000,
      B: Math.round(B * 10000) / 10000,
      C: Math.round(C * 10000) / 10000,
      D: Math.round(D * 10000) / 10000,
      E: Math.round(E * 10000) / 10000,
    },
  };
}

// ============================================================================
// 28. BENEISH M-SCORE CALCULATOR
// ============================================================================

function beneishMScore({
  // Current year
  receivables, revenue, grossMargin, totalAssets,
  ppe, sgaExpense, depreciation, totalDebt,
  netIncomeFromOps, operatingCashFlow,
  // Previous year
  prevReceivables, prevRevenue, prevGrossMargin, prevTotalAssets,
  prevPPE, prevSGAExpense, prevDepreciation, prevTotalDebt,
}) {
  // DSRI: Days Sales in Receivables Index
  const dsri = (prevRevenue && revenue)
    ? (receivables / revenue) / (prevReceivables / prevRevenue) : 1;

  // GMI: Gross Margin Index
  const gmi = (grossMargin > 0) ? prevGrossMargin / grossMargin : 1;

  // AQI: Asset Quality Index
  const currAQ = 1 - ((receivables + ppe) / totalAssets);
  const prevAQ = 1 - ((prevReceivables + prevPPE) / prevTotalAssets);
  const aqi = prevAQ !== 0 ? currAQ / prevAQ : 1;

  // SGI: Sales Growth Index
  const sgi = prevRevenue !== 0 ? revenue / prevRevenue : 1;

  // DEPI: Depreciation Index
  const currDepRate = (ppe + depreciation) !== 0 ? depreciation / (ppe + depreciation) : 0;
  const prevDepRate = (prevPPE + prevDepreciation) !== 0 ? prevDepreciation / (prevPPE + prevDepreciation) : 0;
  const depi = currDepRate !== 0 ? prevDepRate / currDepRate : 1;

  // SGAI: SGA Expense Index
  const currSGAI = revenue !== 0 ? sgaExpense / revenue : 0;
  const prevSGAI = prevRevenue !== 0 ? prevSGAExpense / prevRevenue : 0;
  const sgai = prevSGAI !== 0 ? currSGAI / prevSGAI : 1;

  // LVGI: Leverage Index
  const currLev = totalAssets !== 0 ? totalDebt / totalAssets : 0;
  const prevLev = prevTotalAssets !== 0 ? prevTotalDebt / prevTotalAssets : 0;
  const lvgi = prevLev !== 0 ? currLev / prevLev : 1;

  // TATA: Total Accruals to Total Assets
  const tata = totalAssets !== 0 ? (netIncomeFromOps - operatingCashFlow) / totalAssets : 0;

  // M-Score = -4.84 + 0.92×DSRI + 0.528×GMI + 0.404×AQI + 0.892×SGI
  //           + 0.115×DEPI - 0.172×SGAI + 4.679×TATA - 0.327×LVGI
  const mScore = -4.84
    + 0.92 * dsri
    + 0.528 * gmi
    + 0.404 * aqi
    + 0.892 * sgi
    + 0.115 * depi
    - 0.172 * sgai
    + 4.679 * tata
    - 0.327 * lvgi;

  const mScoreRounded = Math.round(mScore * 100) / 100;
  const manipulationFlag = mScore > -1.78;

  return {
    mScore: mScoreRounded,
    manipulationFlag,
    verdict: manipulationFlag ? 'Possible Earnings Manipulation' : 'Unlikely Manipulation',
    color: manipulationFlag ? 'red' : 'green',
    components: {
      dsri: Math.round(dsri * 100) / 100,
      gmi: Math.round(gmi * 100) / 100,
      aqi: Math.round(aqi * 100) / 100,
      sgi: Math.round(sgi * 100) / 100,
      depi: Math.round(depi * 100) / 100,
      sgai: Math.round(sgai * 100) / 100,
      lvgi: Math.round(lvgi * 100) / 100,
      tata: Math.round(tata * 10000) / 10000,
    },
  };
}

// ============================================================================
// 29. DIVIDEND REINVESTMENT (DRIP) CALCULATOR
// ============================================================================

function dripCalculator({
  initialShares,
  initialPrice,
  annualDividendPerShare,
  dividendGrowthRate = 0,
  priceGrowthRate = 0,
  years,
}) {
  let shares = initialShares;
  let price = initialPrice;
  let dps = annualDividendPerShare;
  let totalDividendsReinvested = 0;

  const yearlyData = [];

  for (let y = 1; y <= years; y++) {
    if (y > 1) {
      price = price * (1 + priceGrowthRate / 100);
      dps = dps * (1 + dividendGrowthRate / 100);
    }

    const dividendReceived = shares * dps;
    const additionalShares = price > 0 ? dividendReceived / price : 0;
    shares += additionalShares;
    totalDividendsReinvested += dividendReceived;

    yearlyData.push({
      year: y,
      price: Math.round(price * 100) / 100,
      dps: Math.round(dps * 100) / 100,
      dividendReceived: Math.round(dividendReceived * 100) / 100,
      additionalShares: Math.round(additionalShares * 100) / 100,
      totalShares: Math.round(shares * 100) / 100,
      portfolioValue: Math.round(shares * price * 100) / 100,
    });
  }

  return {
    endingShares: Math.round(shares * 100) / 100,
    endingValue: Math.round(shares * price * 100) / 100,
    totalDividendsReinvested: Math.round(totalDividendsReinvested * 100) / 100,
    initialInvestment: Math.round(initialShares * initialPrice * 100) / 100,
    yearlyData,
  };
}

// ============================================================================
// 30. COMBINED FAIR VALUE CALCULATOR
// ============================================================================

function combinedFairValue({
  eps, growthRate, gsecYield = 7.1,
  industryPE, peRatio,
  baseFCF, discountRate, terminalGrowthRate, forecastPeriod, netDebt, sharesOutstanding,
  enterpriseValue, ebitda,
  sharePrice, bookValuePerShare,
  adjustedEarnings, wacc,
}) {
  const methods = [];

  // Graham
  const graham = grahamIntrinsicValue({ eps, growthRate, gsecYield });
  if (!graham.error) methods.push({ method: 'Graham', value: graham.intrinsicValue });

  // Lynch
  const lynch = lynchFairValue({ eps, growthRate });
  if (!lynch.error) methods.push({ method: 'Lynch', value: lynch.fairValue });

  // DCF
  if (baseFCF && sharesOutstanding) {
    const dcf = dcfValuation({
      baseFCF, discountRate, terminalGrowthRate,
      forecastPeriod, netDebt, sharesOutstanding,
    });
    if (!dcf.error) methods.push({ method: 'DCF', value: dcf.ivPerShare });
  }

  // P/E Fair Value
  if (eps && industryPE) {
    const pe = peFairValue({ eps, industryPE });
    methods.push({ method: 'P/E', value: pe.fairPrice });
  }

  // PEG-implied
  if (eps && growthRate) {
    methods.push({ method: 'PEG (Fair)', value: Math.round(eps * growthRate * 100) / 100 });
  }

  // EV/EBITDA-implied (very rough per-share)
  if (enterpriseValue && ebitda && sharesOutstanding) {
    const industryMultiple = industryPE || 15; // rough fallback
    const impliedEV = ebitda * industryMultiple;
    const impliedEquity = impliedEV - (netDebt || 0);
    const impliedPrice = impliedEquity / sharesOutstanding;
    methods.push({ method: 'EV/EBITDA', value: Math.round(impliedPrice * 100) / 100 });
  }

  // P/B-implied
  if (bookValuePerShare) {
    methods.push({ method: 'P/B (1x)', value: bookValuePerShare });
  }

  if (methods.length === 0) return { error: 'Insufficient data for any valuation method' };

  const values = methods.map((m) => m.value);
  const average = values.reduce((s, v) => s + v, 0) / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  return {
    methods,
    averageFairValue: Math.round(average * 100) / 100,
    medianFairValue: Math.round(median * 100) / 100,
    currentPrice: sharePrice,
    range: {
      min: Math.round(Math.min(...values) * 100) / 100,
      max: Math.round(Math.max(...values) * 100) / 100,
    },
  };
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

module.exports = {
  intrinsicValue,
  grahamIntrinsicValue,
  lynchFairValue,
  earningsPowerValue,
  marginOfSafety,
  dcfValuation,
  peFairValue,
  pegRatio,
  evToEbitda,
  priceToBook,
  returnOnEquity,
  returnOnCapitalEmployed,
  debtToEquity,
  interestCoverage,
  freeCashFlow,
  cagr,
  epsGrowth,
  dividendYield,
  totalShareholderReturn,
  portfolioAllocation,
  positionSize,
  assetAllocation,
  sipCalculator,
  lumpSumCalculator,
  retirementCalculator,
  inflationCalculator,
  xirr,
  screenerScore,
  piotroskiFScore,
  altmanZScore,
  beneishMScore,
  dripCalculator,
  combinedFairValue,
};
