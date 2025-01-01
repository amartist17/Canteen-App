const mongoose = require('mongoose');
const { AppError } = require('../utils/errorHandler'); // Import custom error handler
const Student = require('../models/Student');
const Plan = require('../models/Plan');

const TransactionSchema = new mongoose.Schema({
    rfidCard: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['recharge', 'deduction', 'plan-update', 'meal-deduction'],
      required: true,
    },
    amount: {
      type: Number,
      required: function () {
        return this.type !== 'meal-deduction';
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
    },
    definedPlanId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['processing', 'success', 'failure'],
      default: 'processing',
    },
  },
  { timestamps: true }
);




/**
 * Get all transactions for a specific student.
 */
TransactionSchema.statics.getTransactionsByStudent = async function (studentId) {
  const transactions = await this.find({ studentId }).sort({ date: -1 });
  if (!transactions.length) throw new AppError(`No transactions found for student ID: ${studentId}`, 404);
  return transactions;
};

TransactionSchema.statics.getTransactions = async function (filter = {}, options = {}) {
  const { sort = { date: -1 }, limit = 100, skip = 0 } = options;

  const transactions = await this.find(filter)
    .sort(sort)
    .limit(limit)
    .skip(skip);

  if (!transactions.length) {
    throw new AppError('No transactions found for the given criteria', 404);
  }

  return transactions;
};

/**
 * Get transactions by type (e.g., recharge, deduction).
 */
TransactionSchema.statics.getTransactionsByType = async function (type) {
  const transactions = await this.find({ type }).sort({ date: -1 });
  if (!transactions.length) throw new AppError(`No transactions found for type: ${type}`, 404);
  return transactions;
};

/**
 * Get transactions within a date range.
 */
TransactionSchema.statics.getTransactionsByDateRange = async function (startDate, endDate) {
  const transactions = await this.find({ date: { $gte: startDate, $lte: endDate } }).sort({ date: -1 });
  if (!transactions.length) throw new AppError('No transactions found in the specified date range', 404);
  return transactions;
};

//  Change the status of a transaction by its ID.

TransactionSchema.statics.updateTransactionStatus = async function (transactionId, newStatus) {
  if (!['success', 'failure'].includes(newStatus)) {
    throw new AppError('Invalid status value. Use "success" or "failure".', 400);
  }

  const transaction = await this.findById(transactionId);
  if (!transaction) {
    throw new AppError(`Transaction with ID ${transactionId} not found.`, 404);
  }

  transaction.status = newStatus;
  await transaction.save();
  return transaction;
};


module.exports = mongoose.model('Transaction', TransactionSchema);
