const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');
const { createAndSendNotification } = require('../services/socketService');
const { sendPrescriptionEmail } = require('../services/emailService');
const { logActivity } = require('../services/auditService');

/**
 * Get Prescriptions by Patient ID
 * GET /api/prescriptions/:patientId
 */
const getPrescriptionsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    // Access control: Patient can only view their own prescriptions
    if (req.user.role === 'patient' && patient.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized access to prescriptions.', 403));
    }

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone avatar' },
          { path: 'department', select: 'name' },
        ],
      })
      .populate('appointment', 'date timeSlot')
      .sort({ date: -1 });

    return successResponse(res, 'Prescriptions fetched successfully.', prescriptions);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single prescription by ID (for viewing/printing)
 * GET /api/prescriptions/single/:id
 */
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'department', select: 'name' },
        ],
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('appointment', 'date timeSlot');

    if (!prescription) {
      return next(new AppError('Prescription not found', 404));
    }

    // Access control: Patient can only view their own
    if (
      req.user.role === 'patient' &&
      prescription.patient.user._id.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Unauthorized access to prescription.', 403));
    }

    return successResponse(res, 'Prescription retrieved.', prescription);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Prescription (Doctor only)
 * POST /api/prescriptions
 */
const createPrescription = async (req, res, next) => {
  try {
    const { patientId, appointmentId, diagnosis, medicines, additionalAdvice } = req.body;

    if (!patientId || !diagnosis || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return next(
        new AppError('Patient ID, diagnosis, and at least one medicine are required.', 400)
      );
    }

    // Identify doctor
    let doctorId = req.body.doctorId;
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) return next(new AppError('Doctor profile not found.', 404));
      doctorId = doctor._id;
    }

    if (!doctorId) {
      return next(new AppError('Doctor reference is required.', 400));
    }

    const prescription = await Prescription.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId || null,
      diagnosis,
      medicines,
      additionalAdvice: additionalAdvice || '',
    });

    const populated = await Prescription.findById(prescription._id)
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'department', select: 'name' },
        ],
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' },
      });

    // Notify patient
    if (populated.patient?.user?._id) {
      await createAndSendNotification({
        recipientId: populated.patient.user._id,
        title: 'New Prescription Issued',
        message: `Dr. ${populated.doctor.user.name} has issued a new prescription for you.`,
        type: 'prescription',
        link: `/patient/prescriptions`,
      });

      sendPrescriptionEmail({
        patientEmail: populated.patient.user.email,
        patientName: populated.patient.user.name,
        doctorName: populated.doctor.user.name,
        date: new Date().toLocaleDateString(),
      }).catch((e) => console.error('Prescription email error:', e.message));
    }

    logActivity({
      req,
      action: 'CREATE_PRESCRIPTION',
      entityType: 'Prescription',
      entityId: prescription._id,
      details: `Prescription issued for patient: ${patientId}`,
    });

    return successResponse(res, 'Prescription created successfully.', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Prescription (Doctor only)
 * PUT /api/prescriptions/:id
 */
const updatePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return next(new AppError('Prescription not found', 404));
    }

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || prescription.doctor.toString() !== doctor._id.toString()) {
        return next(new AppError('Unauthorized to edit this prescription.', 403));
      }
    }

    const updated = await Prescription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logActivity({
      req,
      action: 'UPDATE_PRESCRIPTION',
      entityType: 'Prescription',
      entityId: prescription._id,
      details: `Prescription updated for ID: ${prescription._id}`,
    });

    return successResponse(res, 'Prescription updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrescriptionsByPatient,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
};
