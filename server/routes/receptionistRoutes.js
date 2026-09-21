const express = require('express');
const router = express.Router();
const {
  getReceptionists,
  createReceptionist,
  updateReceptionist,
  deleteReceptionist,
} = require('../controllers/receptionistController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateUser, authorizeRoles('admin'));

router.get('/', getReceptionists);
router.post('/', createReceptionist);
router.put('/:id', updateReceptionist);
router.delete('/:id', deleteReceptionist);

module.exports = router;
