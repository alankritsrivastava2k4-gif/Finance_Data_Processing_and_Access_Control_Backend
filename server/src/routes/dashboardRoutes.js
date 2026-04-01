import { Router } from "express";
import { query } from "express-validator";
import { summary } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/auth.js";
import { requireAuthenticated } from "../middleware/rbac.js";
import { handleValidation } from "../middleware/validate.js";

export function createDashboardRoutes(jwtSecret) {
  const r = Router();
  const auth = authenticate(jwtSecret);

  const summaryRules = [
    query("trend").optional().isIn(["weekly", "monthly"]),
    query("recentLimit").optional().isInt({ min: 1, max: 50 }),
  ];

  r.get("/summary", auth, requireAuthenticated, summaryRules, handleValidation, summary);

  return r;
}
