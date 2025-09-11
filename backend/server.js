import express from "express";
import fs from "fs";
import path from "path";
import { spawn, execSync } from "child_process";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.resolve();

// 🔄 Auto-update yt-dlp to latest version on startup
try {
  console.log("🔄 Updating yt-dlp to latest version...");
  execSync(path.join(__dirname, "backend/yt-dlp") + " -U", { stdio: "inherit" });
} catch (err) {
  console.error("⚠️ Failed to update yt-dlp:", err.message);
}

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

const TMP_DIR = "/tmp";
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Helper: random filename
function randomFileName(prefix, ext) {
  const random = crypto.randomBytes(6).toString("base64url");
  return `${prefix}-${random}.${ext}`;
}

// Normalize FB share links
function normalizeFacebookUrl(url) {
  if (url.includes("/share/")) {
    const match = url.match(/\/share\/(?:v\/)?([A-Za-z0-9]+)/);
    if (match && match[1]) {
      return `https://www.facebook.com/watch?v=${match[1]}`;
    }
  }
  return url;
}

// Main download route
app.post("/api/download", async (req, res) => {
  const { url } = req.body;
  console.log("📥 Raw request body:", req.body);

  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  const normalizedUrl = normalizeFacebookUrl(url);
  console.log("🔗 Normalizing Facebook share link:", normalizedUrl);

  const extractedUrl = normalizedUrl;
  console.log("📥 Extracted URL:", extractedUrl);

  const outputFile = path.join(
    TMP_DIR,
    `tmp_${Date.now()}.%(ext)s`
  );

  console.log("🎬 Starting download for:", extractedUrl);

  const ytDlpArgs = [
    "-f",
    "b[ext=mp4]",
    "--merge-output-format",
    "mp4",
    "--no-playlist",
    "--ffmpeg-location",
    path.join(__dirname, "backend/ffmpeg-bin/ffmpeg"),
    "--no-check-certificate",
    "--rm-cache-dir",
    "--user-agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "--referer",
    "https://www.facebook.com/",
    "--cookies",
    path.join(__dirname, "backend/cookies.txt"),
    extractedUrl,
    "-o",
    outputFile,
  ];

  console.log("📥 Running yt-dlp:", path.join(__dirname, "backend/yt-dlp"), ytDlpArgs.join(" "));

  const ytProcess = spawn(path.join(__dirname, "backend/yt-dlp"), ytDlpArgs);

  let stderr = "";
  ytProcess.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  ytProcess.on("close", (code) => {
    console.log("▶ yt-dlp exited with code:", code);
    if (stderr) console.log("⚠️ yt-dlp stderr:", stderr);

    if (code !== 0) {
      return res.status(500).json({ error: "yt-dlp failed: Video file not created" });
    }

    const finalFile = outputFile.replace("%(ext)s", "mp4");

    if (!fs.existsSync(finalFile)) {
      console.error("❌ Video file not created");
      return res.status(500).json({ error: "yt-dlp failed: Video file not created" });
    }

    const downloadName = randomFileName("freetlo.com-video", "mp4");
    res.download(finalFile, downloadName, (err) => {
      if (err) {
        console.error("❌ Download error:", err);
      }
      fs.unlink(finalFile, () => {});
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
