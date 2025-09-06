// backend/server.js

// ----------------------------
// Imports
// ----------------------------
const express = require("express");
const cors = require("cors");
const YtDlpWrap = require("yt-dlp-wrap").default; // Correct import for Node.js

// ----------------------------
// App and Port
// ----------------------------
const app = express();
const PORT = process.env.PORT || 8080;

// ----------------------------
// Initialize yt-dlp-wrap
// ----------------------------
const ytdlp = new YtDlpWrap(); // ✅ now works correctly

// ----------------------------
// Middleware
// ----------------------------
app.use(
  cors({
    origin: ["https://freetlo.com", "http://localhost:3000"], // allow frontend domains
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.options("*", cors()); // enable preflight requests for all routes

// ----------------------------
// Ping route (test if server is alive)
// ----------------------------
app.get("/ping", (_, res) => {
  console.log("Ping received");
  res.json({ status: "ok", message: "pong" });
});

// ----------------------------
// Download route
// ----------------------------
app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    console.log("Download failed: No URL provided");
    return res.status(400).json({ error: "No URL provided" });
  }

  const fileName = `video_${Date.now()}.mp4`;
  console.log("Download requested:", url);

  // Set headers so browser downloads file
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Type", "video/mp4");

  try {
    // Use yt-dlp-wrap to stream video
    const process = ytdlp.execStream(url, ["-f", "best", "-o", "-"]);

    // Pipe stdout to response (stream video to browser)
    process.stdout.pipe(res);

    // Log yt-dlp stderr for debugging
    process.stderr.on("data", (data) => {
      console.error("yt-dlp error:", data.toString());
    });

    // Log when process finishes
    process.on("close", (code) => {
      if (code !== 0) console.error(`yt-dlp exited with code ${code}`);
      else console.log("Download finished successfully");
    });

    // Handle spawn errors
    process.on("error", (err) => {
      console.error("yt-dlp failed to start:", err);
      if (!res.headersSent)
        res.status(500).json({ error: "yt-dlp failed: " + err.message });
    });
  } catch (err) {
    console.error("Download failed:", err);
    if (!res.headersSent)
      res.status(500).json({ error: "Download failed: " + err.message });
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
