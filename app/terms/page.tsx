"use client";

import Link from "next/link";
import Ad from "../components/Ad";

export default function TermsPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Terms of Service</h1>

      <p>
        Welcome to <strong>Freetlo.com</strong> – a free online platform to download videos, crop images, and create PDFs.
      </p>

      <h2 className="text-xl font-bold mt-4">Terms of Use</h2>
      <ul className="list-disc list-inside">
        <li>You must be at least 18 years old to use this service.</li>
        <li>Services are free for personal, non-commercial use.</li>
        <li>We do not own or host any videos, images, or PDFs. All content remains property of the original creator.</li>
        <li>You are responsible for ensuring your use does not violate copyright or intellectual property rights.</li>
      </ul>

      <h2 className="text-xl font-bold mt-4">Limitation of Liability</h2>
      <p>Freetlo.com is a free tool. We are not responsible for damages, data loss, or copyright violations.</p>

      {/* Optional Ad */}
      <Ad slot="1234567895" className="my-6" />

      <h2 className="text-xl font-bold mt-4">Changes to Terms</h2>
      <p>We may update these terms at any time without notice. Check regularly for updates.</p>

      {/* Back to Home Button */}
      <section className="text-center mt-6">
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}
