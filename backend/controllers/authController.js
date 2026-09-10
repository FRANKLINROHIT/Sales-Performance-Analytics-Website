const { query, queryOne } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'Salesperson', region_id = 1 } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingUser = await queryOne(`SELECT * FROM Users WHERE email = ?`, [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO Users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, role, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150']
    );

    const userId = result.insertId;
    let salespersonId = null;

    if (role === 'Salesperson') {
      const spResult = await query(
        `INSERT INTO Salespersons (user_id, name, email, region_id, target_amount, hire_date) VALUES (?, ?, ?, ?, 150000.00, DATE('now'))`,
        [userId, name, email, region_id]
      );
      salespersonId = spResult.insertId;
    }

    const payload = {
      user_id: userId,
      name,
      email,
      role,
      salesperson_id: salespersonId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_sales_analytics_key_2026_mca_project', {
      expiresIn: '24h'
    });

    await query(`INSERT INTO AuditLogs (user_id, action, entity, details) VALUES (?, 'USER_REGISTER', 'Auth', ?)`, [
      userId,
      `User ${name} registered as ${role}`
    ]);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        user_id: userId,
        name,
        email,
        role,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        salesperson_id: salespersonId
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await queryOne(`SELECT * FROM Users WHERE email = ?`, [email]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    // Get salesperson details if applicable
    let salespersonInfo = null;
    if (user.role === 'Salesperson') {
      salespersonInfo = await queryOne(`SELECT * FROM Salespersons WHERE user_id = ?`, [user.user_id]);
    }

    const payload = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      salesperson_id: salespersonInfo ? salespersonInfo.salesperson_id : null
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret_sales_analytics_key_2026_mca_project', {
      expiresIn: '24h'
    });

    // Log login audit
    await query(`INSERT INTO AuditLogs (user_id, action, entity, details) VALUES (?, 'USER_LOGIN', 'Auth', ?)`, [
      user.user_id,
      `User ${user.name} (${user.role}) logged in`
    ]);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        salesperson_id: salespersonInfo ? salespersonInfo.salesperson_id : null
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await queryOne(
      `SELECT user_id, name, email, role, avatar, created_at FROM Users WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    let salespersonInfo = null;
    if (user.role === 'Salesperson') {
      salespersonInfo = await queryOne(`SELECT * FROM Salespersons WHERE user_id = ?`, [user.user_id]);
    }

    res.json({
      success: true,
      user: {
        ...user,
        salesperson_id: salespersonInfo ? salespersonInfo.salesperson_id : null,
        region_id: salespersonInfo ? salespersonInfo.region_id : null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
