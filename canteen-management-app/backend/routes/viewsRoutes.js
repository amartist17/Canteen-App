const express = require('express');
const PredefinedPlans = require('../models/PredefinedPlans');
const Student = require('../models/Student');
const Ledger = require('../models/Ledger');
const router = express.Router();
const { DateTime } = require('luxon');

// const { testPrint, printReceipt, printReceiptWithLogo } = require('../utils/printerHandler');

// Dashboard Home
router.get('/', (req, res, next) => {
  try {

    res.render('dashboard/dashboard-home');
  } catch (err) {
    next(err);
  }
});

// Daily Ledger
router.get('/daily-ledger', async(req, res, next) => {
  try {
    let ledger = await Ledger.find();
    // ledger= ledger.reverse()
    // console.log(ledger)
    res.render('dashboard/daily-ledger',{ledger});
  } catch (err) {
    next(err);
  }
});


// Take Meal
router.get('/transactions/take-meal', (req, res, next) => {
  try {
    res.render('dashboard/take-meal');
  } catch (err) {
    next(err);
  }
});

// Recharge Debit Card
router.get('/transactions/recharge', (req, res, next) => {
  try {
    res.render('dashboard/recharge');
  } catch (err) {
    next(err);
  }
});

// Purchase
router.get('/transactions/purchase', (req, res, next) => {
  try {
    res.render('dashboard/purchase');
  } catch (err) {
    next(err);
  }
});

// Buy Plan
router.get('/transactions/buy-plan',async (req, res, next) => {
  try {
    let plans = await PredefinedPlans.find();

    res.render('dashboard/buy-plan',{plans});
  } catch (err) {
    next(err);
  }
});

// Add Student
router.get('/students/add-student', (req, res, next) => {
  try {
    res.render('dashboard/add-student');
  } catch (err) {
    next(err);
  }
});

// Add Staff
router.get('/add-staff', (req, res, next) => {
  try {
    res.render('dashboard/add-staff');
  } catch (err) {
    next(err);
  }
});

// Mark Staff Attendance
router.get('/staff-attendance', (req, res, next) => {
  try {
    res.render('dashboard/staff-attendance');
  } catch (err) {
    next(err);
  }
});

const Staff = require('../models/Staff');

// // GET /staff/attendance-table
// router.get('/total-staff', async (req, res) => {
//   try {
//     const staffList = await Staff.find().lean();
//     res.render('dashboard/total-staff', { staffList }); // your EJS view name
//   } catch (err) {
//     res.status(500).send('Server Error');
//   }
// });

// GET /total-staff
router.get('/total-staff', async (req, res) => {
  try {
    const staffList = await Staff.find().lean();

    // Build today's window in IST, convert to UTC for Mongo dates
    const IST_MIN = 330; // +05:30 in minutes
    const now = new Date();
    const istNow = new Date(now.getTime() + IST_MIN * 60_000);

    const istStart = new Date(istNow); istStart.setHours(0,0,0,0);
    const istEnd   = new Date(istNow); istEnd.setHours(23,59,59,999);

    const startUTC = new Date(istStart.getTime() - IST_MIN * 60_000);
    const endUTC   = new Date(istEnd.getTime()   - IST_MIN * 60_000);

    // helper: first timestamp present on a record
    const pickTime = (a) => a?.entryTime || a?.date || a?.createdAt || null;

    for (const s of staffList) {
      const rec = (s.attendance || [])
        .slice() // do not mutate
        .reverse() // check newest first
        .find(a => {
          const t = pickTime(a);
          return t && (new Date(t) >= startUTC) && (new Date(t) <= endUTC);
        });

      s.todayAttendance = rec || null;
      s.todayStatus = rec?.status || 'Absent';
    }

    res.render('dashboard/total-staff', { staffList });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});




// Total Students
router.get('/students/total-students',async (req, res, next) => {
  try {
        let students = await Student.find().populate('currentPlan');
    res.render('dashboard/total-students',{students});
  } catch (err) {
    next(err);
  }
});

// Update Student
router.get('/students/update-student', (req, res, next) => {
  try {
    res.render('dashboard/update-student');
  } catch (err) {
    next(err);
  }
});

// Student Logs
const Transaction = require('../models/Transaction');

router.get('/students/logs', async (req, res, next) => {
  try {
    const { from, to, type = 'all' } = req.query;
    const rows = await Transaction.studentLogs({ from, to, type, limit: 800 });

    // Render your EJS (you can also pass filters to prefill a form)
    res.render('dashboard/student-logs', {
      title: 'Student Logs',
      rows,
      filters: { from: from || '', to: to || '', type },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;





// Contacts
router.get('/contacts', (req, res, next) => {
  try {
    res.render('dashboard/contacts');
  } catch (err) {
    next(err);
  }
});

// Add printer
router.get('/printer', (req, res, next) => {
  try {
    const { listAllUsbDevices, listUsbPrinters } = require('../utils/printerFinder');

// Full list (for debugging)
console.log("All Connected USB Devices:");
console.log(listAllUsbDevices());

// Only known printers (safer for production)
console.log("Detected Printers:");
console.log(listUsbPrinters());

  } catch (err) {
    next(err);
  }
});


module.exports = router;
