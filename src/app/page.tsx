import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/drops");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-10">
        {/* Logo */}
        <div>
          <h1
            className="font-serif text-4xl font-semibold gold-gradient-text"
            style={{ letterSpacing: "0.25em" }}
          >
            VERITY
          </h1>
          <p className="mt-3 text-muted text-sm" style={{ letterSpacing: "0.15em" }}>
            REAL DATES. REAL PEOPLE.
          </p>
        </div>

        {/* Hero copy */}
        <div className="space-y-4">
          <p className="text-foreground/90 text-lg leading-relaxed">
            A video-first dating experience built on trust, safety, and genuine
            connection.
          </p>
          <p className="text-muted text-sm leading-relaxed">
            Join curated drops, meet face-to-face over video, and discover real
            chemistry — no swiping, no games.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Link href="/login" className="ghost-pill inline-block">
            Get Started
          </Link>
          <p className="text-muted text-xs">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Trust signals */}
        <div className="pt-8 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gold font-serif text-lg">100%</p>
              <p className="label-caps mt-1">Verified</p>
            </div>
            <div>
              <p className="text-gold font-serif text-lg">AI</p>
              <p className="label-caps mt-1">Moderated</p>
            </div>
            <div>
              <p className="text-gold font-serif text-lg">Safe</p>
              <p className="label-caps mt-1">By Design</p>
            </div>
          </div>
        </div>

        {/* Legal links */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/safety" className="hover:text-foreground transition-colors">
            Safety
          </Link>
        </div>
      </div>
    </main>
  );
}
