const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const Student = require('../models/Student');
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

router.post('/bulk-add', async (req, res, next) => {
    try {
      const students = req.body;
  
      if (!Array.isArray(students) || students.length === 0) {
        throw new AppError('Request body must contain an array of students', 400);
      }
  
      const addedStudents = await Student.insertMany(students);
      res.status(201).json({
        success: true,
        message: `${addedStudents.length} students added successfully`,
        data: addedStudents,
      });
    } catch (err) {
      next(err);
    }
  });
  

module.exports = router;
