const mongoose = require('mongoose');

const receptionistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Rotating'],
      default: 'Morning',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Receptionist', receptionistSchema);
