const mongoose = require('mongoose');
const { AppError } = require('../utils/errorHandler');
const Plan = require('./Plan'); // Import the Plan model
const {
  printRechargeReceipt,
  printDeductionReceipt,
  printMealReceipt,
} = require('../utils/printerHandler'); // Adjust path as needed

const StudentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: (v) => /^[0-9]{10}$/.test(v),
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  rfidCard: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  currentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    default: null,
  },
  cashBalance: {
    type: Number,
    default: 0,
    validate: {
      validator: (v) => v >= -200,
      message: (props) => `Cash balance cannot go below -200. Current: ${props.value}`,
    },
  },
  transactionHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  ],
  mealPlanHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
    },
  ],
}, { timestamps: true });

/**
 * Instance Methods
 */

// Add a transaction to the student's history
StudentSchema.methods.addTransaction = async function (transactionId) {
  this.transactionHistory.push(transactionId);
  return this.save();
};

// Update meal plan history and current plan
StudentSchema.methods.updatePlanHistory = async function (newPlanId) {
  const newPlan = await Plan.findById(newPlanId);
  if (!newPlan) throw new AppError('Plan not found', 404);

  if (this.currentPlan) this.mealPlanHistory.push(this.currentPlan);
  this.currentPlan = newPlan._id;

  return this.save();
};

// Deduct a meal from the active plan
StudentSchema.methods.deductMeal = async function () {
  if (!this.currentPlan) throw new AppError('No active plan found.', 400);

  await this.populate('currentPlan');
  if (!this.currentPlan) throw new AppError('Plan details not found.', 404);
  return this.currentPlan.deductMeal(this);
};

// Fetch all transactions linked to the student
StudentSchema.methods.getAllTransactions = async function () {
  await this.populate('transactionHistory');
  return this.transactionHistory;
};

// Recharge the student's cash balance
StudentSchema.methods.rechargeCash = async function (amount) {
  if (amount <= 0) throw new AppError('Recharge amount must be greater than 0.', 400);
  this.cashBalance += amount;
  printRechargeReceipt(
    rfidCard= this.rfidCard,
    name= this.name,
    amount= amount,
    balance= this.cashBalance,
  );

  return this.save();
};

// Deduct cash from the student's balance
StudentSchema.methods.deductCash = async function (amount) {
  if (amount <= 0 || this.cashBalance - amount < -200) {
    throw new AppError(`Insufficient balance. Available: ${this.cashBalance}`, 400);
  }
  this.cashBalance -= amount;
  printDeductionReceipt(
    rfidCard= this.rfidCard,
    name= this.name,
    amount= amount,
    balance= this.cashBalance,
  );
  return this.save();
};

// Check current plan status
StudentSchema.methods.checkPlanStatus = async function () {
  if (!this.currentPlan) return { status: 'no-plan', daysRemaining: 0 };

  await this.populate('currentPlan');
  const now = new Date();
  const planEndDate = new Date(this.currentPlan.planEndDate);

  return {
    status: planEndDate < now ? 'expired' : 'active',
    daysRemaining: Math.max(0, Math.ceil((planEndDate - now) / (1000 * 60 * 60 * 24))),
  };
};

/**
 * Static Methods
 */

// Find a student by their RFID card
StudentSchema.statics.findByRFID = async function (rfidCard) {
  return this.findOne({ rfidCard }).populate('currentPlan');
};

module.exports = mongoose.model('Student', StudentSchema);
