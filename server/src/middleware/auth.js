import { User, USER_STATUS } from "../models/User.js";
import { verifyToken } from "../utils/jwt.js";

export function authenticate(secret) {
  return async function authenticateMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing or invalid Authorization header. Use: Bearer <token>",
      });
    }
    const token = header.slice(7);
    try {
      const decoded = verifyToken(token, secret);
      const user = await User.findById(decoded.sub);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized", message: "User not found" });
      }
      if (user.status === USER_STATUS.INACTIVE) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Account is inactive. Contact an administrator.",
        });
      }
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        status: user.status,
        name: user.name,
      };
      next();
    } catch {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
    }
  };
}
