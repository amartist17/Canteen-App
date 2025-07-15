const mongoose = require('mongoose');

const LedgerSchema = new mongoose.Schema({
    branch:{
        type: String,
        required: true,
        trim: true
    },
    POS: {
        type: Number,
        required: true,
        default: 0
    },
    machine: {
        type: Number,
        required: true,
        default: 0
    },
    cash: {
        type: Number,
        required: true,
        default: 0
    },
    online: {
        type: Number,
        required: true,
        default: 0
    },
    totalSale: {
        type: Number,
        default: 0
    },
    totalPayment: {
        type: Number,
        default: 0
    },
    difference: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Pre-save hook to calculate totalSale, totalPayment, and difference
LedgerSchema.pre('save', function (next) {
    this.totalSale = this.POS + this.machine;
    this.totalPayment = this.cash + this.online;
    this.difference = this.totalPayment - this.totalSale;
    next();
});

const Ledger = mongoose.model('Ledger', LedgerSchema);

module.exports = Ledger;
