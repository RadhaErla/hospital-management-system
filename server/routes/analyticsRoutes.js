const express = require('express');
const router = express.Router();
const {
  getAdminDashboardStats,
  getDoctorDashboardStats,
  getReceptionistDashboardStats,
  getPatientDashboardStats,
} = require('../controllers/analyticsController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/admin', authorizeRoles('admin'), getAdminDashboardStats);
router.get('/doctor', authorizeRoles('doctor'), getDoctorDashboardStats);
router.get('/receptionist', authorizeRoles('receptionist'), getReceptionistDashboardStats);
router.get('/patient', authorizeRoles('patient'), getPatientDashboardStats);

module.exports = router;
