"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 py-4 text-center border-t text-xs text-gray-400">
      <div className="space-x-4 mb-1">
        <Link href="/about" className="underline hover:text-blue-500">
          About
        </Link>
        <Link href="/terms" className="underline hover:text-blue-500">
          Terms of Service
        </Link>
        <Link href="/" className="underline hover:text-blue-500">
          Image Cropper & PDF Tools
        </Link>
      </div>
      <p>© 2025 Freetlo.com. All rights reserved.</p>
    </footer>
  );
}
