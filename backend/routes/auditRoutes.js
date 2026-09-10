const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware(['Admin', 'Manager']), getAuditLogs);

module.exports = router;
