#!/usr/bin/env bash
set -e

BACKEND_DIR="./backend"
FFMPEG_DIR="$BACKEND_DIR/ffmpeg-bin"

echo "🚀 Installing yt-dlp..."
if [[ ! -f "$BACKEND_DIR/yt-dlp" ]]; then
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
fi
echo "✅ yt-dlp installed at $BACKEND_DIR/yt-dlp"

echo "🚀 Installing ffmpeg..."
# Only create ffmpeg dir if it does NOT exist
if [[ ! -e "$FFMPEG_DIR" ]]; then
  mkdir -p "$FFMPEG_DIR"
  curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz
  tar -xJf /tmp/ffmpeg.tar.xz -C "$FFMPEG_DIR" --strip-components=1
  chmod +x "$FFMPEG_DIR/ffmpeg"
else
  echo "ℹ️ ffmpeg-bin already exists, skipping creation"
fi

echo "🎯 Postinstall completed!"
