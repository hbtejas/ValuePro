const express = require('express');
const historyController = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All history routes require authentication
router.use(protect);

router.get('/', historyController.getHistory);
router.post('/', historyController.saveCalculation);
router.delete('/:id', historyController.deleteCalculation);

module.exports = router;
