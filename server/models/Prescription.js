const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    medicines: [
      {
        name: {
          type: String,
          required: [true, 'Medicine name is required'],
          trim: true,
        },
        dosage: {
          type: String,
          required: [true, 'Dosage is required (e.g. 500mg)'],
          trim: true,
        },
        frequency: {
          type: String,
          required: [true, 'Frequency is required (e.g. Twice daily)'],
          trim: true,
        },
        duration: {
          type: String,
          required: [true, 'Duration is required (e.g. 5 days)'],
          trim: true,
        },
        instructions: {
          type: String,
          default: 'After meals',
          trim: true,
        },
      },
    ],
    additionalAdvice: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

prescriptionSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
