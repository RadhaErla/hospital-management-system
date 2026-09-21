const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required for a doctor'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    qualifications: {
      type: [String],
      default: ['MBBS'],
    },
    experienceYears: {
      type: Number,
      default: 1,
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: 0,
      default: 50,
    },
    roomNumber: {
      type: String,
      default: '101',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    availability: {
      workingDays: {
        type: [String],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      startTime: {
        type: String,
        default: '09:00', // HH:mm 24-hr format
      },
      endTime: {
        type: String,
        default: '17:00',
      },
      breakStart: {
        type: String,
        default: '13:00',
      },
      breakEnd: {
        type: String,
        default: '14:00',
      },
      slotDurationMinutes: {
        type: Number,
        default: 30,
        min: 15,
        max: 120,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Helpful compound indexes
doctorSchema.index({ department: 1 });
doctorSchema.index({ specialization: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
