// backend/server.js
// ----------------------------
// Simple streaming backend for yt-dlp (yt-dlp-wrap v2.x)
// ----------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const YtDlpWrap = require("yt-dlp-wrap").default;

// Ensure yt-dlp binary exists in backend/ after postinstall
const binaryPath = path.join(__dirname, "yt-dlp");
const ytdlp = new YtDlpWrap(binaryPath);

// Ensure PATH includes backend folder (so ffmpeg / yt-dlp work)
process.env.PATH = (process.env.PATH || "") + path.delimiter + __dirname;

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
    // ✅ Force yt-dlp to write video to stdout
    const args = ["-f", "mp4/best", "-o", "-", "--no-playlist", url];
    console.log("yt-dlp args:", args.join(" "));

    const stream = ytdlp.execStream(args);

    if (!stream || typeof stream.pipe !== "function") {
      throw new Error("yt-dlp did not return a valid stream");
    }

    // Pipe stream → client
    stream.pipe(res);

    // yt-dlp events
    stream.on("ytDlpEvent", (type, data) => {
      console.log("[yt-dlp]", type, data.toString());
    });

    stream.on("close", (code) => {
      console.log("yt-dlp exited with code:", code);
      if (!res.finished) res.end();
    });

    stream.on("error", (err) => {
      console.error("yt-dlp error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "yt-dlp failed: " + err.message });
      } else {
        try { res.end(); } catch {}
      }
    });

    req.on("close", () => {
      console.log("⚠️ Client disconnected — killing yt-dlp process");
      try { stream.destroy(); } catch {}
    });
  } catch (err) {
    console.error("Download failed (catch):", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Download failed: " + (err?.message || err),
      });
    }
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
