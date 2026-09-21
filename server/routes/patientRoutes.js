const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientHistory,
} = require('../controllers/patientController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin', 'doctor', 'receptionist'), getPatients);
router.get('/:id', getPatientById);
router.get('/:id/history', getPatientHistory);

router.post('/', authorizeRoles('admin', 'receptionist'), createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', authorizeRoles('admin'), deletePatient);

module.exports = router;
