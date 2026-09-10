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
    const { product_name, sku, category, price, cost, stock_quantity } = req.body;

    if (!product_name || !sku || !category || price === undefined || cost === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required product parameters.' });
    }

    const result = await query(
      `INSERT INTO Products (product_name, sku, category, price, cost, stock_quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [product_name, sku, category, price, cost, stock_quantity || 100]
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
    const { product_name, sku, category, price, cost, stock_quantity } = req.body;

    await query(
      `UPDATE Products SET product_name = ?, sku = ?, category = ?, price = ?, cost = ?, stock_quantity = ? WHERE product_id = ?`,
      [product_name, sku, category, price, cost, stock_quantity, id]
    );

    res.json({ success: true, message: 'Product details updated successfully.' });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM Products WHERE product_id = ?`, [id]);
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
