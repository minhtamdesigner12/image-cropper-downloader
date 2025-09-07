// backend/server.js
// ----------------------------
// Simple streaming backend for yt-dlp (yt-dlp-wrap v2.x)
// ----------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const YtDlpWrap = require("yt-dlp-wrap").default;

// ----------------------------
// Setup yt-dlp + ffmpeg paths
// ----------------------------
const binaryPath = path.join(__dirname, "..", "yt-dlp");
const ytdlp = new YtDlpWrap(binaryPath);

// Ensure PATH includes project root (so ffmpeg works if installed locally)
process.env.PATH = __dirname + path.delimiter + process.env.PATH;

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
    console.warn("❌ No URL provided");
    return res.status(400).json({ error: "No URL provided" });
  }

  console.log("▶️ Starting download for:", url);

  const fileName = `video_${Date.now()}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    // yt-dlp args
    const args = [
      "-f", "bestvideo+bestaudio/best",
      "--merge-output-format", "mp4",
      "-o", "-",
      "--no-playlist",
      "--verbose",
      url,
    ];

    console.log("▶️ yt-dlp binary:", binaryPath);
    console.log("▶️ yt-dlp args:", args.join(" "));

    // execStream() returns a Readable stream directly
    const stream = ytdlp.execStream(args);

    // Debug: count chunks
    let totalBytes = 0;

    stream.on("data", (chunk) => {
      totalBytes += chunk.length;
      console.log(`[yt-dlp data] ${chunk.length} bytes (total ${totalBytes})`);
    });

    stream.on("error", (err) => {
      console.error("❌ yt-dlp error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "yt-dlp failed: " + err.message });
      } else {
        try { res.end(); } catch {}
      }
    });

    stream.on("end", () => {
      console.log(`✅ yt-dlp stream ended, total ${totalBytes} bytes`);
      if (!res.finished) res.end();
    });

    // Pipe video to client
    stream.pipe(res);

    // Kill stream if client disconnects
    req.on("close", () => {
      console.log("⚠️ Client disconnected — killing yt-dlp stream");
      try { stream.destroy(); } catch {}
    });
  } catch (err) {
    console.error("❌ Download failed (catch):", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Download failed: " + (err && err.message ? err.message : err),
      });
    }
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
