const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment,
} = require('../controllers/appointmentController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.post('/', bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/status', updateAppointmentStatus);
router.put('/:id/reschedule', rescheduleAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;
