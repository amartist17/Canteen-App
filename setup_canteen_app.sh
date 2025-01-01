#!/bin/bash

# Step 1: Create Project Directory
echo "Creating project directory..."
mkdir canteen-management-app
cd canteen-management-app || exit

# Step 2: Initialize Backend Project
echo "Initializing backend project..."
mkdir backend
cd backend || exit
npm init -y

# Step 3: Update Project Name in package.json
echo "Updating package.json with the project name..."
npx json -I -f package.json -e 'this.name="canteen-management-app-backend"'

# Step 4: Install Dependencies
echo "Installing backend dependencies..."
npm install express mongoose body-parser cors nodemon dotenv helmet express-rate-limit xss-clean express-mongo-sanitize bcryptjs jsonwebtoken passport passport-jwt cookie-parser

# Step 5: Set Up Backend File Structure
echo "Setting up file structure..."
mkdir models controllers routes middleware utils
touch server.js .env

# Create subfiles for each directory
# Middleware
touch middleware/auth.js middleware/errorHandler.js

# Models
touch models/Student.js models/Plan.js models/Transaction.js

# Controllers
touch controllers/studentController.js controllers/planController.js controllers/transactionController.js

# Routes
touch routes/studentRoutes.js routes/planRoutes.js routes/transactionRoutes.js

# Utilities
touch utils/db.js

# Step 6: Add Basic Server Code
cat <<EOF >server.js
const express = require('express');
const mongoose = require('./utils/db');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
});
app.use(limiter);

// Routes
app.use('/students', require('./routes/studentRoutes'));
app.use('/plans', require('./routes/planRoutes'));
app.use('/transactions', require('./routes/transactionRoutes'));

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
EOF

# Step 7: Add Database Connection Utility
cat <<EOF >utils/db.js
const mongoose = require('mongoose');

const connectDB = mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connectDB.then(() => console.log('MongoDB connected')).catch((err) => console.error(err));

module.exports = mongoose;
EOF

# Step 8: Add Auth Middleware
cat <<EOF >middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
EOF

# Step 9: Add Error Handler Middleware
cat <<EOF >middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
};
EOF

# Step 10: Add Placeholders for Models
echo "Adding placeholders for models..."
cat <<EOF >models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  studentId: String,
  name: String,
  email: String,
  phone: String,
  rfidCard: String,
  currentPlan: {
    planId: String,
    planName: String,
    remainingMeals: Number,
    planStartDate: Date,
    planEndDate: Date,
  },
});

module.exports = mongoose.model('Student', StudentSchema);
EOF

cat <<EOF >models/Plan.js
const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  planId: String,
  planName: String,
  duration: Number,
  price: Number,
  mealLimit: Number,
});

module.exports = mongoose.model('Plan', PlanSchema);
EOF

cat <<EOF >models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transactionId: String,
  studentId: String,
  rfidCard: String,
  mealCount: Number,
  transactionDate: Date,
});

module.exports = mongoose.model('Transaction', TransactionSchema);
EOF

# Step 11: Add Placeholders for Routes
echo "Adding placeholders for routes..."
cat <<EOF >routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.post('/', studentController.createStudent);
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
EOF

cat <<EOF >routes/planRoutes.js
const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

router.post('/', planController.createPlan);
router.get('/', planController.getAllPlans);
router.get('/:id', planController.getPlanById);
router.put('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

module.exports = router;
EOF

cat <<EOF >routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/', transactionController.createTransaction);
router.get('/:studentId', transactionController.getTransactionsByStudent);

module.exports = router;
EOF

# Step 12: Add Environment Variables
echo "Setting up .env file..."
cat <<EOF >.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/canteen
JWT_SECRET=your_jwt_secret
EOF

# Completion Message
echo "Setup complete! Navigate to 'canteen-management-app/backend' and start your development."
echo "Replace placeholders in controllers and models as needed."
