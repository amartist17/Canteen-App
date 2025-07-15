const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Create a new staff member
router.post('/add', staffController.createStaff);
router.post('/mark-attendance', staffController.markAttendance);

module.exports = router;
