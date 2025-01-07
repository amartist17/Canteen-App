const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const Transaction = require('../models/Transaction');
const Student = require('../models/Student');
const Plan = require('../models/Plan');
const PredefinedPlan = require('../models/PredefinedPlans');
const { AppError } = require('../utils/errorHandler');

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getAllTransactions);
router.get('/student/:rfidCard', transactionController.getTransactionsByStudent);
router.get('/type/:type', transactionController.getTransactionsByType);
router.get('/date-range', transactionController.getTransactionsByDateRange);
// Route for bulk plan updates
router.post('/bulk-plan-update', async (req, res, next) => {
    console.log(req.body);
    const  updates  = req.body; // Expecting an array of updates
    
    if (updates.length === 0) {
      return next(new AppError('Invalid input. Provide an array of plan updates.', 400));
    }
  
    try {
      const results = [];
  
      for (const update of updates) {
        const { rfidCard, definedPlanId, startDate, amount } = update;
  
        if (!rfidCard || !definedPlanId) {
          throw new AppError('Each update must include RFID card and plan ID.', 400);
        }
  
        // Find the student by RFID card
        const student = await Student.findOne({ rfidCard });
        if (!student) {
          results.push({ rfidCard, status: 'Student not found' });
          continue;
        }
  
        // Validate the predefined plan
        const predefinedPlan = await PredefinedPlan.findOne({ definedPlanId });
        if (!predefinedPlan) {
          results.push({ rfidCard, status: 'Plan not found' });
          continue;
        }
  
        // Generate and assign the plan
        try {
          const newPlan = await Plan.generateAndAssignPlan(student, definedPlanId, startDate);
          newPlan.amount = amount || predefinedPlan.price;
          await newPlan.save();
  
          results.push({ rfidCard, status: 'Plan updated successfully' });
        } catch (err) {
          results.push({ rfidCard, status: `Error updating plan: ${err.message}` });
        }
      }
  
      res.status(200).json({
        success: true,
        message: 'Bulk plan update processed',
        results,
      });
    } catch (err) {
      next(err);
    }
  });
  
  
module.exports = router;
