"use client";

import { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
  "https://image-cropper-downloader-production.up.railway.app/download";

export default function DownloaderPane() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

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

      // Convert response to Blob
      const blob = await res.blob();

      // Generate filename from URL
      const urlParts = url.split("/");
      let fileName = urlParts[urlParts.length - 1].split("?")[0];
      if (!fileName || !fileName.endsWith(".mp4")) fileName = "video.mp4";

      // Trigger download
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
    <div className="space-y-4 max-w-md mx-auto mt-4">
      <input
        type="text"
        placeholder="Paste video URL (YouTube, TikTok, Instagram, X.com)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border px-2 py-1 rounded"
        disabled={loading}
      />
      <button
        onClick={handleDownload}
        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? "Processing…" : "Download Video"}
      </button>
    </div>
  );
}
