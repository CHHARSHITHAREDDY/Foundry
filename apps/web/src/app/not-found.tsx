import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface text-ink flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full bg-surface-container-lowest border-editorial border-ink shadow-editorial-lg p-8 space-y-4">
        <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-stone border border-ink inline-block">
          HTTP 404
        </span>
        <h1 className="font-serif text-4xl font-bold text-ink">Page not found</h1>
        <p className="font-serif text-sm text-muted">
          The requested resource does not exist or you do not have permission to view it.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-4 py-2 bg-ink text-on-primary text-xs uppercase font-bold border border-ink hover:bg-accent"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
