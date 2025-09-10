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
// ffmpeg binary path
// ----------------------------
const ffmpegPath = path.join(__dirname, "ffmpeg-bin");
if (!fs.existsSync(ffmpegPath)) {
  console.error("❌ ffmpeg binary not found:", ffmpegPath);
  process.exit(1);
}

// ----------------------------
// yt-dlp binary path
// ----------------------------
const ytdlpPath = path.join(__dirname, "yt-dlp");
if (!fs.existsSync(ytdlpPath)) {
  console.error("❌ yt-dlp binary not found:", ytdlpPath);
  process.exit(1);
}

const ytdlp = new YtDlpWrap(ytdlpPath);

// ----------------------------
// Middleware (CORS + JSON)
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
// Helper: detect platform
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

  console.log("📥 Raw request body:", req.body);

  // 🔗 Normalize Facebook share links
  if (url.includes("facebook.com/share/r/")) {
    console.log("🔗 Normalizing Facebook share link:", url);
    const shareMatch = url.match(/facebook\.com\/share\/r\/([^/?]+)/);
    if (shareMatch) {
      url = `https://www.facebook.com/watch?v=${shareMatch[1]}`;
    }
  }

  console.log("📥 Extracted URL:", url);

  const platformOptions = getPlatformOptions(url);
  if (!platformOptions) {
    return res
      .status(403)
      .json({ error: "YouTube downloads are skipped to avoid bot detection" });
  }

  const { referer, ua } = platformOptions;
  console.log("🎬 Starting download for:", url);

  const tmpFileTemplate = path.join("/tmp", `tmp_${Date.now()}.%(ext)s`);
  let fileName = `video_${Date.now()}.mp4`;

  // Step 1: Metadata
  console.log("⚡ Fetching metadata with yt-dlp...");
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
      console.log("✅ Metadata fetch success, filename:", fileName);
    }
  } catch (metaErr) {
    console.warn("⚠️ Metadata fetch failed, using default filename");
  }

  // Step 2: Download
  async function downloadVideo(url, ua, referer, tmpFileTemplate) {
    const argsList = [
      [
        "-f",
        "bestvideo+bestaudio/best",
        "--merge-output-format",
        "mp4",
        "--no-playlist",
        "--ffmpeg-location",
        path.join(ffmpegPath, "ffmpeg"),
        "--no-check-certificate",
        "--rm-cache-dir",
        "--user-agent",
        ua,
        "--referer",
        referer,
        url,
        "-o",
        tmpFileTemplate,
      ],
      [
        "-f",
        "mp4",
        "--no-playlist",
        "--ffmpeg-location",
        path.join(ffmpegPath, "ffmpeg"),
        "--no-check-certificate",
        "--rm-cache-dir",
        "--user-agent",
        ua,
        "--referer",
        referer,
        url,
        "-o",
        tmpFileTemplate,
      ],
    ];

    for (const args of argsList) {
      console.log("📥 Trying yt-dlp args:", args.join(" "));
      try {
        await ytdlp.exec(args);
        console.log("✅ yt-dlp finished with current args");
        const tmpDir = "/tmp";
        const files = fs.readdirSync(tmpDir).filter(f =>
          f.startsWith(path.basename(tmpFileTemplate).split(".")[0])
        );
        if (files.length > 0) {
          const finalFile = path.join(tmpDir, files[0]);
          console.log("✅ Found output file:", finalFile);
          return finalFile;
        }
      } catch (err) {
        console.warn("⚠️ yt-dlp failed with args:", args.join(" "));
        console.warn(err.stderr?.toString() || err.message);
      }
    }
    return null;
  }

  try {
    const finalFile = await downloadVideo(url, ua, referer, tmpFileTemplate);
    if (!finalFile) {
      console.error("❌ No final file created");
      return res.status(500).json({ error: "Video file not created" });
    }

    res.download(finalFile, fileName, (err) => {
      if (err) console.error("❌ Error sending file:", err);
      fs.unlink(finalFile, () => {});
    });
  } catch (err) {
    console.error("❌ FULL download failed:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "yt-dlp failed: " + (err.message || "Unknown error"),
      });
    }
  }
});

// ----------------------------
// yt-dlp version check
// ----------------------------
app.get("/yt-dlp-version", (_, res) => {
  const { exec } = require("child_process");
  exec(path.join(__dirname, "yt-dlp") + " --version", (err, stdout, stderr) => {
    if (err) return res.status(500).send(stderr);
    res.send(stdout);
  });
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log("🎯 Using yt-dlp binary:", ytdlpPath);
  console.log("🎯 Using ffmpeg binary:", ffmpegPath);
});
