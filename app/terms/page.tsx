// app/terms/page.tsx
import React from "react";
import Link from "next/link";


export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <section className="space-y-4 text-gray-700 leading-relaxed">
        <p>
          By accessing and using Freetlo.com, you agree to the following terms
          and conditions. Please read them carefully.
        </p>

        <h2 className="text-xl font-semibold mt-6">Use of Services</h2>
        <p>
          Freetlo provides free online PDF tools for personal and educational
          use. You may not use our services for unlawful purposes, abuse the
          system, or interfere with the website’s normal operation.
        </p>

        <h2 className="text-xl font-semibold mt-6">Intellectual Property</h2>
        <p>
          All content, design, and functionality on Freetlo.com are the property
          of Freetlo and may not be copied or reproduced without permission.
        </p>

        <h2 className="text-xl font-semibold mt-6">Disclaimer of Liability</h2>
        <p>
          Freetlo.com is provided “as is” without warranties of any kind. We are
          not responsible for any data loss, errors, or damages resulting from
          the use of our tools or services.
        </p>

        <h2 className="text-xl font-semibold mt-6">Changes to Terms</h2>
        <p>
          We may update these Terms of Service from time to time. Continued use
          of the website means you accept any changes.
        </p>

        <p className="mt-6">
          If you have questions, please{" "}
          <a href="/contact" className="text-blue-600 hover:underline">
            contact us
          </a>
          .
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
