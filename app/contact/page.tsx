"use client";

import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="p-4 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Contact Us</h1>

      <p>
        Have a question, feedback, or need support with{" "}
        <strong>Freetlo.com</strong>? You can reach us anytime by email or by
        filling out the form below.
      </p>

      <h2 className="text-xl font-bold mt-4">Email</h2>
      <p>
        Direct email:{" "}
        <a href="mailto:hi@freetlo.com" className="underline text-blue-600">
          hi@freetlo.com
        </a>
      </p>

      <h2 className="text-xl font-bold mt-4">Contact Form</h2>
      <form
        action="https://formspree.io/f/mandkaep" // 🔹 replace with your Formspree endpoint
        method="POST"
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="_replyto"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Message</label>
          <textarea
            name="message"
            required
            className="mt-1 block w-full border rounded px-3 py-2"
            rows={4}
            placeholder="Write your message..."
          />
        </div>

        {/* Hidden field to redirect after submit (optional) */}
        <input type="hidden" name="_subject" value="New message from Freetlo.com" />
        <input type="hidden" name="_next" value="/contact?success=true" />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Send Message
        </button>
      </form>

      <h2 className="text-xl font-bold mt-4">Support</h2>
      <p>
        For more info, visit our{" "}
        <Link href="/about" className="underline text-blue-600">
          About
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="underline text-blue-600">
          Terms
        </Link>{" "}
        pages.
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
