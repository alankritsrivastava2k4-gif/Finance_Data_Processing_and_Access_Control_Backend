import { Router } from "express";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/rbac.js";
import { handleValidation } from "../middleware/validate.js";
import { createUserRules, updateUserRules } from "../validators/userValidators.js";

export function createUserRoutes(jwtSecret) {
  const r = Router();
  const auth = authenticate(jwtSecret);

  r.use(auth, requireAdmin);

  r.get("/", listUsers);
  r.get("/:id", getUser);
  r.post("/", createUserRules, handleValidation, createUser);
  r.patch("/:id", updateUserRules, handleValidation, updateUser);
  r.delete("/:id", deleteUser);

  return r;
}
