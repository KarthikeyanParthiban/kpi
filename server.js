const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "dist");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

const server = http.createServer((req, res) => {
  // Normalize url path
  let filePath = path.join(PUBLIC_DIR, req.url === "/" ? "index.html" : req.url);

  // Safe path check to prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        // Fallback to index.html for client-side routing
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (errIndex, dataIndex) => {
          if (errIndex) {
            res.statusCode = 500;
            res.end("Internal Server Error: index.html not found. Please ensure the project build is run.");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(dataIndex);
          }
        });
      } else {
        res.statusCode = 500;
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Production web server running at http://0.0.0.0:${PORT}/`);
});
