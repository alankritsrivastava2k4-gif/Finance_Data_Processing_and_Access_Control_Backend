import { body } from "express-validator";
import { ROLES, USER_STATUS } from "../models/User.js";

export const createUserRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("name").trim().notEmpty(),
  body("role")
    .optional()
    .isIn(Object.values(ROLES))
    .withMessage(`role must be one of: ${Object.values(ROLES).join(", ")}`),
  body("status")
    .optional()
    .isIn(Object.values(USER_STATUS))
    .withMessage(`status must be one of: ${Object.values(USER_STATUS).join(", ")}`),
];

export const updateUserRules = [
  body("name").optional().trim().notEmpty(),
  body("role").optional().isIn(Object.values(ROLES)),
  body("status").optional().isIn(Object.values(USER_STATUS)),
  body("password").optional().isLength({ min: 8 }),
];
