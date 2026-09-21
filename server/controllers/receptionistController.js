const Receptionist = require('../models/Receptionist');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/auditService');

/**
 * Get all receptionists (Admin only)
 * GET /api/receptionists
 */
const getReceptionists = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      const users = await User.find({
        role: 'receptionist',
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = users.map((u) => u._id);
      query.$or = [
        { user: { $in: userIds } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Receptionist.countDocuments(query);

    const receptionists = await Receptionist.find(query)
      .populate('user', 'name email phone avatar isActive')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Receptionists fetched successfully.', {
      items: receptionists,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Receptionist (Admin only)
 * POST /api/receptionists
 */
const createReceptionist = async (req, res, next) => {
  try {
    const { name, email, password, phone, shift } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Name, email, and password are required.', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('A user with this email already exists.', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'receptionist',
    });

    const count = await Receptionist.countDocuments();
    const employeeId = `REC-${1000 + count + 1}`;

    const receptionist = await Receptionist.create({
      user: user._id,
      employeeId,
      shift: shift || 'Morning',
    });

    const populated = await Receptionist.findById(receptionist._id).populate(
      'user',
      'name email phone avatar'
    );

    logActivity({
      req,
      action: 'CREATE_RECEPTIONIST',
      entityType: 'Receptionist',
      entityId: receptionist._id,
      details: `Receptionist created: ${name} (${employeeId})`,
    });

    return successResponse(res, 'Receptionist staff created successfully.', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Receptionist (Admin only)
 * PUT /api/receptionists/:id
 */
const updateReceptionist = async (req, res, next) => {
  try {
    const receptionist = await Receptionist.findById(req.params.id);
    if (!receptionist) {
      return next(new AppError('Receptionist not found', 404));
    }

    const { name, phone, shift } = req.body;

    if (name || phone !== undefined) {
      await User.findByIdAndUpdate(receptionist.user, {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
      });
    }

    if (shift) receptionist.shift = shift;
    await receptionist.save();

    const updated = await Receptionist.findById(receptionist._id).populate(
      'user',
      'name email phone avatar'
    );

    logActivity({
      req,
      action: 'UPDATE_RECEPTIONIST',
      entityType: 'Receptionist',
      entityId: receptionist._id,
      details: `Receptionist updated: ${employeeId}`,
    });

    return successResponse(res, 'Receptionist updated successfully.', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete / Deactivate Receptionist (Admin only)
 * DELETE /api/receptionists/:id
 */
const deleteReceptionist = async (req, res, next) => {
  try {
    const receptionist = await Receptionist.findById(req.params.id);
    if (!receptionist) {
      return next(new AppError('Receptionist not found', 404));
    }

    await User.findByIdAndUpdate(receptionist.user, { isActive: false });

    logActivity({
      req,
      action: 'DEACTIVATE_RECEPTIONIST',
      entityType: 'Receptionist',
      entityId: receptionist._id,
      details: `Receptionist deactivated: ${receptionist.employeeId}`,
    });

    return successResponse(res, 'Receptionist deactivated successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReceptionists,
  createReceptionist,
  updateReceptionist,
  deleteReceptionist,
};
