// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const YtDlpWrap = require("yt-dlp-wrap").default;
const urlModule = require("url");

const app = express();
const PORT = process.env.PORT || 8080;

const ffmpegPath = path.join(__dirname, "ffmpeg-bin");
const ytdlpPath = path.join(__dirname, "yt-dlp");

if (!fs.existsSync(ffmpegPath)) {
  console.error("❌ ffmpeg binary not found:", ffmpegPath);
  process.exit(1);
}
if (!fs.existsSync(ytdlpPath)) {
  console.error("❌ yt-dlp binary not found:", ytdlpPath);
  process.exit(1);
}

const ytdlp = new YtDlpWrap(ytdlpPath);

app.use(
  cors({
    origin: ["https://freetlo.com", "http://localhost:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.options("*", cors());

app.get("/ping", (_, res) => res.json({ status: "ok", message: "pong" }));

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

app.post("/api/download", async (req, res) => {
  let { url } = req.body;
  console.log("📥 Raw request body:", req.body);
  if (!url) return res.status(400).json({ error: "No URL provided" });

  if (url.includes("facebook.com/share/r/")) {
    console.log("🔗 Normalizing Facebook share link:", url);
    const shareMatch = url.match(/facebook\.com\/share\/r\/([^/?]+)/);
    if (shareMatch) url = `https://www.facebook.com/watch?v=${shareMatch[1]}`;
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

  const tmpFilePath = path.join("/tmp", `tmp_${Date.now()}.mp4`);
  let fileName = `video_${Date.now()}.mp4`;

  // --- Metadata ---
  try {
    console.log("⚡ Fetching metadata with yt-dlp...");
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
    console.log("✅ Metadata fetch success, filename:", fileName);
  } catch (metaErr) {
    console.warn("⚠️ Metadata fetch failed, using default filename", metaErr);
  }

  // --- Download function ---
  async function tryDownload(useGeneric = false) {
    const args = [
      "-f", "bestvideo+bestaudio/best",
      "--merge-output-format", "mp4",
      "--no-playlist",
      "--ffmpeg-location", ffmpegPath,
      "--no-check-certificate",
      "--rm-cache-dir",
      "--user-agent", ua,
      "--referer", referer,
      "-o", tmpFilePath,
      url,
    ];
    if (useGeneric) {
      args.splice(6, 0, "--force-generic-extractor"); // insert before UA
      console.log("🔄 Retrying with --force-generic-extractor");
    }
    console.log("📥 yt-dlp args:", args);
    await ytdlp.exec(args);
  }

  try {
    // first attempt
    await tryDownload(false);

    if (!fs.existsSync(tmpFilePath)) {
      console.error("❌ File not created:", tmpFilePath);
      throw new Error("File missing after yt-dlp");
    }

    res.download(tmpFilePath, fileName, (err) => {
      if (err) console.error("❌ Error sending file:", err);
      fs.unlink(tmpFilePath, () => {});
    });
  } catch (err1) {
    console.error("❌ First attempt failed:", err1);
    if (err1?.stderr) console.error("STDERR:", err1.stderr.toString());

    try {
      // fallback with generic extractor
      await tryDownload(true);
      if (!fs.existsSync(tmpFilePath)) {
        console.error("❌ Fallback file not created:", tmpFilePath);
        throw new Error("File missing after fallback");
      }
      res.download(tmpFilePath, fileName, (err) => {
        if (err) console.error("❌ Error sending file:", err);
        fs.unlink(tmpFilePath, () => {});
      });
    } catch (err2) {
      console.error("❌ Fallback also failed:", err2);
      if (err2?.stderr) console.error("STDERR:", err2.stderr.toString());

      if (!res.headersSent) {
        res.status(500).json({
          error: "yt-dlp failed on both normal and generic extractor: " + (err2.stderr || err2.message),
        });
      }
    }
  }

  req.on("close", () => {
    console.log("⚡ Client disconnected — cleaning temp file");
    try { fs.unlink(tmpFilePath, () => {}); } catch {}
  });
});

app.get("/yt-dlp-version", (_, res) => {
  const { exec } = require("child_process");
  exec("./backend/yt-dlp --version", (err, stdout, stderr) => {
    if (err) return res.status(500).send(stderr);
    res.send(stdout);
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🎯 Using yt-dlp binary: ${ytdlpPath}`);
  console.log(`🎯 Using ffmpeg binary: ${ffmpegPath}`);
});
