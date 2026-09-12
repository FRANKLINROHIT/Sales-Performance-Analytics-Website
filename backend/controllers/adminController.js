const { query, queryOne } = require('../config/db');
const bcrypt = require('bcryptjs');

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

    const existing = await queryOne(`SELECT * FROM Users WHERE email = ?`, [email]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role]
    );

    const userId = result.insertId;

    // If role is Salesperson, create corresponding record in Salespersons table
    if (role === 'Salesperson') {
      await query(
        `INSERT INTO Salespersons (user_id, name, email, region_id, target_amount, hire_date) VALUES (?, ?, ?, ?, 150000.00, DATE('now'))`,
        [userId, name, email, region_id || 1]
      );
    }

    res.status(201).json({
      success: true,
      message: `User ${name} created as ${role}.`,
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

    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role while logged in as Admin.'
      });
    }

    await query(`UPDATE Users SET role = ? WHERE user_id = ?`, [role, id]);

    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active Admin session account.' });
    }

    await query(`DELETE FROM Users WHERE user_id = ?`, [id]);
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
