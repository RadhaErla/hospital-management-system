const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/auditLogController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateUser, authorizeRoles('admin'));

router.get('/', getActivityLogs);

module.exports = router;
