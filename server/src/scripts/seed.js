/**
 * Seeds an admin user and sample financial records.
 * Usage: MONGODB_URI=... JWT_SECRET=... node src/scripts/seed.js
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User, ROLES, USER_STATUS } from "../models/User.js";
import { FinancialRecord, ENTRY_TYPES } from "../models/FinancialRecord.js";

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error("Set MONGODB_URI and JWT_SECRET (see .env.example)");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGODB_URI);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "AdminPass123!";

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    admin = await User.create({
      email: adminEmail,
      passwordHash,
      name: "Seed Admin",
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });
    console.log("Created admin:", adminEmail);
  } else {
    console.log("Admin already exists:", adminEmail);
  }

  const count = await FinancialRecord.countDocuments({ deletedAt: null });
  if (count === 0) {
    const daysAgo = (n) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d;
    };
    await FinancialRecord.insertMany([
      {
        amount: 5000,
        type: ENTRY_TYPES.INCOME,
        category: "Salary",
        date: daysAgo(5),
        notes: "Monthly salary",
        createdBy: admin._id,
      },
      {
        amount: 120,
        type: ENTRY_TYPES.EXPENSE,
        category: "Utilities",
        date: daysAgo(4),
        notes: "Electricity",
        createdBy: admin._id,
      },
      {
        amount: 45.5,
        type: ENTRY_TYPES.EXPENSE,
        category: "Food",
        date: daysAgo(2),
        notes: "Groceries",
        createdBy: admin._id,
      },
      {
        amount: 800,
        type: ENTRY_TYPES.INCOME,
        category: "Freelance",
        date: daysAgo(1),
        notes: "Contract work",
        createdBy: admin._id,
      },
    ]);
    console.log("Inserted sample financial records.");
  } else {
    console.log("Financial records already present, skipping sample data.");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
