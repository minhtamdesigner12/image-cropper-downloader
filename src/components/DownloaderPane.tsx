"use client";

import { useState } from "react";

export default function DownloaderPane() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Use localhost in dev, Railway URL in production
  const BACKEND_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3002/download"
      : "https://image-cropper-downloader-production.up.railway.app/download";

  async function handleDownload() {
    if (!url) return alert("Paste a Facebook / TikTok / X / YouTube URL first");
    setLoading(true);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "video.mp4";
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
    <div className="space-y-4">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste Facebook / TikTok / X / YouTube URL"
        className="w-full border px-2 py-1 rounded"
        disabled={loading}
      />
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Processing…" : "Download Video"}
        </button>
      </div>
    </div>
  );
}
