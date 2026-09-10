const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const auditMiddleware = require('../middleware/auditMiddleware');

router.get('/', authMiddleware, getProducts);
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Manager']), auditMiddleware('CREATE_PRODUCT', 'Products'), createProduct);
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Manager']), auditMiddleware('UPDATE_PRODUCT', 'Products'), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), auditMiddleware('DELETE_PRODUCT', 'Products'), deleteProduct);

module.exports = router;
