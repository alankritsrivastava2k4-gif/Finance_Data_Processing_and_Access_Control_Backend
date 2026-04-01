import { Router } from "express";
import { register, login, me } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { handleValidation } from "../middleware/validate.js";
import { loginRules, registerRules } from "../validators/authValidators.js";

export function createAuthRoutes(jwtSecret) {
  const r = Router();
  const auth = authenticate(jwtSecret);

  r.post("/register", registerRules, handleValidation, register);
  r.post("/login", loginRules, handleValidation, login);
  r.get("/me", auth, me);

  return r;
}
