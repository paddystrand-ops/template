import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow border border-gray-100 p-6 space-y-6">
        <div className="text-center space-y-2">
          <UserPlus className="h-8 w-8 text-blue-600 mx-auto" />
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-gray-500">
            Placeholder signup form. Later this will create real users.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1 text-left">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full name
            </label>
            <input
              id="name"
              placeholder="Jane Doe"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="space-y-1 text-left">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="jane@example.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="space-y-1 text-left">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <button
            type="button"
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
          >
            Sign up (placeholder)
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
