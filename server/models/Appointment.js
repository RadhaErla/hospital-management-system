const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required for appointment'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required for appointment'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required for appointment'],
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      startTime: {
        type: String, // Format: HH:mm (e.g. "09:30")
        required: [true, 'Slot start time is required'],
      },
      endTime: {
        type: String, // Format: HH:mm (e.g. "10:00")
        required: [true, 'Slot end time is required'],
      },
    },
    reason: {
      type: String,
      required: [true, 'Appointment reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Checked-In', 'Completed', 'Cancelled', 'Rejected'],
      default: 'Pending',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for querying and checking double-booking
appointmentSchema.index({ doctor: 1, date: 1, 'timeSlot.startTime': 1 });
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
