"use client";

import Link from "next/link";

export default function ImageEditingTipsPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">
        5 Quick Tips for Better Image Cropping
      </h1>

      <p>
        Cropping images may seem like a simple task, but doing it well can make
        a huge difference in how professional and polished your pictures look.
        Whether you are preparing images for social media, a presentation, or a
        personal project, these tips will help.
      </p>

      <h2 className="text-xl font-bold mt-4">1. Use the Rule of Thirds</h2>
      <p>
        Divide your image into three equal parts horizontally and vertically.
        Place key subjects near the intersections for a more balanced
        composition.
      </p>

      <h2 className="text-xl font-bold mt-4">2. Keep the Focus Clear</h2>
      <p>
        Crop out distractions around your subject. A clean background makes the
        main subject stand out more.
      </p>

      <h2 className="text-xl font-bold mt-4">3. Maintain Aspect Ratios</h2>
      <p>
        Use preset ratios like 16:9 for widescreen or 1:1 for Instagram. This
        ensures consistency and avoids awkward resizing later.
      </p>

      <h2 className="text-xl font-bold mt-4">4. Consider Negative Space</h2>
      <p>
        Don’t always zoom in too close. Leaving space around the subject can
        create a more professional and artistic feel.
      </p>

      <h2 className="text-xl font-bold mt-4">5. Save a Copy</h2>
      <p>
        Always save the original image before cropping. That way, you can return
        to it if you want a different crop later.
      </p>

      <p>
        Cropping is both technical and artistic. With practice, you’ll learn
        what looks best for your projects.
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
