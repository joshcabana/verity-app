"use client";

import { Loader2 } from "lucide-react";

export default function LobbyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
      </div>
      <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
        Green Room
      </h1>
      <p className="text-muted text-sm max-w-xs">
        Hang tight — we&apos;re finding you the perfect match. This usually
        takes less than a minute.
      </p>
    </div>
  );
}
