import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-4">
      <h1 className="text-4xl font-extrabold mb-2">404</h1>
      <p className="text-zinc-400 mb-6 text-sm">The page you were looking for could not be found.</p>
      <Link href="/" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">
        Back to Home
      </Link>
    </div>
  );
}
