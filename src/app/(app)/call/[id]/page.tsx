"use client";

import { Video } from "lucide-react";
import Link from "next/link";

export default function CallPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mb-6">
        <Video className="w-10 h-10 text-gold" />
      </div>
      <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">
        Video Call
      </h1>
      <p className="text-muted text-sm max-w-xs mb-6">
        The Agora-powered video call interface will be implemented in Phase 2.
      </p>
      <Link href="/drops" className="ghost-pill">
        Back to Drops
      </Link>
    </div>
  );
}
