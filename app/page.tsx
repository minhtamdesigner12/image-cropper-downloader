import Head from "next/head";
import Image from "next/image";
import Script from "next/script"; // ✅ Google Analytics
import CropperPane from "./components/CropperPane";
import DownloaderPane from "./components/DownloaderPane";
import PdfMakerPane from "./components/PdfMakerPane";
import Footer from "./components/Footer";
import Ad from "./components/Ad";

export default function Page() {
  return (
    <>
      <Head>
        <title>Freetlo.com - Free Video Downloader, Image Cropper & PDF Maker</title>
        <meta
          name="description"
          content="Use Freetlo.com to download videos, crop images, and create PDFs for free. Simple, safe, and accessible tools for students, teachers, and professionals."
        />
        <meta
          name="keywords"
          content="video downloader, facebook video, tiktok downloader, instagram downloader, x.com downloader, image cropper, pdf maker, free tools, freetlo"
        />
      </Head>

      {/* Google Analytics */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-GFPFE9ZC7L"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-GFPFE9ZC7L');
        `}
      </Script>

      <main className="p-4 max-w-5xl mx-auto space-y-12">
        {/* 🔹 Header */}
        <header className="flex items-center gap-3 mb-8">
          <Image
            src="/logo.svg"
            alt="Freetlo Logo"
            width={44}
            height={0}
            className="h-8 w-auto"
          />
          <h1 className="text-sm font-bold">
            Free Tools: Video Downloader, Image Cropper & PDF Maker
          </h1>
        </header>

        {/* 🔹 Intro */}
        <section style={{ marginTop: "8px" }}>
          <p className="text-gray-700 text-sm leading-relaxed">
            Welcome to <strong>Freetlo.com</strong> — your free online toolkit for
            downloading videos, cropping images, and creating PDFs. 
            These tools are built to be fast, simple, and accessible for everyone. 
            All features are 100% free with no registration required. 
          </p>
        </section>

        {/* 🔹 Video Downloader */}
      <article style={{ marginTop: "20px" }}>
          <h2 className="text-base font-bold mb-4">
            Download Videos (Facebook, TikTok, Instagram, X.com)
          </h2>
          <p className="mb-2 text-gray-700">
            Copy and paste a video link from one of the supported platforms to
            download it instantly. Use this feature responsibly and respect
            copyright laws — only download content you have the right to use.
          </p>
          <DownloaderPane />
          <p className="mt-2 text-sm text-gray-500">
            🔄 To download another video, refresh the page and paste the new link.
          </p>
        </article>

        {/* 🔹 Ad after main content */}
        <Ad slot="1234567890" className="my-8 h-10" />

        {/* 🔹 Cropper Tool */}
      <article style={{ marginTop: "20px" }}>
          <h2 className="text-base font-bold mb-4">
            Crop Images Easily (3:4, 4:6, 16:9, or Custom)
          </h2>
          <p className="mb-2 text-gray-700">
            Upload your photo, choose a preset aspect ratio, or enter a custom
            size. Download the cropped image instantly for social media,
            presentations, or printing.
          </p>
          <CropperPane />
        </article>

        {/* 🔹 PDF Maker */}
      <article style={{ marginTop: "20px" }}>
          <h2 className="text-base font-bold mb-4">Create PDFs from Images</h2>
          <p className="mb-2 text-gray-700">
            Merge multiple images into a single PDF file. This feature is useful
            for reports, portfolios, or sharing photo collections in a portable
            format.
          </p>
          <PdfMakerPane />
        </article>

        {/* 🔹 Educational Content (Policy-friendly) */}
        <section style={{ marginTop: "20px" }}>
          <h2 className="text-base font-bold mb-4">How to Use These Tools</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>Paste a video link and click download.</li>
            <li>Upload an image, adjust the crop, then download it.</li>
            <li>Upload multiple images to generate a single PDF file.</li>
          </ol>
          <p className="mt-3 text-sm text-gray-600">
            ⚠️ Disclaimer: These tools are provided for <strong>personal use only</strong>. 
            Do not use them to infringe on copyrights or violate terms of service of other platforms.
          </p>
        </section>

        {/* 🔹 FAQ */}
        <section style={{ marginTop: "20px" }}>
          <h2 className="text-base font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold">Are these tools free?</h3>
              <p>Yes, all tools on Freetlo.com are 100% free.</p>
            </div>
            <div>
              <h3 className="font-semibold">Do I need to sign up?</h3>
              <p>No, you can use the tools instantly without registration.</p>
            </div>
            <div>
              <h3 className="font-semibold">Is my data safe?</h3>
              <p>We do not collect personal data for tool usage. Your files remain on your device.</p>
            </div>
          </div>
        </section>

        {/* 🔹 Ad near footer */}
        <Ad slot="1234567891" className="my-10 h-10" />
      </main>

      <Footer />
    </>
  );
}
