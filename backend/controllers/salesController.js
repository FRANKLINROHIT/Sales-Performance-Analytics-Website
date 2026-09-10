const { query, queryOne } = require('../config/db');

const getSales = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      region_id,
      salesperson_id,
      product_id,
      customer_id,
      category,
      start_date,
      end_date,
      sort_by = 'sale_date',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push(`(sp.name LIKE ? OR c.name LIKE ? OR p.product_name LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (region_id) {
      whereConditions.push(`s.region_id = ?`);
      params.push(region_id);
    }

    if (salesperson_id) {
      whereConditions.push(`s.salesperson_id = ?`);
      params.push(salesperson_id);
    }

    if (req.user.role === 'Salesperson' && req.user.salesperson_id) {
      whereConditions.push(`s.salesperson_id = ?`);
      params.push(req.user.salesperson_id);
    }

    if (product_id) {
      whereConditions.push(`s.product_id = ?`);
      params.push(product_id);
    }

    if (customer_id) {
      whereConditions.push(`s.customer_id = ?`);
      params.push(customer_id);
    }

    if (category) {
      whereConditions.push(`p.category = ?`);
      params.push(category);
    }

    if (start_date && end_date) {
      whereConditions.push(`s.sale_date BETWEEN ? AND ?`);
      params.push(start_date, end_date);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total Count
    const countSql = `
      SELECT COUNT(*) as total
      FROM Sales s
      JOIN Salespersons sp ON s.salesperson_id = sp.salesperson_id
      JOIN Customers c ON s.customer_id = c.customer_id
      JOIN Products p ON s.product_id = p.product_id
      JOIN Regions r ON s.region_id = r.region_id
      ${whereClause}
    `;
    const countRow = await queryOne(countSql, params);
    const total = countRow ? countRow.total : 0;

    // Paginated list
    const validSortFields = ['sale_date', 'amount', 'profit', 'quantity', 'sale_id'];
    const sortField = validSortFields.includes(sort_by) ? `s.${sort_by}` : 's.sale_date';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const listSql = `
      SELECT 
        s.sale_id,
        s.salesperson_id,
        sp.name as salesperson_name,
        s.customer_id,
        c.name as customer_name,
        s.product_id,
        p.product_name,
        p.category as product_category,
        s.region_id,
        r.region_name,
        s.quantity,
        s.amount,
        s.profit,
        s.sale_date,
        s.status,
        s.payment_method
      FROM Sales s
      JOIN Salespersons sp ON s.salesperson_id = sp.salesperson_id
      JOIN Customers c ON s.customer_id = c.customer_id
      JOIN Products p ON s.product_id = p.product_id
      JOIN Regions r ON s.region_id = r.region_id
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const sales = await query(listSql, [...params, parseInt(limit), parseInt(offset)]);

    res.json({
      success: true,
      data: sales,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createSale = async (req, res, next) => {
  try {
    const { salesperson_id, customer_id, product_id, quantity, sale_date, payment_method } = req.body;

    if (!salesperson_id || !customer_id || !product_id || !quantity || !sale_date) {
      return res.status(400).json({ success: false, message: 'Missing required sale parameters.' });
    }

    const product = await queryOne(`SELECT * FROM Products WHERE product_id = ?`, [product_id]);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Selected product not found.' });
    }

    const salesperson = await queryOne(`SELECT * FROM Salespersons WHERE salesperson_id = ?`, [salesperson_id]);
    if (!salesperson) {
      return res.status(404).json({ success: false, message: 'Selected salesperson not found.' });
    }

    const amount = parseFloat((product.price * quantity).toFixed(2));
    const totalCost = parseFloat((product.cost * quantity).toFixed(2));
    const profit = parseFloat((amount - totalCost).toFixed(2));
    const region_id = salesperson.region_id;

    const result = await query(
      `INSERT INTO Sales (salesperson_id, customer_id, product_id, region_id, quantity, amount, profit, sale_date, status, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Completed', ?)`,
      [salesperson_id, customer_id, product_id, region_id, quantity, amount, profit, sale_date, payment_method || 'Credit Card']
    );

    const sale_id = result.insertId;

    // Auto calculate commission (5%)
    const commission_amount = parseFloat((amount * 0.05).toFixed(2));
    await query(
      `INSERT INTO Commissions (sale_id, salesperson_id, rate_percentage, commission_amount, status)
       VALUES (?, ?, 5.00, ?, 'Pending')`,
      [sale_id, salesperson_id, commission_amount]
    );

    res.status(201).json({
      success: true,
      message: 'Sale transaction registered successfully.',
      sale_id
    });
  } catch (error) {
    next(error);
  }
};

const deleteSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM Commissions WHERE sale_id = ?`, [id]);
    await query(`DELETE FROM Sales WHERE sale_id = ?`, [id]);
    res.json({ success: true, message: 'Sale record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSales,
  createSale,
  deleteSale
};
