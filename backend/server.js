// backend/server.js

const express = require("express");
const cors = require("cors");
const YtDlpWrap = require("yt-dlp-wrap").default; // Important: .default

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize yt-dlp-wrap
const ytdlp = new YtDlpWrap();

// Middleware
app.use(cors({
  origin: ["https://freetlo.com", "http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "50mb" }));
app.options("*", cors());

// Ping route
app.get("/ping", (_, res) => res.json({ status: "ok", message: "pong" }));

// Download route
app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const fileName = `video_${Date.now()}.mp4`;

  // Set download headers
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    // ✅ Correct usage: pass object { url, args }
    const process = ytdlp.execStream({
      url: url,
      args: ["-f", "best", "-o", "-"]
    });

    // Stream to client
    process.stdout.pipe(res);

    process.stderr.on("data", (data) => console.error("yt-dlp error:", data.toString()));

    process.on("close", (code) => {
      if (code !== 0) console.error(`yt-dlp exited with code ${code}`);
      else console.log("Download finished successfully");
    });

    process.on("error", (err) => {
      console.error("yt-dlp failed to start:", err);
      if (!res.headersSent) res.status(500).json({ error: "yt-dlp failed: " + err.message });
    });
  } catch (err) {
    console.error("Download failed:", err);
    if (!res.headersSent) res.status(500).json({ error: "Download failed: " + err.message });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
