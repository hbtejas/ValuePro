const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  stockTicker: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  stockName: {
    type: String,
    trim: true,
  },
  sector: {
    type: String,
    trim: true,
  },
  marketCapCategory: {
    type: String,
    enum: ['Large Cap', 'Mid Cap', 'Small Cap'],
    required: true,
  },
  units: {
    type: Number,
    required: true,
    min: 0,
  },
  avgPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  currentValue: {
    type: Number,
    default: 0,
  },
}, { _id: true });

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    default: 'My Portfolio',
    trim: true,
  },
  holdings: [holdingSchema],
}, {
  timestamps: true,
});

const modelProxy = require('../config/proxyHelper');
const PortfolioModel = mongoose.model('Portfolio', portfolioSchema);
module.exports = modelProxy(PortfolioModel, 'Portfolio');

