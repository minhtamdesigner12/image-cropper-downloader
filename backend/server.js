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

  const fileName = `video_${Date.now()}.mp4`;
  const tmpFile = path.join("/tmp", `tmp_${Date.now()}.mp4`); // writable on Railway

  // Optional: use cookies for restricted videos
  const cookiesPath = path.join(__dirname, "..", "cookies.txt");
  const useCookies = fs.existsSync(cookiesPath);

  const args = ["-f", "mp4/best", "-o", tmpFile, "--no-playlist", url];
  if (useCookies) {
    args.push("--cookies", cookiesPath);
    console.log("🍪 Using cookies from:", cookiesPath);
  }

  try {
    console.log("🎬 Starting download for:", url);
    await ytdlp.exec(args);

    // Check if file was actually created
    if (!fs.existsSync(tmpFile)) {
      console.error("❌ Video download failed: file not created");
      return res.status(500).json({ error: "Video download failed: file not created" });
    }

    console.log("✅ Download completed, sending file to client");
    res.download(tmpFile, fileName, (err) => {
      if (err) console.error("❌ Error sending file:", err);
      // Cleanup
      try { fs.unlinkSync(tmpFile); } catch {}
    });

  } catch (err) {
    console.error("💥 yt-dlp failed:", err);
    const errMsg = err?.stderr?.toString() || err?.message || "Unknown error";
    if (!res.headersSent) res.status(500).json({ error: `yt-dlp failed: ${errMsg}` });
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
