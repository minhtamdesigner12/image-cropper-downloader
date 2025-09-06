"use client";

import React, { useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://image-cropper-downloader-production.up.railway.app/download";

export default function DownloaderPane() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleDownload() {
    if (!url.trim()) return alert("Paste a video URL first");
    setLoading(true);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errText = errJson?.error || await res.text();
        throw new Error(errText || "Unknown error");
      }

      const blob = await res.blob();
      const a = document.createElement("a");

      // Extract filename from URL or fallback
      const urlParts = url.split("/");
      let fileName = urlParts[urlParts.length - 1].split("?")[0];
      if (!fileName || !fileName.endsWith(".mp4")) fileName = `video-${Date.now()}.mp4`;

      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert("Download error: " + (err?.message || "unknown"));
    } finally {
      setLoading(false);
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
        onClick={handleDownload}
        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Processing…" : "Download Video"}
      </button>
    </div>
  );
}
