"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft, Mail } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const passwordsMismatch =
    newPassword.trim().length > 0 &&
    confirm.trim().length > 0 &&
    newPassword !== confirm;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !newPassword.trim() || passwordsMismatch) return;
    // Placeholder only – no real backend reset
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
          Reset password (demo only)
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
            Reset your password
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            In a real application, this page would be opened from a secure link
            sent to your email. Here, it is a front-end demo to complete the
            login / forgot / reset flow.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
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

            {/* New password */}
            <div className="space-y-1">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-slate-700"
              >
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="newPassword"
                  type="password"
                  className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Choose a new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <label
                htmlFor="confirm"
                className="block text-sm font-medium text-slate-700"
              >
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="confirm"
                  type="password"
                  className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Re-enter your new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {passwordsMismatch && (
                <p className="text-[11px] text-red-600">
                  Passwords do not match.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 text-white text-sm font-medium py-2.5 hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={
                !email.trim() || !newPassword.trim() || passwordsMismatch
              }
            >
              Reset password (demo)
            </button>
          </form>

          {submitted && (
            <p className="mt-4 text-xs text-emerald-600">
              In a real application, your password for <strong>{email}</strong>{" "}
              would now be updated. Here it is only a UI demonstration and no
              data is stored.
            </p>
          )}

          <p className="mt-6 text-[11px] text-slate-400">
            This completes the end-to-end password reset flow visually. Backend
            integration can be added later if required.
          </p>
        </div>
      </main>
    </div>
  );
}
