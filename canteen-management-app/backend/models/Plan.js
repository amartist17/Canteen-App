const mongoose = require('mongoose');
const { AppError } = require('../utils/errorHandler');
const PredefinedPlan = require('./PredefinedPlans');
const {
  printRechargeReceipt,
  printDeductionReceipt,
  printMealReceipt,
} = require('../utils/printerHandler'); // Adjust path as needed


const PlanSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  planType: {
    type: String,
    enum: ['fixed', 'flexible'],
    required: true,
  },
  duration: {
    type: Number, // Duration in days
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  mealDetails: {
    type: mongoose.Schema.Types.Mixed, // Structure varies for fixed and flexible plans
    required: true,
  },
  mealUsage: [
    {
      mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'general'], required: true },
      date: { type: Date, default: Date.now },
      description: { type: String },
    },
  ],
  predefinedPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PredefinedPlan', // Reference to the predefined plan template
    required: true,
  },
}, { timestamps: true });

// Determines the current meal based on the time
PlanSchema.methods.getCurrentMeal = function () {
  const mealTimes = {
    breakfast: { start: '07:00', end: '11:00' },
    lunch: { start: '11:00', end: '24:00' },
    dinner: { start: '00:00', end: '06:00' },
  };

  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return Object.keys(mealTimes).find(
    (meal) => currentTime >= mealTimes[meal].start && currentTime <= mealTimes[meal].end
  ) || null;
};

// Generates and assigns a new plan to a student
PlanSchema.statics.generateAndAssignPlan = async function (student, predefinedPlanId, startDate) {
  const predefinedPlan = await PredefinedPlan.findOne({ definedPlanId: predefinedPlanId });
  if (!predefinedPlan) throw new AppError(`Predefined Plan with ID ${predefinedPlanId} not found`, 404);

  const newPlan = await this.create({
    student: student._id,
    planName: predefinedPlan.planName,
    planType: predefinedPlan.planType,
    duration: predefinedPlan.duration,
    startDate: startDate || new Date(),
    endDate: new Date(Date.now() + predefinedPlan.duration * 24 * 60 * 60 * 1000),
    mealDetails: predefinedPlan.mealDetails,
    predefinedPlan: predefinedPlan._id,
  });
  newPlan.amount= predefinedPlan.price;
  await student.updatePlanHistory(newPlan._id);
  return newPlan;
};

// Deducts a meal based on plan type
PlanSchema.methods.deductMeal = async function (student) {
  const currentMeal = this.getCurrentMeal();
  if (!currentMeal && this.planType === 'fixed') throw new AppError('No meal available at this time.', 400);

  return this.planType === 'fixed'
    ? this.deductFixedMeal(student, currentMeal)
    : this.deductFlexibleMeal(student, currentMeal);
};

// Deducts a fixed meal
PlanSchema.methods.deductFixedMeal = async function (student, currentMeal) {
  const today = new Date().toISOString().split('T')[0];

  if (this.mealUsage.some((usage) => usage.mealType === currentMeal && usage.date.toISOString().split('T')[0] === today)) {
    return { message: `${currentMeal} meal already used today` };
  }

  const meal = this.mealDetails.meals.find((m) => m.mealType === currentMeal);
  if (!meal) throw new AppError(`${currentMeal} not included in the plan`, 400);
  if (meal.totalMeals <= 0) throw new AppError(`No ${currentMeal} meals remaining`, 400);

  meal.totalMeals -= 1;
  this.mealUsage.push({ mealType: currentMeal, date: new Date(), description: `Deducted 1 ${currentMeal} meal` });

  this.markModified('mealDetails');
  this.markModified('mealUsage');
  await this.save();
  printMealReceipt(student.rfidCard, this.planName, currentMeal,0, this.endDate)
  return { mealType: currentMeal, remainingMeals: meal.totalMeals, message: `${currentMeal} meal deducted successfully` };
};

// Deducts a flexible meal
PlanSchema.methods.deductFlexibleMeal = async function (student, currentMeal) {
  if (this.mealDetails.totalMeals <= 0) throw new AppError('No meals remaining in the plan', 400);
  if (!currentMeal) throw new AppError('No meal available at this time for deduction.', 400);

  this.mealDetails.totalMeals -= 1;
  this.mealUsage.push({ mealType: currentMeal, date: new Date(), description: `Deducted 1 ${currentMeal} meal` });

  this.markModified('mealDetails');
  this.markModified('mealUsage');
  await this.save();
  printMealReceipt(student.rfidCard, this.planName, currentMeal, this.mealDetails.totalMeals, this.endDate)

  return { mealType: currentMeal, remainingMeals: this.mealDetails.totalMeals, message: `${currentMeal} meal deducted successfully` };
};







module.exports = mongoose.model('Plan', PlanSchema);
