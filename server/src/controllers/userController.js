import bcrypt from "bcryptjs";
import { User, ROLES, USER_STATUS } from "../models/User.js";

export async function listUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json({
      users: users.map((u) => ({
        id: u._id,
        email: u.email,
        name: u.name,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
    });
  } catch (e) {
    next(e);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ error: "NotFound", message: "User not found" });
    }
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (e) {
    next(e);
  }
}

export async function createUser(req, res, next) {
  try {
    const { email, password, name, role, status } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "Conflict", message: "Email already in use" });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: role || ROLES.VIEWER,
      status: status || USER_STATUS.ACTIVE,
    });
    res.status(201).json({
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

export async function updateUser(req, res, next) {
  try {
    const { name, role, status, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "NotFound", message: "User not found" });
    }
    if (name !== undefined) user.name = name;
    if (role !== undefined) {
      if (!Object.values(ROLES).includes(role)) {
        return res.status(400).json({ error: "ValidationError", message: "Invalid role" });
      }
      user.role = role;
    }
    if (status !== undefined) {
      if (!Object.values(USER_STATUS).includes(status)) {
        return res.status(400).json({ error: "ValidationError", message: "Invalid status" });
      }
      user.status = status;
    }
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 12);
    }
    await user.save();
    res.json({
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

export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "BadRequest", message: "Cannot delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "NotFound", message: "User not found" });
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
