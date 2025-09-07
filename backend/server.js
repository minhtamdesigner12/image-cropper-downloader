const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const YtDlpWrap = require("yt-dlp-wrap").default;
const urlModule = require("url");

const app = express();
const PORT = process.env.PORT || 8080;

// ----------------------------
// Cross-platform ffmpeg path
// ----------------------------
const ffmpegPath = process.platform === "darwin"
  ? "/opt/homebrew/bin/ffmpeg"
  : path.join(__dirname, "..", "ffmpeg");

// ----------------------------
// yt-dlp binary path
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
// Helper: detect platform and set options
// ----------------------------
function getPlatformOptions(url) {
  const hostname = urlModule.parse(url).hostname || "";
  let referer = "";
  let ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) {
    referer = "https://www.youtube.com/";
  } else if (hostname.includes("x.com") || hostname.includes("twitter.com")) {
    referer = "https://x.com/";
  } else if (hostname.includes("facebook.com")) {
    referer = "https://www.facebook.com/";
  } else if (hostname.includes("instagram.com")) {
    referer = "https://www.instagram.com/";
  } else if (hostname.includes("tiktok.com")) {
    referer = "https://www.tiktok.com/";
  }

  return { referer, ua };
}

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

  const { referer, ua } = getPlatformOptions(url);

  const args = [
    "-f", "mp4/best",
    "--no-playlist",
    "--ffmpeg-location", ffmpegPath,
    "--no-check-certificate",
    "--rm-cache-dir",
    "--user-agent", ua,
    "--referer", referer,
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
      return res.status(500).json({ error: "Video file was not created. Possibly blocked by the platform." });
    }

    res.download(tmpFilePath, `video_${Date.now()}.mp4`, (err) => {
      if (err) console.error("❌ Error sending file:", err);
      fs.unlink(tmpFilePath, () => {});
    });
  } catch (err) {
    console.error("❌ Download failed:", err.stderr || err.message || err);

    const botBlock = (err.stderr && (
      err.stderr.includes("Sign in to confirm you’re not a bot") ||
      err.stderr.includes("403")
    )) || (err.message && err.message.includes("403"));

    if (!res.headersSent) {
      if (botBlock) {
        res.status(403).json({
          error: "Download blocked by the platform. Try using cookies or a proxy to bypass bot detection.",
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
