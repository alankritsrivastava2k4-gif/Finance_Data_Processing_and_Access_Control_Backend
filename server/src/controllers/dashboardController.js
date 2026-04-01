import { getDashboardSummary } from "../services/dashboardService.js";

export async function summary(req, res, next) {
  try {
    const trend = req.query.trend === "monthly" ? "monthly" : "weekly";
    const recentLimit = Math.min(50, Math.max(1, parseInt(req.query.recentLimit, 10) || 10));
    const data = await getDashboardSummary({ trend, recentLimit });
    res.json(data);
  } catch (e) {
    next(e);
  }
}
