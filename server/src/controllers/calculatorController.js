const engine = require('../services/valuationEngine');
const { CALCULATOR_TYPES } = require('../models/CalculationHistory');

// Map calculator types to engine functions
const calculatorMap = {
  'intrinsic-value': engine.intrinsicValue,
  'margin-of-safety': engine.marginOfSafety,
  'dcf': engine.dcfValuation,
  'pe-fair-value': engine.peFairValue,
  'peg-ratio': engine.pegRatio,
  'ev-ebitda': engine.evToEbitda,
  'price-to-book': engine.priceToBook,
  'roe': engine.returnOnEquity,
  'roce': engine.returnOnCapitalEmployed,
  'debt-to-equity': engine.debtToEquity,
  'interest-coverage': engine.interestCoverage,
  'free-cash-flow': engine.freeCashFlow,
  'cagr': engine.cagr,
  'eps-growth': engine.epsGrowth,
  'dividend-yield': engine.dividendYield,
  'total-shareholder-return': engine.totalShareholderReturn,
  'portfolio-allocation': engine.portfolioAllocation,
  'position-size': engine.positionSize,
  'asset-allocation': engine.assetAllocation,
  'sip': engine.sipCalculator,
  'lump-sum': engine.lumpSumCalculator,
  'retirement': engine.retirementCalculator,
  'inflation': engine.inflationCalculator,
  'xirr': engine.xirr,
  'screener-score': engine.screenerScore,
  'piotroski-f-score': engine.piotroskiFScore,
  'altman-z-score': engine.altmanZScore,
  'beneish-m-score': engine.beneishMScore,
  'drip': engine.dripCalculator,
  'combined-fair-value': engine.combinedFairValue,
};

exports.calculate = async (req, res, next) => {
  try {
    const { calculatorType } = req.params;

    if (!CALCULATOR_TYPES.includes(calculatorType)) {
      return res.status(400).json({
        success: false,
        message: `Unknown calculator type: ${calculatorType}`,
        errors: [`Valid types: ${CALCULATOR_TYPES.join(', ')}`],
      });
    }

    const calcFn = calculatorMap[calculatorType];
    if (!calcFn) {
      return res.status(500).json({
        success: false,
        message: `Calculator "${calculatorType}" is not yet implemented`,
      });
    }

    const result = calcFn(req.body);

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        calculatorType,
        inputs: req.body,
        outputs: result,
      },
    });
  } catch (error) {
    next(error);
  }
};
