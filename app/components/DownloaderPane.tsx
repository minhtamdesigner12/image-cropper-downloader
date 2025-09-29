"use client";

import { useState } from "react";

const BACKEND_URL =
  "https://freetlo.onrender.com/api/download";

export default function DownloaderPane() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
      else alert("Clipboard is empty.");
    } catch {
      alert("Failed to read clipboard. Please paste manually.");
    }
  };

  const handleDownload = async () => {
    if (!url.trim()) return alert("Please paste a video URL first!");
    setLoading(true);

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const msg =
          errJson?.error ||
          "Download failed: Unknown error (maybe platform not supported)";
        throw new Error(msg);
      }

      const blob = await res.blob();

      // ✅ Filename handling
      let fileName = `freetlo.com-video-${Date.now()}.mp4`;
      const cdHeader = res.headers.get("Content-Disposition");
      if (cdHeader) {
        const match = cdHeader.match(/filename="(.+)"/);
        if (match && match[1]) {
          const original = decodeURIComponent(match[1]);
          const safeName = original.replace(/[^a-z0-9_\-\.]+/gi, "_");
          fileName = safeName.startsWith("freetlo.com-")
            ? safeName
            : `freetlo.com-${safeName}`;
        }
      }

      // ✅ Trigger browser download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err: any) {
      alert("Download error: " + (err?.message || "unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 border rounded bg-white shadow">
      {/* Input + Paste */}
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
          className="px-4 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center justify-center border-blue-300"
          disabled={loading}
        >
          📋 Paste
        </button>
      </div>

      {/* Download */}
      <button
        onClick={handleDownload}
        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            {/* ✅ Add spinning loader icon here */}
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Downloading... please wait
          </span>
        ) : (
          "⬇️ Download Video"
        )}
      </button>

      <p className="text-xs text-gray-500 mt-2">
        🔄 Refresh the page to download another video; if you see an error, reload and re-paste the link.
      </p>

       {/* Optional: progress bar under button */}
      {loading && (
        <div className="w-full h-1 bg-gray-200 rounded mt-2 overflow-hidden">
          <div className="w-1/3 h-full bg-green-500 animate-pulse"></div>
        </div>
      )}

    </div>
  );
}
