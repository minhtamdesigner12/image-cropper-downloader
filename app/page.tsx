import Head from "next/head";
import Image from "next/image";
import CropperPane from "./components/CropperPane";
import DownloaderPane from "./components/DownloaderPane";
import PdfMakerPane from "./components/PdfMakerPane";
import Footer from "./components/Footer";
import Ad from "./components/Ad";

export default function Page() {
  return (
    <>
      <Head>
        <title>Download Videos, Image Cropper & PDF Tools - Freetlo.com</title>
        <meta
          name="description"
          content="Freetlo.com provides free online tools to download videos, crop images, and create PDFs from images easily."
        />
        <meta
          name="keywords"
          content="download videos, video downloader, image cropper, pdf maker, free tools, freetlo.com"
        />
      </Head>

      <main className="p-4 max-w-4xl mx-auto space-y-10">
        {/* 🔹 Header with Logo + Title */}
        <header className="flex items-center gap-3 mb-8">
          <Image
            src="/logo.svg"
            alt="Freetlo Logo"
            width={44}
            height={0}
            className="h-8 w-auto"
          />
          <h1 className="text-2xl font-bold">
            Download Videos, Image Cropper & PDF Tools
          </h1>
        </header>

        <Ad slot="1234567890" className="my-1 h-10" />

        <section>
          <h2 className="text-xl font-bold mb-4">
            Crop Image with ratio 3:4, 4:6, 16:9 and enter the width
          </h2>
          <CropperPane />
        </section>

        <Ad slot="1234567891" className="my-1 h-10" />

        <section>
          <h2 className="text-xl font-bold mb-4">Download Video</h2>
          <DownloaderPane /> {/* ✅ inside this, input will be full width */}
        </section>

        <Ad slot="1234567892" className="my-1 h-10" />

        <section>
          <h2 className="text-xl font-bold mb-4">PDF Maker</h2>
          <PdfMakerPane />
        </section>

        <Ad slot="1234567893" className="my-6 mb-12" />
      </main>

      <Footer />
    </>
  );
}
