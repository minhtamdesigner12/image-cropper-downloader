// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const YtDlpWrap = require("yt-dlp-wrap").default;

const app = express();
const PORT = process.env.PORT || 8080;

// ----------------------------
// Cross-platform ffmpeg path
// ----------------------------
const ffmpegPath = process.platform === "darwin"
  ? "/opt/homebrew/bin/ffmpeg" // macOS local testing
  : path.join(__dirname, "..", "ffmpeg"); // Railway Linux

// ----------------------------
// Path to yt-dlp binary
// ----------------------------
const ytdlpPath = path.join(__dirname, "..", "yt-dlp_linux");
if (!fs.existsSync(ytdlpPath)) {
  console.error("❌ yt-dlp binary not found:", ytdlpPath);
  process.exit(1);
}
if (!fs.existsSync(ffmpegPath)) {
  console.error("❌ ffmpeg binary not found:", ffmpegPath);
  process.exit(1);
}

const ytdlp = new YtDlpWrap(ytdlpPath);

// ----------------------------
// Middleware
// ----------------------------
app.use(cors({
  origin: ["https://freetlo.com", "http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
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

  const tmpFilePath = path.join("/tmp", `tmp_${Date.now()}.mp4`);
  const cookiesPath = path.join(__dirname, "cookies.txt");
  const useCookies = fs.existsSync(cookiesPath);

  const args = [
    "-f", "mp4/best",
    "--no-playlist",
    "--ffmpeg-location", ffmpegPath,
    "--no-check-certificate",
    "--rm-cache-dir",
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "--referer", "https://freetlo.com/",
    url,
    "-o", tmpFilePath
  ];

  if (useCookies) {
    args.push("--cookies", cookiesPath);
    console.log("🍪 Using cookies from:", cookiesPath);
  }

  try {
    await ytdlp.exec(args);

    if (!fs.existsSync(tmpFilePath)) {
      return res.status(500).json({ error: "Video file was not created. Possibly blocked by YouTube." });
    }

    res.download(tmpFilePath, `video_${Date.now()}.mp4`, (err) => {
      if (err) console.error("❌ Error sending file:", err);
      fs.unlink(tmpFilePath, () => {});
    });
  } catch (err) {
    console.error("❌ Download failed:", err.stderr || err.message || err);

    // Detect YouTube bot block
    const botBlock = err.stderr?.includes("Sign in to confirm you’re not a bot") || err.stderr?.includes("403") || err.message?.includes("403");

    if (!res.headersSent) {
      if (botBlock) {
        res.status(403).json({
          error: "YouTube blocked the download. Try using cookies or a proxy to bypass bot detection.",
        });
      } else {
        res.status(500).json({
          error: "yt-dlp failed: " + (err.stderr || err.message || "Unknown error"),
        });
      }
    }
    try { fs.unlink(tmpFilePath, () => {}); } catch {}
  }

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
