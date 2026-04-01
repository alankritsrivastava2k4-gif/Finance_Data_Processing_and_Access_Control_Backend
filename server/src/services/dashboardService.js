import { FinancialRecord, ENTRY_TYPES } from "../models/FinancialRecord.js";

function startOfWeek(d) {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Aggregates for non-deleted records.
 */
export async function getDashboardSummary(options = {}) {
  const { recentLimit = 10, trend = "weekly" } = options;

  const baseMatch = { deletedAt: null };

  const [totalsAgg] = await FinancialRecord.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ["$type", ENTRY_TYPES.INCOME] }, "$amount", 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ["$type", ENTRY_TYPES.EXPENSE] }, "$amount", 0] },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const totalIncome = totalsAgg?.totalIncome ?? 0;
  const totalExpenses = totalsAgg?.totalExpenses ?? 0;
  const netBalance = totalIncome - totalExpenses;

  const byCategory = await FinancialRecord.aggregate([
    { $match: baseMatch },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const categoryWise = byCategory.map((row) => ({
    category: row._id.category,
    type: row._id.type,
    total: row.total,
  }));

  const recent = await FinancialRecord.find(baseMatch)
    .sort({ date: -1, createdAt: -1 })
    .limit(recentLimit)
    .populate("createdBy", "name email")
    .lean();

  const now = new Date();
  const trendStart =
    trend === "monthly" ? startOfMonth(now) : startOfWeek(now);

  const trendPipeline = [
    { $match: { ...baseMatch, date: { $gte: trendStart } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        income: {
          $sum: { $cond: [{ $eq: ["$type", ENTRY_TYPES.INCOME] }, "$amount", 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ["$type", ENTRY_TYPES.EXPENSE] }, "$amount", 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const trendPoints = await FinancialRecord.aggregate(trendPipeline);

  return {
    totals: {
      totalIncome,
      totalExpenses,
      netBalance,
      recordCount: totalsAgg?.count ?? 0,
    },
    categoryWise,
    recentActivity: recent,
    trend: {
      granularity: trend === "monthly" ? "daily" : "daily",
      periodStart: trendStart.toISOString(),
      points: trendPoints.map((p) => ({
        date: p._id,
        income: p.income,
        expense: p.expense,
        net: p.income - p.expense,
      })),
    },
  };
}
