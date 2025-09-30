"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-center">About Freetlo.com</h1>
        <p className="mt-4">
          <strong>Freetlo.com</strong> was created with one goal in mind: to make
          powerful yet simple online tools accessible to everyone. Many websites
          charge hidden fees, require logins, or overwhelm users with ads. Our
          mission is to provide clean, free, and useful tools for everyday
          digital tasks.
        </p>
        <p className="mt-2">Here’s what you can do on Freetlo.com:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Download videos from social platforms (for personal use only).</li>
          <li>Crop and resize images with preset or custom dimensions.</li>
          <li>Create professional PDFs from multiple images.</li>
        </ul>
        <p className="mt-2">
          Our tools are designed to be lightweight, fast, and accessible from any
          device — whether you’re on a computer, tablet, or smartphone.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold">Our Mission</h2>
        <p className="mt-2">
          We believe technology should make life easier, not harder. That’s why
          Freetlo.com is built to save you time: whether you’re a student
          working on a school project, a professional preparing documents, or
          just someone editing photos for fun.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold">How We Stay Free</h2>
        <p className="mt-2">
          Freetlo.com is supported by non-intrusive ads. These allow us to cover
          server costs and keep the tools available for everyone at no charge.
          We never sell your data or require you to create an account.
        </p>
      </section>

      <p className="text-sm text-gray-500 mt-4">
        Disclaimer: Freetlo.com is not affiliated with Facebook, TikTok,
        Instagram, or any other third-party platforms. All trademarks and
        copyrights belong to their respective owners. Users are responsible for
        complying with copyright laws.
      </p>

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
