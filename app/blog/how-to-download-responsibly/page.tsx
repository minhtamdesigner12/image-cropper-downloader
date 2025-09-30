"use client";

import Link from "next/link";

export default function DownloadResponsiblyPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">How to Download Videos Responsibly</h1>

      <p>
        Downloading videos from the internet can be convenient, but it also
        comes with responsibilities. At <strong>Freetlo.com</strong>, we
        encourage users to respect copyrights and the rights of content creators.
      </p>

      <h2 className="text-xl font-bold mt-4">1. Understand Copyright Basics</h2>
      <p>
        Videos on platforms like YouTube, Facebook, and TikTok are protected by
        copyright. This means you should not redistribute or monetize content
        that isn’t yours.
      </p>

      <h2 className="text-xl font-bold mt-4">2. Personal Use Only</h2>
      <p>
        It’s generally acceptable to download videos for personal offline
        viewing, studying, or commentary. But using them commercially without
        permission can lead to legal issues.
      </p>

      <h2 className="text-xl font-bold mt-4">3. Use Fair Use Wisely</h2>
      <p>
        Fair use allows limited use of copyrighted material (such as commentary,
        criticism, or education). However, the rules vary by country, so be sure
        to check your local laws.
      </p>

      <h2 className="text-xl font-bold mt-4">4. Always Credit Creators</h2>
      <p>
        If you share downloaded content in any way (e.g., for school projects),
        always give proper credit to the original creator.
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
