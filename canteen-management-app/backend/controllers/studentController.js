const Student = require('../models/Student');
const { AppError } = require('../utils/errorHandler');

/**
 * Fetch all students
 */
exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find();
    res.status(200).json({ success: true, data: students });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch a single student by RFID card
 */
exports.getStudentByRFID = async (req, res, next) => {
  try {
    const student = await Student.findByRFID(req.params.rfidCard);
    if (!student) throw new AppError('Student not found', 404);
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

/**
 * Add a new student
 */
exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a student by ID
 */
exports.updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) throw new AppError('Student not found', 404);
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a student by ID
 */
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) throw new AppError('Student not found', 404);
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
};
