const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
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
    symptoms: {
      type: String,
      required: [true, 'Symptoms are required'],
      trim: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    treatment: {
      type: String,
      required: [true, 'Treatment plan is required'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    allergies: {
      type: [String],
      default: [],
    },
    vitals: {
      bp: { type: String, default: '' },            // e.g. "120/80 mmHg"
      pulse: { type: String, default: '' },         // e.g. "72 bpm"
      temperature: { type: String, default: '' },   // e.g. "98.6 °F"
      weight: { type: String, default: '' },        // e.g. "70 kg"
      height: { type: String, default: '' },        // e.g. "175 cm"
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

medicalRecordSchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
