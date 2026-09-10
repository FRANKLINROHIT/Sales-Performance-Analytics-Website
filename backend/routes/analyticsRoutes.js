const express = require('express');
const router = express.Router();
const { getAdvancedAnalytics, simulateWhatIf } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/advanced', authMiddleware, getAdvancedAnalytics);
router.post('/what-if', authMiddleware, simulateWhatIf);

module.exports = router;
