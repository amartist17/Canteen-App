const Staff = require('../models/Staff');
const { AppError } = require('../utils/errorHandler');


/**
 * Add a new Staff
 */
exports.createStaff = async (req, res, next) => {
  try {
    const staff = await Staff.create(req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (err) {
    next(err);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { rfidCard } = req.body;
    
    if (!rfidCard) return next(new AppError('RFID card number is required.', 400));

    const actionMessage = await Staff.markAttendance(rfidCard);

    res.status(200).json({
      success: true,
      message: actionMessage
    });

  } catch (err) {
    next(new AppError(err.message, 400));
  }
};
