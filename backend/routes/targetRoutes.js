const express = require('express');
const router = express.Router();
const { getTargets, createOrUpdateTarget } = require('../controllers/targetController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.get('/', authMiddleware, getTargets);
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Manager']), auditMiddleware('UPDATE_TARGET', 'Targets'), createOrUpdateTarget);

module.exports = router;
