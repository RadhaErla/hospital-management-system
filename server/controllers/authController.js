const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Receptionist = require('../models/Receptionist');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');
const { sendWelcomeEmail } = require('../services/emailService');
const { logActivity } = require('../services/auditService');

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_for_dev_only', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Register Patient
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, gender, dateOfBirth, bloodGroup, address } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password.', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists.', 400));
    }

    // Create user with patient role
    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'patient',
    });

    // Auto-generate patient ID e.g. PAT-1001
    const patientCount = await Patient.countDocuments();
    const patientId = `PAT-${1000 + patientCount + 1}`;

    const patient = await Patient.create({
      user: user._id,
      patientId,
      gender: gender || 'Other',
      dateOfBirth: dateOfBirth || null,
      bloodGroup: bloodGroup || 'Unknown',
      address: address || {},
    });

    // Generate JWT
    const token = signToken(user._id);

    // Audit log & welcome email (async non-blocking)
    logActivity({ req, user, action: 'REGISTER', entityType: 'User', entityId: user._id, details: `Patient registered with ID ${patientId}` });
    sendWelcomeEmail(user).catch((e) => console.error('Welcome email error:', e.message));

    return successResponse(
      res,
      'Registration successful! Welcome to AuraHealth.',
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          profileId: patient._id,
          patientId: patient.patientId,
        },
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Login
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide both email and password.', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact an administrator.', 403));
    }

    // Fetch role profile ID if exists
    let profileData = {};
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: user._id });
      if (patient) {
        profileData = { profileId: patient._id, patientId: patient.patientId };
      }
    } else if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id }).populate('department', 'name');
      if (doctor) {
        profileData = {
          profileId: doctor._id,
          department: doctor.department,
          specialization: doctor.specialization,
        };
      }
    } else if (user.role === 'receptionist') {
      const receptionist = await Receptionist.findOne({ user: user._id });
      if (receptionist) {
        profileData = { profileId: receptionist._id, employeeId: receptionist.employeeId };
      }
    }

    const token = signToken(user._id);

    logActivity({ req, user, action: 'LOGIN', entityType: 'User', entityId: user._id, details: `User logged in as ${user.role}` });

    return successResponse(res, 'Logged in successfully.', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        ...profileData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  return successResponse(res, 'Logged out successfully.');
};

/**
 * Get Current Logged-in User Profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'receptionist') {
      profile = await Receptionist.findOne({ user: user._id });
    }

    return successResponse(res, 'Profile retrieved successfully.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, profileDetails } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    // Update role profile if provided
    let updatedProfile = null;
    if (profileDetails) {
      if (user.role === 'patient') {
        updatedProfile = await Patient.findOneAndUpdate(
          { user: user._id },
          { $set: profileDetails },
          { new: true, runValidators: true }
        );
      } else if (user.role === 'doctor') {
        updatedProfile = await Doctor.findOneAndUpdate(
          { user: user._id },
          { $set: profileDetails },
          { new: true, runValidators: true }
        ).populate('department');
      } else if (user.role === 'receptionist') {
        updatedProfile = await Receptionist.findOneAndUpdate(
          { user: user._id },
          { $set: profileDetails },
          { new: true, runValidators: true }
        );
      }
    }

    logActivity({ req, user, action: 'UPDATE_PROFILE', entityType: 'User', entityId: user._id, details: 'User updated personal profile' });

    return successResponse(res, 'Profile updated successfully.', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change Password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide both current and new passwords.', 400));
    }

    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters long.', 400));
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password does not match.', 400));
    }

    user.password = newPassword;
    await user.save();

    logActivity({ req, user, action: 'CHANGE_PASSWORD', entityType: 'User', entityId: user._id, details: 'Password was updated successfully' });

    return successResponse(res, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
