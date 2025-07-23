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
  entryTime: {
    type: Date
  },
  breakOutTime: {
    type: Date
  },
  breakReturnTime: {
    type: Date
  },
  dutyOffTime: {
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
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  let attendanceToday = staff.attendance.find(att =>
    new Date(att.date).setHours(0, 0, 0, 0) === todayMidnight.getTime()
  );

  const ONE_MIN_GAP = 60 * 1000; // 1 min (safety against scanner double clicks)
  let action = '';

  if (!attendanceToday) {
    // Add new attendance record
    staff.attendance.push({
      date: new Date(),
      entryTime: now,
      status: 'Present'
    });
    action = 'Entry marked';
  } else {
    // Prevent double scan within 1 minute of last recorded time
    const lastTimes = [attendanceToday.dutyOffTime, attendanceToday.breakReturnTime, attendanceToday.breakOutTime, attendanceToday.entryTime];
    const lastRecorded = lastTimes.reverse().find(Boolean);
    if (lastRecorded && now - lastRecorded < ONE_MIN_GAP) {
      throw new Error('Already marked recently. Please wait before trying again.');
    }

    // Determine the next stage
    if (!attendanceToday.breakOutTime) {
      attendanceToday.breakOutTime = now;
      action = 'Break out marked';
    } else if (!attendanceToday.breakReturnTime) {
      attendanceToday.breakReturnTime = now;
      action = 'Break return marked';
    } else if (!attendanceToday.dutyOffTime) {
      attendanceToday.dutyOffTime = now;
      action = 'Duty off marked';
    } else {
      throw new Error('All attendance points already marked for today.');
    }
  }

  await staff.save();
  return action;
};



const Staff = mongoose.model('Staff', StaffSchema);
module.exports = Staff;
