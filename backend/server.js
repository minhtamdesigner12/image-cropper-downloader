// backend/server.js
const express = require("express");
const cors = require("cors");
const { YtDlpWrap } = require("yt-dlp-wrap");

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration
app.use(
  cors({
    origin: ["https://freetlo.com", "http://localhost:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.options("*", cors());

// Ping route
app.get("/ping", (_, res) => res.json({ status: "ok", message: "pong" }));

// Initialize yt-dlp wrapper
const ytdlpWrap = new YtDlpWrap();

// Download route
app.post("/download", async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "No URL provided or invalid URL" });
  }

  const fileName = `video_${Date.now()}.mp4`;

  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    await ytdlpWrap.execPromise(["-f", "best", "-o", "-", url], { stdout: res });
  } catch (err) {
    console.error("Download failed:", err);
    if (!res.headersSent) res.status(500).json({ error: "Download failed" });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
