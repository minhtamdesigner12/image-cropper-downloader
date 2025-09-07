// backend/server.js
// ----------------------------
// Simple streaming backend for yt-dlp (yt-dlp-wrap v2.x)
// ----------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const YtDlpWrap = require("yt-dlp-wrap").default;

// ensure local ./yt-dlp binary can be found
process.env.PATH = (process.env.PATH || "") + path.delimiter + process.cwd();

const app = express();
const PORT = process.env.PORT || 8080;

// init wrapper (v2.x)
const ytdlp = new YtDlpWrap();

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
    console.warn("No URL provided");
    return res.status(400).json({ error: "No URL provided" });
  }

  console.log("📥 Starting download for:", url);

  // Set download filename for client
  const fileName = `video_${Date.now()}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    // ✅ execStream in v2.x returns a Readable stream directly
    const args = ["-f", "best", "-o", "-", "--no-playlist", url];
    console.log("▶️ yt-dlp args:", args.join(" "));

    const stream = ytdlp.execStream(args);

    // ✅ pipe stream directly to response
    stream.pipe(res);

    // ✅ capture yt-dlp internal logs
    stream.on("ytDlpEvent", (eventType, eventData) => {
      console.log("yt-dlp event:", eventType, eventData?.toString());
    });

    // ✅ handle errors
    stream.on("error", (err) => {
      console.error("🔥 yt-dlp stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "yt-dlp failed: " + err.message });
      } else {
        try { res.end(); } catch (e) {}
      }
    });

    // ✅ handle close
    stream.on("close", (code) => {
      console.log("✅ yt-dlp stream closed with code:", code);
      try { if (!res.finished) res.end(); } catch (e) {}
    });

    // ✅ cleanup if client disconnects
    req.on("close", () => {
      console.log("⚠️ Client disconnected — ending yt-dlp stream");
      try { stream.destroy(); } catch (e) {}
    });
  } catch (err) {
    console.error("💥 Download failed (catch):", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Download failed: " + (err?.message || err) });
    }
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
