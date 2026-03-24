const request = require("supertest");
const express = require("express");

jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
  },
}));

function createApp(statsRouter) {
  const app = express();
  app.use("/api/stats", statsRouter);

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
    });
  });

  return app;
}

describe("stats routes", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("GET /api/stats returns computed stats", async () => {
    const fs = require("fs");
    fs.promises.readFile.mockResolvedValue(
      JSON.stringify([
        { id: 1, name: "Laptop", price: 100 },
        { id: 2, name: "Chair", price: 200 },
        { id: 3, name: "Desk", price: 300 },
      ]),
    );

    const statsRouter = require("../../src/routes/stats");
    const app = createApp(statsRouter);

    const res = await request(app).get("/api/stats");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      total: 3,
      averagePrice: 200,
    });

    expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
  });

  test("GET /api/stats returns 500 when file read fails", async () => {
    const fs = require("fs");
    fs.promises.readFile.mockRejectedValue(new Error("read failed"));

    const statsRouter = require("../../src/routes/stats");
    const app = createApp(statsRouter);

    const res = await request(app).get("/api/stats");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      message: "read failed",
    });
  });

  test("GET /api/stats uses cached stats on second request", async () => {
    const fs = require("fs");
    fs.promises.readFile.mockResolvedValue(
      JSON.stringify([
        { id: 1, name: "Laptop", price: 100 },
        { id: 2, name: "Chair", price: 300 },
      ]),
    );

    const statsRouter = require("../../src/routes/stats");
    const app = createApp(statsRouter);

    const first = await request(app).get("/api/stats");
    const second = await request(app).get("/api/stats");

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    expect(first.body).toEqual({
      total: 2,
      averagePrice: 200,
    });

    expect(second.body).toEqual({
      total: 2,
      averagePrice: 200,
    });

    expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
  });

  test("concurrent GET /api/stats requests share one computation", async () => {
    const fs = require("fs");

    let resolveRead;
    const readPromise = new Promise((resolve) => {
      resolveRead = resolve;
    });

    fs.promises.readFile.mockReturnValue(readPromise);

    const statsRouter = require("../../src/routes/stats");
    const app = createApp(statsRouter);

    const req1 = request(app).get("/api/stats");
    const req2 = request(app).get("/api/stats");
    const req3 = request(app).get("/api/stats");

    resolveRead(
      JSON.stringify([
        { id: 1, name: "A", price: 50 },
        { id: 2, name: "B", price: 150 },
      ]),
    );

    const [res1, res2, res3] = await Promise.all([req1, req2, req3]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(200);

    expect(res1.body).toEqual({ total: 2, averagePrice: 100 });
    expect(res2.body).toEqual({ total: 2, averagePrice: 100 });
    expect(res3.body).toEqual({ total: 2, averagePrice: 100 });

    expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
  });
});
