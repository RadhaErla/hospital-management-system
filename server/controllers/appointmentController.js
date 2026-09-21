const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Department = require('../models/Department');
const AppError = require('../utils/AppError');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const { createAndSendNotification } = require('../services/socketService');
const { sendAppointmentEmail } = require('../services/emailService');
const { logActivity } = require('../services/auditService');

/**
 * Book Appointment
 * POST /api/appointments
 */
const bookAppointment = async (req, res, next) => {
  try {
    let { patientId, doctorId, departmentId, date, timeSlot, reason, notes } = req.body;

    // If logged in as patient, default patientId to own patient profile
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) {
        return next(new AppError('Patient profile not found for this account.', 404));
      }
      patientId = patient._id;
    }

    if (!patientId || !doctorId || !date || !timeSlot || !timeSlot.startTime || !timeSlot.endTime || !reason) {
      return next(
        new AppError('Please provide patient, doctor, date, timeSlot (startTime & endTime), and reason.', 400)
      );
    }

    // Check doctor exists
    const doctor = await Doctor.findById(doctorId).populate('user department');
    if (!doctor) {
      return next(new AppError('Selected doctor does not exist.', 404));
    }

    // Check patient exists
    const patient = await Patient.findById(patientId).populate('user');
    if (!patient) {
      return next(new AppError('Selected patient does not exist.', 404));
    }

    // Default department if not passed explicitly
    if (!departmentId) {
      departmentId = doctor.department?._id || doctor.department;
    }

    // Validate appointment date is not in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return next(new AppError('Cannot book an appointment for a past date.', 400));
    }

    // PREVENT DOUBLE BOOKING: Check if doctor already has an active appointment at this slot
    const existingConflict = await Appointment.findOne({
      doctor: doctorId,
      date,
      'timeSlot.startTime': timeSlot.startTime,
      status: { $nin: ['Cancelled', 'Rejected'] },
    });

    if (existingConflict) {
      return next(
        new AppError('This time slot has already been booked with Dr. ' + doctor.user.name + '. Please select another slot.', 400)
      );
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      department: departmentId,
      date,
      timeSlot,
      reason,
      notes: notes || '',
      status: 'Pending',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({ path: 'doctor', populate: [{ path: 'user', select: 'name email phone avatar' }, { path: 'department', select: 'name' }] })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate('department', 'name');

    // Notify doctor
    if (doctor.user?._id) {
      await createAndSendNotification({
        recipientId: doctor.user._id,
        title: 'New Appointment Booked',
        message: `${patient.user.name} booked an appointment for ${date} at ${timeSlot.startTime}.`,
        type: 'appointment',
        link: '/doctor/appointments',
      });
    }

    // Notify reception staff
    await createAndSendNotification({
      targetRole: 'receptionist',
      title: 'New Appointment Booked',
      message: `New booking for Dr. ${doctor.user.name} on ${date} (${timeSlot.startTime}).`,
      type: 'appointment',
      link: '/receptionist/appointments',
    });

    // Send email to patient
    sendAppointmentEmail({
      patientEmail: patient.user.email,
      patientName: patient.user.name,
      doctorName: doctor.user.name,
      date,
      time: `${timeSlot.startTime} - ${timeSlot.endTime}`,
      status: 'Pending Confirmation',
    }).catch((e) => console.error('Email error:', e.message));

    logActivity({
      req,
      action: 'BOOK_APPOINTMENT',
      entityType: 'Appointment',
      entityId: appointment._id,
      details: `Appointment booked with Dr. ${doctor.user.name} for ${date} ${timeSlot.startTime}`,
    });

    return successResponse(res, 'Appointment booked successfully.', populatedAppointment, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all appointments with filtering and pagination
 * GET /api/appointments
 */
const getAppointments = async (req, res, next) => {
  try {
    const {
      doctorId,
      patientId,
      departmentId,
      status,
      date,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Role-based restrictions
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) return successResponse(res, 'No appointments.', { items: [], total: 0, page: 1, limit });
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) return successResponse(res, 'No appointments.', { items: [], total: 0, page: 1, limit });
      query.doctor = doctor._id;
    } else {
      // Admin / Receptionist can filter by specific doctor or patient
      if (doctorId) query.doctor = doctorId;
      if (patientId) query.patient = patientId;
    }

    if (departmentId) query.department = departmentId;
    if (status) query.status = status;
    if (date) query.date = date;

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(query);

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctor',
        populate: [{ path: 'user', select: 'name email phone avatar' }, { path: 'department', select: 'name' }],
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('department', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ date: -1, 'timeSlot.startTime': -1 });

    return paginatedResponse(res, 'Appointments retrieved successfully.', {
      items: appointments,
      total,
      page,
      limit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        populate: [{ path: 'user', select: 'name email phone avatar' }, { path: 'department', select: 'name' }],
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('department', 'name');

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    return successResponse(res, 'Appointment fetched.', appointment);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Appointment Status (Doctor, Receptionist, Admin, or Patient for cancelling)
 * PUT /api/appointments/:id/status
 */
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes, cancellationReason } = req.body;

    if (!status) {
      return next(new AppError('Status is required.', 400));
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } });

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Role-based status authorization:
    // Patient can only cancel their own pending/confirmed appointment
    if (req.user.role === 'patient') {
      if (status !== 'Cancelled') {
        return next(new AppError('Patients are only permitted to cancel appointments.', 403));
      }
      if (appointment.patient.user._id.toString() !== req.user._id.toString()) {
        return next(new AppError('Unauthorized to alter this appointment.', 403));
      }
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;

    await appointment.save();

    // Send notifications to patient
    if (appointment.patient?.user?._id) {
      await createAndSendNotification({
        recipientId: appointment.patient.user._id,
        title: `Appointment ${status}`,
        message: `Your appointment with Dr. ${appointment.doctor.user.name} on ${appointment.date} is now ${status}.`,
        type: 'appointment',
        link: '/patient/appointments',
      });

      sendAppointmentEmail({
        patientEmail: appointment.patient.user.email,
        patientName: appointment.patient.user.name,
        doctorName: appointment.doctor.user.name,
        date: appointment.date,
        time: `${appointment.timeSlot.startTime} - ${appointment.timeSlot.endTime}`,
        status,
      }).catch((e) => console.error('Email error:', e.message));
    }

    logActivity({
      req,
      action: 'UPDATE_APPOINTMENT_STATUS',
      entityType: 'Appointment',
      entityId: appointment._id,
      details: `Appointment status updated to ${status}`,
    });

    return successResponse(res, `Appointment status updated to ${status}.`, appointment);
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule Appointment
 * PUT /api/appointments/:id/reschedule
 */
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, timeSlot } = req.body;

    if (!date || !timeSlot || !timeSlot.startTime || !timeSlot.endTime) {
      return next(new AppError('Please provide new date and timeSlot.', 400));
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    // Check double booking for new slot
    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      date,
      'timeSlot.startTime': timeSlot.startTime,
      status: { $nin: ['Cancelled', 'Rejected'] },
    });

    if (conflict) {
      return next(new AppError('The requested time slot is already booked. Please choose another.', 400));
    }

    appointment.date = date;
    appointment.timeSlot = timeSlot;
    appointment.status = 'Confirmed';
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } });

    // Notify patient
    if (populatedAppointment.patient?.user?._id) {
      await createAndSendNotification({
        recipientId: populatedAppointment.patient.user._id,
        title: 'Appointment Rescheduled',
        message: `Your appointment with Dr. ${populatedAppointment.doctor.user.name} has been moved to ${date} at ${timeSlot.startTime}.`,
        type: 'appointment',
        link: '/patient/appointments',
      });
    }

    logActivity({
      req,
      action: 'RESCHEDULE_APPOINTMENT',
      entityType: 'Appointment',
      entityId: appointment._id,
      details: `Appointment rescheduled to ${date} ${timeSlot.startTime}`,
    });

    return successResponse(res, 'Appointment rescheduled successfully.', populatedAppointment);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Appointment
 * DELETE /api/appointments/:id
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } });

    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }

    appointment.status = 'Cancelled';
    appointment.cancellationReason = reason || 'Cancelled by user or staff';
    await appointment.save();

    logActivity({
      req,
      action: 'CANCEL_APPOINTMENT',
      entityType: 'Appointment',
      entityId: appointment._id,
      details: `Appointment cancelled: ${appointment.cancellationReason}`,
    });

    return successResponse(res, 'Appointment cancelled successfully.', appointment);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment,
};
