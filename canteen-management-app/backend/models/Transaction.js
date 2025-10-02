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
      orphaned:    { type: Boolean, default: false, index: true },
  orphanReason:{ type: String },
  orphanedAt:  { type: Date },
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
// TRANSFER-BASED studentLogs (rechecked)
TransactionSchema.statics.studentLogs = async function ({
  from,
  to,
  type = 'all',
  limit = 500,
  includeHistory = false, // also match via students.rfidHistory if true
} = {}) {
  const p = [];

  // 1) Optional type filter
  if (type && type !== 'all') p.push({ $match: { type } });

  // 2) Coalesce timestamp -> 'at'
  p.push({
    $addFields: {
      at: { $ifNull: ['$date', { $ifNull: ['$occurredAt', '$createdAt'] }] },
    },
  });

  // 3) Date range on 'at'
  if (from || to) {
    const range = {};
    if (from) range.$gte = new Date(from);
    if (to) { const end = new Date(to); end.setHours(23, 59, 59, 999); range.$lte = end; }
    p.push({ $match: { at: range } });
  }

  // 4) Join Student by current RFID; optionally include rfidHistory
  const studentMatchExpr = includeHistory
    ? {
        $or: [
          { $eq: ['$rfidCard', '$$rf'] },
          { $in: ['$$rf', { $ifNull: ['$rfidHistory', []] }] },
        ],
      }
    : { $eq: ['$rfidCard', '$$rf'] };

  p.push({
    $lookup: {
      from: 'students',
      let: { rf: '$rfidCard' },
      pipeline: [
        { $match: { $expr: studentMatchExpr } },
        { $project: { _id: 1, name: 1, rfidCard: 1 } },
        { $limit: 1 },
      ],
      as: 'student',
    },
  });

  // 5) Keep only rows that matched a student
  p.push({ $unwind: { path: '$student', preserveNullAndEmptyArrays: false } });

  // 6) Slot labels (IST)
  p.push(
    { $addFields: { istParts: { $dateToParts: { date: '$at', timezone: 'Asia/Kolkata' } } } },
    {
      $addFields: {
        minutes: { $add: [{ $multiply: ['$istParts.hour', 60] }, '$istParts.minute'] },
        duration: {
          $switch: {
            branches: [
              { case: { $and: [{ $gte: ['$minutes', 450] }, { $lt: ['$minutes', 570] }] }, then: 'Breakfast' }, // 07:30–09:30
              { case: { $and: [{ $gte: ['$minutes', 570] }, { $lt: ['$minutes', 690] }] }, then: 'Brunch' },    // 09:30–11:30
              { case: { $and: [{ $gte: ['$minutes', 690] }, { $lt: ['$minutes', 870] }] }, then: 'Lunch' },     // 11:30–14:30
              { case: { $and: [{ $gte: ['$minutes', 960] }, { $lt: ['$minutes', 1140] }] }, then: 'Snacks' },   // 16:00–19:00
              { case: { $and: [{ $gte: ['$minutes', 1140] }, { $lt: ['$minutes', 1260] }] }, then: 'Dinner' },  // 19:00–21:00
            ],
            default: 'Outside Slots',
          },
        },
      },
    }
  );

  // 7) Final shape
  p.push(
    {
      $project: {
        _id: 0,
        transId: '$_id',
        at: 1,
        type: 1,
        rfid: '$rfidCard',
        studentId: '$student._id',
        name: '$student.name',
        duration: 1,
        status: 1,
        reason: { $ifNull: ['$failureReason', '$description'] },
      },
    },
    { $sort: { at: -1 } },
    { $limit: Math.max(1, Number(limit) || 500) }
  );

  return this.aggregate(p);
};


// Transactions
TransactionSchema.index({ type: 1, createdAt: -1 });
TransactionSchema.index({ rfidCard: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
