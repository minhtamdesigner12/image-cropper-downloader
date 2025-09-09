const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

async function runYtDlp(url) {
  return new Promise((resolve, reject) => {
    const tmpFile = `/tmp/tmp_${Date.now()}.mp4`;
    const baseArgs = [
      "-f",
      "bestvideo+bestaudio/best",
      "--merge-output-format",
      "mp4",
      "--no-playlist",
      "--ffmpeg-location",
      "/app/backend/ffmpeg-bin",
      "--no-check-certificate",
      "--rm-cache-dir",
      "--user-agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "--referer",
      "https://www.facebook.com/",
      url,
      "-o",
      tmpFile,
    ];

    console.log("📥 yt-dlp args:", JSON.stringify(baseArgs, null, 2));

    let stdout = "";
    let stderr = "";

    const ytDlp = spawn("./backend/yt-dlp", baseArgs);

    ytDlp.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    ytDlp.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ytDlp.on("close", async (code) => {
      console.log(`🔚 yt-dlp exited with code: ${code}`);
      console.log("📜 yt-dlp stdout:", stdout);
      console.error("⚠️ yt-dlp stderr:", stderr);

      if (fs.existsSync(tmpFile)) {
        console.log("✅ File created:", tmpFile);
        return resolve(tmpFile);
      }

      console.warn("❌ File not created. Retrying with fallback (-f mp4)...");
      // fallback attempt
      const fallbackArgs = [
        "-f",
        "mp4",
        "--no-playlist",
        "--ffmpeg-location",
        "/app/backend/ffmpeg-bin",
        "--no-check-certificate",
        "--rm-cache-dir",
        "--user-agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "--referer",
        "https://www.facebook.com/",
        url,
        "-o",
        tmpFile,
      ];

      console.log("📥 yt-dlp fallback args:", JSON.stringify(fallbackArgs, null, 2));

      const fallback = spawn("./backend/yt-dlp", fallbackArgs);

      let fbOut = "";
      let fbErr = "";

      fallback.stdout.on("data", (d) => (fbOut += d.toString()));
      fallback.stderr.on("data", (d) => (fbErr += d.toString()));

      fallback.on("close", (fbCode) => {
        console.log(`🔚 yt-dlp fallback exited with code: ${fbCode}`);
        console.log("📜 yt-dlp fallback stdout:", fbOut);
        console.error("⚠️ yt-dlp fallback stderr:", fbErr);

        if (fs.existsSync(tmpFile)) {
          console.log("✅ Fallback worked, file created:", tmpFile);
          return resolve(tmpFile);
        }
        reject(new Error("Download failed: Video file was not created."));
      });
    });
  });
}
