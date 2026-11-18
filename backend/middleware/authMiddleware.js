const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[FATAL SECURITY ERROR] JWT_SECRET environment variable is not defined in production.');
    }
    // Strict fallback warning in development/test
    return 'dev_insecure_fallback_secret_must_change_in_production_32chars';
  }
  return secret;
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No authorization token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = getJwtSecret();
    // Explicitly pin algorithm to HS256 to prevent algorithm confusion attacks
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authorization token.' });
  }
};

module.exports = authMiddleware;
