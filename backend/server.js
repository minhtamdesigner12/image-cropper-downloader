// backend/server.js
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
// Make sure yt-dlp_macos is in project root
const binaryPath = path.join(__dirname, "..", "yt-dlp_macos");
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
// Download route
// ----------------------------
app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  console.log("🎬 Starting download for:", url);

  // Temporary file to store video
  const tempFile = path.join("/tmp", `tmp_${Date.now()}.mp4`);
  res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
  res.setHeader("Content-Type", "video/mp4");

  // Cookies
  const cookiesPath = path.join(__dirname, "..", "cookies.txt");
  const useCookies = fs.existsSync(cookiesPath);

  // yt-dlp args
  const args = ["-f", "mp4/best", "-o", tempFile, "--no-playlist", url];
  if (useCookies) {
    args.push("--cookies", cookiesPath);
    console.log("🍪 Using cookies from:", cookiesPath);
  }

  try {
    // Execute download
    await ytdlp.exec(args);

    if (!fs.existsSync(tempFile)) {
      console.error("❌ Video file not created:", tempFile);
      return res.status(500).json({ error: "Video download failed: file not created" });
    }

    // Stream the file to client
    const readStream = fs.createReadStream(tempFile);
    readStream.pipe(res);

    readStream.on("close", () => {
      fs.unlink(tempFile, () => console.log("🗑 Temporary file deleted:", tempFile));
    });

    readStream.on("error", (err) => {
      console.error("❌ Error sending file:", err);
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });

  } catch (err) {
    console.error("❌ Video download failed:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Video download failed: " + (err?.stderr?.toString?.() || err.message || err)
      });
    }
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
