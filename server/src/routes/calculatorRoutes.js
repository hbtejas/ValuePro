const express = require('express');
const calculatorController = require('../controllers/calculatorController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/calculate/:calculatorType — public (optional auth for save context)
router.post('/:calculatorType', optionalAuth, calculatorController.calculate);

module.exports = router;
