const mongoose = require('mongoose');
const Student = require('./models/Student'); // Adjust path as necessary
const Plan = require('./models/Plan');
const Transaction = require('./models/Transaction');
require('dotenv').config(); // Load environment variables

const clearCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // List of models to clear
    const models = [Student, Plan, Transaction];

    for (const model of models) {
      const modelName = model.modelName;
      const result = await model.deleteMany({});
      console.log(`Cleared ${result.deletedCount} documents from ${modelName} collection`);
    }

    console.log('All collections cleared successfully!');
  } catch (error) {
    console.error('Error clearing collections:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the function
clearCollections();
