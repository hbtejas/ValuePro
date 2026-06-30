const express = require('express');
const router = express.Router();
const screenerController = require('../controllers/screenerController');

// GET /api/screener?ticker=TCS.NS — Full stock analysis
router.get('/', screenerController.screenStock);

// GET /api/screener/chart?ticker=TCS.NS&range=1y — Historical chart data
router.get('/chart', screenerController.getChartData);

// GET /api/screener/autocomplete?q=REL — Stock name/ticker autocomplete
router.get('/autocomplete', screenerController.autocomplete);

module.exports = router;
