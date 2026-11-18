/**
 * Lightweight, zero-dependency in-memory sliding window rate limiter
 */
const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // default 15 minutes
  const max = options.max || 100; // max requests per windowMs
  const message = options.message || { success: false, message: 'Too many requests. Please try again later.' };

  const hits = new Map();

  // Periodic cleanup to avoid memory leak
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, records] of hits.entries()) {
      const active = records.filter(timestamp => now - timestamp < windowMs);
      if (active.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, active);
      }
    }
  }, windowMs);

  // Unref interval so it does not block process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    const clientRecords = hits.get(ip) || [];
    const validRecords = clientRecords.filter(timestamp => now - timestamp < windowMs);

    if (validRecords.length >= max) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json(message);
    }

    validRecords.push(now);
    hits.set(ip, validRecords);
    next();
  };
};

module.exports = {
  authLimiter: createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
  }),
  aiLimiter: createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: { success: false, message: 'AI rate limit exceeded. Please wait a minute before making more requests.' }
  }),
  createRateLimiter
};
