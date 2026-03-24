const express = require("express");
const fs = require("fs/promises"); // promise based versio of fs
const path = require("path");
const { validateItem } = require("../utils/validation");

const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../../data/items.json");

// Utility to read data (changed to asynchronous)
async function readData() {
  const raw = await fs.readFile(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

// Utility to write data (asynchronous implemented as well)
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

// GET /api/items (updated to asynchronous route)
router.get("/", async (req, res, next) => {
  try {
    const data = await readData();
    const { q, limit, page } = req.query;

    let results = data;

    if (q) {
      results = results.filter((item) =>
        item.name.toLowerCase().includes(String(q).toLowerCase()),
      );
    }

    const totalCount = results.length;
    const pageSize = Number(limit) || totalCount || 1;
    const pageNumber = Number(page) || 1;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedResults = results.slice(startIndex, startIndex + pageSize);

    res.json({
      canGoNext: pageNumber < totalPages,
      canGoPrevious: pageNumber > 1,
      totalPages,
      pageSize,
      pageNumber,
      totalCount,
      items: paginatedResults,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id (updated to asynchronous route)
router.get("/:id", async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find((i) => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error("Item not found");
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post("/", async (req, res, next) => {
  try {
    const item = req.body;

    // TODO: Validation implemented
    const errors = validateItem(item);
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    const data = await readData();

    const newItem = {
      id: Date.now(),
      name: item.name.trim(),
      category: item.category.trim(),
      price: item.price,
    };

    data.push(newItem);
    await writeData(data);

    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
