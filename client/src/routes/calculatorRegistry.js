import { lazy, Suspense } from 'react';

// Eager imports for core calculators (most popular)
import IntrinsicValueCalculator from '../components/calculators/IntrinsicValueCalculator';
import DCFCalculator from '../components/calculators/DCFCalculator';
import SIPCalculator from '../components/calculators/SIPCalculator';
import XIRRCalculator from '../components/calculators/XIRRCalculator';
import DRIPCalculator from '../components/calculators/DRIPCalculator';
import PortfolioAllocationCalculator from '../components/calculators/PortfolioAllocationCalculator';
import CombinedFairValueCalculator from '../components/calculators/CombinedFairValueCalculator';

import {
  MarginOfSafetyCalculator, PEFairValueCalculator, PEGRatioCalculator,
  EVEBITDACalculator, PriceToBookCalculator, ROECalculator, ROCECalculator,
  DebtToEquityCalculator, InterestCoverageCalculator, FreeCashFlowCalculator,
  CAGRCalculator, DividendYieldCalculator, TSRCalculator, LumpSumCalculator,
  InflationCalculator, PositionSizeCalculator, EPSGrowthCalculator,
  RetirementCalculator, AssetAllocationCalculator, AltmanZScoreCalculator,
  PiotroskiFScoreCalculator,
} from '../components/calculators/SimpleCalculators';

import { ScreenerScoreCalculator, BeneishMScoreCalculator } from '../components/calculators/AdvancedCalculators';

// Map calculator IDs to their components
const CALCULATOR_COMPONENTS = {
  'intrinsic-value': IntrinsicValueCalculator,
  'margin-of-safety': MarginOfSafetyCalculator,
  'dcf': DCFCalculator,
  'pe-fair-value': PEFairValueCalculator,
  'peg-ratio': PEGRatioCalculator,
  'ev-ebitda': EVEBITDACalculator,
  'price-to-book': PriceToBookCalculator,
  'roe': ROECalculator,
  'roce': ROCECalculator,
  'debt-to-equity': DebtToEquityCalculator,
  'interest-coverage': InterestCoverageCalculator,
  'free-cash-flow': FreeCashFlowCalculator,
  'cagr': CAGRCalculator,
  'eps-growth': EPSGrowthCalculator,
  'dividend-yield': DividendYieldCalculator,
  'total-shareholder-return': TSRCalculator,
  'portfolio-allocation': PortfolioAllocationCalculator,
  'position-size': PositionSizeCalculator,
  'asset-allocation': AssetAllocationCalculator,
  'sip': SIPCalculator,
  'lump-sum': LumpSumCalculator,
  'retirement': RetirementCalculator,
  'inflation': InflationCalculator,
  'xirr': XIRRCalculator,
  'screener-score': ScreenerScoreCalculator,
  'piotroski-f-score': PiotroskiFScoreCalculator,
  'altman-z-score': AltmanZScoreCalculator,
  'beneish-m-score': BeneishMScoreCalculator,
  'drip': DRIPCalculator,
  'combined-fair-value': CombinedFairValueCalculator,
};

export function getCalculatorComponent(id) {
  return CALCULATOR_COMPONENTS[id] || null;
}

export default CALCULATOR_COMPONENTS;
