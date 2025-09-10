#!/usr/bin/env bash
set -e

BACKEND_DIR="./backend"
FFMPEG_DIR="$BACKEND_DIR/ffmpeg-bin"

echo "🚀 Installing yt-dlp..."
# Detect OS and pick correct yt-dlp binary
if [[ $(uname) == "Darwin" ]]; then
  YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
elif [[ $(uname) == "Linux" ]]; then
  YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux"
else
  echo "❌ Unsupported OS"
  exit 1
fi

curl -L "$YTDLP_URL" -o "$BACKEND_DIR/yt-dlp"
chmod +x "$BACKEND_DIR/yt-dlp"
echo "✅ yt-dlp installed at $BACKEND_DIR/yt-dlp"

echo "🚀 Installing ffmpeg..."
curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz
mkdir -p "$FFMPEG_DIR"
tar -xJf /tmp/ffmpeg.tar.xz -C "$FFMPEG_DIR" --strip-components=1
chmod +x "$FFMPEG_DIR/ffmpeg"
echo "✅ ffmpeg installed at $FFMPEG_DIR"

echo "🎯 Postinstall completed!"
