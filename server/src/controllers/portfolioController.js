const Portfolio = require('../models/Portfolio');

exports.getPortfolio = async (req, res, next) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user._id, holdings: [] });
    }
    res.json({ success: true, data: portfolio });
  } catch (error) {
    next(error);
  }
};

exports.updatePortfolio = async (req, res, next) => {
  try {
    const { holdings, name } = req.body;
    let portfolio = await Portfolio.findOne({ userId: req.user._id });

    if (!portfolio) {
      portfolio = new Portfolio({ userId: req.user._id });
    }

    if (name) portfolio.name = name;
    if (holdings) portfolio.holdings = holdings;
    await portfolio.save();

    res.json({ success: true, data: portfolio });
  } catch (error) {
    next(error);
  }
};

exports.addHolding = async (req, res, next) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      portfolio = new Portfolio({ userId: req.user._id, holdings: [] });
    }

    portfolio.holdings.push(req.body);
    await portfolio.save();

    res.status(201).json({ success: true, data: portfolio });
  } catch (error) {
    next(error);
  }
};

exports.removeHolding = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      return res.status(404).json({ success: false, message: 'Portfolio not found' });
    }

    portfolio.holdings = portfolio.holdings.filter(
      (h) => h._id.toString() !== req.params.holdingId
    );
    await portfolio.save();

    res.json({ success: true, data: portfolio });
  } catch (error) {
    next(error);
  }
};
