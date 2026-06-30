const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  ticker: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  exchange: {
    type: String,
    enum: ['NSE', 'BSE'],
    required: true,
  },
  sector: {
    type: String,
    trim: true,
  },
  fundamentals: {
    eps: Number,
    bookValue: Number,
    totalDebt: Number,
    shareholdersEquity: Number,
    ebit: Number,
    ebitda: Number,
    marketCap: Number,
    promoterHolding: Number,
    netProfit: Number,
    revenue: Number,
    operatingCashFlow: Number,
    capex: Number,
    totalAssets: Number,
    currentLiabilities: Number,
    retainedEarnings: Number,
    totalLiabilities: Number,
    sales: Number,
    workingCapital: Number,
    interestExpense: Number,
    dividendPerShare: Number,
    currentPrice: Number,
    sharesOutstanding: Number,
    freeCashFlow: Number,
    peRatio: Number,
    industryPE: Number,
    grossMargin: Number,
    assetTurnover: Number,
    currentRatio: Number,
    epsGrowthRate: Number,
    revenueGrowthRate: Number,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Text index for search autocomplete
stockSchema.index({ name: 'text', ticker: 'text' });

const modelProxy = require('../config/proxyHelper');
const StockModel = mongoose.model('Stock', stockSchema);
module.exports = modelProxy(StockModel, 'Stock');

