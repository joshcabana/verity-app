'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pb-20">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
          <span className="text-2xl">✦</span>
        </div>
        <h2 className="font-serif text-xl text-foreground">Something broke</h2>
        <p className="text-muted text-sm">
          We hit an error. Try refreshing, or head back to Drops.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="ghost-pill">
            Retry
          </button>
          <Link href="/drops" className="ghost-pill">
            Back to Drops
          </Link>
        </div>
      </div>
    </div>
  );
}
