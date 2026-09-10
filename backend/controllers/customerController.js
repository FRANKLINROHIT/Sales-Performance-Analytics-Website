const { query, queryOne } = require('../config/db');

const getCustomers = async (req, res, next) => {
  try {
    const { search, region_id } = req.query;
    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('(c.name LIKE ? OR c.company LIKE ? OR c.email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (region_id) {
      whereConditions.push('c.region_id = ?');
      params.push(region_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        c.customer_id,
        c.name,
        c.email,
        c.phone,
        c.company,
        c.location,
        r.region_name,
        COALESCE(COUNT(s.sale_id), 0) as total_orders,
        COALESCE(SUM(s.amount), 0) as lifetime_value,
        MAX(s.sale_date) as last_purchase_date
      FROM Customers c
      LEFT JOIN Regions r ON c.region_id = r.region_id
      LEFT JOIN Sales s ON c.customer_id = s.customer_id AND s.status = 'Completed'
      ${whereClause}
      GROUP BY c.customer_id, c.name, c.email, c.phone, c.company, c.location, r.region_name
      ORDER BY lifetime_value DESC
    `;

    const customers = await query(sql, params);

    const processed = customers.map(cust => {
      const ltv = parseFloat(cust.lifetime_value) || 0;
      let rfmSegment = 'Standard Customer';
      if (ltv > 50000) rfmSegment = 'VIP Champions';
      else if (ltv > 25000) rfmSegment = 'High Value Loyalist';
      else if (cust.total_orders > 1) rfmSegment = 'Potential Loyalist';

      return {
        ...cust,
        lifetime_value: ltv,
        rfm_segment: rfmSegment
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

const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, location, region_id } = req.body;

    if (!name || !company) {
      return res.status(400).json({ success: false, message: 'Customer name and company are required.' });
    }

    const result = await query(
      `INSERT INTO Customers (name, email, phone, company, location, region_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, company, location, region_id || 1]
    );

    res.status(201).json({
      success: true,
      message: 'Customer record created successfully.',
      customer_id: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  createCustomer
};
