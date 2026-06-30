const Stock = require('../models/Stock');

// GET /api/stocks/:ticker — Get cached fundamentals for a ticker
// In production, this would fetch from NSE/BSE data vendor (Screener.in API, Yahoo Finance, etc.)
exports.getStock = async (req, res, next) => {
  try {
    const stock = await Stock.findOne({ ticker: req.params.ticker.toUpperCase() });
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: `Stock ${req.params.ticker} not found. In production, this would fetch from an NSE/BSE data vendor.`,
      });
    }

    res.json({
      success: true,
      data: stock,
      // NOTE: In production, plug in a real market-data API here.
      // Example integration points:
      // - Screener.in API (Indian fundamental data)
      // - Yahoo Finance (yahoo-finance2 npm package)
      // - NSE/BSE official data feeds
      // - MoneyControl API
      _meta: {
        source: 'seed_data',
        lastUpdated: stock.lastUpdated,
        note: 'This is manually seeded data. Configure a real data API for live fundamentals.',
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/stocks/search?q= — Ticker/name autocomplete
exports.searchStocks = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json({ success: true, data: [] });
    }

    const stocks = await Stock.find({
      $or: [
        { ticker: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
    })
      .select('ticker name exchange sector')
      .limit(10);

    res.json({ success: true, data: stocks });
  } catch (error) {
    next(error);
  }
};
