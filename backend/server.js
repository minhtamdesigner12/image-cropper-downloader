// backend/server.js
// ----------------------------
// Simple streaming backend for yt-dlp (yt-dlp-wrap v2.x)
// ----------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const YtDlpWrap = require("yt-dlp-wrap").default;

// ----------------------------
// Binary setup
// ----------------------------
const binaryPath = path.join(__dirname, "yt-dlp");
console.log("🔍 Using yt-dlp binaryPath:", binaryPath);

// Check if yt-dlp binary exists
if (fs.existsSync(binaryPath)) {
  console.log("✅ yt-dlp binary exists");
} else {
  console.warn("❌ yt-dlp binary not found at:", binaryPath);
}

// Init wrapper with explicit binary path
const ytdlp = new YtDlpWrap(binaryPath);

// Ensure PATH includes backend folder (so ffmpeg / yt-dlp work)
process.env.PATH = (process.env.PATH || "") + path.delimiter + __dirname;

// ----------------------------
// App
// ----------------------------
const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: ["https://freetlo.com", "http://localhost:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.options("*", cors());

// ----------------------------
// Health check
// ----------------------------
app.get("/ping", (_, res) => res.json({ status: "ok", message: "pong" }));

// ----------------------------
// Download route
// ----------------------------
app.post("/download", (req, res) => {
  const { url } = req.body;
  if (!url) {
    console.warn("❌ No URL provided");
    return res.status(400).json({ error: "No URL provided" });
  }

  console.log("▶️ Starting download for:", url);

  const fileName = `video_${Date.now()}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    const args = ["-f", "mp4/best", "-o", "-", "--no-playlist", url];
    console.log("▶️ yt-dlp args:", args.join(" "));

    const stream = ytdlp.execStream(args);

    if (!stream || typeof stream.pipe !== "function") {
      console.error("❌ yt-dlp did not return a valid stream");
      return res
        .status(500)
        .json({ error: "yt-dlp did not return a valid stream" });
    }

    // Pipe stream → client
    stream.pipe(res);

    // yt-dlp events
    stream.on("ytDlpEvent", (type, data) => {
      const msg = data?.toString?.().trim();
      if (msg) console.log("[yt-dlp]", type, msg);
    });

    // Debug: capture stderr as well
    stream.on("stderr", (chunk) => {
      console.error("[yt-dlp stderr]", chunk.toString());
    });

    // Process closed
    stream.on("close", (code) => {
      console.log("✅ yt-dlp exited with code:", code);
      if (!res.finished) res.end();
    });

    // Error handling
    stream.on("error", (err) => {
      console.error("❌ yt-dlp error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "yt-dlp failed: " + err.message });
      } else {
        try {
          res.end();
        } catch {}
      }
    });

    // Client disconnects
    req.on("close", () => {
      console.log("⚠️ Client disconnected — stopping yt-dlp");
      try {
        stream.destroy();
      } catch {}
    });
  } catch (err) {
    console.error("❌ Download failed (catch):", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Download failed: " + (err?.message || err),
      });
    }
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
