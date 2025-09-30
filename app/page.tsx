"use client";

import Head from "next/head";
import Image from "next/image";
import Script from "next/script";
import CropperPane from "./components/CropperPane";
import DownloaderPane from "./components/DownloaderPane";
import PdfMakerPane from "./components/PdfMakerPane";
import Footer from "./components/Footer";
import Ad from "./components/Ad";
import Link from "next/link";


export default function Page() {
  return (
    <>
      <Head>
        <title>
          Freetlo.com - Free Video Downloader, Image Cropper & PDF Maker
        </title>
        <meta
          name="description"
          content="Use Freetlo.com to download videos, crop images, and create PDFs for free. Learn how to safely use online tools for personal and educational purposes."
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
        {/* Header */}
        <header className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
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
          </div>
          <nav>
            <Link href="/blog" className="text-blue-600 underline text-sm">
              Blog
            </Link>
          </nav>
        </header>


        {/* Intro */}
        <section>
          <p className="text-gray-700 text-sm leading-relaxed">
            Welcome to <strong>Freetlo.com</strong> — your free online toolkit
            for downloading videos, cropping images, and creating PDFs. We built
            these tools to be <em>fast, reliable, and accessible</em> for
            students, teachers, and professionals. All features are completely
            free and require no registration.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mt-3">
            Unlike many sites that hide features behind subscriptions, our
            mission is to make essential digital tools available to everyone. We
            focus on usability, safety, and simplicity so you can complete tasks
            in just a few clicks.
          </p>
        </section>

        {/* Video Downloader */}
        <article>
          <h2 className="text-base font-bold mb-4">
            Download Videos (Facebook, TikTok, Instagram, X.com)
          </h2>
          <p className="mb-2 text-gray-700">
            Copy and paste a video link from one of the supported platforms to
            download it instantly. Please use this tool responsibly and respect
            copyright laws — only download content you have the right to use.
          </p>
          <DownloaderPane />
          <p className="text-gray-700 text-sm leading-relaxed mt-3">
            This downloader works directly in your browser. No software
            installation is required, and files are processed quickly. It’s
            perfect for saving educational videos, personal content, or clips
            shared by friends. Always remember that copyrighted material should
            not be downloaded without permission.
          </p>
        </article>

        {/* Ad */}
        <Ad slot="1234567890" className="my-8 h-10" />

        {/* Cropper Tool */}
        <article>
          <h2 className="text-base font-bold mb-4">
            Crop Images Easily (3:4, 4:6, 16:9, or Custom)
          </h2>
          <p className="mb-2 text-gray-700">
            Upload your photo, choose a preset aspect ratio, or enter a custom
            size. Download the cropped image instantly for social media,
            presentations, or printing.
          </p>
          <CropperPane />
          <p className="text-gray-700 text-sm leading-relaxed mt-3">
            This feature is useful when preparing profile pictures, resizing
            images for presentations, or adjusting photos to fit specific
            formats. Whether you need 16:9 for videos or 4:6 for printing, the
            tool ensures clean results without the need for advanced software.
          </p>
        </article>

        {/* PDF Maker */}
        <article>
          <h2 className="text-base font-bold mb-4">Create PDFs from Images</h2>
          <p className="mb-2 text-gray-700">
            Merge multiple images into a single PDF file. This feature is useful
            for reports, portfolios, or sharing photo collections in a portable
            format.
          </p>
          <PdfMakerPane />
          <p className="text-gray-700 text-sm leading-relaxed mt-3">
            PDFs are widely accepted in schools and businesses. By combining
            your images into one file, you can easily share assignments,
            projects, or design mockups. Freetlo’s PDF Maker keeps everything
            secure on your device — your images are never uploaded to our
            servers.
          </p>
        </article>

        {/* Educational Section */}
        <section>
          <h2 className="text-base font-bold mb-4">How to Use These Tools</h2>
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>Paste a video link and click download.</li>
            <li>Upload an image, adjust the crop, then download it.</li>
            <li>Upload multiple images to generate a single PDF file.</li>
          </ol>
          <p className="mt-3 text-sm text-gray-600">
            ⚠️ Disclaimer: These tools are provided for{" "}
            <strong>personal use only</strong>. Please respect copyright laws
            and terms of service of other platforms.
          </p>
        </section>

        {/* FAQ */}
        <section>
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
              <p>
                Yes. All processing happens in your browser. We do not collect or
                store your files.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">
                Can I use these tools for commercial work?
              </h3>
              <p>
                The tools are free and open for personal projects. For
                commercial use, ensure that you respect copyright and legal
                requirements in your country.
              </p>
            </div>
          </div>
        </section>

        {/* Educational Blog-style Section */}
        <section>
          <h2 className="text-base font-bold mb-4">
            Why Free Online Tools Matter
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Many people around the world do not have access to expensive
            software. Free tools like Freetlo make basic digital tasks possible
            for students, teachers, freelancers, and small businesses. By
            lowering barriers, we help more people participate in the digital
            economy.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mt-2">
            Our goal is not only to provide tools but also to educate users on
            safe and responsible digital practices. From respecting copyrights
            to understanding file formats, we aim to empower users with both
            technology and knowledge.
          </p>
        </section>

        {/* Ad near footer */}
        <Ad slot="1234567891" className="my-10 h-10" />
      </main>

      <Footer />
    </>
  );
}
