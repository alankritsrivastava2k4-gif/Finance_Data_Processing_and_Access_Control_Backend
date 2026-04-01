import request from "supertest";
import { createApp } from "../app.js";

describe("createApp", () => {
  it("GET /health returns ok", async () => {
    const app = createApp({
      jwtSecret: "test-secret-at-least-16",
      clientOrigin: "*",
    });
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("GET /api/dashboard/summary without token returns 401", async () => {
    const app = createApp({
      jwtSecret: "test-secret-at-least-16",
      clientOrigin: "*",
    });
    const res = await request(app).get("/api/dashboard/summary");
    expect(res.status).toBe(401);
  });
});
