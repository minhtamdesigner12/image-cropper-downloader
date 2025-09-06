const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS fix ---
app.use(cors({
  origin: ["https://freetlo.com", "http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "50mb" }));
app.options("*", cors());

// --- Ping route ---
app.get("/ping", (_, res) => res.json({ status: "ok", message: "pong" }));

// --- Download route ---
app.post("/download", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const fileName = `video_${Date.now()}.mp4`;

  try {
    const ytdlp = spawn("yt-dlp", ["-f", "best", "-o", "-", url]);

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "video/mp4");

    ytdlp.stdout.pipe(res);

    ytdlp.stderr.on("data", data => console.error("yt-dlp error:", data.toString()));

    ytdlp.on("close", code => {
      if (code !== 0) console.error(`yt-dlp exited with code ${code}`);
    });

    ytdlp.on("error", err => {
      console.error("yt-dlp failed to start:", err);
      if (!res.headersSent) res.status(500).json({ error: "yt-dlp failed: " + err.message });
    });

  } catch (err) {
    console.error("Download failed:", err);
    if (!res.headersSent) res.status(500).json({ error: "Download failed: " + err.message });
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
