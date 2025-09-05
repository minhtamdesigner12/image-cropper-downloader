import CropperPane from "@/components/CropperPane";
import DownloaderPane from "@/components/DownloaderPane";
import PdfMakerPane from "@/components/PdfMakerPane";
import Footer from "@/components/Footer";
import Ad from "@/components/Ad";

export default function Page() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Download Videos, Image Cropper & PDF Tools
      </h1>

      <Ad slot="1234567890" className="my-1" />

      <section>
        <h2 className="text-xl font-bold mb-4">
          Crop Image with ratio 3:4, 4:6, 16:9 and enter the width
        </h2>
        <CropperPane />
      </section>

      <Ad slot="1234567891" className="my-1" />

      <section>
        <h2 className="text-xl font-bold mb-4">Download Video</h2>
        <DownloaderPane />
      </section>

      <Ad slot="1234567892" className="my-1" />

      <section>
        <h2 className="text-xl font-bold mb-4">PDF Maker</h2>
        <PdfMakerPane />
      </section>

      <Ad slot="1234567893" className="my-6 mb-12" />
      <Footer />
    </main>
  );
}
