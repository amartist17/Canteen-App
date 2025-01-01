const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const PredefinedPlan = require('../models/PredefinedPlans');
const { AppError } = require('../utils/errorHandler');

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

module.exports = router;
