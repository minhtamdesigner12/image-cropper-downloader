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
    link.download = "output.pdf";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="p-4 space-y-4">
      <input type="file" accept="image/*" multiple onChange={handleFiles} />
      <button onClick={createPdf} className="px-4 py-2 bg-blue-600 text-white rounded">
        Create PDF
      </button>
    </div>
  );
}
