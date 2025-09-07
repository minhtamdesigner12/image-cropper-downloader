// backend/server.js
// ----------------------------
// Simple streaming backend for yt-dlp (yt-dlp-wrap v2.x)
// ----------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
const YtDlpWrap = require("yt-dlp-wrap").default;

process.env.PATH = (process.env.PATH || "") + path.delimiter + process.cwd(); // ensure local ./yt-dlp can be found

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

app.get("/ping", (_, res) => res.json({ status: "ok", message: "pong" }));

app.post("/download", (req, res) => {
  const { url } = req.body;
  if (!url) {
    console.warn("No URL provided");
    return res.status(400).json({ error: "No URL provided" });
  }

  console.log("Starting download for:", url);

  // Set download filename for client
  const fileName = `video_${Date.now()}.mp4`;
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    // IMPORTANT: execStream in yt-dlp-wrap v2.x takes an array of args
    // We put the URL at the end to be safe for multiple site URLs.
    const args = ["-f", "best", "-o", "-", "--no-playlist", url];
    console.log("yt-dlp args:", args.join(" "));

    const proc = ytdlp.execStream(args);

    // Pipe stdout -> response
    proc.stdout.pipe(res);

    // Emit stderr to logs for debugging
    proc.stderr.on("data", (chunk) => {
      const text = chunk.toString().trim();
      if (text) console.error("yt-dlp stderr:", text);
    });

    proc.on("close", (code) => {
      console.log("yt-dlp process closed with code:", code);
      // ensure response is closed
      try {
        if (!res.finished) res.end();
      } catch (e) {}
    });

    proc.on("error", (err) => {
      console.error("yt-dlp spawn error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "yt-dlp failed to start: " + err.message });
      } else {
        try { res.end(); } catch (e) {}
      }
    });

    // if client disconnects, kill yt-dlp child to free resources
    req.on("close", () => {
      console.log("Client disconnected — killing yt-dlp process");
      try {
        proc.kill("SIGKILL");
      } catch (e) {}
    });
  } catch (err) {
    console.error("Download failed (catch):", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Download failed: " + (err && err.message ? err.message : err) });
    }
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
