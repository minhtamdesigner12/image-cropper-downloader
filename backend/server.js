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
app.post("/download", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const fileName = `video_${Date.now()}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  // Optional: use cookies for restricted videos
  const cookiesPath = path.join(__dirname, "..", "cookies.txt");
  const useCookies = fs.existsSync(cookiesPath);

  const args = ["-f", "mp4/best", "-o", "-", "--no-playlist", url];
  if (useCookies) {
    args.push("--cookies", cookiesPath);
    console.log("🍪 Using cookies from:", cookiesPath);
  }

  try {
    const stream = ytdlp.execStream(args);

    if (!stream || !stream.pipe)
      return res.status(500).json({ error: "yt-dlp failed to start" });

    // Pipe video to client
    stream.pipe(res);

    // yt-dlp events
    stream.on("ytDlpEvent", (type, data) => {
      const msg = data?.toString?.().trim();
      if (msg) console.log(`[yt-dlp:${type}]`, msg);
    });

    stream.on("stderr", (chunk) => console.error("yt-dlp stderr:", chunk.toString()));
    stream.on("stdout", (chunk) => console.log("yt-dlp stdout chunk:", chunk.length, "bytes"));

    stream.on("close", (code) => {
      console.log("yt-dlp exited with code:", code ?? "undefined");
      if (!res.finished) res.end();
    });

    stream.on("error", (err) => {
      console.error("yt-dlp stream error:", err);
      if (!res.headersSent) res.status(500).json({ error: err.message });
      else res.end();
    });

    req.on("close", () => {
      console.log("Client disconnected — stopping yt-dlp");
      try { stream.destroy(); } catch {}
    });
  } catch (err) {
    console.error("Download failed:", err);
    if (!res.headersSent) res.status(500).json({ error: err.message || err });
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
