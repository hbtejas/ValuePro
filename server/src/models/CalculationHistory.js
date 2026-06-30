const mongoose = require('mongoose');

const CALCULATOR_TYPES = [
  'intrinsic-value', 'margin-of-safety', 'dcf', 'pe-fair-value', 'peg-ratio',
  'ev-ebitda', 'price-to-book', 'roe', 'roce', 'debt-to-equity',
  'interest-coverage', 'free-cash-flow', 'cagr', 'eps-growth', 'dividend-yield',
  'total-shareholder-return', 'portfolio-allocation', 'position-size',
  'asset-allocation', 'sip', 'lump-sum', 'retirement', 'inflation', 'xirr',
  'screener-score', 'piotroski-f-score', 'altman-z-score', 'beneish-m-score',
  'drip', 'combined-fair-value', 'income-tax',
];

const calculationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  calculatorType: {
    type: String,
    required: true,
    enum: CALCULATOR_TYPES,
  },
  inputs: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  outputs: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  stockTicker: {
    type: String,
    uppercase: true,
    trim: true,
    default: null,
  },
}, {
  timestamps: true,
});

calculationHistorySchema.index({ userId: 1, createdAt: -1 });
calculationHistorySchema.index({ userId: 1, calculatorType: 1 });

const modelProxy = require('../config/proxyHelper');
const CalculationHistoryModel = mongoose.model('CalculationHistory', calculationHistorySchema);
module.exports = modelProxy(CalculationHistoryModel, 'CalculationHistory');
module.exports.CALCULATOR_TYPES = CALCULATOR_TYPES;

