"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Terms of Service</h1>

      <p>
        Welcome to <strong>Freetlo.com</strong> – a free online platform that
        provides tools for downloading videos, cropping images, and creating
        PDFs. By using this website, you agree to the following terms and
        conditions.
      </p>

      <h2 className="text-xl font-bold mt-4">Eligibility & Use</h2>
      <ul className="list-disc list-inside">
        <li>You must be at least 18 years old to use this service.</li>
        <li>Our services are free for personal, non-commercial use.</li>
        <li>
          You agree not to misuse the tools or use them for illegal purposes.
        </li>
      </ul>

      <h2 className="text-xl font-bold mt-4">Intellectual Property</h2>
      <p>
        Freetlo.com does not own or host any videos, images, or PDFs. All
        content remains the property of the original creators. You are
        responsible for ensuring your use complies with copyright and
        intellectual property laws in your country.
      </p>

      <h2 className="text-xl font-bold mt-4">Limitation of Liability</h2>
      <p>
        Freetlo.com is offered as a free tool. We make no guarantees regarding
        availability, accuracy, or reliability. We are not responsible for any
        damages, data loss, or legal issues that may arise from the use of this
        site.
      </p>

      <h2 className="text-xl font-bold mt-4">Changes to Terms</h2>
      <p>
        We may update these terms at any time without prior notice. It is your
        responsibility to review this page regularly for updates.
      </p>

      <h2 className="text-xl font-bold mt-4">Contact</h2>
      <p>
        If you have questions about these Terms, please visit our{" "}
        <Link href="/contact" className="underline text-blue-600">
          Contact page
        </Link>
        .
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
