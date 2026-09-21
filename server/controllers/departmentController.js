const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/auditService');

/**
 * Get all active departments
 * GET /api/departments
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate({
        path: 'headDoctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .sort({ name: 1 });

    // Attach doctor counts
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const doctorCount = await Doctor.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          doctorCount,
        };
      })
    );

    return successResponse(res, 'Departments fetched successfully.', departmentsWithCounts);
  } catch (error) {
    next(error);
  }
};

/**
 * Get department by ID
 * GET /api/departments/:id
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate({
      path: 'headDoctor',
      populate: { path: 'user', select: 'name email phone avatar' },
    });

    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    const doctors = await Doctor.find({ department: department._id }).populate(
      'user',
      'name email phone avatar'
    );

    return successResponse(res, 'Department details fetched.', {
      department,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new department (Admin only)
 * POST /api/departments
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, icon, headDoctor } = req.body;

    if (!name) {
      return next(new AppError('Department name is required.', 400));
    }

    const department = await Department.create({
      name,
      description: description || '',
      icon: icon || 'Activity',
      headDoctor: headDoctor || null,
    });

    logActivity({
      req,
      action: 'CREATE_DEPARTMENT',
      entityType: 'Department',
      entityId: department._id,
      details: `Department created: ${department.name}`,
    });

    return successResponse(res, 'Department created successfully.', department, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update department (Admin only)
 * PUT /api/departments/:id
 */
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    logActivity({
      req,
      action: 'UPDATE_DEPARTMENT',
      entityType: 'Department',
      entityId: department._id,
      details: `Department updated: ${department.name}`,
    });

    return successResponse(res, 'Department updated successfully.', department);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete department (Admin only)
 * DELETE /api/departments/:id
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return next(new AppError('Department not found', 404));
    }

    // Check if doctors are assigned
    const assignedDoctorsCount = await Doctor.countDocuments({ department: department._id });
    if (assignedDoctorsCount > 0) {
      // Soft-deactivate to preserve historical integrity
      department.isActive = false;
      await department.save();
      return successResponse(
        res,
        'Department has assigned doctors and was deactivated rather than permanently removed.'
      );
    }

    await Department.findByIdAndDelete(req.params.id);

    logActivity({
      req,
      action: 'DELETE_DEPARTMENT',
      entityType: 'Department',
      entityId: department._id,
      details: `Department removed: ${department.name}`,
    });

    return successResponse(res, 'Department removed successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
