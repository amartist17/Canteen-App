const Transaction = require('../models/Transaction');
const Student = require('../models/Student');
const Plan = require('../models/Plan');
const { AppError } = require('../utils/errorHandler');

// Create a new transaction
exports.createTransaction = async (req, res, next) => {
    let { rfidCard, type, amount, description, definedPlanId, startDate } = req.body;
    console.log(req.body);
    if(amount){

      amount=parseInt(amount);
    }
    try {
      // Validate required fields
      if (!rfidCard || !type) {
        throw new AppError('RFID card and transaction type are required', 400);
      }
  
      // Find the student by RFID card
      const student = await Student.findByRFID(rfidCard);
      if (!student) {
        throw new AppError(`Student with RFID card ${rfidCard} not found`, 404);
      }
  
      // Initialize result for response
      let result;
  
      // Process the transaction based on its type
      switch (type) {
        case 'recharge':
          result = await student.rechargeCash(amount);
          break;
  
        case 'deduction':
          result = await student.deductCash(amount);
          break;
  
        case 'plan-update':
          if (!definedPlanId) {
            throw new AppError('Plan Template ID is required for plan-update transactions', 400);
          }
          result = await Plan.generateAndAssignPlan(student, definedPlanId, startDate);
          amount= result.amount;

          break;
  
        case 'meal-deduction':
          result = await student.deductMeal();
          break;
  
        default:
          throw new AppError(`Unsupported transaction type: ${type}`, 400);
      }
      // Create and save the transaction
      const transaction = await new Transaction({
        rfidCard,
        type,
        amount,
        description,
        definedPlanId,
        status: 'success', // Automatically mark as success if no errors occur
      }).save();
  
      // Update the student's transaction history
      await student.addTransaction(transaction._id);
  
      // Send the response
      res.status(201).json({
        success: true,
        message: 'Transaction processed successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.getAllTransactions = async (req, res, next) => {
    try {
      const transactions = await Transaction.getTransactions();
      res.status(200).json({ success: true, data: transactions });
    } catch (err) {
      next(err);
    }
  };

  exports.getFilteredTransactions = async (req, res, next) => {
    try {
      const { type, startDate, endDate, limit, skip } = req.query;
  
      const filter = {};
      if (type) filter.type = type;
      if (startDate && endDate) {
        filter.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
  
      const transactions = await Transaction.getTransactions(filter, {
        limit: parseInt(limit) || 100,
        skip: parseInt(skip) || 0,
      });
  
      res.status(200).json({ success: true, data: transactions });
    } catch (err) {
      next(err);
    }
  };
  

// Fetch transactions by student
exports.getTransactionsByStudent = async (req, res, next) => {
  try {
    const student = await Student.findByRFID(req.params.rfidCard);
    const transactions = await student.getAllTransactions();
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
};

// Fetch transactions by type
exports.getTransactionsByType = async (req, res, next) => {
  try {
    const transactions = await Transaction.getTransactionsByType(req.params.type);
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
};

// Fetch transactions in a date range
exports.getTransactionsByDateRange = async (req, res, next) => {
  const { startDate, endDate } = req.query;
  try {
    if (!startDate || !endDate) {
      throw new AppError('Both startDate and endDate are required', 400);
    }

    const transactions = await Transaction.getTransactionsByDateRange(new Date(startDate), new Date(endDate));
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
};
