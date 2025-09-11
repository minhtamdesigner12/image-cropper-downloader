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

// ----------------------------
// Cookie file (optional)
// ----------------------------
const cookiesFile = path.join(__dirname, "cookies.txt");
const hasCookies = fs.existsSync(cookiesFile);

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

  if (hostname.includes("x.com") || hostname.includes("twitter.com")) referer = "https://x.com/";
  else if (hostname.includes("facebook.com")) referer = "https://www.facebook.com/";
  else if (hostname.includes("instagram.com")) referer = "https://www.instagram.com/";
  else if (hostname.includes("tiktok.com")) referer = "https://www.tiktok.com/";
  else if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return null; // skip YouTube

  return { referer, ua };
}

// ----------------------------
// Helper: short random ID
// ----------------------------
function shortId(len = 6) {
  return crypto.randomBytes(len).toString("base64url").substring(0, len);
}

// ----------------------------
// Auto-update yt-dlp on start
// ----------------------------
function updateYtDlp() {
  return new Promise((resolve, reject) => {
    console.log("⬆️ Updating yt-dlp to latest version...");
    const proc = spawn(ytdlpPath, ["-U"]);
    proc.stdout.on("data", (d) => console.log("yt-dlp:", d.toString().trim()));
    proc.stderr.on("data", (d) => console.error("yt-dlp err:", d.toString().trim()));
    proc.on("close", (code) => {
      if (code === 0) {
        console.log("✅ yt-dlp update complete");
        resolve();
      } else {
        reject(new Error("yt-dlp update failed with code " + code));
      }
    });
  });
}

// ----------------------------
// Download route
// ----------------------------
app.post("/api/download", async (req, res) => {
  let { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  console.log("📥 Raw request body:", req.body);

  // Normalize Facebook share links
  if (url.includes("facebook.com/share/")) {
    const shareMatch = url.match(/facebook\.com\/share\/[vr]\/([^/?&]+)/);
    if (shareMatch) url = `https://www.facebook.com/watch?v=${shareMatch[1]}`;
  }

  const platformOptions = getPlatformOptions(url);
  if (!platformOptions) {
    return res.status(403).json({ error: "YouTube downloads are skipped to avoid bot detection" });
  }

  // Check Facebook cookies
  if (url.includes("facebook.com") && !hasCookies) {
    return res.status(403).json({
      error: "Facebook downloads require cookies.txt for authentication",
    });
  }

  const { referer, ua } = platformOptions;
  console.log("🎬 Starting download for:", url);

  const tmpFileTemplate = path.join("/tmp", `tmp_${Date.now()}.%(ext)s`);
  let baseFileName = `freetlo.com-video`;
  let fileName = `${baseFileName}-${shortId()}.mp4`;

  // Step 1: Metadata
  try {
    const metaProc = spawn(ytdlpPath, [
      "--dump-json",
      "--no-playlist",
      "--user-agent",
      ua,
      "--referer",
      referer,
      ...(hasCookies ? ["--cookies", cookiesFile] : []),
      url,
    ]);

    let jsonOut = "";
    for await (const chunk of metaProc.stdout) jsonOut += chunk.toString();
    await new Promise((resolve) => metaProc.on("close", resolve));

    if (jsonOut) {
      const meta = JSON.parse(jsonOut);
      if (meta?.title) {
        baseFileName =
          "freetlo.com-" +
          meta.title.replace(/[^a-z0-9_\-]+/gi, "_").substring(0, 80);
        fileName = `${baseFileName}-${shortId()}.mp4`;
        console.log("✅ Metadata fetch success, filename:", fileName);
      }
    }
  } catch {
    console.warn("⚠️ Metadata fetch failed, using default filename:", fileName);
  }

  // Step 2: Download
  const args = [
    "-f", "b[ext=mp4]",
    "--merge-output-format", "mp4",
    "--no-playlist",
    "--ffmpeg-location", path.join(ffmpegPath, "ffmpeg"),
    "--no-check-certificate",
    "--rm-cache-dir",
    "--user-agent", ua,
    "--referer", referer,
    ...(hasCookies ? ["--cookies", cookiesFile] : []),
    url,
    "-o", tmpFileTemplate,
  ];

  console.log("📥 Running yt-dlp:", ytdlpPath, args.join(" "));

  const proc = spawn(ytdlpPath, args);
  proc.stdout.on("data", (d) => console.log("▶ yt-dlp:", d.toString().trim()));
  proc.stderr.on("data", (d) => console.error("⚠️ yt-dlp:", d.toString().trim()));

  proc.on("close", (code) => {
    if (code !== 0) {
      console.error("❌ yt-dlp exited with code:", code);
      if (!res.headersSent) return res.status(500).json({ error: "yt-dlp failed: Video file not created" });
      return;
    }

    const files = fs.readdirSync("/tmp");
    const base = path.basename(tmpFileTemplate).split(".")[0];
    const outputFile = files.find((f) => f.startsWith(base));
    if (!outputFile) {
      if (!res.headersSent) return res.status(500).json({ error: "Video file not created" });
      return;
    }

    const finalFile = path.join("/tmp", outputFile);
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader("Content-Type", "video/mp4");

    const filestream = fs.createReadStream(finalFile);
    filestream.pipe(res);
    filestream.on("end", () => fs.unlink(finalFile, () => {}));
  });
});

// ----------------------------
// yt-dlp version check
// ----------------------------
app.get("/yt-dlp-version", (_, res) => {
  const proc = spawn(ytdlpPath, ["--version"]);
  let out = "";
  proc.stdout.on("data", (d) => (out += d.toString()));
  proc.on("close", () => res.send(out));
});

// ----------------------------
// Cleanup job (every hour)
// ----------------------------
setInterval(() => {
  try {
    const files = fs.readdirSync("/tmp");
    for (const f of files) {
      if (f.startsWith("tmp_") && f.endsWith(".mp4")) {
        fs.unlink(path.join("/tmp", f), () => console.log("🧹 Cleaned up leftover:", f));
      }
    }
  } catch (err) {
    console.error("⚠️ Cleanup job error:", err);
  }
}, 60 * 60 * 1000); // every 1 hour

// ----------------------------
// Start server
// ----------------------------
async function safeUpdateYtDlp() {
  if (process.env.NODE_ENV === "production") {
    console.log("⚠️ Skipping yt-dlp auto-update in production");
    return;
  }

  try {
    console.log("⬆️ Updating yt-dlp to latest version...");
    const proc = spawn(ytdlpPath, ["-U"]);
    proc.stdout.on("data", (d) => console.log("yt-dlp:", d.toString().trim()));
    proc.stderr.on("data", (d) => console.error("yt-dlp err:", d.toString().trim()));
    await new Promise((resolve, reject) => {
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error("yt-dlp update failed with code " + code));
      });
    });
    console.log("✅ yt-dlp update complete");
  } catch (err) {
    console.warn("⚠️ yt-dlp update skipped:", err.message);
  }
}

safeUpdateYtDlp().finally(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log("🎯 Using yt-dlp binary:", ytdlpPath);
    console.log("🎯 Using ffmpeg binary:", ffmpegPath);
    if (hasCookies) console.log("🍪 Using cookies file:", cookiesFile);
    else console.log("⚠️ No cookies file found, Facebook may fail");
  });
});

