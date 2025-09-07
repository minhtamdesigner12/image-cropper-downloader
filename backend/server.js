// ----------------------------
// Simple streaming backend for yt-dlp (yt-dlp-wrap v2.x)
// ----------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const YtDlpWrap = require("yt-dlp-wrap").default;

// ----------------------------
// Setup yt-dlp binary path
// ----------------------------
const binaryPath = path.join(__dirname, "yt-dlp"); // downloaded in postinstall
const ytdlp = new YtDlpWrap(binaryPath);

const app = express();
const PORT = process.env.PORT || 8080;

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
app.post("/download", (req, res) => {
  const { url } = req.body;
  if (!url) {
    console.warn("❌ No URL provided");
    return res.status(400).json({ error: "No URL provided" });
  }

  console.log("🚀 Starting download for:", url);

  const fileName = `video_${Date.now()}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    // ✅ Force yt-dlp to stream video to stdout
    const args = ["-f", "mp4/best", "-o", "-", "--no-playlist", url];
    console.log("🛠️ yt-dlp args:", args.join(" "));

    const proc = ytdlp.execStream(args);

    // pipe stdout → response
    proc.stdout.pipe(res);

    // log stderr for debugging
    proc.stderr.on("data", (chunk) => {
      const msg = chunk.toString().trim();
      if (msg) console.error("⚠️ yt-dlp stderr:", msg);
    });

    proc.on("close", (code) => {
      console.log("✅ yt-dlp exited with code:", code);
      if (!res.finished) res.end();
    });

    proc.on("error", (err) => {
      console.error("❌ yt-dlp process error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "yt-dlp failed: " + err.message });
      } else {
        try {
          res.end();
        } catch {}
      }
    });

    // client disconnected
    req.on("close", () => {
      console.log("⚡ Client disconnected — killing yt-dlp process");
      try {
        proc.kill("SIGKILL");
      } catch {}
    });
  } catch (err) {
    console.error("❌ Download failed (catch):", err);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Download failed: " + (err.message || err) });
    }
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
