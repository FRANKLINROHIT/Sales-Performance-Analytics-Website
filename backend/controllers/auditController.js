const { query } = require('../config/db');

const getAuditLogs = async (req, res, next) => {
  try {
    const { action, search } = req.query;
    let whereConditions = [];
    let params = [];

    if (action) {
      whereConditions.push('a.action = ?');
      params.push(action);
    }

    if (search) {
      whereConditions.push('(u.name LIKE ? OR a.entity LIKE ? OR a.details LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `
      SELECT a.log_id, a.user_id, u.name as user_name, u.email, a.action, a.entity, a.details, a.ip_address, a.timestamp
      FROM AuditLogs a
      LEFT JOIN Users u ON a.user_id = u.user_id
      ${whereClause}
      ORDER BY a.log_id DESC
      LIMIT 100
    `;

    const logs = await query(sql, params);

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs
};
