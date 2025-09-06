// backend/server.js
const express = require("express");
const cors = require("cors");
const { YtDlpWrap } = require("yt-dlp-wrap"); // fixed import
const path = require("path");
const fs = require("fs");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3002;

// CORS setup
app.use(cors({
  origin: ["https://freetlo.com", "http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "50mb" }));
app.options("*", cors());

// Ping route for testing
app.get("/ping", (_, res) => res.json({ status: "ok", message: "pong" }));

// Download route
app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "No URL provided or invalid URL" });
  }

  const fileName = `video_${Date.now()}.mp4`;
  const tmpFile = path.join(os.tmpdir(), fileName);

  const ytdlpWrap = new YtDlpWrap();

  try {
    // Download video to temporary file
    await ytdlpWrap.execPromise(
      [url, "-f", "best", "-o", tmpFile]
    );

    // Stream the file to response
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "video/mp4");

    const readStream = fs.createReadStream(tmpFile);
    readStream.pipe(res);

    readStream.on("close", () => {
      // Delete temp file after streaming
      fs.unlink(tmpFile, () => {});
    });

    readStream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).json({ error: "Error streaming video" });
    });

  } catch (err) {
    console.error("Download failed:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Download failed: " + (err.message || err) });
    }
  }
});

// Start server
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
