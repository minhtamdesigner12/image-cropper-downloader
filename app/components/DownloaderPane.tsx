"use client";

import { useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://image-cropper-downloader-production.up.railway.app/api/download";

export default function DownloaderPane() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      } else {
        alert("Clipboard is empty.");
      }
    } catch (err) {
      alert("Failed to read clipboard. Please paste manually.");
    }
  };

  const handleDownload = async () => {
    if (!url) return alert("Paste a video URL first");
    setLoading(true);

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

      // Extract filename from Content-Disposition header
      const blob = await res.blob();
      const cdHeader = res.headers.get("Content-Disposition");
      let fileName = "video.mp4";
      if (cdHeader) {
        const match = cdHeader.match(/filename="(.+)"/);
        if (match && match[1]) fileName = match[1];
      }

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (err: any) {
      alert("Download error: " + (err?.message || "unknown"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 🔹 Input + Paste button same row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Paste video URL (Facebook, TikTok, Instagram, X.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
          disabled={loading}
        />
        <button
          onClick={handlePaste}
          className="px-4 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
          disabled={loading}
        >
          Paste URL
        </button>
      </div>

      <button
        onClick={handleDownload}
        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Downloading..." : "Download Video"}
      </button>
    </div>
  );
}
