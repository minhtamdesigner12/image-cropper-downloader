// backend/server.js
const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

const ytDlpPath = path.join(__dirname, "yt-dlp"); // binary downloaded in postinstall
const ffmpegPath = path.join(__dirname, "ffmpeg-bin");

// helper: run yt-dlp with args
function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    console.log("📥 Running yt-dlp with args:", args.join(" "));

    const proc = spawn(ytDlpPath, args);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      console.log("✅ yt-dlp exit code:", code);
      if (stdout.trim()) console.log("📤 yt-dlp stdout:\n", stdout);
      if (stderr.trim()) console.log("⚠️ yt-dlp stderr:\n", stderr);

      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`));
      }
    });
  });
}

// helper: list /tmp files
function listTmp() {
  try {
    const files = fs.readdirSync("/tmp");
    console.log("📂 /tmp content:", files);
    return files;
  } catch (err) {
    console.error("⚠️ Could not read /tmp:", err.message);
    return [];
  }
}

// download video with fallback args
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
    try {
      console.log("🔍 Before yt-dlp run:");
      listTmp();

      await runYtDlp(args);

      console.log("🔍 After yt-dlp run:");
      const files = listTmp();

      // check if file exists
      const base = tmpFileTemplate.replace("%(ext)s", "mp4");
      if (fs.existsSync(base)) {
        console.log("✅ File created:", base);
        return base;
      } else {
        console.warn("⚠️ Expected file not found:", base);
      }

      // maybe another extension (mkv, webm…)
      const found = files.find((f) => f.startsWith(path.basename(tmpFileTemplate, ".%(ext)s")));
      if (found) {
        console.log("✅ Found alternative file:", found);
        return path.join("/tmp", found);
      }
    } catch (err) {
      console.error("❌ yt-dlp attempt failed:", err.message);
    }
  }
  return null; // failed
}

// API endpoint
app.post("/api/download", async (req, res) => {
  const { url } = req.body;
  console.log("📥 Raw request body:", req.body);
  if (!url) return res.status(400).json({ error: "Missing URL" });

  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  const referer = "https://www.facebook.com/";
  const tmpFileTemplate = `/tmp/tmp_${Date.now()}.%(ext)s`;

  console.log("🎬 Starting download for:", url);

  try {
    const finalPath = await downloadVideo(url, ua, referer, tmpFileTemplate);

    if (!finalPath) {
      return res.status(500).json({ error: "Video file not created" });
    }

    res.download(finalPath, (err) => {
      if (err) {
        console.error("❌ Error sending file:", err.message);
      }
      // cleanup
      try {
        fs.unlinkSync(finalPath);
      } catch {}
    });
  } catch (err) {
    console.error("❌ Download error:", err.message);
    res.status(500).json({ error: "Download failed: " + err.message });
  }
});

// start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`🎯 Using yt-dlp binary: ${ytDlpPath}`);
  console.log(`🎯 Using ffmpeg binary: ${ffmpegPath}`);
});
