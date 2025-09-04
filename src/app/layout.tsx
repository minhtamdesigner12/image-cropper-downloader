import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Cropper & Downloader",
  description: "Crop images, download videos, and create PDFs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2028237203618434"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
