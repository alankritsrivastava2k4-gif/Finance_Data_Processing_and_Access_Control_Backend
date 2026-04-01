import { validationResult } from "express-validator";

export function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "ValidationError",
      message: "Invalid input",
      details: errors.array({ onlyFirstError: false }).map((e) => ({
        path: e.path,
        msg: e.msg,
        value: e.value,
      })),
    });
  }
  next();
}
