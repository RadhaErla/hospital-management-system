const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const LabReport = require('../models/LabReport');
const Bill = require('../models/Bill');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/auditService');

/**
 * Get all patients with search & pagination (Staff only)
 * GET /api/patients
 */
const getPatients = async (req, res, next) => {
  try {
    const { search, bloodGroup, page = 1, limit = 10 } = req.query;

    const query = {};

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (search) {
      // Find matching users by name or email or phone
      const matchingUsers = await User.find({
        role: 'patient',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);
      query.$or = [
        { user: { $in: userIds } },
        { patientId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Patient.countDocuments(query);

    const patients = await Patient.find(query)
      .populate('user', 'name email phone avatar isActive')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Patients retrieved successfully.', {
      items: patients,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient by ID
 * GET /api/patients/:id
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      'user',
      'name email phone avatar isActive'
    );

    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    // Access control: Patient can only view own profile
    if (req.user.role === 'patient' && patient.user._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied. You can only view your own records.', 403));
    }

    return successResponse(res, 'Patient details retrieved.', patient);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Patient (Receptionist or Admin)
 * POST /api/patients
 */
const createPatient = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      medicalHistory,
      allergies,
    } = req.body;

    if (!name || !email) {
      return next(new AppError('Name and email are required to register a patient.', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists.', 400));
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Patient@123', // Default initial password for front-desk created patients
      phone: phone || '',
      role: 'patient',
    });

    const count = await Patient.countDocuments();
    const patientId = `PAT-${1000 + count + 1}`;

    const patient = await Patient.create({
      user: user._id,
      patientId,
      dateOfBirth: dateOfBirth || null,
      gender: gender || 'Other',
      bloodGroup: bloodGroup || 'Unknown',
      address: address || {},
      emergencyContact: emergencyContact || {},
      medicalHistory: medicalHistory || [],
      allergies: allergies || [],
    });

    const populated = await Patient.findById(patient._id).populate('user', 'name email phone');

    logActivity({
      req,
      action: 'CREATE_PATIENT',
      entityType: 'Patient',
      entityId: patient._id,
      details: `New patient registered: ${name} (${patientId})`,
    });

    return successResponse(res, 'Patient created successfully.', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Patient
 * PUT /api/patients/:id
 */
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    // Access control: Patient can only update their own profile; staff can update any
    if (req.user.role === 'patient' && patient.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update your own patient record.', 403));
    }

    const {
      name,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      medicalHistory,
      allergies,
    } = req.body;

    if (name || phone !== undefined) {
      await User.findByIdAndUpdate(patient.user, {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
      });
    }

    if (dateOfBirth) patient.dateOfBirth = dateOfBirth;
    if (gender) patient.gender = gender;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (address) patient.address = address;
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (medicalHistory) patient.medicalHistory = medicalHistory;
    if (allergies) patient.allergies = allergies;

    await patient.save();

    const updated = await Patient.findById(patient._id).populate('user', 'name email phone avatar');

    logActivity({
      req,
      action: 'UPDATE_PATIENT',
      entityType: 'Patient',
      entityId: patient._id,
      details: `Patient details updated for ID ${patient.patientId}`,
    });

    return successResponse(res, 'Patient profile updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete / Deactivate Patient (Admin only)
 * DELETE /api/patients/:id
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    await User.findByIdAndUpdate(patient.user, { isActive: false });

    logActivity({
      req,
      action: 'DEACTIVATE_PATIENT',
      entityType: 'Patient',
      entityId: patient._id,
      details: `Patient deactivated: ${patient.patientId}`,
    });

    return successResponse(res, 'Patient deactivated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Comprehensive Patient Medical History
 * GET /api/patients/:id/history
 */
const getPatientHistory = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate('user', 'name email phone');
    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    // Access control: Patient can only view own history
    if (req.user.role === 'patient' && patient.user._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied to other patient records.', 403));
    }

    const [appointments, medicalRecords, prescriptions, labReports, bills] = await Promise.all([
      Appointment.find({ patient: patient._id })
        .populate({ path: 'doctor', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name' }] })
        .sort({ date: -1 }),
      MedicalRecord.find({ patient: patient._id })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
        .sort({ date: -1 }),
      Prescription.find({ patient: patient._id })
        .populate({ path: 'doctor', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name' }] })
        .sort({ date: -1 }),
      LabReport.find({ patient: patient._id })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
        .sort({ date: -1 }),
      Bill.find({ patient: patient._id }).sort({ createdAt: -1 }),
    ]);

    return successResponse(res, 'Patient complete history fetched.', {
      patient,
      appointments,
      medicalRecords,
      prescriptions,
      labReports,
      bills,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientHistory,
};
