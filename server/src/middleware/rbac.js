import { ROLES } from "../models/User.js";

/**
 * Allow only listed roles. Must run after authenticate.
 */
export function requireRoles(...allowedRoles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(500).json({ error: "ServerError", message: "Auth middleware not applied" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to perform this action.",
        requiredRoles: allowedRoles,
        yourRole: req.user.role,
      });
    }
    next();
  };
}

/** Admin-only shorthand */
export const requireAdmin = requireRoles(ROLES.ADMIN);

/** Analyst or Admin (read financial records + insights) */
export const requireAnalystOrAdmin = requireRoles(ROLES.ANALYST, ROLES.ADMIN);

/** Any authenticated user (for dashboard aggregates visible to viewer) */
export const requireAuthenticated = requireRoles(
  ROLES.VIEWER,
  ROLES.ANALYST,
  ROLES.ADMIN
);
