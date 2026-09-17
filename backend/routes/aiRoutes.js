const express = require('express');
const router = express.Router();
const { getForecastInsights, chatWithForecast } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/forecast-insights', authMiddleware, getForecastInsights);
router.post('/chat', authMiddleware, chatWithForecast);

module.exports = router;
