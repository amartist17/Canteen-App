const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path");

// Initialize Express app
const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "static")));

const bodyParser = require('body-parser');

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Parse application/json
app.use(bodyParser.json());


// Middleware
app.use(cors());
app.use(express.json());
// app.use(helmet());
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
app.use('/', require('./routes/viewsRoutes'));

// Error handling middleware
const { errorHandler } = require('./utils/errorHandler');
app.use(errorHandler);

module.exports = app;
