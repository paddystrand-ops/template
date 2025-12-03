// src/app/page.tsx
import Link from "next/link";
import { Globe, Activity, User, Lock, Mail } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Hero */}
      <header className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="mb-6 flex items-center justify-center">
          <div className="p-4 bg-blue-600 rounded-full shadow-lg">
            <Globe className="h-12 w-12 text-white" />
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          Global Health Intelligence
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Placeholder platform for world health statistics, interactive dashboards,
          and future AI-powered predictions. (Data and logic will be added later.)
        </p>
      </header>

      {/* Login card */}
      <main className="pb-16 px-4">
        <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <Activity className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <h2 className="text-2xl font-semibold">Welcome back</h2>
            <p className="text-sm text-gray-500">
              Sign in to access the placeholder dashboard.
            </p>
          </div>

          <form className="space-y-4">
            <div className="space-y-1 text-left">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* For now this just navigates to /dashboard – no real auth yet */}
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              <Mail className="h-4 w-4 mr-2" />
              Sign in (placeholder)
            </Link>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:underline block"
            >
              Forgot your password?
            </Link>
            <Link
              href="/reset-password"
              className="text-blue-600 hover:underline block"
            >
              Reset password via email
            </Link>
            <p className="text-xs text-gray-500 mt-4">
              New here?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
