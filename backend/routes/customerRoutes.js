const express = require('express');
const router = express.Router();
const { getCustomers, createCustomer } = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.get('/', authMiddleware, getCustomers);
router.post('/', authMiddleware, auditMiddleware('CREATE_CUSTOMER', 'Customers'), createCustomer);

module.exports = router;
