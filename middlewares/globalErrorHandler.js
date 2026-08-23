const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  const status = `${statusCode}`.startsWith("4")
    ? "fail"
    : "error";

  console.error(err);

  if (process.env.NODE_ENV === "dev") {
    return res.status(statusCode).json({
      status,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(statusCode).json({
    status,
    message: err.message || "Internal Server Error",
  });
};

module.exports = globalErrorHandler;