const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById } = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getEmployees);
router.get('/:id', authMiddleware, getEmployeeById);

module.exports = router;
