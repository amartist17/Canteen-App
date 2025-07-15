const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const PredefinedPlan = require('../models/PredefinedPlans');
const { AppError } = require('../utils/errorHandler');
const Plan = require('../models/Plan');
// Fetch all plans
router.get('/', planController.getAllPlans);


// Delete a plan
router.delete('/:planId', planController.deletePlan);

// Add multiple predefined plans
router.post('/batch-add', async (req, res, next) => {
  try {
    const plans = req.body;

    // Validate input
    if (!Array.isArray(plans) || plans.length === 0) {
      throw new AppError('Request body must contain an array of predefined plans', 400);
    }

    // Check for required fields in each plan
    for (const plan of plans) {
      if (
        !plan.definedPlanId ||
        !plan.planName ||
        !plan.planType ||
        !plan.duration ||
        !plan.price ||
        !plan.mealDetails
      ) {
        throw new AppError(
          'Each plan must contain definedPlanId, planName, planType, duration, price, and mealDetails',
          400
        );
      }
    }

    // Insert plans into the database
    const addedPlans = await PredefinedPlan.insertMany(plans);

    res.status(201).json({
      success: true,
      message: `${addedPlans.length} predefined plans added successfully`,
      data: addedPlans,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/initialize-active', async (req, res) => {
  try {
    const plans = await Plan.find({}, '_id endDate');

    const now = new Date();
    let initialized = 0;

    const updates = plans.map(async (plan) => {
      const status = plan.endDate < now ? 'expired' : 'active';
      await Plan.updateOne({ _id: plan._id }, { $set: { active: status } });
      initialized++;
    });

    await Promise.all(updates);

    res.status(200).json({
      success: true,
      initialized,
      message: `Initialized 'active' status for ${initialized} plans.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// POST /plans/update-statuses
router.post('/plans/update-statuses', async (req, res) => {
  try {
    const plans = await Plan.find({}, '_id endDate active');

    const now = new Date();

    const updates = plans.map(async (plan) => {
      const newStatus = plan.endDate < now ? 'expired' : 'active';

      if (plan.active !== newStatus) {
        await Plan.updateOne({ _id: plan._id }, { $set: { active: newStatus } });
      }
    });

    await Promise.all(updates);

    res.status(200).json({ success: true, message: 'Statuses updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
