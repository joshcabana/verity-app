'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠</span>
        </div>
        <h2 className="font-serif text-2xl text-foreground">Something went wrong</h2>
        <p className="text-muted text-sm">
          An unexpected error occurred. Please try again.
        </p>
        <button onClick={reset} className="ghost-pill">
          Try again
        </button>
      </div>
    </div>
  );
}
