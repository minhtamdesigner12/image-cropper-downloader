// backend/server.js
// ----------------------------
// Simple streaming backend for yt-dlp (yt-dlp-wrap v2.x)
// ----------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const YtDlpWrap = require("yt-dlp-wrap").default;

const app = express();
const PORT = process.env.PORT || 8080;

// ----------------------------
// Setup yt-dlp binary
// ----------------------------
// Postinstall saves binary into backend/yt-dlp
const binaryPath = path.join(__dirname, "yt-dlp");
const ytdlp = new YtDlpWrap(binaryPath);

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

  console.log("▶️ Starting download for:", url);

  const fileName = `video_${Date.now()}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    // yt-dlp-wrap v2.x: execStream returns a readable stream
    const args = ["-f", "mp4/best", "-o", "-", "--no-playlist", url];
    console.log("▶️ yt-dlp args:", args.join(" "));

    const stream = ytdlp.execStream(args);

    // ✅ Pipe stream → response
    stream.pipe(res);

    // Debug yt-dlp events
    stream.on("ytDlpEvent", (type, data) => {
      const msg = data?.toString?.().trim();
      if (msg) console.log(`[yt-dlp ${type}] ${msg}`);
    });

    // When yt-dlp exits
    stream.on("close", (code) => {
      console.log("✅ yt-dlp closed with code:", code);
      if (!res.finished) res.end();
    });

    // Handle errors
    stream.on("error", (err) => {
      console.error("❌ yt-dlp stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "yt-dlp failed: " + err.message });
      } else {
        try { res.end(); } catch {}
      }
    });

    // Client disconnect
    req.on("close", () => {
      console.log("⚠️ Client disconnected — stopping yt-dlp");
      try { stream.destroy(); } catch {}
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
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
