const express = require('express');
const router = express.Router();
const {
  getRecordsByPatient,
  createRecord,
  updateRecord,
} = require('../controllers/medicalRecordController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/:patientId', getRecordsByPatient);
router.post('/', authorizeRoles('doctor', 'admin'), createRecord);
router.put('/:id', authorizeRoles('doctor', 'admin'), updateRecord);

module.exports = router;
