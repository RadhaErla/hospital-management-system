const LabReport = require('../models/LabReport');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');
const { createAndSendNotification } = require('../services/socketService');
const { logActivity } = require('../services/auditService');

/**
 * Upload Lab Report (Doctor, Receptionist, Admin)
 * POST /api/lab-reports
 */
const uploadReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please select a file to upload.', 400));
    }

    const { patientId, appointmentId, testName, category, notes } = req.body;

    if (!patientId || !testName) {
      return next(new AppError('Patient ID and test name are required.', 400));
    }

    const patient = await Patient.findById(patientId).populate('user');
    if (!patient) {
      return next(new AppError('Patient not found.', 404));
    }

    let doctorId = req.body.doctorId;
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (doctor) doctorId = doctor._id;
    }

    // Generate accessible relative file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    const report = await LabReport.create({
      patient: patientId,
      doctor: doctorId || null,
      appointment: appointmentId || null,
      testName,
      category: category || 'General',
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      notes: notes || '',
    });

    const populated = await LabReport.findById(report._id)
      .populate('patient', 'patientId user')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    // Notify patient
    if (patient.user?._id) {
      await createAndSendNotification({
        recipientId: patient.user._id,
        title: 'New Diagnostic Report Uploaded',
        message: `Your lab report for '${testName}' is now available for review.`,
        type: 'lab_report',
        link: '/patient/lab-reports',
      });
    }

    logActivity({
      req,
      action: 'UPLOAD_LAB_REPORT',
      entityType: 'LabReport',
      entityId: report._id,
      details: `Uploaded lab report: ${testName} for patient ${patient.patientId}`,
    });

    return successResponse(res, 'Lab report uploaded successfully.', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Lab Reports by Patient ID
 * GET /api/lab-reports/:patientId
 */
const getReportsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return next(new AppError('Patient not found.', 404));
    }

    // Access control: Patient can only view their own
    if (req.user.role === 'patient' && patient.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Unauthorized access to lab reports.', 403));
    }

    const reports = await LabReport.find({ patient: patientId })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ date: -1 });

    return successResponse(res, 'Lab reports fetched successfully.', reports);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Lab Report (Staff only)
 * DELETE /api/lab-reports/:id
 */
const deleteReport = async (req, res, next) => {
  try {
    const report = await LabReport.findById(req.params.id);
    if (!report) {
      return next(new AppError('Lab report not found.', 404));
    }

    await LabReport.findByIdAndDelete(req.params.id);

    logActivity({
      req,
      action: 'DELETE_LAB_REPORT',
      entityType: 'LabReport',
      entityId: report._id,
      details: `Deleted lab report ${report.testName}`,
    });

    return successResponse(res, 'Lab report deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadReport,
  getReportsByPatient,
  deleteReport,
};
