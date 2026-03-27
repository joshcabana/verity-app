"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitle: Record<string, string> = {
  "/drops": "Drops",
  "/chat": "Chat",
  "/invite": "Invite",
  "/profile": "Profile",
  "/tokens": "Shop",
  "/settings": "Settings",
  "/admin": "Admin",
};

export function AppHeader() {
  const pathname = usePathname();

  // Don't show on call pages or lobby (those have their own UI)
  if (pathname.startsWith("/call/") || pathname.startsWith("/lobby")) {
    return null;
  }

  const title = Object.entries(pageTitle).find(([path]) =>
    pathname === path || pathname.startsWith(path + "/")
  )?.[1];

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto">
        <Link href="/drops" className="flex items-center gap-2">
          <Image
            src="/v-mark-64.png"
            alt="Verity"
            width={22}
            height={22}
            className="drop-shadow-[0_0_8px_rgba(212,175,55,0.2)]"
          />
          {!title && (
            <span
              className="font-serif text-sm text-gold tracking-[0.15em]"
              style={{ letterSpacing: "0.15em" }}
            >
              VERITY
            </span>
          )}
        </Link>
        {title && (
          <h1 className="font-serif text-sm text-foreground tracking-wider">
            {title}
          </h1>
        )}
        <div className="w-[22px]" /> {/* Balance spacer */}
      </div>
    </header>
  );
}
