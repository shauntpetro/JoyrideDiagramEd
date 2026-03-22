const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;

// ── In-memory Samsara token (never persisted to disk) ──
let samsaraToken = null;

// ── Driver profiles bank (persisted to disk) ──
const PROFILES_PATH = path.join(__dirname, "driver-profiles.json");

function loadProfiles() {
  try {
    if (fs.existsSync(PROFILES_PATH)) {
      return JSON.parse(fs.readFileSync(PROFILES_PATH, "utf8"));
    }
  } catch (e) { console.error("Failed to load profiles:", e.message); }
  return {};
}

function saveProfiles(profiles) {
  try {
    fs.writeFileSync(PROFILES_PATH, JSON.stringify(profiles, null, 2), "utf8");
    return true;
  } catch (e) { console.error("Failed to save profiles:", e.message); return false; }
}

const MIME = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".csv": "text/csv",
};

// ── Helpers ──

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch { resolve({}); }
    });
    req.on("error", reject);
  });
}

function jsonRes(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function samsaraRequest(method, endpoint, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, "https://api.samsara.com");
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        "Authorization": `Bearer ${samsaraToken}`,
        "Accept": "application/json",
      },
      timeout,
    };

    const req = https.request(options, (resp) => {
      const chunks = [];
      resp.on("data", (c) => chunks.push(c));
      resp.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve({ status: resp.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: resp.statusCode, data: { raw: body } });
        }
      });
    });

    req.on("timeout", () => { req.destroy(); reject(new Error("Samsara API timeout")); });
    req.on("error", reject);
    req.end();
  });
}

// ── Server ──

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split("?")[0];

  // ── CORS preflight ──
  if (req.method === "OPTIONS" && urlPath.startsWith("/api/")) {
    jsonRes(res, 204, null);
    return;
  }

  // ── Samsara API routes ──
  if (urlPath.startsWith("/api/samsara/")) {
    try {
      // GET /api/samsara/status
      if (req.method === "GET" && urlPath === "/api/samsara/status") {
        return jsonRes(res, 200, { connected: !!samsaraToken });
      }

      // POST /api/samsara/connect
      if (req.method === "POST" && urlPath === "/api/samsara/connect") {
        const body = await readBody(req);
        if (!body.token) return jsonRes(res, 400, { error: "Token required" });

        // Validate token with a test call
        samsaraToken = body.token;
        try {
          const test = await samsaraRequest("GET", "/fleet/drivers?limit=1");
          if (test.status === 200) {
            console.log("Samsara connected successfully");
            return jsonRes(res, 200, { connected: true });
          } else {
            samsaraToken = null;
            return jsonRes(res, 401, { connected: false, error: `Samsara returned ${test.status}` });
          }
        } catch (e) {
          samsaraToken = null;
          return jsonRes(res, 502, { connected: false, error: e.message });
        }
      }

      // DELETE /api/samsara/disconnect
      if (req.method === "DELETE" && urlPath === "/api/samsara/disconnect") {
        samsaraToken = null;
        console.log("Samsara disconnected");
        return jsonRes(res, 200, { connected: false });
      }

      // Proxy routes require token
      if (!samsaraToken) return jsonRes(res, 401, { error: "Not connected to Samsara" });

      // GET /api/samsara/drivers
      if (req.method === "GET" && urlPath === "/api/samsara/drivers") {
        const result = await samsaraRequest("GET", "/fleet/drivers");
        return jsonRes(res, result.status === 200 ? 200 : 502, result.data);
      }

      // GET /api/samsara/hos/clocks
      if (req.method === "GET" && urlPath === "/api/samsara/hos/clocks") {
        const result = await samsaraRequest("GET", "/fleet/hos/clocks");
        return jsonRes(res, result.status === 200 ? 200 : 502, result.data);
      }

      // GET /api/samsara/locations — current driver/vehicle locations
      if (req.method === "GET" && urlPath === "/api/samsara/locations") {
        const result = await samsaraRequest("GET", "/fleet/vehicles/locations");
        return jsonRes(res, result.status === 200 ? 200 : 502, result.data);
      }

      // GET /api/samsara/vehicles — vehicle list with driver assignments
      if (req.method === "GET" && urlPath === "/api/samsara/vehicles") {
        const result = await samsaraRequest("GET", "/fleet/vehicles");
        return jsonRes(res, result.status === 200 ? 200 : 502, result.data);
      }

      // GET /api/samsara/debug — raw HOS + locations for debugging field mapping
      if (req.method === "GET" && urlPath === "/api/samsara/debug") {
        const [hos, locs, drivers] = await Promise.all([
          samsaraRequest("GET", "/fleet/hos/clocks"),
          samsaraRequest("GET", "/fleet/vehicles/locations"),
          samsaraRequest("GET", "/fleet/drivers?limit=3"),
        ]);
        // Return first entry of each for field inspection
        const hosEntry = hos.data?.data?.[0] || hos.data;
        const locEntry = locs.data?.data?.[0] || locs.data;
        const driverEntry = drivers.data?.data?.[0] || drivers.data;
        return jsonRes(res, 200, {
          hosFields: hosEntry ? Object.keys(hosEntry) : [],
          hosSample: hosEntry,
          locFields: locEntry ? Object.keys(locEntry) : [],
          locSample: locEntry,
          driverFields: driverEntry ? Object.keys(driverEntry) : [],
          driverSample: driverEntry,
        });
      }

      return jsonRes(res, 404, { error: "Unknown API route" });

    } catch (e) {
      console.error("API error:", e.message);
      return jsonRes(res, 500, { error: e.message });
    }
  }

  // ── Driver Profiles API ──
  if (urlPath.startsWith("/api/profiles")) {
    try {
      // GET /api/profiles — load all driver profiles
      if (req.method === "GET" && urlPath === "/api/profiles") {
        const profiles = loadProfiles();
        return jsonRes(res, 200, profiles);
      }

      // POST /api/profiles — save/merge driver profiles
      if (req.method === "POST" && urlPath === "/api/profiles") {
        const body = await readBody(req);
        if (!body.drivers || typeof body.drivers !== "object") {
          return jsonRes(res, 400, { error: "drivers object required" });
        }
        const existing = loadProfiles();
        // Merge: for each driver, accumulate start time history
        Object.entries(body.drivers).forEach(([name, profile]) => {
          if (!existing[name]) {
            existing[name] = { startTimes: [], domicile: profile.domicile, lastUpdated: new Date().toISOString() };
          }
          // Append new start times (deduplicate by value)
          const existingTimes = new Set(existing[name].startTimes.map(t => t.hour));
          (profile.startTimes || []).forEach(t => {
            if (!existingTimes.has(t.hour)) {
              existing[name].startTimes.push(t);
              existingTimes.add(t.hour);
            }
          });
          existing[name].domicile = profile.domicile || existing[name].domicile;
          existing[name].preferredStartLabel = profile.preferredStartLabel || existing[name].preferredStartLabel;
          existing[name].preferredShift = profile.preferredShift || existing[name].preferredShift;
          existing[name].shiftConsistency = profile.shiftConsistency ?? existing[name].shiftConsistency;
          existing[name].lastUpdated = new Date().toISOString();
        });
        const saved = saveProfiles(existing);
        console.log(`Driver profiles saved: ${Object.keys(existing).length} drivers`);
        return jsonRes(res, saved ? 200 : 500, { saved, count: Object.keys(existing).length });
      }

      // DELETE /api/profiles — clear all profiles
      if (req.method === "DELETE" && urlPath === "/api/profiles") {
        saveProfiles({});
        console.log("Driver profiles cleared");
        return jsonRes(res, 200, { cleared: true });
      }

      return jsonRes(res, 404, { error: "Unknown profiles route" });
    } catch (e) {
      console.error("Profiles API error:", e.message);
      return jsonRes(res, 500, { error: e.message });
    }
  }

  // ── Static file serving ──
  let filePath = urlPath === "/" ? "/joyride-logistics-diagram.html" : urlPath;
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Joyride Logistics server running on port ${PORT}`);
});
