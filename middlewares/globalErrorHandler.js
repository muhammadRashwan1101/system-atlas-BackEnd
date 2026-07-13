const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

  if (process.env.NODE_ENV === "dev") {
    return res.status(statusCode).json({
      status: status,
      message: err.message,
      stack: err.stack
    });
  }

  return res.status(statusCode).json({
    status: status,
    message: err.message
  });
};

module.exports = globalErrorHandler;