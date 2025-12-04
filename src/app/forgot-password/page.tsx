"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Placeholder only – no real email logic
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Simple header */}
      <header className="w-full py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">
            Global Health Intelligence
          </span>
        </div>
        <span className="text-xs text-slate-500">
          Password reset (demo only)
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-100 px-6 py-8">
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to sign in
            </Link>
          </div>

          <h1 className="text-xl font-semibold text-slate-900 mb-2">
            Forgot your password?
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Enter the email address associated with your account. In a real
            system, we would send you a link to reset your password. Here, this
            page is a front-end placeholder only.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!email.trim()}
            >
              Send reset link (demo)
            </button>
          </form>

          {submitted && (
            <p className="mt-4 text-xs text-emerald-600">
              In a real application, a password reset email would now be sent to{" "}
              <strong>{email}</strong>. Since this is a demo, no email has been
              sent.
            </p>
          )}

          <p className="mt-6 text-[11px] text-slate-400">
            This page exists to show the full password reset flow for the UI.
            Backend integration can be added later if needed.
          </p>
        </div>
      </main>
    </div>
  );
}
