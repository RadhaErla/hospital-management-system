const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorSlots,
} = require('../controllers/doctorController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getDoctorSlots);

router.post('/', authenticateUser, authorizeRoles('admin'), createDoctor);
router.put('/:id', authenticateUser, authorizeRoles('admin', 'doctor'), updateDoctor);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteDoctor);

module.exports = router;
