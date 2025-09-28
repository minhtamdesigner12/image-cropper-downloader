"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-8">
      {/* About Section */}
      <section>
        <h1 className="text-2xl font-bold text-center">About Freetlo.com</h1>
        <p className="mt-4">
          <strong>Freetlo.com</strong> was created to provide free, simple, and
          effective online tools for everyday digital tasks. We noticed that
          many sites charge fees or hide features behind subscriptions, so our
          goal is to make useful tools accessible to everyone.
        </p>
        <p className="mt-2">
          On Freetlo.com you can:
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>Download videos from popular platforms (for personal use only)</li>
          <li>Crop images with preset ratios or custom dimensions</li>
          <li>Create and combine PDFs from images</li>
        </ul>
        <p className="mt-2">
          We are committed to offering free tools without hidden costs, so you
          can complete tasks quickly without barriers.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Disclaimer: Freetlo.com is not affiliated with Facebook, Meta
          Platforms, Inc., or any other brands. All trademarks and copyrights
          belong to their respective owners. Users are responsible for using the
          tools in compliance with copyright and intellectual property laws.
        </p>
      </section>

      {/* Mission Section */}
      <section>
        <h2 className="text-xl font-bold">Our Mission</h2>
        <p className="mt-2">
          Technology should be easy. Our mission is to help people work with
          media files quickly, whether you’re a student making a presentation, a
          professional preparing documents, or just someone editing photos for
          social media. Freetlo.com is here to save you time.
        </p>
      </section>

      {/* Support / Donate Section */}
      <section>
        <h2 className="text-xl font-bold">Support / Donate</h2>
        <p className="mt-2">
          Supporting <strong>Freetlo.com</strong> helps us maintain and improve
          the platform:
        </p>
        <ul className="list-disc list-inside mt-2">
          <li>Website hosting and maintenance</li>
          <li>Developing new tools and improving existing ones</li>
        </ul>
        <p className="mt-2">
          PayPal donations accepted at:{" "}
          <a
            href="https://www.paypal.com/donate/?business=minhtamdesign@gmail.com"
            className="underline text-blue-600"
          >
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
