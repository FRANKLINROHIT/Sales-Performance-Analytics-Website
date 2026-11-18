const { query } = require('../config/db');

// Helper to sanitize sensitive credentials before writing to audit logs
const SENSITIVE_KEYS = new Set(['password', 'token', 'secret', 'authorization', 'credit_card', 'card_number', 'cvv', 'apiKey', 'api_key']);

const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeData);

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizeData(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
};

const auditMiddleware = (action, entity) => {
  return async (req, res, next) => {
    // Intercept res.send / res.json to log after successful response
    const originalJson = res.json;

    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user ? req.user.user_id : null;
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '127.0.0.1';
        const details = JSON.stringify({
          method: req.method,
          path: req.originalUrl,
          body: sanitizeData(req.body),
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
