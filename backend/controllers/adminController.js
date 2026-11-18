const { query, queryOne } = require('../config/db');
const bcrypt = require('bcryptjs');

const ALLOWED_ROLES = new Set(['Admin', 'Manager', 'Salesperson']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getUsers = async (req, res, next) => {
  try {
    const users = await query(
      `SELECT user_id, name, email, role, avatar, created_at FROM Users ORDER BY user_id ASC`
    );
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, region_id } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all user registration details.' });
    }

    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ success: false, message: 'Role must be Admin, Manager, or Salesperson.' });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({ success: false, message: 'Name must be between 2 and 100 characters.' });
    }

    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 150) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, message: 'Password must be between 8 and 128 characters.' });
    }

    const existing = await queryOne(`SELECT user_id FROM Users WHERE email = ?`, [cleanEmail]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [cleanName, cleanEmail, hashedPassword, role]
    );

    const userId = result.insertId;

    // If role is Salesperson, create corresponding record in Salespersons table
    if (role === 'Salesperson') {
      await query(
        `INSERT INTO Salespersons (user_id, name, email, region_id, target_amount, hire_date) VALUES (?, ?, ?, ?, 150000.00, DATE('now'))`,
        [userId, cleanName, cleanEmail, parseInt(region_id, 10) || 1]
      );
    }

    res.status(201).json({
      success: true,
      message: `User ${cleanName} created as ${role}.`,
      user_id: userId
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const targetUserId = parseInt(id, 10);

    if (isNaN(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid user identifier.' });
    }

    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ success: false, message: 'Role must be Admin, Manager, or Salesperson.' });
    }

    if (targetUserId === req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role while logged in as Admin.'
      });
    }

    const targetUser = await queryOne(`SELECT user_id FROM Users WHERE user_id = ?`, [targetUserId]);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    await query(`UPDATE Users SET role = ? WHERE user_id = ?`, [role, targetUserId]);

    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const targetUserId = parseInt(id, 10);

    if (isNaN(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid user identifier.' });
    }

    if (targetUserId === req.user.user_id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active Admin session account.' });
    }

    const targetUser = await queryOne(`SELECT user_id FROM Users WHERE user_id = ?`, [targetUserId]);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    // Clean up dependent records before user deletion
    await query(`UPDATE Salespersons SET user_id = NULL WHERE user_id = ?`, [targetUserId]);
    await query(`DELETE FROM Notifications WHERE user_id = ?`, [targetUserId]);
    await query(`DELETE FROM Users WHERE user_id = ?`, [targetUserId]);

    res.json({ success: true, message: 'User account removed.' });
  } catch (error) {
    next(error);
  }
};

const getRegions = async (req, res, next) => {
  try {
    const regions = await query(`SELECT * FROM Regions ORDER BY region_id ASC`);
    res.json({ success: true, data: regions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserRole,
  deleteUser,
  getRegions
};
