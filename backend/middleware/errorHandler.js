const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Express Error]:', err);

  const statusCode = err.status || err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, mask internal 500 errors to avoid leaking database internals or paths
  const message = (isProduction && statusCode === 500)
    ? 'An internal server error occurred. Please contact support.'
    : (err.message || 'Internal Server Error');

  res.status(statusCode).json({
    success: false,
    message,
    stack: !isProduction ? err.stack : undefined
  });
};

module.exports = errorHandler;
