"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// ✅ Use CDN worker for client-side
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function PdfCompressorPane() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(0.5);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const compressPdf = async () => {
    if (!file) return alert("Upload a PDF first");

    setLoading(true);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const newPdfDoc = await PDFDocument.create();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;

        // ✅ Include canvas in render params
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const imgBytes = Uint8Array.from(atob(dataUrl.split(",")[1]), c => c.charCodeAt(0));

        const img = await newPdfDoc.embedJpg(imgBytes);
        const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
        newPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });

        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      const compressedBytes = await newPdfDoc.save();
      const blob = new Blob([new Uint8Array(compressedBytes)], { type: "application/pdf" });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "compressed.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error(err);
      alert("Compression failed");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <input type="file" accept="application/pdf" onChange={handleFile} />
      <div className="flex items-center gap-2">
        <label className="text-sm">JPEG Quality:</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step={0.05}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="flex-1"
        />
        <span className="w-12 text-right">{Math.round(quality * 100)}%</span>
      </div>
      {loading && <p>Compressing… {progress}%</p>}
      <button
        onClick={compressPdf}
        className="px-4 py-2 bg-green-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "Compressing…" : "Compress PDF"}
      </button>
    </div>
  );
}
