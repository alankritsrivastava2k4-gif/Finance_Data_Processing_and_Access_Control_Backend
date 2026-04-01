import mongoose from "mongoose";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: "ValidationError", message: err.message, details });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: "Conflict",
      message: "A record with this unique field already exists.",
    });
  }

  const status = err.statusCode || err.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";

  return res.status(status).json({
    error: err.name || "Error",
    message,
    ...(process.env.NODE_ENV !== "production" && err.stack ? { stack: err.stack } : {}),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "NotFound", message: `Cannot ${req.method} ${req.originalUrl}` });
}
