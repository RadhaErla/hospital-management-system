const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateUser);

router.get('/', getMedicines);
router.get('/:id', getMedicineById);
router.post('/', authorizeRoles('admin'), createMedicine);
router.put('/:id', authorizeRoles('admin'), updateMedicine);
router.delete('/:id', authorizeRoles('admin'), deleteMedicine);

module.exports = router;
