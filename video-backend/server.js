import express from "express";
import { spawn } from "child_process";
import { tmpdir } from "os";
import { join } from "path";
import fs from "fs/promises";

const app = express();
app.use(express.json());

app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send("Missing URL");

  try {
    const outPath = join(tmpdir(), `video_${Date.now()}.mp4`);
    const download = spawn("yt-dlp", ["-f", "mp4", "-o", outPath, url]);

    download.on("close", async (code) => {
      if (code !== 0) return res.status(500).send("Download failed");
      const buffer = await fs.readFile(outPath);
      await fs.unlink(outPath);
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
      res.send(buffer);
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Backend running"));
