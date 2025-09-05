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
