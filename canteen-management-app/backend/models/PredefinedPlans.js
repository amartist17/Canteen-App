const mongoose = require('mongoose');

const PredefinedPlanSchema = new mongoose.Schema({
  definedPlanId: {
    type: String,
    required: true,
    unique: true,
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
  price: {
    type: Number,
    required: true,
  },
  mealDetails: {
    type: mongoose.Schema.Types.Mixed, // Details vary based on planType
    required: true,
  },
});

module.exports = mongoose.model('PredefinedPlan', PredefinedPlanSchema);
