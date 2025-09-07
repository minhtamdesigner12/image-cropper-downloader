// backend/server.js
// ----------------------------
// Streaming backend for yt-dlp (yt-dlp-wrap v2.x)
// ----------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const YtDlpWrap = require("yt-dlp-wrap").default;

const binaryPath = path.join(__dirname, "yt-dlp"); // ⬅️ always in backend/
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

  console.log("▶️ Starting download for:", url);

  const fileName = `video_${Date.now()}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    // ✅ best muxed format to stdout
    const args = [
      "-f", "bestvideo+bestaudio/best",
      "--merge-output-format", "mp4",
      "-o", "-",
      "--no-playlist",
      url,
    ];
    console.log("yt-dlp args:", args.join(" "));

    const proc = ytdlp.execStream(args);

    // stdout → response
    proc.stdout.pipe(res);

    // log stderr
    proc.stderr.on("data", (chunk) => {
      const msg = chunk.toString().trim();
      if (msg) console.error("[yt-dlp]", msg);
    });

    proc.on("close", (code) => {
      console.log("✅ yt-dlp exited with code:", code);
      if (!res.finished) res.end();
    });

    proc.on("error", (err) => {
      console.error("❌ yt-dlp spawn error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "yt-dlp failed: " + err.message });
      } else {
        try { res.end(); } catch {}
      }
    });

    req.on("close", () => {
      console.log("⚠️ Client disconnected — killing yt-dlp");
      try { proc.kill("SIGKILL"); } catch {}
    });
  } catch (err) {
    console.error("❌ Download failed (catch):", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Download failed: " + (err && err.message ? err.message : err),
      });
    }
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
