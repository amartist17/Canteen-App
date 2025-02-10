const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        enum: ['indian', 'chaat', 'continental', 'chinese', 'tandoor', 'south', 'service', 'housekeeping', 'other'],
        required: true
    },
    position: {
        type: String,
        enum: ['chef', 'helper', 'waiter', 'captain', 'house keeper', 'cashier', 'inventory', 'other'],
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    security: {
        type: Number,
        default: 300
    },
    joiningDate: {
        type: Date,
        required: true
    },
    referencedBy: {
        type: String, // Can store a reference name or ID
        default: 'Self'
    },
    advance: {
        type: Number,
        default: 0
    },
    fine: [{
        date: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true
        }
    }]
}, { timestamps: true });

const Staff = mongoose.model('Staff', StaffSchema);
module.exports = Staff;
