import express from "express";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = join(__dirname, "trip-data.json");
const DIST = join(__dirname, "../dist");

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
  res.sendFile(join(DIST, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Trip planner server running on port ${PORT}`);
});
