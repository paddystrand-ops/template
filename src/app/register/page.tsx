"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) return;
    if (password !== confirm) return;
    // Placeholder only – no real account creation
    setSubmitted(true);
  };

  const passwordsMismatch =
    password.trim().length > 0 &&
    confirm.trim().length > 0 &&
    password !== confirm;

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
          Registration (front-end only)
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
            Create an account
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            This is a demo registration screen to show the flow. No data is
            stored or sent to a server. In a real system, these details would be
            validated and saved securely.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full name */}
            <div className="space-y-1">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-700"
              >
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="fullName"
                  type="text"
                  className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

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

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Choose a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <label
                htmlFor="confirm"
                className="block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="confirm"
                  type="password"
                  className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Re-enter your password"
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
                !fullName.trim() ||
                !email.trim() ||
                !password.trim() ||
                passwordsMismatch
              }
            >
              Create account (demo)
            </button>
          </form>

          {submitted && (
            <p className="mt-4 text-xs text-emerald-600">
              In a real application, this would create your account using these
              details. Here it is only a UI demonstration and no data is stored.
            </p>
          )}

          <p className="mt-6 text-[11px] text-slate-400">
            This registration page completes the full login / register / forgot
            password flow for the project. Backend and database integration can
            be added later if required.
          </p>
        </div>
      </main>
    </div>
  );
}
