const express = require('express');
const router = express.Router();
const { getReportData } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getReportData);

module.exports = router;
