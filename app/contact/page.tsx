"use client";

import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Contact Us</h1>

      <p>
        Have a question, feedback, or need support with{" "}
        <strong>Freetlo.com</strong>? You can reach us anytime by email.
      </p>

      <h2 className="text-xl font-bold mt-4">Email</h2>
      <p>
        Direct email:{" "}
        <a href="mailto:hi@freetlo.com" className="underline text-blue-600">
          hi@freetlo.com
        </a>
      </p>

      <h2 className="text-xl font-bold mt-4">Support</h2>
      <p>
        For more info, visit our{" "}
        <Link href="/about" className="underline text-blue-600">
          About
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="underline text-blue-600">
          Terms
        </Link>{" "}
        pages.
      </p>

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
