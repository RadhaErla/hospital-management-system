const MedicalRecord = require('../models/MedicalRecord');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/auditService');

/**
 * Get Medical Records by Patient ID
 * GET /api/medical-records/:patientId
 */
const getRecordsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    // Access control: Patient can only view their own records
    if (req.user.role === 'patient' && patient.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized access to medical records.', 403));
    }

    const records = await MedicalRecord.find({ patient: patientId })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone avatar' },
          { path: 'department', select: 'name' },
        ],
      })
      .populate('appointment', 'date timeSlot reason status')
      .sort({ date: -1 });

    return successResponse(res, 'Medical records fetched successfully.', records);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Medical Record (Doctor only)
 * POST /api/medical-records
 */
const createRecord = async (req, res, next) => {
  try {
    const {
      patientId,
      appointmentId,
      symptoms,
      diagnosis,
      treatment,
      notes,
      allergies,
      vitals,
    } = req.body;

    if (!patientId || !symptoms || !diagnosis || !treatment) {
      return next(
        new AppError('Patient ID, symptoms, diagnosis, and treatment are required.', 400)
      );
    }

    // Identify doctor profile
    let doctorId = req.body.doctorId;
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) return next(new AppError('Doctor profile not found.', 404));
      doctorId = doctor._id;
    }

    if (!doctorId) {
      return next(new AppError('Doctor reference is required.', 400));
    }

    const record = await MedicalRecord.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId || null,
      symptoms,
      diagnosis,
      treatment,
      notes: notes || '',
      allergies: allergies || [],
      vitals: vitals || {},
    });

    const populated = await MedicalRecord.findById(record._id)
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' },
      });

    logActivity({
      req,
      action: 'CREATE_MEDICAL_RECORD',
      entityType: 'MedicalRecord',
      entityId: record._id,
      details: `Medical record created for patient: ${patientId}`,
    });

    return successResponse(res, 'Medical record created successfully.', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Medical Record (Doctor only)
 * PUT /api/medical-records/:id
 */
const updateRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return next(new AppError('Medical record not found', 404));
    }

    // Ensure doctor is owner of record or admin
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || record.doctor.toString() !== doctor._id.toString()) {
        return next(new AppError('Unauthorized to update this medical record.', 403));
      }
    }

    const updated = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name email' },
    });

    logActivity({
      req,
      action: 'UPDATE_MEDICAL_RECORD',
      entityType: 'MedicalRecord',
      entityId: record._id,
      details: `Medical record updated for ID: ${record._id}`,
    });

    return successResponse(res, 'Medical record updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecordsByPatient,
  createRecord,
  updateRecord,
};
