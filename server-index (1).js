const express = require("express");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { join } = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const DATA_FILE = join(ROOT, "trip-data.json");

console.log(`Root:        ${ROOT}`);
console.log(`Dist:        ${DIST}`);
console.log(`Dist exists: ${existsSync(DIST)}`);

app.use(express.json({ limit: "5mb" }));
app.use(express.static(DIST));

let tripData = null;
if (existsSync(DATA_FILE)) {
  try {
    tripData = JSON.parse(readFileSync(DATA_FILE, "utf8"));
    console.log("Loaded saved trip data from disk.");
  } catch (e) {
    console.error("Failed to parse trip-data.json:", e.message);
  }
}

const clients = new Set();

app.get("/api/trip", (req, res) => {
  res.json(tripData || {});
});

app.post("/api/trip", (req, res) => {
  tripData = req.body;
  try { writeFileSync(DATA_FILE, JSON.stringify(tripData)); } catch (e) {
    console.error("Failed to write trip-data.json:", e.message);
  }
  const payload = `data: ${JSON.stringify(tripData)}\n\n`;
  for (const client of clients) {
    try { client.write(payload); } catch { clients.delete(client); }
  }
  res.json({ ok: true });
});

app.get("/api/trip/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  if (tripData) {
    res.write(`data: ${JSON.stringify(tripData)}\n\n`);
  }

  clients.add(res);

  const hb = setInterval(() => {
    try { res.write(": heartbeat\n\n"); } catch { clearInterval(hb); }
  }, 25000);

  req.on("close", () => {
    clients.delete(res);
    clearInterval(hb);
  });
});

app.get("*", (req, res) => {
  const indexPath = join(DIST, "index.html");
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(
      `index.html not found. Dist: ${DIST}, exists: ${existsSync(DIST)}, cwd: ${ROOT}`
    );
  }
});

app.listen(PORT, () => {
  console.log(`Trip planner running on port ${PORT}`);
});
