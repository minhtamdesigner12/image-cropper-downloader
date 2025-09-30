"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 py-4 text-center border-t text-xs text-gray-400">
      <div className="space-x-4 mb-1">
        <Link href="/about" className="underline hover:text-blue-500">
          About
        </Link>
        <Link href="/blog" className="underline hover:text-blue-500">
          Blog
        </Link>
        <Link href="/terms" className="underline hover:text-blue-500">
          Terms of Service
        </Link>
        <Link href="/privacy" className="underline hover:text-blue-500">
          Privacy Policy
        </Link>
        <Link href="/contact" className="underline hover:text-blue-500">
          Contact
        </Link>
      </div>
      <p>© 2025 Freetlo.com. All rights reserved.</p>
    </footer>
  );
}
