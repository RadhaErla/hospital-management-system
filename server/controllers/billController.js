const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const paymentService = require('../services/paymentService');
const { createAndSendNotification } = require('../services/socketService');
const { sendPaymentEmail } = require('../services/emailService');
const { logActivity } = require('../services/auditService');

/**
 * Get Bills with filters & pagination
 * GET /api/bills
 */
const getBills = async (req, res, next) => {
  try {
    const { patientId, paymentStatus, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) return successResponse(res, 'No bills.', { items: [], total: 0, page: 1, limit });
      query.patient = patient._id;
    } else if (patientId) {
      query.patient = patientId;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Bill.countDocuments(query);

    const bills = await Bill.find(query)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate({
        path: 'appointment',
        populate: { path: 'doctor', populate: { path: 'user', select: 'name' } },
      })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return paginatedResponse(res, 'Bills fetched successfully.', {
      items: bills,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Bill by ID (printable invoice)
 * GET /api/bills/:id
 */
const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone address' },
      })
      .populate({
        path: 'appointment',
        populate: [
          { path: 'doctor', populate: [{ path: 'user', select: 'name email phone' }, { path: 'department', select: 'name' }] },
          { path: 'department', select: 'name' },
        ],
      });

    if (!bill) {
      return next(new AppError('Bill not found.', 404));
    }

    // Access control: Patient can only view their own bills
    if (
      req.user.role === 'patient' &&
      bill.patient.user._id.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Unauthorized access to invoice.', 403));
    }

    return successResponse(res, 'Invoice fetched successfully.', bill);
  } catch (error) {
    next(error);
  }
};

/**
 * Create Bill (Receptionist or Admin)
 * POST /api/bills
 */
const createBill = async (req, res, next) => {
  try {
    const {
      patientId,
      appointmentId,
      doctorFee = 0,
      labCharges = 0,
      medicineCharges = 0,
      otherCharges = 0,
      items = [],
      discount = 0,
      tax = 0,
      notes,
    } = req.body;

    if (!patientId) {
      return next(new AppError('Patient reference is required.', 400));
    }

    const patient = await Patient.findById(patientId).populate('user');
    if (!patient) {
      return next(new AppError('Patient not found.', 404));
    }

    // Calculate subtotal and total
    const itemsTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const subtotal =
      Number(doctorFee) + Number(labCharges) + Number(medicineCharges) + Number(otherCharges) + itemsTotal;
    const totalAmount = Math.max(0, subtotal - Number(discount) + Number(tax));

    // Generate unique invoice number
    const count = await Bill.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${1000 + count + 1}`;

    const bill = await Bill.create({
      invoiceNumber,
      patient: patientId,
      appointment: appointmentId || null,
      doctorFee,
      labCharges,
      medicineCharges,
      otherCharges,
      items,
      discount,
      tax,
      totalAmount,
      paymentStatus: 'Pending',
      notes: notes || '',
    });

    const populated = await Bill.findById(bill._id).populate({
      path: 'patient',
      populate: { path: 'user', select: 'name email phone' },
    });

    // Notify patient
    if (patient.user?._id) {
      await createAndSendNotification({
        recipientId: patient.user._id,
        title: 'New Bill Generated',
        message: `Invoice ${invoiceNumber} for $${totalAmount} has been generated.`,
        type: 'bill',
        link: '/patient/bills',
      });
    }

    logActivity({
      req,
      action: 'CREATE_BILL',
      entityType: 'Bill',
      entityId: bill._id,
      details: `Generated bill ${invoiceNumber} for $${totalAmount}`,
    });

    return successResponse(res, 'Bill generated successfully.', populated, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Payment Status / Process Payment
 * PUT /api/bills/:id/payment
 */
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod = 'Cash', paymentDetails = {} } = req.body;

    if (!paymentStatus) {
      return next(new AppError('Payment status is required.', 400));
    }

    const bill = await Bill.findById(req.params.id).populate({
      path: 'patient',
      populate: { path: 'user', select: 'name email' },
    });

    if (!bill) {
      return next(new AppError('Bill not found.', 404));
    }

    // Process payment through payment service if paying
    let transactionId = `MANUAL-${Date.now()}`;
    if (paymentStatus === 'Paid') {
      const processResult = await paymentService.verifyAndProcessPayment({
        billId: bill._id,
        amount: bill.totalAmount,
        paymentMethod,
        paymentDetails,
      });
      transactionId = processResult.transactionId;
      bill.paidAt = new Date();

      // Record in Payment collection
      await Payment.create({
        bill: bill._id,
        transactionId,
        amount: bill.totalAmount,
        paymentMethod,
        status: 'Success',
        gatewayResponse: processResult,
      });
    }

    bill.paymentStatus = paymentStatus;
    bill.paymentMethod = paymentMethod;
    await bill.save();

    // Send notifications if paid
    if (paymentStatus === 'Paid' && bill.patient?.user?._id) {
      await createAndSendNotification({
        recipientId: bill.patient.user._id,
        title: 'Payment Successful',
        message: `Payment of $${bill.totalAmount} for invoice ${bill.invoiceNumber} received via ${paymentMethod}.`,
        type: 'payment',
        link: '/patient/bills',
      });

      sendPaymentEmail({
        patientEmail: bill.patient.user.email,
        patientName: bill.patient.user.name,
        invoiceNumber: bill.invoiceNumber,
        amount: bill.totalAmount,
        paymentMethod,
      }).catch((e) => console.error('Payment email error:', e.message));
    }

    logActivity({
      req,
      action: 'UPDATE_BILL_PAYMENT',
      entityType: 'Bill',
      entityId: bill._id,
      details: `Bill ${bill.invoiceNumber} payment status updated to ${paymentStatus} via ${paymentMethod}`,
    });

    return successResponse(res, `Payment status updated to ${paymentStatus}.`, bill);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBills,
  getBillById,
  createBill,
  updatePaymentStatus,
};
