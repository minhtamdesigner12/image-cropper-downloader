import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Videos, Image Cropper & PDF Tools - Freetlo.com",
  description:
    "Freetlo.com provides free online tools to download videos, crop images, and create PDFs from images easily.",
  keywords:
    "download videos, video downloader, image cropper, pdf maker, free tools, freetlo.com",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
