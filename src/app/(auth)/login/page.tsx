
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
    toast.success("Magic link sent! Check your inbox.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-8 space-y-8">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Image
                src="/v-mark-512.png"
                alt="Verity"
                width={60}
                height={60}
                style={{ filter: "drop-shadow(0 0 24px rgba(212,175,55,0.2))" }}
                priority
              />
            </div>
            <h1
              className="font-serif text-3xl font-semibold gold-gradient-text"
              style={{ letterSpacing: "0.25em" }}
            >
              VERITY
            </h1>
            <p className="text-muted text-xs label-caps">
              Sign in to continue
            </p>
          </div>

          {sent ? (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-gold/10 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-foreground font-medium">Check your email</p>
                <p className="text-muted text-sm mt-1">
                  We&apos;ve sent a magic link to{" "}
                  <span className="text-gold">{email}</span>
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            /* Email form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="label-caps block mb-2"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-gold/50 transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="ghost-pill w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                ) : null}
                {isLoading ? "Sending…" : "Send magic link"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-muted text-xs mt-6">
          By continuing, you agree to our{" "}
          <a href="/terms" className="text-gold/80 hover:text-gold">
            Terms
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-gold/80 hover:text-gold">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
