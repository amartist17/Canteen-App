// models/Contact.js
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    type: {
      type: String,
      trim: true,
      maxlength: 60,
      // Uncomment to restrict to known types:
      // enum: ['Vendor', 'Staff', 'Student', 'Client', 'Supplier', 'Other'],
      default: 'Other',
    },

    location: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 32,
      validate: {
        validator: v =>
          !v || /^[+\d][\d\s\-().]{6,}$/.test(v), // basic +digits / spaces / dashes / ()
        message: 'Invalid phone number format',
      },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Helpful indexes
ContactSchema.index({ name: 'text', location: 'text', type: 1 });
ContactSchema.index({ phone: 1 }, { sparse: true }); // make unique if you need: { unique: true, sparse: true }

// Optional sanitize: trim all strings on save
ContactSchema.pre('save', function (next) {
  for (const path of ['name', 'type', 'location', 'phone']) {
    if (this[path] && typeof this[path] === 'string') this[path] = this[path].trim();
  }
  next();
});

module.exports = mongoose.model('Contact', ContactSchema);
