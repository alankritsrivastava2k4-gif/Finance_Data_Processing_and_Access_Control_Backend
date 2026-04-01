import { body } from "express-validator";

export const registerRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("name").trim().notEmpty().withMessage("Name is required"),
];

export const loginRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];
