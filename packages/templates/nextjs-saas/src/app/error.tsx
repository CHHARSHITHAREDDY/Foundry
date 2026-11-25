"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white p-4">
      <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-zinc-400 mb-6 max-w-md text-center text-sm">
        {error.message || "An unexpected error occurred in the application."}
      </p>
      <Button onClick={() => reset()} className="bg-indigo-600 hover:bg-indigo-500 text-white">
        Try again
      </Button>
    </div>
  );
}
