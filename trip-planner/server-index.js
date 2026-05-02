import express from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const app = express();
const PORT = process.env.PORT || 3001;

// process.cwd() is always the repo root on Render, regardless of
// where the server file lives — safer than __dirname-relative paths.
const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const DATA_FILE = join(ROOT, "trip-data.json");

console.log(`Root:        ${ROOT}`);
console.log(`Dist:        ${DIST}`);
console.log(`Dist exists: ${existsSync(DIST)}`);


app.use(express.json({ limit: "5mb" }));

// ── Serve built React app in production ──
app.use(express.static(DIST));

// ── In-memory trip state ──
let tripData = null;
if (existsSync(DATA_FILE)) {
  try { tripData = JSON.parse(readFileSync(DATA_FILE, "utf8")); } catch {}
}

// ── SSE clients for live push ──
const clients = new Set();

// GET current trip
app.get("/api/trip", (req, res) => {
  res.json(tripData || {});
});

// POST updated trip (saves + broadcasts to all connected clients)
app.post("/api/trip", (req, res) => {
  tripData = req.body;
  try { writeFileSync(DATA_FILE, JSON.stringify(tripData)); } catch {}
  // Push to all SSE subscribers
  const payload = `data: ${JSON.stringify(tripData)}\n\n`;
  for (const client of clients) {
    try { client.write(payload); } catch { clients.delete(client); }
  }
  res.json({ ok: true });
});

// SSE stream — clients subscribe here for live updates
app.get("/api/trip/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  // Send current state immediately on connect
  if (tripData) {
    res.write(`data: ${JSON.stringify(tripData)}\n\n`);
  }

  clients.add(res);

  // Heartbeat every 25s to keep connection alive
  const hb = setInterval(() => {
    try { res.write(": heartbeat\n\n"); } catch { clearInterval(hb); }
  }, 25000);

  req.on("close", () => {
    clients.delete(res);
    clearInterval(hb);
  });
});

// Catch-all: serve React app for any non-API route
app.get("*", (req, res) => {
  const indexPath = join(DIST, "index.html");
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(
      `Build not found. Looking for: ${indexPath}. ` +
      `dist exists: ${existsSync(DIST)}. cwd: ${ROOT}`
    );
  }
});

app.listen(PORT, () => {
  console.log(`Trip planner server running on port ${PORT}`);
});
