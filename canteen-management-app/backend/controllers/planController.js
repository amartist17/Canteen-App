const Plan = require('../models/Plan');
const PredefinedPlan = require('../models/PredefinedPlans');
const { AppError } = require('../utils/errorHandler');

// Fetch all plans
exports.getAllPlans = async (req, res, next) => {
  try {
    const plans = await Plan.getAllPlans();
    res.status(200).json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};


// Delete a plan
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findOneAndDelete({ planId: req.params.planId });
    if (!plan) {
      throw new AppError(`Plan with ID ${req.params.planId} not found`, 404);
    }

    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (err) {
    next(err);
  }
};
