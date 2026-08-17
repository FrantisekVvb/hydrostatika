const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3481;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

const WATCHED = ["index.html", "main.js", "style.css", "server.js"];
const reloadClients = new Set();
let version = Date.now();
let reloadTimer = null;

function noCache(res, type) {
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
}

function shouldWatchFile(filename) {
  if (!filename) return true;
  const normalized = filename.replace(/\\/g, "/");
  if (normalized.includes(".git") || normalized.includes("node_modules")) {
    return false;
  }
  return true;
}

function broadcastReload() {
  version = Date.now();
  for (const client of reloadClients) {
    try {
      client.write(`data: ${version}\n\n`);
    } catch {
      reloadClients.delete(client);
    }
  }
}

function scheduleReload() {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(broadcastReload, 60);
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === "ENOENT" ? 404 : 500);
      res.end(err.code === "ENOENT" ? "Soubor nenalezen" : "Chyba serveru");
      return;
    }

    noCache(res, type);
    res.writeHead(200);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

  if (urlPath === "/__livereload") {
    noCache(res, "text/event-stream; charset=utf-8");
    res.setHeader("Connection", "keep-alive");
    res.writeHead(200);
    res.write(`data: ${version}\n\n`);
    reloadClients.add(res);
    const ping = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch {
        clearInterval(ping);
      }
    }, 15000);
    req.on("close", () => {
      clearInterval(ping);
      reloadClients.delete(res);
    });
    return;
  }

  if (urlPath === "/__version") {
    noCache(res, "text/plain; charset=utf-8");
    res.writeHead(200);
    res.end(String(version));
    return;
  }

  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath === "/" ? "index.html" : safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Zakázáno");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      sendFile(res, path.join(filePath, "index.html"));
      return;
    }

    sendFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`Hydrostatika běží na http://localhost:${PORT}`);
  console.log("Live reload je zapnutý — stránka se obnoví po uložení souboru.");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} je obsazený. Zkus: PORT=3490 npm start`);
    process.exit(1);
  }

  console.error(err.message);
  process.exit(1);
});

try {
  fs.watch(ROOT, { recursive: true }, (_event, filename) => {
    if (!shouldWatchFile(filename)) return;
    scheduleReload();
  });
} catch {
  // fallback below
}

for (const name of WATCHED) {
  const filePath = path.join(ROOT, name);
  try {
    fs.watchFile(filePath, { interval: 250 }, (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs) scheduleReload();
    });
  } catch {
    // ignore missing files
  }
}
