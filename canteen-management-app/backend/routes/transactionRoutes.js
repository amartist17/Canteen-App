const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getAllTransactions);
router.get('/student/:rfidCard', transactionController.getTransactionsByStudent);
router.get('/type/:type', transactionController.getTransactionsByType);
router.get('/date-range', transactionController.getTransactionsByDateRange);

module.exports = router;
