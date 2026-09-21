const express = require('express');
const router = express.Router();
const {
  getBills,
  getBillById,
  createBill,
  updatePaymentStatus,
} = require('../controllers/billController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', getBills);
router.get('/:id', getBillById);
router.post('/', authorizeRoles('receptionist', 'admin'), createBill);
router.put('/:id/payment', updatePaymentStatus);

module.exports = router;
