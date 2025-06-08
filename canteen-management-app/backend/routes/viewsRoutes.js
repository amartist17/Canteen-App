const express = require('express');
const PredefinedPlans = require('../models/PredefinedPlans');
const Student = require('../models/Student');
const Ledger = require('../models/Ledger');
const router = express.Router();
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

// Total Students
router.get('/students/total-students',async (req, res, next) => {
  try {
        let students = await Student.find().populate('currentPlan');
    res.render('dashboard/total-students',{students});
  } catch (err) {
    next(err);
  }
});

// Add Staff
router.get('/contacts', (req, res, next) => {
  try {
    res.render('dashboard/contacts');
  } catch (err) {
    next(err);
  }
});


module.exports = router;
