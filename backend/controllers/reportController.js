const { query } = require('../config/db');

const getReportData = async (req, res, next) => {
  try {
    const { report_type = 'sales', start_date, end_date } = req.query;

    let data = [];
    if (report_type === 'sales') {
      data = await query(`
        SELECT s.sale_id, s.sale_date, sp.name as salesperson, c.name as customer, p.product_name as product, p.category, r.region_name as region, s.quantity, s.amount, s.profit
        FROM Sales s
        JOIN Salespersons sp ON s.salesperson_id = sp.salesperson_id
        JOIN Customers c ON s.customer_id = c.customer_id
        JOIN Products p ON s.product_id = p.product_id
        JOIN Regions r ON s.region_id = r.region_id
        ORDER BY s.sale_date DESC
      `);
    } else if (report_type === 'employees') {
      data = await query(`
        SELECT sp.name as salesperson, sp.email, r.region_name as region, sp.hire_date, COUNT(s.sale_id) as total_orders, COALESCE(SUM(s.amount), 0) as total_revenue, COALESCE(SUM(s.profit), 0) as total_profit
        FROM Salespersons sp
        LEFT JOIN Regions r ON sp.region_id = r.region_id
        LEFT JOIN Sales s ON sp.salesperson_id = s.salesperson_id
        GROUP BY sp.salesperson_id, sp.name, sp.email, r.region_name, sp.hire_date
        ORDER BY total_revenue DESC
      `);
    } else if (report_type === 'products') {
      data = await query(`
        SELECT p.product_name, p.sku, p.category, p.price, p.cost, COALESCE(SUM(s.quantity), 0) as units_sold, COALESCE(SUM(s.amount), 0) as total_revenue
        FROM Products p
        LEFT JOIN Sales s ON p.product_id = s.product_id
        GROUP BY p.product_id, p.product_name, p.sku, p.category, p.price, p.cost
        ORDER BY total_revenue DESC
      `);
    } else if (report_type === 'customers') {
      data = await query(`
        SELECT c.name as customer_name, c.company, c.email, c.location, r.region_name as region, COUNT(s.sale_id) as total_orders, COALESCE(SUM(s.amount), 0) as lifetime_revenue
        FROM Customers c
        LEFT JOIN Regions r ON c.region_id = r.region_id
        LEFT JOIN Sales s ON c.customer_id = s.customer_id
        GROUP BY c.customer_id, c.name, c.company, c.email, c.location, r.region_name
        ORDER BY lifetime_revenue DESC
      `);
    }

    res.json({
      success: true,
      report_type,
      generated_at: new Date().toISOString(),
      record_count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportData
};
