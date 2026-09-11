const { query } = require('./config/db');

const showData = async () => {
  try {
    console.log('\n============================= USERS =============================');
    const users = await query('SELECT user_id, name, email, role, created_at FROM Users');
    console.table(users);

    console.log('\n============================= PRODUCTS =============================');
    const products = await query('SELECT product_id, product_name, category, price, cost, stock_quantity FROM Products');
    console.table(products);

    console.log('\n============================= CUSTOMERS =============================');
    const customers = await query('SELECT customer_id, name, email, company, location FROM Customers');
    console.table(customers);

    console.log('\n============================= RECENT SALES (Top 10) =============================');
    const sales = await query(`
      SELECT 
        s.sale_id,
        sp.name AS salesperson,
        c.company AS customer,
        p.product_name,
        s.quantity,
        s.amount,
        s.profit,
        s.sale_date,
        s.status
      FROM Sales s
      LEFT JOIN Salespersons sp ON s.salesperson_id = sp.salesperson_id
      LEFT JOIN Customers c ON s.customer_id = c.customer_id
      LEFT JOIN Products p ON s.product_id = p.product_id
      ORDER BY s.sale_date DESC
      LIMIT 10
    `);
    console.table(sales);

    console.log('\n============================= TARGETS =============================');
    const targets = await query(`
      SELECT 
        t.target_id,
        sp.name AS salesperson,
        t.target_amount,
        t.achieved_amount,
        t.period,
        t.year,
        t.month
      FROM Targets t
      LEFT JOIN Salespersons sp ON t.salesperson_id = sp.salesperson_id
    `);
    console.table(targets);

    process.exit(0);
  } catch (err) {
    console.error('Error viewing data:', err);
    process.exit(1);
  }
};

showData();
