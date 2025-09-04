"use client";

import { useState } from "react";

export default function DownloaderPane() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!url) return alert("Paste Facebook / TikTok / X / YouTube URL first");
    setLoading(true);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed");
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
