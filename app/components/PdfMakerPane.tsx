"use client";

import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

export default function PdfMakerPane() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const createPdf = async () => {
    const { default: heic2any } = await import("heic2any");
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      let workingFile = file;

      if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
        const converted = await heic2any({ blob: file, toType: "image/jpeg" });
        workingFile = new File([converted as Blob], file.name.replace(/.heic$/i, ".jpg"), { type: "image/jpeg" });
      }

      const bytes = await workingFile.arrayBuffer();
      const img = workingFile.type === "image/png"
        ? await pdfDoc.embedPng(bytes)
        : await pdfDoc.embedJpg(bytes);

      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([Uint8Array.from(pdfBytes)], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "freetlo.com output.pdf";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
   <div className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded bg-white shadow">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="w-full sm:flex-grow text-sm file:bg-blue-50 file:px-4 file:py-2 file:rounded file:border file:border-blue-300 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
      />
      <button
        onClick={createPdf}
        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded whitespace-nowrap"
      >
        Create PDF
      </button>
    </div>


  );
}
