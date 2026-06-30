const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', portfolioController.getPortfolio);
router.put('/', portfolioController.updatePortfolio);
router.post('/holdings', portfolioController.addHolding);
router.delete('/holdings/:holdingId', portfolioController.removeHolding);

module.exports = router;
