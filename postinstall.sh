#!/usr/bin/env bash
set -e

BACKEND_DIR="./backend"
FFMPEG_DIR="$BACKEND_DIR/ffmpeg-bin"

echo "🚀 Installing yt-dlp..."
if [[ $(uname) == "Darwin" ]]; then
  YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
else
  YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux"
fi

curl -L "$YTDLP_URL" -o "$BACKEND_DIR/yt-dlp"
chmod +x "$BACKEND_DIR/yt-dlp"
echo "✅ yt-dlp installed at $BACKEND_DIR/yt-dlp"

echo "🚀 Installing ffmpeg..."
if [[ ! -d "$FFMPEG_DIR" ]]; then
  mkdir -p "$FFMPEG_DIR"
fi

if [[ $(uname) != "Darwin" ]]; then
  curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz
  tar -xJf /tmp/ffmpeg.tar.xz -C "$FFMPEG_DIR" --strip-components=1
fi
chmod +x "$FFMPEG_DIR/ffmpeg" || true

echo "🎯 Postinstall completed!"
