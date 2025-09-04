"use client";

import Link from "next/link";
import Ad from "@/components/Ad";

export default function AboutPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-8">
      {/* About Section */}
      <section>
        <h1 className="text-2xl font-bold text-center">About Freetlo.com</h1>
        <p className="mt-4">
          <strong>Freetlo.com</strong> is a <strong>free online tool</strong> designed to help users:
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>Download videos</li>
          <li>Crop images</li>
          <li>Create PDFs from images</li>
        </ul>
        <p className="mt-2">
          Our goal is simply to provide a free service to support users. There are no hidden fees or subscriptions.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Disclaimer: Freetlo.com is not affiliated with Facebook, Meta Platforms, Inc., or any other brands. Use responsibly and at your own risk.
        </p>
      </section>

      {/* Optional Ad */}
      <Ad slot="1234567894" className="my-6" />

      {/* Donate / Support Section */}
      <section>
        <h2 className="text-xl font-bold">Support / Donate</h2>
        <p className="mt-2">
          Supporting <strong>Freetlo.com</strong> helps us maintain and improve the platform:
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>Website hosting and maintenance</li>
        </ul>
        <p className="mt-2">
          PayPal donations accepted at:{" "}
          <a href="https://www.paypal.com/donate/?business=minhtamdesign@gmail.com" className="underline text-blue-600">
            minhtamdesign@gmail.com
          </a>
        </p>
      </section>

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
