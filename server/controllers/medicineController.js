const Medicine = require('../models/Medicine');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const { logActivity } = require('../services/auditService');

/**
 * Get Medicines with search, filter, and pagination
 * GET /api/medicines
 */
const getMedicines = async (req, res, next) => {
  try {
    const { search, category, dosageForm, page = 1, limit = 10 } = req.query;

    const query = {};

    if (category) query.category = category;
    if (dosageForm) query.dosageForm = dosageForm;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Medicine.countDocuments(query);

    const medicines = await Medicine.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ name: 1 });

    return paginatedResponse(res, 'Medicines fetched successfully.', {
      items: medicines,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Medicine by ID
 * GET /api/medicines/:id
 */
const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    return successResponse(res, 'Medicine fetched.', medicine);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Medicine (Admin only)
 * POST /api/medicines
 */
const createMedicine = async (req, res, next) => {
  try {
    const {
      name,
      genericName,
      category,
      dosageForm,
      strength,
      manufacturer,
      stockQuantity,
      unitPrice,
      expiryDate,
    } = req.body;

    if (!name || stockQuantity === undefined || unitPrice === undefined) {
      return next(new AppError('Please provide name, stock quantity, and unit price.', 400));
    }

    const medicine = await Medicine.create({
      name,
      genericName: genericName || '',
      category: category || 'Other',
      dosageForm: dosageForm || 'Tablet',
      strength: strength || '',
      manufacturer: manufacturer || '',
      stockQuantity,
      unitPrice,
      expiryDate: expiryDate || null,
    });

    logActivity({
      req,
      action: 'CREATE_MEDICINE',
      entityType: 'Medicine',
      entityId: medicine._id,
      details: `Added medicine: ${name} (Stock: ${stockQuantity})`,
    });

    return successResponse(res, 'Medicine created successfully.', medicine, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Medicine (Admin only)
 * PUT /api/medicines/:id
 */
const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    logActivity({
      req,
      action: 'UPDATE_MEDICINE',
      entityType: 'Medicine',
      entityId: medicine._id,
      details: `Updated medicine: ${medicine.name}`,
    });

    return successResponse(res, 'Medicine updated successfully.', medicine);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Medicine (Admin only)
 * DELETE /api/medicines/:id
 */
const deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return next(new AppError('Medicine not found', 404));
    }

    logActivity({
      req,
      action: 'DELETE_MEDICINE',
      entityType: 'Medicine',
      entityId: medicine._id,
      details: `Deleted medicine: ${medicine.name}`,
    });

    return successResponse(res, 'Medicine deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};
