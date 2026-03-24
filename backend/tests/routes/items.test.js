const request = require("supertest");
const express = require("express");

jest.mock("fs/promises", () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock("../../src/utils/validation", () => ({
  validateItem: jest.fn(),
}));

function createApp(itemsRouter) {
  const app = express();
  app.use(express.json());
  app.use("/api/items", itemsRouter);

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
    });
  });

  return app;
}

describe("items routes", () => {
  let app;
  let fs;
  let validateItem;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    fs = require("fs/promises");
    ({ validateItem } = require("../../src/utils/validation"));

    const itemsRouter = require("../../src/routes/items");
    app = createApp(itemsRouter);
  });

  describe("GET /api/items", () => {
    test("returns all items", async () => {
      const mockItems = [
        { id: 1, name: "Laptop", category: "Electronics", price: 1200 },
        { id: 2, name: "Chair", category: "Furniture", price: 150 },
      ];

      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const res = await request(app).get("/api/items");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        canGoNext: false,
        canGoPrevious: false,
        totalPages: 1,
        pageSize: 2,
        pageNumber: 1,
        totalCount: 2,
        items: mockItems,
      });
      expect(fs.readFile).toHaveBeenCalledTimes(1);
    });

    test("filters items by q", async () => {
      const mockItems = [
        { id: 1, name: "Laptop", category: "Electronics", price: 1200 },
        { id: 2, name: "Lamp", category: "Home", price: 40 },
        { id: 3, name: "Chair", category: "Furniture", price: 150 },
      ];

      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const res = await request(app).get("/api/items?q=lap");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        canGoNext: false,
        canGoPrevious: false,
        totalPages: 1,
        pageSize: 1,
        pageNumber: 1,
        totalCount: 1,
        items: [
          { id: 1, name: "Laptop", category: "Electronics", price: 1200 },
        ],
      });
    });

    test("limits results", async () => {
      const mockItems = [
        { id: 1, name: "Laptop", category: "Electronics", price: 1200 },
        { id: 2, name: "Lamp", category: "Home", price: 40 },
        { id: 3, name: "Chair", category: "Furniture", price: 150 },
      ];

      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const res = await request(app).get("/api/items?limit=2&page=1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        canGoNext: true,
        canGoPrevious: false,
        totalPages: 2,
        pageSize: 2,
        pageNumber: 1,
        totalCount: 3,
        items: mockItems.slice(0, 2),
      });
    });

    test("returns second page correctly", async () => {
      const mockItems = [
        { id: 1, name: "Laptop", category: "Electronics", price: 1200 },
        { id: 2, name: "Lamp", category: "Home", price: 40 },
        { id: 3, name: "Chair", category: "Furniture", price: 150 },
      ];

      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const res = await request(app).get("/api/items?limit=2&page=2");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        canGoNext: false,
        canGoPrevious: true,
        totalPages: 2,
        pageSize: 2,
        pageNumber: 2,
        totalCount: 3,
        items: [mockItems[2]],
      });
    });

    test("returns 500 when file read fails", async () => {
      fs.readFile.mockRejectedValue(new Error("read failed"));

      const res = await request(app).get("/api/items");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: "read failed" });
    });
  });

  describe("GET /api/items/:id", () => {
    test("returns a single item by id", async () => {
      const mockItems = [
        { id: 1, name: "Laptop", category: "Electronics", price: 1200 },
        { id: 2, name: "Chair", category: "Furniture", price: 150 },
      ];

      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const res = await request(app).get("/api/items/2");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: 2,
        name: "Chair",
        category: "Furniture",
        price: 150,
      });
    });

    test("returns 404 when item is not found", async () => {
      const mockItems = [
        { id: 1, name: "Laptop", category: "Electronics", price: 1200 },
      ];

      fs.readFile.mockResolvedValue(JSON.stringify(mockItems));

      const res = await request(app).get("/api/items/999");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Item not found" });
    });

    test("returns 500 when file read fails", async () => {
      fs.readFile.mockRejectedValue(new Error("read failed"));

      const res = await request(app).get("/api/items/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: "read failed" });
    });
  });

  describe("POST /api/items", () => {
    test("creates a new item", async () => {
      const existingItems = [
        { id: 1, name: "Laptop", category: "Electronics", price: 1200 },
      ];

      validateItem.mockReturnValue([]);
      fs.readFile.mockResolvedValue(JSON.stringify(existingItems));
      fs.writeFile.mockResolvedValue();

      const payload = {
        name: "  Desk  ",
        category: "  Furniture  ",
        price: 300,
      };

      const res = await request(app).post("/api/items").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: "Desk",
        category: "Furniture",
        price: 300,
      });
      expect(typeof res.body.id).toBe("number");

      expect(fs.writeFile).toHaveBeenCalledTimes(1);

      const writtenJson = fs.writeFile.mock.calls[0][1];
      const writtenData = JSON.parse(writtenJson);

      expect(writtenData).toHaveLength(2);
      expect(writtenData[1]).toMatchObject({
        name: "Desk",
        category: "Furniture",
        price: 300,
      });
    });

    test("returns 400 when validation fails", async () => {
      validateItem.mockReturnValue([
        "name is required",
        "price must be a non-negative number",
      ]);

      const res = await request(app).post("/api/items").send({
        name: "",
        category: "Electronics",
        price: -10,
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: "Validation failed",
        errors: ["name is required", "price must be a non-negative number"],
      });

      expect(fs.readFile).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test("returns 500 when write fails", async () => {
      validateItem.mockReturnValue([]);
      fs.readFile.mockResolvedValue(JSON.stringify([]));
      fs.writeFile.mockRejectedValue(new Error("write failed"));

      const res = await request(app).post("/api/items").send({
        name: "Desk",
        category: "Furniture",
        price: 300,
      });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: "write failed" });
    });
  });
});
