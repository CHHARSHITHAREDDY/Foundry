"use client";
export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return <div>Error <button onClick={() => reset()}>Retry</button></div>;
}
