"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url) return alert("Paste a video URL first");
    setLoading(true);

    try {
      const res = await fetch(
        "https://image-cropper-downloader-production.up.railway.app/download", // your Railway backend URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "video.mp4";
      a.click();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Video Downloader</h1>
      <input
        type="text"
        placeholder="Paste video URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border p-2 w-full"
      />
      <button
        onClick={handleDownload}
        disabled={loading}
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Downloading..." : "Download Video"}
      </button>
    </div>
  );
}
