// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const urlModule = require("url");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 8080;

// ----------------------------
// ffmpeg & yt-dlp paths
// ----------------------------
const ffmpegPath = path.join(__dirname, "ffmpeg-bin/ffmpeg");
const ytdlpPath = path.join(__dirname, "yt-dlp");

if (!fs.existsSync(ffmpegPath)) {
  console.error("❌ ffmpeg binary not found:", ffmpegPath);
  process.exit(1);
}
if (!fs.existsSync(ytdlpPath)) {
  console.error("❌ yt-dlp binary not found:", ytdlpPath);
  process.exit(1);
}

const cookiesFile = path.join(__dirname, "cookies.txt");

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
// Helpers
// ----------------------------
function getPlatformOptions(url) {
  const hostname = urlModule.parse(url).hostname || "";
  let referer = "";
  let ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  if (hostname.includes("facebook.com")) referer = "https://www.facebook.com/";
  else if (hostname.includes("instagram.com"))
    referer = "https://www.instagram.com/";
  else if (hostname.includes("tiktok.com")) referer = "https://www.tiktok.com/";
  else if (hostname.includes("x.com") || hostname.includes("twitter.com"))
    referer = "https://x.com/";
  else if (hostname.includes("youtube.com") || hostname.includes("youtu.be"))
    return null;

  return { referer, ua };
}

function shortId(len = 6) {
  return crypto.randomBytes(len).toString("base64url").substring(0, len);
}

// ----------------------------
// Normalize Facebook share links
// ----------------------------
function normalizeFacebookUrl(url) {
  if (url.includes("facebook.com/share/")) {
    console.log("🔗 Normalizing Facebook share link:", url);
    const vidMatch = url.match(/\/share\/[a-z]\/([^/?&]+)/i);
    if (vidMatch) {
      return `https://www.facebook.com/watch?v=${vidMatch[1]}`;
    }
  }
  return url;
}

// ----------------------------
// Download route
// ----------------------------
app.post("/api/download", async (req, res) => {
  let { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  console.log("📥 Raw request body:", req.body);
  url = normalizeFacebookUrl(url);
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
  let fileName = `freetlo.com-video-${shortId()}.mp4`;

  async function downloadVideo() {
    return new Promise((resolve, reject) => {
      const args = [
        "-f",
        "b[ext=mp4]",
        "--merge-output-format",
        "mp4",
        "--no-playlist",
        "--ffmpeg-location",
        ffmpegPath,
        "--no-check-certificate",
        "--rm-cache-dir",
        "--user-agent",
        ua,
        "--referer",
        referer,
        ...(fs.existsSync(cookiesFile) ? ["--cookies", cookiesFile] : []),
        url,
        "-o",
        tmpFileTemplate,
      ];

      console.log("📥 Running yt-dlp:", [ytdlpPath, ...args].join(" "));

      const proc = spawn(ytdlpPath, args);

      let stderr = "";
      let stdout = "";

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        console.log("▶ yt-dlp exited with code:", code);
        if (stdout) console.log("▶ yt-dlp stdout:", stdout);
        if (stderr) console.error("⚠️ yt-dlp stderr:", stderr);

        const files = fs.readdirSync("/tmp");
        console.log("📂 /tmp content:", files);

        const base = path.basename(tmpFileTemplate).split(".")[0];
        const outputFile = files.find((f) => f.startsWith(base));
        if (outputFile) {
          console.log("✅ Found output file:", outputFile);
          resolve(path.join("/tmp", outputFile));
        } else {
          reject(new Error("Video file not created"));
        }
      });
    });
  }

  try {
    const finalFile = await downloadVideo();
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`
    );
    res.setHeader("Content-Type", "video/mp4");

    const filestream = fs.createReadStream(finalFile);
    filestream.pipe(res);

    filestream.on("end", () => {
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
// Start server
// ----------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log("🎯 Using yt-dlp binary:", ytdlpPath);
  console.log("🎯 Using ffmpeg binary:", ffmpegPath);
  if (fs.existsSync(cookiesFile)) {
    console.log("🍪 Using cookies file:", cookiesFile);
  } else {
    console.log("⚠️ No cookies file found, continuing without authentication");
  }
});
