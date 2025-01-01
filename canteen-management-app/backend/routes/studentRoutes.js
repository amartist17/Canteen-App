const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Fetch all students
router.get('/', studentController.getAllStudents);

// Fetch a single student by RFID card
router.get('/:rfidCard', studentController.getStudentByRFID);

// Add a new student
router.post('/', studentController.createStudent);

// Update student by ID
router.put('/:id', studentController.updateStudent);

// Delete student by ID
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
