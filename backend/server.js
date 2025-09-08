// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const YtDlpWrap = require("yt-dlp-wrap").default;
const urlModule = require("url");

const app = express();
const PORT = process.env.PORT || 8080;

// ----------------------------
// ffmpeg binary path (downloaded in postinstall)
// ----------------------------
const ffmpegPath = path.join(__dirname, "ffmpeg-bin");
if (!fs.existsSync(ffmpegPath)) {
  console.error("❌ ffmpeg binary not found:", ffmpegPath);
  process.exit(1);
}

// ----------------------------
// yt-dlp binary path (downloaded in postinstall)
// ----------------------------
const ytdlpPath = path.join(__dirname, "yt-dlp");
if (!fs.existsSync(ytdlpPath)) {
  console.error("❌ yt-dlp binary not found:", ytdlpPath);
  process.exit(1);
}

const ytdlp = new YtDlpWrap(ytdlpPath);

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
// Helper: detect platform & set headers
// ----------------------------
function getPlatformOptions(url) {
  const hostname = urlModule.parse(url).hostname || "";
  let referer = "";
  let ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  if (hostname.includes("x.com") || hostname.includes("twitter.com"))
    referer = "https://x.com/";
  else if (hostname.includes("facebook.com"))
    referer = "https://www.facebook.com/";
  else if (hostname.includes("instagram.com"))
    referer = "https://www.instagram.com/";
  else if (hostname.includes("tiktok.com"))
    referer = "https://www.tiktok.com/";
  else if (hostname.includes("youtube.com") || hostname.includes("youtu.be"))
    return null;

  return { referer, ua };
}

// ----------------------------
// Download route
// ----------------------------
app.post("/api/download", async (req, res) => {
  let { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  // 🔗 Normalize Facebook share links
  if (url.includes("facebook.com/share/r/")) {
    console.log("🔗 Normalizing Facebook share link:", url);
    url = url.replace("facebook.com/share/r/", "facebook.com/watch/?v=");
  }

  const platformOptions = getPlatformOptions(url);
  if (!platformOptions) {
    return res
      .status(403)
      .json({ error: "YouTube downloads are skipped to avoid bot detection" });
  }

  const { referer, ua } = platformOptions;
  console.log("🎬 Starting download for:", url);

  const tmpFilePath = path.join("/tmp", `tmp_${Date.now()}.mp4`);
  let fileName = `video_${Date.now()}.mp4`;

  // Step 1: Try to get metadata
  try {
    const jsonOut = await ytdlp.execPromise([
      "--dump-json",
      "--no-playlist",
      "--user-agent",
      ua,
      "--referer",
      referer,
      url,
    ]);
    const meta = JSON.parse(jsonOut);
    if (meta?.title) {
      fileName =
        meta.title.replace(/[^a-z0-9_\-]+/gi, "_").substring(0, 80) + ".mp4";
    }
  } catch (metaErr) {
    console.warn("⚠️ Metadata fetch failed, continuing with default filename");
  }

  // Step 2: Download video
  const args = [
    "-f",
    "mp4/best",
    "--no-playlist",
    "--ffmpeg-location",
    ffmpegPath,
    "--no-check-certificate",
    "--rm-cache-dir",
    "--user-agent",
    ua,
    "--referer",
    referer,
    url,
    "-o",
    tmpFilePath,
  ];

  try {
    await ytdlp.exec(args);

    if (!fs.existsSync(tmpFilePath)) {
      return res.status(500).json({
        error: "Video file was not created. Possibly blocked by the platform.",
      });
    }

    res.download(tmpFilePath, fileName, (err) => {
      if (err) console.error("❌ Error sending file:", err);
      fs.unlink(tmpFilePath, () => {});
    });
  } catch (err) {
    console.error("❌ FULL download failed:", err);
    if (err?.stderr) console.error("STDERR:", err.stderr.toString());
    if (err?.stdout) console.error("STDOUT:", err.stdout.toString());

    const blocked =
      (err.stderr &&
        (err.stderr.includes("403") ||
          err.stderr.includes("Sign in to confirm you’re not a bot"))) ||
      (err.message && err.message.includes("403"));

    if (!res.headersSent) {
      res.status(blocked ? 403 : 500).json({
        error: blocked
          ? "Download blocked by platform. Try a public video."
          : "yt-dlp failed: " + (err.stderr || err.message || "Unknown error"),
      });
    }

    try {
      fs.unlink(tmpFilePath, () => {});
    } catch {}
  }

  req.on("close", () => {
    console.log("⚡ Client disconnected — cleaning temp file");
    try {
      fs.unlink(tmpFilePath, () => {});
    } catch {}
  });
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
