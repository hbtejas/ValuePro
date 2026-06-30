const CalculationHistory = require('../models/CalculationHistory');

exports.getHistory = async (req, res, next) => {
  try {
    const { calculatorType, limit = 50, page = 1 } = req.query;
    const filter = { userId: req.user._id };
    if (calculatorType) filter.calculatorType = calculatorType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [history, total] = await Promise.all([
      CalculationHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CalculationHistory.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { history, total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.saveCalculation = async (req, res, next) => {
  try {
    const { calculatorType, inputs, outputs, stockTicker } = req.body;

    const record = await CalculationHistory.create({
      userId: req.user._id,
      calculatorType,
      inputs,
      outputs,
      stockTicker: stockTicker || null,
    });

    res.status(201).json({
      success: true,
      message: 'Calculation saved',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCalculation = async (req, res, next) => {
  try {
    const record = await CalculationHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Calculation not found' });
    }

    res.json({ success: true, message: 'Calculation deleted' });
  } catch (error) {
    next(error);
  }
};
