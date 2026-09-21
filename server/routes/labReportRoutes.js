const express = require('express');
const router = express.Router();
const {
  uploadReport,
  getReportsByPatient,
  deleteReport,
} = require('../controllers/labReportController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticateUser);

router.post(
  '/',
  authorizeRoles('doctor', 'receptionist', 'admin'),
  upload.single('file'),
  uploadReport
);
router.get('/:patientId', getReportsByPatient);
router.delete('/:id', authorizeRoles('doctor', 'receptionist', 'admin'), deleteReport);

module.exports = router;
