import bcrypt from "bcryptjs";
import { User, USER_STATUS, ROLES } from "../models/User.js";
import { signToken } from "../utils/jwt.js";

export async function register(req, res, next) {
  try {
    const count = await User.countDocuments();
    const allowPublic =
      process.env.ALLOW_PUBLIC_REGISTER === "true" || count === 0;
    if (!allowPublic) {
      return res.status(403).json({
        error: "Forbidden",
        message:
          "Public registration is disabled. Use an admin account or set ALLOW_PUBLIC_REGISTER=true for development.",
      });
    }

    const { email, password, name } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      const err = new Error("Email already registered");
      err.statusCode = 409;
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: ROLES.VIEWER,
    });
    const token = signToken(
      { sub: user._id.toString(), role: user.role },
      req.app.get("jwtSecret")
    );
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
    }
    if (user.status === USER_STATUS.INACTIVE) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Account is inactive. Contact an administrator.",
      });
    }
    const token = signToken(
      { sub: user._id.toString(), role: user.role },
      req.app.get("jwtSecret")
    );
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res) {
  res.json({ user: req.user });
}
