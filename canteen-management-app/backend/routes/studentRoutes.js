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

// Update student RFID
router.post('/update-rfid', studentController.updateRFID);

// Delete student by ID
router.delete('/:id', studentController.deleteStudent);

// router.post('/bulk-add', async (req, res, next) => {
//     try {
//       const students = req.body;
  
//       if (!Array.isArray(students) || students.length === 0) {
//         throw new AppError('Request body must contain an array of students', 400);
//       }
  
//       const addedStudents = await Student.insertMany(students);
//       res.status(201).json({
//         success: true,
//         message: `${addedStudents.length} students added successfully`,
//         data: addedStudents,
//       });
//     } catch (err) {
//       next(err);
//     }
//   });
  

// const Transaction = require('../models/Transaction');

// // POST /maintenance/remove-orphan-transactions?dryRun=1&includeHistory=1
// router.post('/maintenance/remove-orphan-transactions', async (req, res) => {
//   try {
//     const dryRun = /^(1|true|yes)$/i.test(String(req.query.dryRun || req.body?.dryRun || ''));
//     const includeHistory = /^(1|true|yes)$/i.test(String(req.query.includeHistory || req.body?.includeHistory || ''));

//     // valid RFIDs = all current cards (+ history if requested)
//     let validRFIDs = await Student.distinct('rfidCard');
//     if (includeHistory) {
//       const hist = await Student.aggregate([
//         { $unwind: { path: '$rfidHistory', preserveNullAndEmptyArrays: false } },
//         { $group: { _id: null, list: { $addToSet: '$rfidHistory' } } },
//         { $project: { _id: 0, list: 1 } }
//       ]);
//       validRFIDs = validRFIDs.concat(hist[0]?.list || []);
//     }

//     const filter = {
//       rfidCard: { $exists: true, $ne: null, $nin: validRFIDs },
//     };

//     if (dryRun) {
//       const count = await Transaction.countDocuments(filter);
//       return res.status(200).json({ success: true, dryRun: true, wouldDelete: count });
//     }

//     const delRes = await Transaction.deleteMany(filter);
//     return res.status(200).json({ success: true, deleted: delRes.deletedCount || 0 });
//   } catch (err) {
//     console.error('remove-orphan-transactions error:', err);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// });


module.exports = router;
