const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;

// ── In-memory Samsara token (never persisted to disk) ──
let samsaraToken = null;

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

      return jsonRes(res, 404, { error: "Unknown API route" });

    } catch (e) {
      console.error("API error:", e.message);
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
