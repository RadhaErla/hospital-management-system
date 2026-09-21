const express = require('express');
const router = express.Router();
const {
  getPrescriptionsByPatient,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
} = require('../controllers/prescriptionController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/single/:id', getPrescriptionById);
router.get('/:patientId', getPrescriptionsByPatient);
router.post('/', authorizeRoles('doctor', 'admin'), createPrescription);
router.put('/:id', authorizeRoles('doctor', 'admin'), updatePrescription);

module.exports = router;
