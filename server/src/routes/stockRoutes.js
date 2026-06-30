const express = require('express');
const stockController = require('../controllers/stockController');

const router = express.Router();

// Public routes
router.get('/search', stockController.searchStocks);
router.get('/:ticker', stockController.getStock);

module.exports = router;
