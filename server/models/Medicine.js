const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      unique: true,
    },
    genericName: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Antibiotic', 'Analgesic', 'Antipyretic', 'Antihistamine', 'Antacid', 'Cardiovascular', 'Vitamin/Supplement', 'Other'],
      default: 'Other',
    },
    dosageForm: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Inhaler'],
      default: 'Tablet',
    },
    strength: {
      type: String,
      default: '',
      trim: true,
    },
    manufacturer: {
      type: String,
      default: '',
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

medicineSchema.index({ name: 'text', genericName: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
