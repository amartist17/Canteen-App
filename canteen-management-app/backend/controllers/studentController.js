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


exports.updateRFID = async (req, res) => {
  const { oldRFID, newRFID } = req.body;
  console.log('Updating RFID:', oldRFID, 'to', newRFID);
  try {
    // Find student by old RFID
    const student = await Student.findOne({ rfidCard: oldRFID });

    if (!student) {
      return res.status(404).json({ message: 'Student with old RFID not found.' });
    }

    // Update the RFID
    student.rfidCard = newRFID;
    await student.save();

    res.status(200).json({ message: 'RFID updated successfully.', student });
  } catch (error) {
    console.error('Error updating RFID:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};