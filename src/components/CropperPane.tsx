"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactCrop, {
  type PercentCrop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

export default function CropperPane() {
  const [src, setSrc] = useState<string | null>(null);

  const [crop, setCrop] = useState<PercentCrop | undefined>(undefined);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [aspect, setAspect] = useState<number | undefined>(3 / 4);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const [exportWidth, setExportWidth] = useState<number>(800);
  const [exportHeight, setExportHeight] = useState<number>(() =>
    Math.round(800 / (3 / 4))
  );

  // Helper: compute centered crop
  function centerAspectCrop(
    mediaW: number,
    mediaH: number,
    aspectRatio: number | undefined,
    percentWidth = 80
  ): PercentCrop {
    if (aspectRatio) {
      const aspectCrop = makeAspectCrop(
        { unit: "%", width: percentWidth },
        aspectRatio,
        mediaW,
        mediaH
      );
      return centerCrop(aspectCrop, mediaW, mediaH) as PercentCrop;
    } else {
      return centerCrop(
        { unit: "%", width: percentWidth, height: percentWidth },
        mediaW,
        mediaH
      ) as PercentCrop;
    }
  }

  // Select file (HEIC handled client-side)
  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    let fileToUse = f;

    if (
      typeof window !== "undefined" &&
      (f.type === "image/heic" ||
        f.type === "image/heif" ||
        f.name.endsWith(".heic") ||
        f.name.endsWith(".heif"))
    ) {
      try {
        // dynamic import inside browser-only
        const heic2any = (await import("heic2any")).default;
        const convertedBlob = await heic2any({ blob: f, toType: "image/jpeg" });
        fileToUse = new File(
          [convertedBlob as Blob],
          f.name + ".jpg",
          { type: "image/jpeg" }
        );
      } catch (err) {
        console.error("HEIC conversion failed:", err);
        alert("Failed to convert HEIC image. Try another file.");
        return;
      }
    }

    setSrc(URL.createObjectURL(fileToUse));
    setCrop(undefined);
    setCompletedCrop(null);
    setAspect(3 / 4);
    setExportWidth(800);
    setExportHeight(Math.round(800 / (3 / 4)));
  };

  // Image load → recenter crop
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    if (!imgRef.current) return;
    const w = imgRef.current.width;
    const h = imgRef.current.height;
    const centered = centerAspectCrop(w, h, aspect, 80);
    setCrop(centered);
    if (aspect) setExportHeight(Math.round(exportWidth / aspect));
  };

  // Aspect change → recenter crop
  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current) {
      const w = imgRef.current.width;
      const h = imgRef.current.height;
      const centered = centerAspectCrop(w, h, newAspect, 80);
      setCrop(centered);
      if (newAspect) setExportHeight(Math.round(exportWidth / newAspect));
    } else {
      setCrop(undefined);
    }
  };

  // Keep exportHeight in sync with width when aspect is active
  useEffect(() => {
    if (aspect) {
      setExportHeight(Math.max(1, Math.round(exportWidth / aspect)));
    }
  }, [exportWidth, aspect]);

  // Download cropped image
  const downloadCropped = () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = Math.round(completedCrop.x * scaleX);
    const cropY = Math.round(completedCrop.y * scaleY);
    const cropW = Math.round(completedCrop.width * scaleX);
    const cropH = Math.round(completedCrop.height * scaleY);

    if (cropW <= 0 || cropH <= 0) return;

    let outW = exportWidth > 0 ? exportWidth : cropW;
    let outH = exportHeight > 0 ? exportHeight : cropH;

    if (aspect) {
      const cropRatio = cropW / cropH;
      outH = Math.round(outW / cropRatio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cropped.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const ratios = [
    { label: "3:4", value: 3 / 4 },
    { label: "4:6", value: 4 / 6 },
    { label: "16:9", value: 16 / 9 },
  ];

  return (
    <div className="p-6 space-y-6 border rounded shadow bg-white max-w-5xl mx-auto">
      {/* Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={onSelectFile}
          className="w-full text-sm file:bg-blue-50 file:px-4 file:py-2 file:rounded file:border file:border-blue-300 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </div>

      {src && (
        <>
          {/* Crop frame */}
          <div className="flex justify-center items-center min-h-[70vh]">
            <div className="relative w-full max-w-4xl max-h-[70vh] bg-gray-200 flex items-center justify-center overflow-hidden rounded shadow-inner">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
                aspect={aspect}
                keepSelection
              >
                <img
                  ref={imgRef}
                  src={src}
                  onLoad={onImageLoad}
                  alt="to crop"
                  className="max-w-full max-h-[70vh] object-contain"
                  style={{ display: "block" }}
                />
              </ReactCrop>
            </div>
          </div>

          <hr className="border-gray-300" />

          {/* Ratio buttons */}
          <div className="flex gap-3 flex-wrap justify-center">
            {ratios.map((r) => (
              <button
                key={r.label}
                onClick={() => handleAspectChange(r.value)}
                className={`px-4 py-2 rounded text-sm font-medium shadow ${
                  aspect === r.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => handleAspectChange(undefined)}
              className={`px-4 py-2 rounded text-sm font-medium shadow ${
                aspect === undefined
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Free
            </button>
          </div>

          <hr className="border-gray-300" />

          {/* Export size */}
          <div className="flex flex-wrap justify-center items-center gap-3">
            <label className="text-sm font-medium">Export size:</label>
            <input
              type="number"
              min={1}
              value={exportWidth}
              onChange={(e) =>
                setExportWidth(Math.max(1, Number(e.target.value)))
              }
              className="w-28 px-3 py-2 border rounded shadow-sm"
            />
            <span className="font-semibold">×</span>
            <input
              type="number"
              min={1}
              value={exportHeight}
              onChange={(e) =>
                setExportHeight(Math.max(1, Number(e.target.value)))
              }
              className="w-28 px-3 py-2 border rounded shadow-sm"
              disabled={!!aspect}
            />
          </div>

          <hr className="border-gray-300" />

          <div className="flex justify-center">
            <button
              onClick={downloadCropped}
              className="px-6 py-3 rounded bg-green-600 text-white font-semibold shadow hover:bg-green-700"
            >
              Crop & Download
            </button>
          </div>
        </>
      )}
    </div>
  );
}
