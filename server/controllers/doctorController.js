const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Department = require('../models/Department');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const { generateDoctorSlots } = require('../services/slotGeneratorService');
const { logActivity } = require('../services/auditService');

/**
 * Get all doctors with filtering and pagination
 * GET /api/doctors
 */
const getDoctors = async (req, res, next) => {
  try {
    const { department, search, specialization, page = 1, limit = 10 } = req.query;

    const query = {};

    if (department) {
      query.department = department;
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // If search term provided, find matching users first
    if (search) {
      const users = await User.find({
        role: 'doctor',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = users.map((u) => u._id);
      query.$or = [
        { user: { $in: userIds } },
        { specialization: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Doctor.countDocuments(query);

    const doctors = await Doctor.find(query)
      .populate('user', 'name email phone avatar isActive')
      .populate('department', 'name icon')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(
      res,
      'Doctors fetched successfully.',
      {
        items: doctors,
        total,
        page,
        limit,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor by ID
 * GET /api/doctors/:id
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone avatar isActive')
      .populate('department', 'name description icon');

    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }

    return successResponse(res, 'Doctor retrieved successfully.', doctor);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Doctor (Admin only)
 * POST /api/doctors
 */
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      department,
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      roomNumber,
      bio,
      availability,
    } = req.body;

    if (!name || !email || !password || !department || !specialization) {
      return next(
        new AppError('Please provide name, email, password, department, and specialization.', 400)
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists.', 400));
    }

    const deptDoc = await Department.findById(department);
    if (!deptDoc) {
      return next(new AppError('Specified department does not exist.', 404));
    }

    // Create user with doctor role
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'doctor',
    });

    const doctor = await Doctor.create({
      user: user._id,
      department,
      specialization,
      qualifications: qualifications || ['MBBS'],
      experienceYears: experienceYears || 1,
      consultationFee: consultationFee || 50,
      roomNumber: roomNumber || '101',
      bio: bio || '',
      availability: availability || undefined,
    });

    const populatedDoctor = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name');

    logActivity({
      req,
      action: 'CREATE_DOCTOR',
      entityType: 'Doctor',
      entityId: doctor._id,
      details: `Doctor created: Dr. ${name} (${specialization})`,
    });

    return successResponse(res, 'Doctor created successfully.', populatedDoctor, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Doctor (Admin or the Doctor themselves)
 * PUT /api/doctors/:id
 */
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }

    // Check authorization: must be admin OR the doctor user
    if (req.user.role !== 'admin' && doctor.user.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to update this doctor profile.', 403));
    }

    const {
      name,
      phone,
      department,
      specialization,
      qualifications,
      experienceYears,
      consultationFee,
      roomNumber,
      bio,
      availability,
    } = req.body;

    // Update user info if name or phone changed
    if (name || phone !== undefined) {
      await User.findByIdAndUpdate(doctor.user, {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
      });
    }

    // Update doctor profile
    if (department && req.user.role === 'admin') doctor.department = department;
    if (specialization) doctor.specialization = specialization;
    if (qualifications) doctor.qualifications = qualifications;
    if (experienceYears !== undefined) doctor.experienceYears = experienceYears;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (roomNumber !== undefined) doctor.roomNumber = roomNumber;
    if (bio !== undefined) doctor.bio = bio;
    if (availability) doctor.availability = availability;

    await doctor.save();

    const updated = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name');

    logActivity({
      req,
      action: 'UPDATE_DOCTOR',
      entityType: 'Doctor',
      entityId: doctor._id,
      details: `Doctor profile updated for ${updated.user?.name}`,
    });

    return successResponse(res, 'Doctor profile updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete / Deactivate Doctor (Admin only)
 * DELETE /api/doctors/:id
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }

    // Deactivate user account
    await User.findByIdAndUpdate(doctor.user, { isActive: false });

    logActivity({
      req,
      action: 'DEACTIVATE_DOCTOR',
      entityType: 'Doctor',
      entityId: doctor._id,
      details: `Doctor deactivated: ${doctor._id}`,
    });

    return successResponse(res, 'Doctor deactivated successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * Get Available Doctor Slots for a Given Date
 * GET /api/doctors/:id/slots?date=YYYY-MM-DD
 */
const getDoctorSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return next(new AppError('Please provide a date in YYYY-MM-DD format.', 400));
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return next(new AppError('Doctor not found', 404));
    }

    const slotInfo = await generateDoctorSlots(doctor, date);

    return successResponse(res, 'Doctor slots calculated successfully.', slotInfo);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorSlots,
};
