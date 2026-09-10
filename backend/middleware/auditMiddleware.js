const { query } = require('../config/db');

const auditMiddleware = (action, entity) => {
  return async (req, res, next) => {
    // Intercept res.send / res.json to log after successful response
    const originalJson = res.json;

    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user.user_id : null;
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        const details = JSON.stringify({
          method: req.method,
          path: req.originalUrl,
          body: req.body,
          params: req.params
        });

        query(
          `INSERT INTO AuditLogs (user_id, action, entity, details, ip_address) VALUES (?, ?, ?, ?, ?)`,
          [userId, action, entity, details, ip]
        ).catch(err => console.error('[Audit Logger Error]', err));
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

module.exports = auditMiddleware;
