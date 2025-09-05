"use client";

import { useState } from "react";

export default function DownloaderPane() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!url) return alert("Paste a video URL first");
    setLoading(true);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Download failed");
      }

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "video.mp4";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
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
      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Processing…" : "Download Video"}
      </button>
    </div>
  );
}
