const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUserRole, deleteUser, getRegions } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.get('/users', authMiddleware, roleMiddleware(['Admin']), getUsers);
router.post('/users', authMiddleware, roleMiddleware(['Admin']), auditMiddleware('CREATE_USER', 'Users'), createUser);
router.put('/users/:id/role', authMiddleware, roleMiddleware(['Admin']), auditMiddleware('UPDATE_USER_ROLE', 'Users'), updateUserRole);
router.delete('/users/:id', authMiddleware, roleMiddleware(['Admin']), auditMiddleware('DELETE_USER', 'Users'), deleteUser);
router.get('/regions', authMiddleware, getRegions);

module.exports = router;
