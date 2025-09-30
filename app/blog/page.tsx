"use client";

import Link from "next/link";

export default function BlogPage() {
  return (
    <main className="p-4 max-w-4xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Blog & Guides – Freetlo.com
      </h1>

      <p className="text-gray-700">
        Welcome to the <strong>Freetlo Blog</strong>. Here you’ll find tips,
        guides, and tutorials on how to make the most of our free tools. We
        focus on practical knowledge, responsible usage, and productivity
        tricks.
      </p>

      {/* Article 1 */}
      <article className="space-y-3 border-b pb-6">
        <h2 className="text-xl font-bold">
          <Link href="/blog/how-to-download-responsibly" className="hover:underline">
            How to Download Videos Responsibly
          </Link>
        </h2>
        <p className="text-gray-700">
          Learn the do’s and don’ts of downloading videos online. This article
          explains copyright basics, fair use, and tips for personal vs.
          commercial use.
        </p>
        <Link
          href="/blog/how-to-download-responsibly"
          className="text-blue-600 underline text-sm"
        >
          Read more →
        </Link>
      </article>

      {/* Article 2 */}
      <article className="space-y-3 border-b pb-6">
        <h2 className="text-xl font-bold">
          <Link href="/blog/image-editing-tips" className="hover:underline">
            5 Quick Tips for Better Image Cropping
          </Link>
        </h2>
        <p className="text-gray-700">
          Cropping images seems simple, but small adjustments can make your
          photos look more professional. We share five practical tricks for
          better results.
        </p>
        <Link
          href="/blog/image-editing-tips"
          className="text-blue-600 underline text-sm"
        >
          Read more →
        </Link>
      </article>

      {/* Article 3 */}
      <article className="space-y-3">
        <h2 className="text-xl font-bold">
          <Link href="/blog/create-pdf-guide" className="hover:underline">
            How to Create PDFs Like a Pro
          </Link>
        </h2>
        <p className="text-gray-700">
          PDFs are one of the most widely used formats for sharing files. This
          guide shows you how to merge, organize, and optimize PDFs for work,
          school, or personal projects.
        </p>
        <Link
          href="/blog/create-pdf-guide"
          className="text-blue-600 underline text-sm"
        >
          Read more →
        </Link>
      </article>

      <section className="text-center mt-10">
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
