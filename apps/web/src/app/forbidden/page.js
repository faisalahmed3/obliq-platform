import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-red-500">403</h1>
      <h2 className="mt-4 text-2xl font-semibold">Access Forbidden</h2>
      <p className="mt-2 max-w-md text-gray-600">
        You do not have permission to access this page.
      </p>
      <Link
        href="/login"
        className="mt-6 rounded-xl bg-black px-5 py-3 text-white"
      >
        Back to Login
      </Link>
    </main>
  );
}