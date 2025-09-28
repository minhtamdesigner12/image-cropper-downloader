// app/about/page.tsx
import React from "react";
import Link from "next/link";


export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">About Freetlo</h1>

      <section className="space-y-4 text-gray-700 leading-relaxed">
        <p>
          Freetlo.com was created to provide free, reliable, and easy-to-use
          online tools for students, teachers, and professionals. Our mission is
          to make digital tasks—like working with PDF files—accessible to
          everyone without requiring expensive software or complicated
          installations.
        </p>

        <p>
          Whether you need to merge, split, compress, or convert PDFs, Freetlo
          offers a fast and secure solution directly from your browser. We
          believe that technology should empower people, and that’s why all of
          our tools are completely free to use.
        </p>

        <p>
          We are continuously improving the platform by adding new features and
          enhancing performance, so users can focus on learning, teaching, and
          working more efficiently.
        </p>

        <p>
          If you have questions, suggestions, or feedback, please feel free to{" "}
          <a href="/contact" className="text-blue-600 hover:underline">
            contact us
          </a>
          . Your input helps us grow and provide better services.
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
