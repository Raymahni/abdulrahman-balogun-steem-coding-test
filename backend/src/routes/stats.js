const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../../data/items.json");

let cachedStats = null; // empty shell to hold cached stats
let cacheReady = false; // indicator to determine when cache is ready for use
let recomputing = null;

// Utility to compute stats
async function computeStats() {
  const raw = await fs.promises.readFile(DATA_PATH, "utf8");
  const items = JSON.parse(raw);

  const total = items.length;
  const averagePrice =
    total === 0 ? 0 : items.reduce((sum, item) => sum + item.price, 0) / total;

  cachedStats = { total, averagePrice };
  cacheReady = true;
}

// Checks stats are not computed multiple times. This does the heavy lifting for the performance
async function checkStats() {
  if (cacheReady) return cachedStats; // if cache has already been computed, just return them

  // checking if we are not currently computing or in progress
  if (!recomputing) {
    // if we are not currently computing, here we start computing the stats.
    // The result is returned as a promise into recomputing
    // the finally is to return recomputing into its default state (null) after computing is done
    recomputing = computeStats().finally(() => {
      recomputing = null;
    });
  }
  await recomputing;

  // return the result
  return cachedStats;
}

// GET /api/stats (asynchronous implemented)
router.get("/", async (req, res, next) => {
  try {
    const stats = await checkStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
