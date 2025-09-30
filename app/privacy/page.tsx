"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Privacy Policy</h1>

      <p>
        Your privacy matters to us. This Privacy Policy explains how{" "}
        <strong>Freetlo.com</strong> collects, uses, and protects your
        information when you use our free tools.
      </p>

      <h2 className="text-xl font-bold mt-4">Information We Collect</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>No sign-up is required. We do not ask for personal information.</li>
        <li>
          We may collect anonymous technical data such as browser type and
          device information to improve performance.
        </li>
        <li>
          Google AdSense and Google Analytics may use cookies for ads and
          traffic reporting.
        </li>
      </ul>

      <h2 className="text-xl font-bold mt-4">How We Use Data</h2>
      <p>
        Data collected is used only to maintain and improve the site. We never
        sell or rent your data. Information may be shared only if required by
        law.
      </p>

      <h2 className="text-xl font-bold mt-4">Cookies</h2>
      <p>
        Third-party vendors, including Google, use cookies to serve ads based on
        your browsing history. You can disable cookies or manage preferences
        through your browser settings or{" "}
        <a
          href="https://www.google.com/settings/ads/"
          className="underline text-blue-600"
        >
          Google Ads Settings
        </a>
        .
      </p>

      <h2 className="text-xl font-bold mt-4">Your Rights</h2>
      <p>
        You may request access to or deletion of your data at any time by
        contacting us at{" "}
        <a href="mailto:hi@freetlo.com" className="underline text-blue-600">
          hi@freetlo.com
        </a>
        .
      </p>

      <p className="text-sm text-gray-500">Last updated: September 2025</p>

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
