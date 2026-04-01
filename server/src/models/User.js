import mongoose from "mongoose";

export const ROLES = Object.freeze({
  VIEWER: "viewer",
  ANALYST: "analyst",
  ADMIN: "admin",
});

export const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.VIEWER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
