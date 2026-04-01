import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createAuthRoutes } from "./routes/authRoutes.js";
import { createUserRoutes } from "./routes/userRoutes.js";
import { createRecordRoutes } from "./routes/recordRoutes.js";
import { createDashboardRoutes } from "./routes/dashboardRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp(options) {
  const { jwtSecret, clientOrigin } = options;
  const app = express();

  app.set("jwtSecret", jwtSecret);
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: clientOrigin || true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/health", (req, res) => {
    res.json({ ok: true, service: "finance-backend" });
  });

  app.get("/", (req, res) => {
    res.json({
      service: "finance-backend",
      message: "REST API is running. There is no HTML homepage at this URL.",
      try: {
        health: "/health",
        login: "POST /api/auth/login",
        dashboardSummary: "GET /api/dashboard/summary (Bearer token)",
      },
      docs: "See README.md in the repository for full routes and setup.",
    });
  });

  app.use("/api/auth", authLimiter, createAuthRoutes(jwtSecret));
  app.use("/api/users", apiLimiter, createUserRoutes(jwtSecret));
  app.use("/api/records", apiLimiter, createRecordRoutes(jwtSecret));
  app.use("/api/dashboard", apiLimiter, createDashboardRoutes(jwtSecret));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
