const express = require("express");
const cors = require("cors");
const { YtDlpWrap } = require("yt-dlp-wrap");

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS configuration ---
app.use(cors({
  origin: ["https://freetlo.com", "http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "50mb" }));
app.options("*", cors());

// --- Ping route ---
app.get("/ping", (_, res) => {
  console.log("Ping received");
  res.json({ status: "ok", message: "pong" });
});

// --- Download route ---
app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const fileName = `video_${Date.now()}.mp4`;
  const ytdlp = new YtDlpWrap();

  try {
    console.log("Starting download for URL:", url);

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "video/mp4");

    const stream = await ytdlp.execStream([
      url,
      "-f",
      "best",
      "-o",
      "-"
    ]);

    stream.stdout.pipe(res);

    stream.stderr.on("data", data => {
      console.error("yt-dlp error:", data.toString());
    });

    stream.on("close", code => {
      if (code !== 0) console.error(`yt-dlp exited with code ${code}`);
      else console.log("Download completed successfully");
    });

    stream.on("error", err => {
      console.error("yt-dlp failed:", err);
      if (!res.headersSent) res.status(500).json({ error: "yt-dlp failed: " + err.message });
    });

  } catch (err) {
    console.error("Download failed:", err);
    if (!res.headersSent) res.status(500).json({ error: "Download failed: " + err.message });
  }
});

// --- Start server ---
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
