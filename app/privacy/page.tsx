// app/privacy/page.tsx
import React from "react";
import Link from "next/link";


export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <section className="space-y-4 text-gray-700 leading-relaxed">
        <p>
          At Freetlo.com, your privacy is very important to us. This Privacy
          Policy explains how we collect, use, and protect your information
          when you use our website and services.
        </p>

        <h2 className="text-xl font-semibold mt-6">Information We Collect</h2>
        <p>
          We do not require personal information to use our free tools. Basic
          technical data, such as your browser type, IP address, and usage
          patterns, may be collected automatically to improve site performance.
        </p>

        <h2 className="text-xl font-semibold mt-6">How We Use Information</h2>
        <p>
          Any information collected is used solely to maintain and improve our
          services. We do not sell, rent, or share your personal information
          with third parties for marketing purposes.
        </p>

        <h2 className="text-xl font-semibold mt-6">Cookies</h2>
        <p>
          We may use cookies to enhance user experience, analyze site traffic,
          and display relevant advertising. You can disable cookies in your
          browser settings if you prefer.
        </p>

        <h2 className="text-xl font-semibold mt-6">Third-Party Ads</h2>
        <p>
          Freetlo.com uses Google AdSense to serve ads. Google may use cookies
          or similar technologies to display relevant ads based on your
          interests. You can learn more and manage your preferences in{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            className="text-blue-600 hover:underline"
            target="_blank"
          >
            Google’s Ads Policy
          </a>
          .
        </p>

        <p className="mt-6">
          If you have any questions, please{" "}
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
