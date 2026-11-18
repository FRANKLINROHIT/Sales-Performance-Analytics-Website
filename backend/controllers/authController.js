const { query, queryOne } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[FATAL SECURITY ERROR] JWT_SECRET environment variable is not defined in production.');
    }
    return 'dev_insecure_fallback_secret_must_change_in_production_32chars';
  }
  return secret;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, region_id = 1 } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    // Input validation
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters.' });
    }

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.length > 150) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    if (password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password cannot exceed 128 characters.' });
    }

    // SECURITY: Prevent unauthenticated users from escalating to Admin or Manager via self-registration
    if (role && role !== 'Salesperson') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Self-registration for privileged roles (Admin, Manager) is not permitted. Please contact an administrator.'
      });
    }

    const assignedRole = 'Salesperson';
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const existingUser = await queryOne(`SELECT user_id FROM Users WHERE email = ?`, [cleanEmail]);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO Users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)`,
      [cleanName, cleanEmail, hashedPassword, assignedRole, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150']
    );

    const userId = result.insertId;
    let salespersonId = null;

    const spResult = await query(
      `INSERT INTO Salespersons (user_id, name, email, region_id, target_amount, hire_date) VALUES (?, ?, ?, ?, 150000.00, DATE('now'))`,
      [userId, cleanName, cleanEmail, parseInt(region_id) || 1]
    );
    salespersonId = spResult.insertId;

    const payload = {
      user_id: userId,
      name: cleanName,
      email: cleanEmail,
      role: assignedRole,
      salesperson_id: salespersonId
    };

    const token = jwt.sign(payload, getJwtSecret(), {
      algorithm: 'HS256',
      expiresIn: '24h'
    });

    await query(`INSERT INTO AuditLogs (user_id, action, entity, details) VALUES (?, 'USER_REGISTER', 'Auth', ?)`, [
      userId,
      `User ${cleanName} registered as ${assignedRole}`
    ]);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        user_id: userId,
        name: cleanName,
        email: cleanEmail,
        role: assignedRole,
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

    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const user = await queryOne(`SELECT * FROM Users WHERE email = ?`, [cleanEmail]);

    // Prevent user enumeration: use generic invalid credentials message
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
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

    const token = jwt.sign(payload, getJwtSecret(), {
      algorithm: 'HS256',
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
