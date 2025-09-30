"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Terms of Service</h1>

      <p>
        Welcome to <strong>Freetlo.com</strong>. These Terms of Service explain
        the rules and responsibilities that apply when you use our free tools.
        By accessing our website, you agree to follow these terms. If you do not
        agree, please stop using our services immediately.
      </p>

      <h2 className="text-xl font-bold mt-4">Eligibility & Use</h2>
      <ul className="list-disc list-inside space-y-1">
        <li>You must be at least 18 years old to use this website.</li>
        <li>Our services are provided for personal and non-commercial use.</li>
        <li>
          You may not use Freetlo.com for any illegal or harmful activity,
          including copyright infringement or distributing malicious content.
        </li>
      </ul>

      <h2 className="text-xl font-bold mt-4">Intellectual Property</h2>
      <p>
        Freetlo.com does not host or own any videos, images, or PDFs generated
        by users. All content remains the property of the original creators. You
        are responsible for ensuring your use of the tools complies with
        copyright and intellectual property laws.
      </p>

      <h2 className="text-xl font-bold mt-4">Limitation of Liability</h2>
      <p>
        Freetlo.com is provided as-is, without warranties. While we strive for
        reliability, we are not responsible for service interruptions, loss of
        data, or damages arising from the use of this website. You use our tools
        at your own risk.
      </p>

      <h2 className="text-xl font-bold mt-4">Changes to Terms</h2>
      <p>
        We may update these Terms at any time. Updates will take effect
        immediately once published. It is your responsibility to review this
        page regularly.
      </p>

      <h2 className="text-xl font-bold mt-4">Contact</h2>
      <p>
        For questions about these Terms, please visit our{" "}
        <Link href="/contact" className="underline text-blue-600">
          Contact page
        </Link>{" "}
        or email us directly.
      </p>

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
