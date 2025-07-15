const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    active: {
  type: String,
  enum: ['active', 'expired'],
  default: 'active',
},
 
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
    rfidCard: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    department: {
        type: String,
        enum: ['management', 'indian', 'chaat', 'continental', 'chinese', 'tandoor', 'south', 'service', 'housekeeping', 'other'],
        required: true
    },
    position: {
        type: String,
        enum: ['management', 'chef', 'helper', 'waiter', 'captain', 'house keeper', 'cashier', 'inventory', 'other'],
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    security: {
        type: Number,
        default: 0
    },
    joiningDate: {
        type: Date,
        required: true
    },
    referencedBy: {
        type: String,
        default: 'Self'
    },
    advances: [{
        date: { type: Date, required: true },
        amount: { type: Number, required: true }   
    }],
    fine: [{
        date: { type: Date, required: true },
        reason: { type: String, required: true, trim: true },
        amount: { type: Number, required: true }
    }],
    attendance: [{
        date: {
            type: Date,
            required: true
        },
        checkIn: {
            type: Date,
            required: true
        },
        checkOut: {
            type: Date
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave'],
            required: true,
            default: 'Present'
        }
    }]
}, { timestamps: true });

// Static method to mark attendance with one-hour gap handling
StaffSchema.statics.markAttendance = async function(rfidCard) {
  const staff = await this.findOne({ rfidCard });
  if (!staff) throw new Error('Staff member not found.');

  const now = new Date();
  const todayMidnight = new Date(now.setHours(0, 0, 0, 0));

  let attendanceToday = staff.attendance.find(att =>
    new Date(att.date).setHours(0, 0, 0, 0) === todayMidnight.getTime()
  );

  const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds
  let action;

  if (attendanceToday) {
    if (!attendanceToday.checkOut) {
      const checkInTime = attendanceToday.checkIn;

      // Ensure at least one hour has passed since check-in
      if ((Date.now() - new Date(checkInTime)) < ONE_HOUR_MS) {
        throw new Error('Cannot check out yet. At least one hour must pass after check-in.');
      }

      attendanceToday.checkOut = new Date();
      action = 'Checked out successfully';
    } else {
      throw new Error('Attendance already completed for today.');
    }
  } else {
    // Check previous attendance for accidental double scan
    const lastAttendance = staff.attendance[staff.attendance.length - 1];
    if (lastAttendance && (Date.now() - new Date(lastAttendance.checkIn)) < ONE_HOUR_MS) {
      throw new Error('Check-in already marked recently. Please wait before checking in again.');
    }

    // ✅ Fix: Include explicit `date`
    staff.attendance.push({
      date: new Date(),
      checkIn: new Date(),
      status: 'Present'
    });

    action = 'Checked in successfully';
  }

  await staff.save();
  return action;
};



const Staff = mongoose.model('Staff', StaffSchema);
module.exports = Staff;
