import Link from "next/link";
import { Lock } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-6">
        <div className="text-center space-y-2">
          <Lock className="h-8 w-8 text-blue-600 mx-auto" />
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="text-sm text-gray-500">
            Placeholder form. Later this will validate a real token from email.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1 text-left">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1 text-left">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="button"
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Update password (placeholder)
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Done?{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
