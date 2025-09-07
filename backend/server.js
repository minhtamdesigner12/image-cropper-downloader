// backend/server.js
// ----------------------------
// Express backend for yt-dlp streaming using yt-dlp_linux
// Handles cookies, headers, 403 errors, and temp file cleanup
// ----------------------------

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const YtDlpWrap = require("yt-dlp-wrap").default;

const app = express();
const PORT = process.env.PORT || 8080;

// ----------------------------
// Path to yt-dlp binary
// ----------------------------
const binaryPath = path.join(__dirname, "..", "yt-dlp_linux");
if (!fs.existsSync(binaryPath)) {
  console.error("❌ yt-dlp binary not found:", binaryPath);
  process.exit(1);
}
const ytdlp = new YtDlpWrap(binaryPath);

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
// Download route with 403 handling
// ----------------------------
app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  console.log("🎬 Starting download for:", url);

  const tmpFilePath = path.join("/tmp", `tmp_${Date.now()}.mp4`);
  const cookiesPath = path.join(__dirname, "cookies.txt");
  const useCookies = fs.existsSync(cookiesPath);

  // Base yt-dlp arguments
  const baseArgs = [
    "-f", "mp4/best",
    "--no-playlist",
    "--no-check-certificate",
    "--rm-cache-dir",
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "--referer", "https://freetlo.com/",
    url,
    "-o", tmpFilePath
  ];

  if (useCookies) {
    baseArgs.push("--cookies", cookiesPath);
    console.log("🍪 Using cookies from:", cookiesPath);
  }

  // Function to attempt download with retry
  const downloadVideo = async (attempt = 1) => {
    try {
      console.log(`⬇️ Attempt ${attempt} to download video`);
      await ytdlp.exec(baseArgs);

      if (!fs.existsSync(tmpFilePath)) {
        throw new Error("Video file not created after download");
      }

      // Send file to client
      res.download(tmpFilePath, `video_${Date.now()}.mp4`, (err) => {
        if (err) console.error("❌ Error sending file:", err);
        fs.unlink(tmpFilePath, () => {});
      });
    } catch (err) {
      console.error(`❌ Attempt ${attempt} failed:`, err.stderr || err.message || err);

      const is403 = err.stderr?.includes("403") || (err.message && err.message.includes("403"));

      if (is403 && attempt < 2) {
        console.log("⚡ 403 detected — retrying with cookies (if available)");
        if (!useCookies && fs.existsSync(cookiesPath)) {
          baseArgs.push("--cookies", cookiesPath);
        }
        await downloadVideo(attempt + 1);
      } else {
        if (!res.headersSent) {
          const errorMsg = is403
            ? "Download blocked (403 Forbidden) — try using cookies or a different URL"
            : err.stderr || err.message || "Unknown error";
          res.status(500).json({ error: "yt-dlp failed: " + errorMsg });
        }
        try { fs.unlink(tmpFilePath, () => {}); } catch {}
      }
    }
  };

  // Start download
  await downloadVideo();

  // Cleanup if client disconnects
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
