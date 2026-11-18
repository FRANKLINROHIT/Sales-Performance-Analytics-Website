const { query, queryOne } = require('../config/db');

const getProducts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let whereConditions = [];
    let params = [];

    if (category) {
      whereConditions.push('p.category = ?');
      params.push(category);
    }

    if (search) {
      whereConditions.push('(p.product_name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        p.product_id,
        p.product_name,
        p.sku,
        p.category,
        p.price,
        p.cost,
        p.stock_quantity,
        COALESCE(SUM(s.quantity), 0) as units_sold,
        COALESCE(SUM(s.amount), 0) as total_revenue,
        COALESCE(SUM(s.profit), 0) as total_profit
      FROM Products p
      LEFT JOIN Sales s ON p.product_id = s.product_id AND s.status = 'Completed'
      ${whereClause}
      GROUP BY p.product_id, p.product_name, p.sku, p.category, p.price, p.cost, p.stock_quantity
      ORDER BY total_revenue DESC
    `;

    const products = await query(sql, params);

    const processed = products.map(prod => {
      const price = parseFloat(prod.price);
      const cost = parseFloat(prod.cost);
      const profitMarginPct = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
      return {
        ...prod,
        price,
        cost,
        profit_margin_pct: profitMarginPct,
        total_revenue: parseFloat(prod.total_revenue),
        total_profit: parseFloat(prod.total_profit)
      };
    });

    res.json({
      success: true,
      data: processed
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { product_name, sku, category, price, cost, stock_quantity = 100 } = req.body;

    if (!product_name || !sku || !category || price === undefined || cost === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required product parameters.' });
    }

    const numPrice = parseFloat(price);
    const numCost = parseFloat(cost);
    const numStock = parseInt(stock_quantity, 10);

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a non-negative number.' });
    }
    if (isNaN(numCost) || numCost < 0) {
      return res.status(400).json({ success: false, message: 'Cost must be a non-negative number.' });
    }
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });
    }

    const cleanName = String(product_name).trim();
    const cleanSku = String(sku).trim().toUpperCase();
    const cleanCategory = String(category).trim();

    if (cleanName.length < 2 || cleanName.length > 150) {
      return res.status(400).json({ success: false, message: 'Product name must be between 2 and 150 characters.' });
    }
    if (cleanSku.length < 2 || cleanSku.length > 50) {
      return res.status(400).json({ success: false, message: 'SKU must be between 2 and 50 characters.' });
    }

    const existingSku = await queryOne(`SELECT product_id FROM Products WHERE sku = ?`, [cleanSku]);
    if (existingSku) {
      return res.status(400).json({ success: false, message: 'A product with this SKU already exists.' });
    }

    const result = await query(
      `INSERT INTO Products (product_name, sku, category, price, cost, stock_quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cleanName, cleanSku, cleanCategory, numPrice, numCost, numStock]
    );

    res.status(201).json({
      success: true,
      message: 'Product catalog entry created successfully.',
      product_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product identifier.' });
    }

    const { product_name, sku, category, price, cost, stock_quantity } = req.body;

    const numPrice = parseFloat(price);
    const numCost = parseFloat(cost);
    const numStock = parseInt(stock_quantity, 10);

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a non-negative number.' });
    }
    if (isNaN(numCost) || numCost < 0) {
      return res.status(400).json({ success: false, message: 'Cost must be a non-negative number.' });
    }
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock quantity must be a non-negative integer.' });
    }

    await query(
      `UPDATE Products SET product_name = ?, sku = ?, category = ?, price = ?, cost = ?, stock_quantity = ? WHERE product_id = ?`,
      [String(product_name).trim(), String(sku).trim().toUpperCase(), String(category).trim(), numPrice, numCost, numStock, productId]
    );

    res.json({ success: true, message: 'Product details updated successfully.' });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product identifier.' });
    }

    // Check if product is referenced in existing sales
    const linkedSales = await queryOne(`SELECT COUNT(*) as count FROM Sales WHERE product_id = ?`, [productId]);
    if (linkedSales && linkedSales.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product: it is associated with existing completed sales records.'
      });
    }

    await query(`DELETE FROM Products WHERE product_id = ?`, [productId]);
    res.json({ success: true, message: 'Product removed from catalog.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
