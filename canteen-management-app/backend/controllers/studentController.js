const Student = require('../models/Student');
const Transaction = require('../models/Transaction');
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
    console.log(req.params.rfidCard);
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

// KEEP SAME NAME
exports.updateRFID = async (req, res) => {
  try {
    let { oldRFID, newRFID } = req.body;
    oldRFID = String(oldRFID || '').trim();
    newRFID = String(newRFID || '').trim();

    if (!oldRFID || !newRFID) {
      return res.status(400).json({ success:false, message:'oldRFID and newRFID are required.' });
    }
    if (oldRFID === newRFID) {
      return res.status(400).json({ success:false, message:'Old and new RFID cannot be the same.' });
    }

    // 1) newRFID must not already be taken
    const taken = await Student.exists({ rfidCard: newRFID });
    if (taken) return res.status(409).json({ success:false, message:'newRFID already assigned.' });

    // 2) find student with oldRFID
    const student = await Student.findOne({ rfidCard: oldRFID });
    if (!student) return res.status(404).json({ success:false, message:'Student with old RFID not found.' });

    // 3) update student card (+ keep history)
    const before = { id: student._id, oldRFID, newRFID };
    student.rfidCard = newRFID;
    if (!student.rfidHistory?.includes(oldRFID)) student.rfidHistory = [...(student.rfidHistory || []), oldRFID];
    await student.save(); // <— no session

    // 4) transfer past transactions oldRFID -> newRFID
    let modifiedCount = 0;
    try {
      const upd = await Transaction.updateMany(
        { rfidCard: oldRFID },
        { $set: { rfidCard: newRFID } }
      );
      modifiedCount = typeof upd.modifiedCount === 'number' ? upd.modifiedCount : (upd.nModified || 0);
    } catch (txErr) {
      // 5) best-effort rollback of the student change (since no transaction)
      await Student.updateOne(
        { _id: before.id, rfidCard: newRFID },
        { $set: { rfidCard: oldRFID }, $pull: { rfidHistory: oldRFID } }
      );
      throw txErr;
    }

    return res.status(200).json({
      success: true,
      message: 'RFID updated and past transactions transferred (no-session).',
      studentId: before.id,
      movedTransactions: modifiedCount
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ success:false, message:'Duplicate RFID (unique index).' });
    }
    console.error('updateRFID (no-session) error:', err);
    return res.status(500).json({ success:false, message:'Server error.' });
  }
};
