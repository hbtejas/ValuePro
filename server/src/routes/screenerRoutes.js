const express = require('express');
const router = express.Router();
const screenerController = require('../controllers/screenerController');

// GET /api/screener?ticker=TCS.NS
router.get('/', screenerController.screenStock);

module.exports = router;
