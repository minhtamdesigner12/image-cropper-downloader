"use client";

import React, { useState } from "react";

const BACKEND_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3002/download"
    : "https://image-cropper-downloader-production.up.railway.app/download";

export default function DownloaderPane() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  async function handleDownload() {
    if (!url) return alert("Paste a video URL first");

    setLoading(true);
    setProgress(0);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Download failed: ${errText}`);
      }

      const reader = res.body?.getReader();
      const contentLengthHeader = res.headers.get("Content-Length");
      const total = contentLengthHeader ? parseInt(contentLengthHeader) : 0;
      let receivedLength = 0;
      const chunks = [];

      if (!reader) throw new Error("No data received");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedLength += value.length;
          if (total) setProgress(Math.floor((receivedLength / total) * 100));
        }
      }

      const blob = new Blob(chunks);
      const a = document.createElement("a");
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1].split("?")[0] || "video.mp4";

      a.href = URL.createObjectURL(blob);
      a.download = fileName.endsWith(".mp4") ? fileName : "video.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();

      setProgress(100);
    } catch (err: any) {
      alert("Download error: " + (err?.message || "unknown"));
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000); // reset after 1s
    }
  }

  return (
    <div className="space-y-4 max-w-md mx-auto mt-4">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste video URL (YouTube, TikTok, Instagram, X.com)"
        className="w-full border px-2 py-1 rounded"
        disabled={loading}
      />
      <button
        onClick={() => {
          if (!loading) handleDownload();
        }}
        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? `Downloading… ${progress}%` : "Download Video"}
      </button>
      {loading && (
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-green-600 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
