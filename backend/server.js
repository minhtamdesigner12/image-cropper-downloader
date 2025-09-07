// backend/server.js
// ----------------------------
// Express backend for yt-dlp streaming (using standalone binary)
// ----------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const YtDlpWrap = require("yt-dlp-wrap").default;

// ----------------------------
// Setup yt-dlp binary path
// ----------------------------
// We install yt-dlp_linux into project root during postinstall
const binaryPath = path.join(__dirname, "..", "yt-dlp");
const ytdlp = new YtDlpWrap(binaryPath);

const app = express();
const PORT = process.env.PORT || 8080;

// ----------------------------
// Middleware
// ----------------------------
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
    console.warn("⚠️ No URL provided");
    return res.status(400).json({ error: "No URL provided" });
  }

  console.log("🎬 Starting download for:", url);

  const fileName = `video_${Date.now()}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    // ✅ Force yt-dlp to stream video → stdout
    const args = ["-f", "mp4/best", "-o", "-", "--no-playlist", url];
    console.log("▶️ yt-dlp args:", args.join(" "));

    const stream = ytdlp.execStream(args);

    if (!stream || !stream.pipe) {
      console.error("❌ execStream did not return a valid stream");
      return res.status(500).json({ error: "yt-dlp failed to start" });
    }

    // Pipe video stream to client
    stream.pipe(res);

    // yt-dlp emits internal events/logs
    stream.on("ytDlpEvent", (type, data) => {
      const msg = data?.toString?.().trim();
      if (msg) console.log(`[yt-dlp:${type}]`, msg);
    });

    // Debug stderr logs
    stream.on("stderr", (chunk) => {
      console.error("🐛 yt-dlp stderr:", chunk.toString());
    });

    // Debug stdout logs (small chunks only)
    stream.on("stdout", (chunk) => {
      console.log("📥 yt-dlp stdout chunk:", chunk.length, "bytes");
    });

    // Process closed
    stream.on("close", (code) => {
      console.log("✅ yt-dlp exited with code:", code);
      if (!res.finished) res.end();
    });

    // Error handling
    stream.on("error", (err) => {
      console.error("❌ yt-dlp stream error:", err);
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
      console.log("⚡ Client disconnected — stopping yt-dlp");
      try {
        stream.destroy();
      } catch {}
    });
  } catch (err) {
    console.error("💥 Download failed (catch):", err);
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
app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
