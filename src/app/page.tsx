"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe2, Lock, Mail, User } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError(
        "Please enter both a username (or email) and a password to continue."
      );
      return;
    }

    // Store username so the dashboard can show "Signed in as ..."
    if (typeof window !== "undefined") {
      window.localStorage.setItem("whd-username", username.trim());
    }

    setError(null);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Simple header */}
      <header className="w-full py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe2 className="h-7 w-7 text-blue-600" />
          <span className="font-semibold text-slate-900">
            Global Health Intelligence
          </span>
        </div>
        <span className="text-xs text-slate-500">
          Prototype – front-end only login
        </span>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Hero text */}
        <div className="max-w-2xl w-full text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            World Health Analytics Dashboard
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            Sign in to explore birth rates, death rates and life expectancy
            trends using the cleaned world health dataset. This login is
            front-end only and is used to personalise the dashboard header.
          </p>
        </div>

        {/* Login card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-slate-100 px-6 py-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6 text-center">
            Sign in
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="space-y-1">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700"
              >
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="username"
                  type="text"
                  className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john.doe@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 mt-1" role="alert">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 text-white text-sm font-medium py-2.5 mt-2 hover:bg-blue-700 transition"
            >
              <Mail className="h-4 w-4 mr-2" />
              Sign in &amp; open dashboard
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-2 text-center">
            <Link
              href="/forgot-password"
              className="block text-xs text-blue-600 hover:underline"
            >
              Forgot your password?
            </Link>
            <Link
              href="/reset-password"
              className="block text-xs text-blue-600 hover:underline"
            >
              Reset password via email
            </Link>
            <p className="text-[11px] text-slate-500 mt-3">
              New here?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          <p className="mt-4 text-[10px] text-slate-400 text-center">
            This is a demo login only. Nothing is sent to a server. The username
            is stored locally in your browser so the dashboard can show “Signed
            in as …”.
          </p>
        </div>
      </main>
    </div>
  );
}
