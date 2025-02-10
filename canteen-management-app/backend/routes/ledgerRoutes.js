const express = require('express');
const router = express.Router();
const Ledger = require('../models/Ledger');

// Create a new ledger entry
router.post('/entry', async (req, res) => {
    try {
        const newEntry = await Ledger.create(req.body);
        res.status(201).json(newEntry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
