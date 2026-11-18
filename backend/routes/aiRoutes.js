const express = require('express');
const router = express.Router();
const { getForecastInsights, chatWithForecast } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/forecast-insights', authMiddleware, aiLimiter, getForecastInsights);
router.post('/chat', authMiddleware, aiLimiter, chatWithForecast);

module.exports = router;
