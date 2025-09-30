"use client";

import Link from "next/link";

export default function CreatePdfGuidePage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">
        How to Create PDFs Like a Pro
      </h1>

      <p>
        PDFs are one of the most widely used file formats in the world. They
        preserve formatting, are easy to share, and work across almost any
        device. At <strong>Freetlo.com</strong>, you can create PDFs from
        images in just a few clicks. Here are some tips to get the best results.
      </p>

      <h2 className="text-xl font-bold mt-4">1. Organize Your Images</h2>
      <p>
        Before creating a PDF, rename your files in the order you want them to
        appear. For example, “Page-1.jpg”, “Page-2.jpg”, etc.
      </p>

      <h2 className="text-xl font-bold mt-4">2. Use High-Resolution Images</h2>
      <p>
        Low-quality images may look blurry in a PDF. Upload clear, high-resolution
        images to maintain professional quality.
      </p>

      <h2 className="text-xl font-bold mt-4">3. Compress for Sharing</h2>
      <p>
        If your PDF is too large, it may be hard to email or upload. Use
        compression tools to reduce file size without losing too much quality.
      </p>

      <h2 className="text-xl font-bold mt-4">4. Add Titles or Captions</h2>
      <p>
        Adding short text under each image (before making the PDF) makes your
        document more understandable and engaging.
      </p>

      <h2 className="text-xl font-bold mt-4">5. Check Before Sending</h2>
      <p>
        Always preview your PDF before sharing. Make sure pages are in order,
        text is readable, and nothing important is cut off.
      </p>

      <p>
        With these simple steps, you can create PDFs that look clean,
        professional, and easy to share.
      </p>

      <section className="text-center mt-6">
        <Link
          href="/blog"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Back to Blog
        </Link>
      </section>
    </main>
  );
}
