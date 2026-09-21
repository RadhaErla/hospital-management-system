const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const Department = require('../models/Department');
const Prescription = require('../models/Prescription');
const MedicalRecord = require('../models/MedicalRecord');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get Admin Dashboard Analytics & Chart Data
 * GET /api/analytics/admin
 */
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    // Counts
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      bills,
      departments,
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: 'Pending' }),
      Appointment.countDocuments({ status: 'Cancelled' }),
      Bill.find({ paymentStatus: 'Paid' }).select('totalAmount createdAt'),
      Department.find().select('name _id'),
    ]);

    // Total revenue
    const totalRevenue = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Revenue by Month (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueByMonth = {};
    const appointmentsByMonth = {};

    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      revenueByMonth[key] = 0;
      appointmentsByMonth[key] = 0;
    }

    // Populate revenue by month
    bills.forEach((b) => {
      const d = new Date(b.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (revenueByMonth[key] !== undefined) {
        revenueByMonth[key] += b.totalAmount || 0;
      }
    });

    const revenueChart = Object.keys(revenueByMonth).map((month) => ({
      month,
      revenue: Math.round(revenueByMonth[month]),
    }));

    // Populate appointments by month
    const allAppointments = await Appointment.find().select('date createdAt');
    allAppointments.forEach((a) => {
      const d = a.date ? new Date(a.date) : new Date(a.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (appointmentsByMonth[key] !== undefined) {
        appointmentsByMonth[key] += 1;
      }
    });

    const appointmentsChart = Object.keys(appointmentsByMonth).map((month) => ({
      month,
      appointments: appointmentsByMonth[month],
    }));

    // Patients by Department
    const patientsByDepartment = await Promise.all(
      departments.map(async (dept) => {
        const count = await Appointment.countDocuments({ department: dept._id });
        return {
          name: dept.name,
          count,
        };
      })
    );

    // Appointment Status Distribution
    const statusDistribution = [
      { name: 'Completed', value: completedAppointments, color: '#10b981' },
      { name: 'Pending', value: pendingAppointments, color: '#f59e0b' },
      { name: 'Confirmed', value: await Appointment.countDocuments({ status: 'Confirmed' }), color: '#0d9488' },
      { name: 'Checked-In', value: await Appointment.countDocuments({ status: 'Checked-In' }), color: '#3b82f6' },
      { name: 'Cancelled', value: cancelledAppointments, color: '#ef4444' },
      { name: 'Rejected', value: await Appointment.countDocuments({ status: 'Rejected' }), color: '#64748b' },
    ];

    return successResponse(res, 'Admin analytics fetched successfully.', {
      counts: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        cancelledAppointments,
        totalRevenue,
      },
      charts: {
        revenueByMonth: revenueChart,
        appointmentsByMonth: appointmentsChart,
        patientsByDepartment: patientsByDepartment.filter((d) => d.count > 0 || departments.length < 6),
        statusDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Doctor Dashboard Stats
 * GET /api/analytics/doctor
 */
const getDoctorDashboardStats = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return successResponse(res, 'Doctor stats.', {
        todayAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        totalPatients: 0,
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const [
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      pendingAppointments,
      distinctPatients,
    ] = await Promise.all([
      Appointment.countDocuments({ doctor: doctor._id, date: todayStr }),
      Appointment.countDocuments({ doctor: doctor._id, date: { $gte: todayStr }, status: { $in: ['Pending', 'Confirmed'] } }),
      Appointment.countDocuments({ doctor: doctor._id, status: 'Completed' }),
      Appointment.countDocuments({ doctor: doctor._id, status: 'Pending' }),
      Appointment.distinct('patient', { doctor: doctor._id }),
    ]);

    return successResponse(res, 'Doctor dashboard stats fetched.', {
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      pendingAppointments,
      totalPatients: distinctPatients.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Receptionist Dashboard Stats
 * GET /api/analytics/receptionist
 */
const getReceptionistDashboardStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [todayAppointments, checkedInPatients, pendingAppointments, pendingPaymentsCount] =
      await Promise.all([
        Appointment.countDocuments({ date: todayStr }),
        Appointment.countDocuments({ date: todayStr, status: 'Checked-In' }),
        Appointment.countDocuments({ status: 'Pending' }),
        Bill.countDocuments({ paymentStatus: 'Pending' }),
      ]);

    return successResponse(res, 'Receptionist dashboard stats fetched.', {
      todayAppointments,
      checkedInPatients,
      pendingAppointments,
      pendingPayments: pendingPaymentsCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Patient Dashboard Stats
 * GET /api/analytics/patient
 */
const getPatientDashboardStats = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return successResponse(res, 'Patient stats.', {
        totalAppointments: 0,
        pendingAppointments: 0,
        outstandingBills: 0,
        nextAppointment: null,
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const [
      totalAppointments,
      pendingAppointments,
      outstandingBills,
      nextAppointment,
      recentPrescriptions,
      recentRecords,
    ] = await Promise.all([
      Appointment.countDocuments({ patient: patient._id }),
      Appointment.countDocuments({ patient: patient._id, status: 'Pending' }),
      Bill.find({ patient: patient._id, paymentStatus: 'Pending' }),
      Appointment.findOne({
        patient: patient._id,
        date: { $gte: todayStr },
        status: { $in: ['Pending', 'Confirmed', 'Checked-In'] },
      })
        .populate({ path: 'doctor', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name' }] })
        .sort({ date: 1, 'timeSlot.startTime': 1 }),
      Prescription.find({ patient: patient._id })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
        .sort({ date: -1 })
        .limit(3),
      MedicalRecord.find({ patient: patient._id })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
        .sort({ date: -1 })
        .limit(3),
    ]);

    const outstandingBalance = outstandingBills.reduce((sum, b) => sum + b.totalAmount, 0);

    return successResponse(res, 'Patient dashboard stats fetched.', {
      totalAppointments,
      pendingAppointments,
      outstandingBillsCount: outstandingBills.length,
      outstandingBalance,
      nextAppointment,
      recentPrescriptions,
      recentRecords,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getDoctorDashboardStats,
  getReceptionistDashboardStats,
  getPatientDashboardStats,
};
