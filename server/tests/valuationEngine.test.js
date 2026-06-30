const engine = require('../src/services/valuationEngine');

describe('Valuation Engine — All 30 Calculators', () => {

  // 1. Intrinsic Value (Graham)
  describe('intrinsicValue / grahamIntrinsicValue', () => {
    it('should compute Graham intrinsic value correctly', () => {
      const result = engine.grahamIntrinsicValue({ eps: 50, growthRate: 15, gsecYield: 7.1 });
      // IV = 50 × (8.5 + 30) × 4.4 / 7.1 = 50 × 38.5 × 0.6197 = 1192.88
      expect(result.intrinsicValue).toBeCloseTo(1192.96, 0);
      expect(result.method).toBe('Graham');
    });
    it('should handle zero G-Sec yield', () => {
      const result = engine.grahamIntrinsicValue({ eps: 50, growthRate: 15, gsecYield: 0 });
      expect(result.error).toBeDefined();
    });
  });

  // 1b. Lynch Fair Value
  describe('lynchFairValue', () => {
    it('should compute Lynch fair value', () => {
      const result = engine.lynchFairValue({ eps: 50, growthRate: 20 });
      expect(result.fairValue).toBe(1000);
    });
    it('should handle zero growth', () => {
      const result = engine.lynchFairValue({ eps: 50, growthRate: 0 });
      expect(result.fairValue).toBe(0);
    });
  });

  // 1c. EPV
  describe('earningsPowerValue', () => {
    it('should compute EPV correctly', () => {
      const result = engine.earningsPowerValue({ adjustedEarnings: 1000, wacc: 10 });
      expect(result.epv).toBe(10000);
    });
    it('should handle zero WACC', () => {
      const result = engine.earningsPowerValue({ adjustedEarnings: 1000, wacc: 0 });
      expect(result.error).toBeDefined();
    });
  });

  // 2. Margin of Safety
  describe('marginOfSafety', () => {
    it('should return Undervalued for MoS >= 30%', () => {
      const result = engine.marginOfSafety({ intrinsicValue: 100, currentPrice: 60 });
      expect(result.mosPercent).toBe(40);
      expect(result.verdict).toBe('Undervalued');
      expect(result.color).toBe('green');
    });
    it('should return Overvalued for MoS < -10%', () => {
      const result = engine.marginOfSafety({ intrinsicValue: 100, currentPrice: 120 });
      expect(result.mosPercent).toBe(-20);
      expect(result.verdict).toBe('Overvalued');
      expect(result.color).toBe('red');
    });
  });

  // 3. DCF
  describe('dcfValuation', () => {
    it('should compute DCF with projected FCF', () => {
      const result = engine.dcfValuation({
        baseFCF: 1000, growthRateY1to5: 15, growthRateY6to10: 10,
        discountRate: 12, terminalGrowthRate: 3, forecastPeriod: 10,
        netDebt: 500, sharesOutstanding: 100,
      });
      expect(result.projectedFCF).toHaveLength(10);
      expect(result.ivPerShare).toBeGreaterThan(0);
      expect(result.enterpriseValue).toBeGreaterThan(0);
    });
    it('should error if discount rate <= terminal growth', () => {
      const result = engine.dcfValuation({ baseFCF: 1000, discountRate: 3, terminalGrowthRate: 5, sharesOutstanding: 100 });
      expect(result.error).toBeDefined();
    });
  });

  // 4. P/E Fair Value
  describe('peFairValue', () => {
    it('should compute fair price', () => {
      const result = engine.peFairValue({ eps: 50, industryPE: 25 });
      expect(result.fairPrice).toBe(1250);
    });
    it('should handle negative EPS', () => {
      const result = engine.peFairValue({ eps: -10, industryPE: 25 });
      expect(result.fairPrice).toBe(-250);
    });
  });

  // 5. PEG Ratio
  describe('pegRatio', () => {
    it('should return Undervalued for PEG < 1', () => {
      const result = engine.pegRatio({ peRatio: 15, epsGrowthRate: 20 });
      expect(result.peg).toBe(0.75);
      expect(result.verdict).toBe('Undervalued');
    });
    it('should handle zero growth rate', () => {
      const result = engine.pegRatio({ peRatio: 15, epsGrowthRate: 0 });
      expect(result.peg).toBe(Infinity);
    });
  });

  // 6. EV/EBITDA
  describe('evToEbitda', () => {
    it('should compute multiple', () => {
      const result = engine.evToEbitda({ enterpriseValue: 10000, ebitda: 1000 });
      expect(result.multiple).toBe(10);
    });
    it('should handle zero EBITDA', () => {
      const result = engine.evToEbitda({ enterpriseValue: 10000, ebitda: 0 });
      expect(result.multiple).toBe(Infinity);
    });
  });

  // 7. Price-to-Book
  describe('priceToBook', () => {
    it('should compute P/B ratio', () => {
      const result = engine.priceToBook({ sharePrice: 500, bookValuePerShare: 250 });
      expect(result.pbRatio).toBe(2);
      expect(result.note).toBeDefined();
    });
    it('should handle zero book value', () => {
      const result = engine.priceToBook({ sharePrice: 500, bookValuePerShare: 0 });
      expect(result.pbRatio).toBe(Infinity);
    });
  });

  // 8. ROE
  describe('returnOnEquity', () => {
    it('should compute ROE', () => {
      const result = engine.returnOnEquity({ netProfit: 200, shareholdersEquity: 1000 });
      expect(result.roe).toBe(20);
    });
    it('should handle zero equity', () => {
      const result = engine.returnOnEquity({ netProfit: 200, shareholdersEquity: 0 });
      expect(result.error).toBeDefined();
    });
  });

  // 9. ROCE
  describe('returnOnCapitalEmployed', () => {
    it('should compute ROCE', () => {
      const result = engine.returnOnCapitalEmployed({ ebit: 300, totalAssets: 2000, currentLiabilities: 500 });
      expect(result.roce).toBe(20);
      expect(result.capitalEmployed).toBe(1500);
    });
    it('should handle zero capital employed', () => {
      const result = engine.returnOnCapitalEmployed({ ebit: 300, totalAssets: 500, currentLiabilities: 500 });
      expect(result.error).toBeDefined();
    });
  });

  // 10. Debt-to-Equity
  describe('debtToEquity', () => {
    it('should flag Low Risk for D/E < 0.5', () => {
      const result = engine.debtToEquity({ totalDebt: 200, shareholdersEquity: 1000 });
      expect(result.deRatio).toBe(0.2);
      expect(result.risk).toBe('Low Risk');
    });
    it('should flag High Risk for D/E > 1.5', () => {
      const result = engine.debtToEquity({ totalDebt: 2000, shareholdersEquity: 1000 });
      expect(result.deRatio).toBe(2);
      expect(result.risk).toBe('High Risk');
    });
  });

  // 11. Interest Coverage
  describe('interestCoverage', () => {
    it('should flag Safe for ratio > 3', () => {
      const result = engine.interestCoverage({ ebit: 500, interestExpense: 100 });
      expect(result.ratio).toBe(5);
      expect(result.verdict).toBe('Safe');
    });
    it('should flag Risky for ratio < 1.5', () => {
      const result = engine.interestCoverage({ ebit: 100, interestExpense: 100 });
      expect(result.ratio).toBe(1);
      expect(result.verdict).toBe('Risky');
    });
  });

  // 12. Free Cash Flow
  describe('freeCashFlow', () => {
    it('should compute FCF', () => {
      const result = engine.freeCashFlow({ operatingCashFlow: 5000, capex: 2000 });
      expect(result.fcf).toBe(3000);
    });
    it('should handle negative capex (already absolute)', () => {
      const result = engine.freeCashFlow({ operatingCashFlow: 5000, capex: -2000 });
      expect(result.fcf).toBe(3000);
    });
  });

  // 13. CAGR
  describe('cagr', () => {
    it('should compute CAGR correctly', () => {
      const result = engine.cagr({ startValue: 100, endValue: 200, years: 5 });
      expect(result.cagr).toBeCloseTo(14.87, 1);
    });
    it('should error on zero start value', () => {
      const result = engine.cagr({ startValue: 0, endValue: 200, years: 5 });
      expect(result.error).toBeDefined();
    });
  });

  // 14. EPS Growth
  describe('epsGrowth', () => {
    it('should compute YoY growth rates', () => {
      const result = engine.epsGrowth({
        epsData: [{ year: 2020, eps: 10 }, { year: 2021, eps: 12 }, { year: 2022, eps: 15 }],
      });
      expect(result.growthRates).toHaveLength(2);
      expect(result.growthRates[0].growth).toBe(20);
    });
    it('should error with insufficient data', () => {
      const result = engine.epsGrowth({ epsData: [{ year: 2020, eps: 10 }] });
      expect(result.error).toBeDefined();
    });
  });

  // 15. Dividend Yield
  describe('dividendYield', () => {
    it('should compute yield', () => {
      const result = engine.dividendYield({ dividendPerShare: 10, sharePrice: 500 });
      expect(result.yield).toBe(2);
    });
    it('should handle zero price', () => {
      const result = engine.dividendYield({ dividendPerShare: 10, sharePrice: 0 });
      expect(result.error).toBeDefined();
    });
  });

  // 16. TSR
  describe('totalShareholderReturn', () => {
    it('should compute TSR with dividends', () => {
      const result = engine.totalShareholderReturn({ startPrice: 100, endPrice: 130, totalDividends: 10 });
      expect(result.tsr).toBe(40);
    });
    it('should handle zero start price', () => {
      const result = engine.totalShareholderReturn({ startPrice: 0, endPrice: 130 });
      expect(result.error).toBeDefined();
    });
  });

  // 17. Portfolio Allocation
  describe('portfolioAllocation', () => {
    it('should compute allocation percentages', () => {
      const result = engine.portfolioAllocation({
        holdings: [
          { stock: 'A', sector: 'IT', marketCapCategory: 'Large Cap', value: 50000 },
          { stock: 'B', sector: 'Banking', marketCapCategory: 'Mid Cap', value: 30000 },
        ],
      });
      expect(result.totalValue).toBe(80000);
      expect(result.byStock).toHaveLength(2);
      expect(result.bySector).toHaveLength(2);
    });
    it('should warn on concentration > 25%', () => {
      const result = engine.portfolioAllocation({
        holdings: [
          { stock: 'A', sector: 'IT', value: 80000 },
          { stock: 'B', sector: 'IT', value: 20000 },
        ],
      });
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  // 18. Position Size
  describe('positionSize', () => {
    it('should compute shares to buy', () => {
      const result = engine.positionSize({ portfolioSize: 1000000, riskPercent: 2, entryPrice: 500, stopLossPrice: 480 });
      expect(result.riskAmount).toBe(20000);
      expect(result.sharesToBuy).toBe(1000);
    });
    it('should error if entry <= stop loss', () => {
      const result = engine.positionSize({ portfolioSize: 1000000, riskPercent: 2, entryPrice: 480, stopLossPrice: 500 });
      expect(result.error).toBeDefined();
    });
  });

  // 19. Asset Allocation
  describe('assetAllocation', () => {
    it('should suggest allocation based on age and risk profile', () => {
      const result = engine.assetAllocation({ age: 30, riskProfile: 'Moderate' });
      expect(result.allocation['Equity (Stocks/MF)']).toBe(70);
      expect(result.riskProfile).toBe('Moderate');
    });
    it('should accept custom allocation', () => {
      const custom = { equity: 60, gold: 10, fixedIncome: 20, nps: 5, cash: 5 };
      const result = engine.assetAllocation({ age: 30, customAllocation: custom });
      expect(result.allocation.equity).toBe(60);
    });
  });

  // 20. SIP Calculator
  describe('sipCalculator', () => {
    it('should compute SIP future value', () => {
      const result = engine.sipCalculator({ monthlyInvestment: 10000, expectedReturnRate: 12, years: 10 });
      expect(result.futureValue).toBeGreaterThan(result.totalInvested);
      expect(result.totalInvested).toBe(1200000);
      expect(result.yearlyBreakdown).toHaveLength(10);
    });
    it('should handle zero return rate', () => {
      const result = engine.sipCalculator({ monthlyInvestment: 10000, expectedReturnRate: 0, years: 5 });
      expect(result.futureValue).toBe(600000);
    });
  });

  // 21. Lump Sum Calculator
  describe('lumpSumCalculator', () => {
    it('should compute lump sum growth', () => {
      const result = engine.lumpSumCalculator({ principal: 100000, expectedReturnRate: 10, years: 10 });
      expect(result.futureValue).toBeGreaterThan(100000);
      expect(result.yearlyBreakdown).toHaveLength(10);
    });
    it('should handle zero rate', () => {
      const result = engine.lumpSumCalculator({ principal: 100000, expectedReturnRate: 0, years: 5 });
      expect(result.futureValue).toBe(100000);
    });
  });

  // 22. Retirement Calculator
  describe('retirementCalculator', () => {
    it('should compute required corpus and SIP', () => {
      const result = engine.retirementCalculator({
        currentAge: 30, retirementAge: 60, monthlyExpenseToday: 50000,
        inflationRate: 6, expectedReturn: 12, postRetirementReturn: 8, lifeExpectancy: 80,
      });
      expect(result.requiredCorpus).toBeGreaterThan(0);
      expect(result.requiredMonthlySIP).toBeGreaterThan(0);
      expect(result.yearsToRetirement).toBe(30);
    });
    it('should error if retirement age <= current age', () => {
      const result = engine.retirementCalculator({ currentAge: 60, retirementAge: 55, monthlyExpenseToday: 50000 });
      expect(result.error).toBeDefined();
    });
  });

  // 23. Inflation Calculator
  describe('inflationCalculator', () => {
    it('should compute future cost', () => {
      const result = engine.inflationCalculator({ presentCost: 100, inflationRate: 6, years: 10 });
      expect(result.futureCost).toBeCloseTo(179.08, 0);
    });
    it('should compute purchasing power erosion', () => {
      const result = engine.inflationCalculator({ presentCost: 100, inflationRate: 6, years: 10 });
      expect(result.purchasingPowerErosion).toBeGreaterThan(0);
    });
  });

  // 24. XIRR
  describe('xirr', () => {
    it('should compute XIRR for simple cashflows', () => {
      const result = engine.xirr({
        cashflows: [
          { date: '01/01/2020', amount: -100000 },
          { date: '01/01/2021', amount: 112000 },
        ],
      });
      expect(result.xirr).toBeCloseTo(12, 0);
    });
    it('should error without negative cashflow', () => {
      const result = engine.xirr({
        cashflows: [
          { date: '01/01/2020', amount: 10000 },
          { date: '01/01/2021', amount: 20000 },
        ],
      });
      expect(result.error).toBeDefined();
    });
  });

  // 25. Screener Score
  describe('screenerScore', () => {
    it('should compute composite score', () => {
      const result = engine.screenerScore({
        metrics: { roe: 20, roce: 25, debtToEquity: 0.3, revenueGrowth: 15, epsGrowth: 20, fcf: 5000, peRatio: 20, pegRatio: 1, promoterHolding: 60, marketCapStability: true },
      });
      expect(result.compositeScore).toBeGreaterThan(0);
      expect(result.compositeScore).toBeLessThanOrEqual(100);
    });
    it('should accept custom weights', () => {
      const result = engine.screenerScore({
        metrics: { roe: 20 },
        weights: { roe: 100 },
      });
      expect(result.compositeScore).toBeGreaterThan(0);
    });
  });

  // 26. Piotroski F-Score
  describe('piotroskiFScore', () => {
    it('should compute score out of 9', () => {
      const result = engine.piotroskiFScore({
        netIncome: 100, totalAssets: 1000, operatingCashFlow: 150,
        prevROA: 0.08, currentROA: 0.10,
        prevLeverage: 0.5, currentLeverage: 0.4,
        prevCurrentRatio: 1.5, currentCurrentRatio: 1.8,
        sharesIssued: false,
        prevGrossMargin: 0.40, currentGrossMargin: 0.42,
        prevAssetTurnover: 0.8, currentAssetTurnover: 0.85,
      });
      expect(result.score).toBe(9);
      expect(result.verdict).toBe('Strong');
    });
    it('should handle weak fundamentals', () => {
      const result = engine.piotroskiFScore({
        netIncome: -50, totalAssets: 1000, operatingCashFlow: -20,
        prevROA: 0.08, currentROA: 0.02,
        prevLeverage: 0.3, currentLeverage: 0.5,
        prevCurrentRatio: 1.8, currentCurrentRatio: 1.2,
        sharesIssued: true,
        prevGrossMargin: 0.42, currentGrossMargin: 0.38,
        prevAssetTurnover: 0.85, currentAssetTurnover: 0.80,
      });
      expect(result.score).toBeLessThan(4);
      expect(result.verdict).toBe('Weak');
    });
  });

  // 27. Altman Z-Score
  describe('altmanZScore', () => {
    it('should classify Safe Zone', () => {
      const result = engine.altmanZScore({
        workingCapital: 300, totalAssets: 1000, retainedEarnings: 400,
        ebit: 200, marketCap: 2000, totalLiabilities: 500, sales: 1500,
      });
      expect(result.zScore).toBeGreaterThan(2.99);
      expect(result.zone).toBe('Safe Zone');
    });
    it('should classify Distress Zone', () => {
      const result = engine.altmanZScore({
        workingCapital: -200, totalAssets: 1000, retainedEarnings: 50,
        ebit: 30, marketCap: 200, totalLiabilities: 800, sales: 300,
      });
      expect(result.zScore).toBeLessThan(1.81);
      expect(result.zone).toBe('Distress Zone');
    });
  });

  // 28. Beneish M-Score
  describe('beneishMScore', () => {
    it('should compute M-Score and flag manipulation', () => {
      const result = engine.beneishMScore({
        receivables: 200, revenue: 1000, grossMargin: 0.4, totalAssets: 2000,
        ppe: 500, sgaExpense: 150, depreciation: 80, totalDebt: 600,
        netIncomeFromOps: 100, operatingCashFlow: 50,
        prevReceivables: 150, prevRevenue: 800, prevGrossMargin: 0.45, prevTotalAssets: 1800,
        prevPPE: 450, prevSGAExpense: 130, prevDepreciation: 70, prevTotalDebt: 550,
      });
      expect(result.mScore).toBeDefined();
      expect(typeof result.manipulationFlag).toBe('boolean');
    });
    it('should indicate unlikely manipulation for clean data', () => {
      const result = engine.beneishMScore({
        receivables: 150, revenue: 1000, grossMargin: 0.4, totalAssets: 2000,
        ppe: 500, sgaExpense: 150, depreciation: 80, totalDebt: 400,
        netIncomeFromOps: 100, operatingCashFlow: 120,
        prevReceivables: 140, prevRevenue: 950, prevGrossMargin: 0.38, prevTotalAssets: 1900,
        prevPPE: 480, prevSGAExpense: 145, prevDepreciation: 75, prevTotalDebt: 420,
      });
      expect(result.verdict).toBeDefined();
    });
  });

  // 29. DRIP Calculator
  describe('dripCalculator', () => {
    it('should simulate dividend reinvestment', () => {
      const result = engine.dripCalculator({
        initialShares: 100, initialPrice: 500, annualDividendPerShare: 10,
        dividendGrowthRate: 5, priceGrowthRate: 10, years: 5,
      });
      expect(result.endingShares).toBeGreaterThan(100);
      expect(result.endingValue).toBeGreaterThan(50000);
      expect(result.yearlyData).toHaveLength(5);
    });
    it('should handle zero price growth', () => {
      const result = engine.dripCalculator({
        initialShares: 100, initialPrice: 500, annualDividendPerShare: 10,
        dividendGrowthRate: 0, priceGrowthRate: 0, years: 3,
      });
      expect(result.endingShares).toBeGreaterThan(100);
    });
  });

  // 30. Combined Fair Value
  describe('combinedFairValue', () => {
    it('should run multiple methods and compute average/median', () => {
      const result = engine.combinedFairValue({
        eps: 50, growthRate: 15, gsecYield: 7.1,
        industryPE: 25, peRatio: 30,
        baseFCF: 1000, discountRate: 12, terminalGrowthRate: 3,
        forecastPeriod: 10, netDebt: 500, sharesOutstanding: 100,
        enterpriseValue: 10000, ebitda: 1000,
        sharePrice: 1200, bookValuePerShare: 400,
      });
      expect(result.methods.length).toBeGreaterThan(0);
      expect(result.averageFairValue).toBeGreaterThan(0);
      expect(result.medianFairValue).toBeGreaterThan(0);
    });
    it('should error with no data', () => {
      const result = engine.combinedFairValue({});
      expect(result.error).toBeDefined();
    });
  });
});
