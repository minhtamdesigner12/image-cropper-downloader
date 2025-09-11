#!/usr/bin/env bash
set -e

BACKEND_DIR="./backend"
FFMPEG_DIR="$BACKEND_DIR/ffmpeg-bin"

echo "🚀 Installing yt-dlp..."
# Detect OS and pick correct yt-dlp binary
OS_TYPE=$(uname)
if [[ "$OS_TYPE" == "Darwin" ]]; then
  YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
elif [[ "$OS_TYPE" == "Linux" ]]; then
  YTDLP_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux"
else
  echo "❌ Unsupported OS: $OS_TYPE"
  exit 1
fi

# Download yt-dlp
curl -L "$YTDLP_URL" -o "$BACKEND_DIR/yt-dlp"
chmod +x "$BACKEND_DIR/yt-dlp"
echo "✅ yt-dlp installed at $BACKEND_DIR/yt-dlp"

# ----------------------------
# Install ffmpeg if not exists
# ----------------------------
if [[ ! -f "$FFMPEG_DIR/ffmpeg" ]]; then
  echo "🚀 Installing ffmpeg..."
  mkdir -p "$FFMPEG_DIR"

  if [[ "$OS_TYPE" == "Darwin" ]]; then
    echo "⚠️ Mac detected, assuming ffmpeg already installed via brew"
    ln -sf /opt/homebrew/bin/ffmpeg "$FFMPEG_DIR/ffmpeg"
  else
    # Linux static build
    curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz -o /tmp/ffmpeg.tar.xz
    tar -xJf /tmp/ffmpeg.tar.xz -C "$FFMPEG_DIR" --strip-components=1
  fi

  chmod +x "$FFMPEG_DIR/ffmpeg"
  echo "✅ ffmpeg installed at $FFMPEG_DIR"
else
  echo "ℹ️ ffmpeg already exists at $FFMPEG_DIR, skipping"
fi

echo "🎯 Postinstall completed!"
