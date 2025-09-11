// backend/fb-extractor.js
const YTDlpWrap = require("yt-dlp-wrap").default;
const path = require("path");

// Just the binary path, no "-U"
const ytdlp = new YTDlpWrap("/opt/homebrew/bin/yt-dlp");

// Example run
(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error("Usage: node backend/fb-extractor.js <url>");
    process.exit(1);
  }

  try {
    const result = await ytdlp.execPromise([
      url,
      "--cookies", path.join(__dirname, "cookies.txt"),
      "-o", path.join(__dirname, "downloads/%(title)s.%(ext)s"),
    ]);
    console.log(result);
  } catch (err) {
    console.error("Error:", err);
  }
})();
