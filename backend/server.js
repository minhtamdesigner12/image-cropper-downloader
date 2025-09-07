const express = require("express");
const cors = require("cors");
const path = require("path");
const YtDlpWrap = require("yt-dlp-wrap").default;
const fs = require("fs");

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
  const tmpFile = path.join("/tmp", `tmp_${Date.now()}.mp4`); // Writable path in Railway

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
    await ytdlp.exec(args); // Download video fully to temp file

    console.log("✅ Download completed, sending file to client");
    res.download(tmpFile, fileName, (err) => {
      if (err) console.error("❌ Error sending file:", err);
      try { fs.unlinkSync(tmpFile); } catch {}
    });

  } catch (err) {
    console.error("💥 yt-dlp failed:", err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
