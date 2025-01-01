const express = require('express');
const router = express.Router();
// const { testPrint, printReceipt, printReceiptWithLogo } = require('../utils/printerHandler');

// Dashboard Home
router.get('/dashboard', (req, res, next) => {
  try {

    res.render('dashboard/dashboard-home');
  } catch (err) {
    next(err);
  }
});

// Daily Ledger
router.get('/daily-ledger', (req, res, next) => {
  try {
    res.render('dashboard/daily-ledger');
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
router.get('/transactions/buy-plan', (req, res, next) => {
  try {
    res.render('dashboard/buy-plan');
  } catch (err) {
    next(err);
  }
});

// Buy Plan
router.get('/students/add-student', (req, res, next) => {
  try {
    res.render('dashboard/add-student');
  } catch (err) {
    next(err);
  }
});



module.exports = router;
