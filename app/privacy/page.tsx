"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Privacy Policy</h1>

      <p>
        At <strong>Freetlo.com</strong>, we respect your privacy. This Privacy
        Policy explains how we collect, use, and protect your information when
        you use our free tools, including the video downloader, image cropper,
        and PDF maker.
      </p>

      <h2 className="text-xl font-bold mt-4">Information We Collect</h2>
      <ul className="list-disc list-inside">
        <li>
          We do not require accounts, registration, or personal details to use
          our tools.
        </li>
        <li>
          We may collect limited technical data (browser type, device, usage
          stats) to improve performance.
        </li>
        <li>
          Google AdSense and Analytics may use cookies to display ads and track
          traffic.
        </li>
      </ul>

      <h2 className="text-xl font-bold mt-4">How We Use Information</h2>
      <p>
        Any data collected is used only to provide, maintain, and improve our
        services. We never sell or rent your data. Information may be shared
        only if required by law.
      </p>

      <h2 className="text-xl font-bold mt-4">Cookies</h2>
      <p>
        Third-party vendors, including Google, use cookies to serve ads based on
        your prior visits to this or other websites. You can opt out of
        personalized ads through your browser settings or Google Ads Settings.
      </p>

      <h2 className="text-xl font-bold mt-4">Third-Party Links</h2>
      <p>
        Our site may contain links to external websites. We are not responsible
        for the privacy practices of those websites. Please review their
        policies separately.
      </p>

      <h2 className="text-xl font-bold mt-4">Your Rights</h2>
      <p>
        You can control cookies through your browser and opt out of
        personalized advertising. If you have questions about your data, please
        contact us at{" "}
        <a href="mailto:hi@freetlo.com" className="underline text-blue-600">
          hi@freetlo.com
        </a>
        .
      </p>

      <h2 className="text-xl font-bold mt-4">Updates</h2>
      <p>
        We may update this Privacy Policy from time to time. Updates will be
        posted on this page with the date of the last revision.
      </p>

      <p className="text-sm text-gray-500">Last updated: September 2025</p>

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
