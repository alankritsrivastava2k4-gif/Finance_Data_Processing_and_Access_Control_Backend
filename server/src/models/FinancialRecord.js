import mongoose from "mongoose";

export const ENTRY_TYPES = Object.freeze({
  INCOME: "income",
  EXPENSE: "expense",
});

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: Object.values(ENTRY_TYPES),
      required: true,
    },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String, default: "", trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

financialRecordSchema.index({ date: -1, type: 1, category: 1 });
financialRecordSchema.index({ deletedAt: 1 });

financialRecordSchema.methods.softDelete = function softDelete() {
  this.deletedAt = new Date();
  return this.save();
};

export const FinancialRecord = mongoose.model(
  "FinancialRecord",
  financialRecordSchema
);
