// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const YtDlpWrap = require("yt-dlp-wrap").default;
const urlModule = require("url");
const crypto = require("crypto");

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
// yt-dlp static binary path
// ----------------------------
const ytdlpPath = path.join(__dirname, "yt-dlp"); // ✅ static binary
if (!fs.existsSync(ytdlpPath)) {
  console.error("❌ yt-dlp binary not found:", ytdlpPath);
  process.exit(1);
}
const ytdlp = new YtDlpWrap(ytdlpPath);

// ----------------------------
// Cookie file (optional)
// ----------------------------
const cookiesFile = path.join(__dirname, "cookies.txt");

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
// Helper: short random ID
// ----------------------------
function shortId(len = 6) {
  return crypto.randomBytes(len).toString("base64url").substring(0, len);
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
    const shareMatch = url.match(/facebook\.com\/share\/r\/([^/?&]+)/);
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

  // default filename with random ID
  let baseFileName = `freetlo.com-video`;
  let fileName = `${baseFileName}-${shortId()}.mp4`;

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
      ...(fs.existsSync(cookiesFile) ? ["--cookies", cookiesFile] : []),
      url,
    ]);
    const meta = JSON.parse(jsonOut);
    if (meta?.title) {
      baseFileName =
        "freetlo.com-" +
        meta.title.replace(/[^a-z0-9_\-]+/gi, "_").substring(0, 80);
      fileName = `${baseFileName}-${shortId()}.mp4`;
      console.log("✅ Metadata fetch success, filename:", fileName);
    }
  } catch (metaErr) {
    console.warn("⚠️ Metadata fetch failed, using default filename:", fileName);
  }

  // Step 2: Download
  async function downloadVideo(url, ua, referer, tmpFileTemplate) {
    const argsBase = [
      "--no-playlist",
      "--ffmpeg-location", path.join(ffmpegPath, "ffmpeg"),
      "--no-check-certificate",
      "--rm-cache-dir",
      "--user-agent", ua,
      "--referer", referer,
      ...(fs.existsSync(cookiesFile) ? ["--cookies", cookiesFile] : []),
      url,
      "-o", tmpFileTemplate,
    ];

    const argsList = [
      [
        "-f", "bv*[vcodec^=avc1]+ba*[acodec^=mp4a]/b[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "--recode-video", "mp4",
        ...argsBase,
      ],
      [
        "-f", "b[ext=mp4]",
        "--recode-video", "mp4",
        ...argsBase,
      ],
    ];

    for (const args of argsList) {
      try {
        console.log("📥 Trying yt-dlp args:", args.join(" "));
        const { stdout, stderr } = await ytdlp.execPromise(args);
        if (stdout) console.log("▶ yt-dlp stdout:", stdout.toString());
        if (stderr) console.log("⚠️ yt-dlp stderr:", stderr.toString());

        // Check if file created
        const files = fs.readdirSync("/tmp");
        console.log("📂 /tmp content after run:", files);

        const base = path.basename(tmpFileTemplate).split(".")[0];
        const outputFile = files.find((f) => f.startsWith(base));
        if (outputFile) {
          console.log("✅ Found output file:", outputFile);
          return path.join("/tmp", outputFile);
        }
      } catch (err) {
        console.error("❌ yt-dlp exec failed:", err);
      }
    }

    throw new Error("Video file not created");
  }

  try {
    const finalFile = await downloadVideo(url, ua, referer, tmpFileTemplate);
    if (!finalFile) {
      console.error("❌ No final file created");
      return res.status(500).json({ error: "Video file not created" });
    }

    // ✅ Always send with prefixed + random filename
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
// yt-dlp version check
// ----------------------------
app.get("/yt-dlp-version", (_, res) => {
  const { exec } = require("child_process");
  exec(`${ytdlpPath} --version`, (err, stdout, stderr) => {
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
  if (fs.existsSync(cookiesFile)) {
    console.log("🍪 Using cookies file:", cookiesFile);
  } else {
    console.log("⚠️ No cookies file found, continuing without authentication");
  }
});
