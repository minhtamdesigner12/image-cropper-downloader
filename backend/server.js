// backend/server.js
// ----------------------------
// Express backend for yt-dlp streaming using yt-dlp_linux
// Supports authenticated downloads via cookies.txt
// ----------------------------

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const YtDlpWrap = require("yt-dlp-wrap").default;

const app = express();
const PORT = process.env.PORT || 8080;

// ----------------------------
// Path to yt-dlp binary
// ----------------------------
const binaryPath = path.join(__dirname, "..", "yt-dlp_linux"); // should exist and be executable
if (!fs.existsSync(binaryPath)) {
  console.error("❌ yt-dlp binary not found:", binaryPath);
  process.exit(1);
}
const ytdlp = new YtDlpWrap(binaryPath);

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
app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  console.log("🎬 Starting download for:", url);

  // Temp file path
  const tmpFilePath = path.join("/tmp", `tmp_${Date.now()}.mp4`);

  // Cookies (optional for YouTube/X)
  const cookiesPath = path.join(__dirname, "cookies.txt");
  const useCookies = fs.existsSync(cookiesPath);

  // yt-dlp arguments
  const args = ["-f", "mp4/best", "--no-playlist", url, "-o", tmpFilePath];
  if (useCookies) {
    args.push("--cookies", cookiesPath);
    console.log("🍪 Using cookies from:", cookiesPath);
  }

  try {
    // Download video
    await ytdlp.exec(args);

    if (!fs.existsSync(tmpFilePath)) {
      console.error("❌ Video file not created:", tmpFilePath);
      return res.status(500).json({ error: "Video download failed: file not created" });
    }

    // Send file
    res.download(tmpFilePath, `video_${Date.now()}.mp4`, (err) => {
      if (err) console.error("❌ Error sending file:", err);
      fs.unlink(tmpFilePath, () => {}); // delete temp file
    });
  } catch (err) {
    console.error("❌ Download failed:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "yt-dlp failed: " + err.message });
    }
  }

  // Cleanup on client disconnect
  req.on("close", () => {
    console.log("⚡ Client disconnected — cleaning temp file");
    try { fs.unlink(tmpFilePath, () => {}); } catch {}
  });
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
