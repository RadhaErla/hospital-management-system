const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

router.post('/', authenticateUser, authorizeRoles('admin'), createDepartment);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateDepartment);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteDepartment);

module.exports = router;
