const express = require('express');
const router = express.Router();
const { getSales, createSale, deleteSale } = require('../controllers/salesController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.get('/', authMiddleware, getSales);
router.post('/', authMiddleware, auditMiddleware('CREATE_SALE', 'Sales'), createSale);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin', 'Manager']), auditMiddleware('DELETE_SALE', 'Sales'), deleteSale);

module.exports = router;
