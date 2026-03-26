import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verity — Anonymous Video Dating. Canberra First.",
  description:
    "45 seconds of anonymous video. Real voice, real eyes, no filters. Your identity stays hidden until you both say yes. Free tokens on signup.",
  openGraph: {
    title: "Verity — Anonymous Video Dating",
    description:
      "See their vibe, not their face. Spark → match → reveal. Launching in Canberra.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/drops");
  }

  // Pull live stats (best effort — fallback to 0)
  let totalSparks = 0;
  let totalUsers = 0;
  try {
    const { count: sparkCount } = await supabase
      .from("sparks")
      .select("*", { count: "exact", head: true });
    totalSparks = sparkCount ?? 0;

    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    totalUsers = userCount ?? 0;
  } catch {
    // Silent — stats are best-effort
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
        {/* Radial gold glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.08) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-lg w-full text-center space-y-8 z-10">
          {/* Badge */}
          <p className="label-caps text-gold tracking-[0.2em]">
            LAUNCHING IN CANBERRA
          </p>

          {/* Logo */}
          <h1
            className="font-serif text-5xl sm:text-6xl font-semibold gold-gradient-text"
            style={{ letterSpacing: "0.2em" }}
          >
            VERITY
          </h1>

          {/* Headline */}
          <div className="space-y-3">
            <p className="font-serif text-2xl sm:text-3xl text-foreground leading-tight">
              See their vibe,{" "}
              <span className="italic gold-gradient-text">not their face.</span>
            </p>
            <p className="text-muted text-base sm:text-lg leading-relaxed max-w-md mx-auto">
              45 seconds of anonymous video. Real voice, real energy, zero
              filters. Your identity stays hidden until you both say yes.
            </p>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {["18+ only", "45-second calls", "Anonymous video"].map((chip) => (
              <span
                key={chip}
                className="text-xs border border-gold/30 text-gold/80 rounded-full px-3 py-1"
              >
                {chip}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <Link href="/login" className="ghost-pill inline-block text-base px-8 py-3">
              Join the next Drop — free
            </Link>
            <p className="text-muted text-xs">
              3 free tokens on signup. No card required.
            </p>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-gold/40"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto">
          <p className="label-caps text-gold mb-4">HOW IT WORKS</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-12">
            Three steps. No swiping.
          </h2>

          <div className="space-y-10">
            {[
              {
                num: "01",
                title: "RSVP to a Drop",
                desc: "Pick a themed session — Creative Minds, Night Owls, Over 35. 24 spots. Show up when one speaks to you.",
              },
              {
                num: "02",
                title: "45 seconds, anonymous",
                desc: "Your face is pixelated in real-time. The other person sees your energy, not your appearance. Real voice, real eyes.",
              },
              {
                num: "03",
                title: "Spark or Pass",
                desc: "Both choose privately. The server resolves it. No rejection is ever sent. Mutual spark = identities unlock.",
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-5">
                <span className="font-serif text-2xl text-gold/50 shrink-0 w-10">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-serif text-lg text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE DIFFERENCE ── */}
      <section className="py-20 px-6 bg-surface border-t border-border">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <p className="label-caps text-gold">WHY VERITY</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground">
            Dating without the performance.
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            {[
              {
                title: "No profiles",
                desc: "No bios to optimise. No photos to curate. Just show up.",
              },
              {
                title: "No rejection",
                desc: "Neither person knows unless it's mutual. Zero rejection signals.",
              },
              {
                title: "No performance",
                desc: "45 seconds of honest conversation. That's it.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-xl border border-border bg-card"
              >
                <h3 className="font-serif text-base text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE STATS ── */}
      {(totalSparks > 0 || totalUsers > 0) && (
        <section className="py-16 px-6 border-t border-border">
          <div className="max-w-md mx-auto text-center">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-serif text-3xl gold-gradient-text">
                  {totalSparks.toLocaleString()}
                </p>
                <p className="text-muted text-xs mt-1">Sparks sent</p>
              </div>
              <div>
                <p className="font-serif text-3xl gold-gradient-text">
                  {totalUsers.toLocaleString()}
                </p>
                <p className="text-muted text-xs mt-1">People joined</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST ── */}
      <section className="py-16 px-6 bg-surface border-t border-border">
        <div className="max-w-md mx-auto text-center space-y-6">
          <p className="label-caps text-gold">TRUST &amp; SAFETY</p>
          <div className="space-y-3 text-sm text-muted">
            <p>Canvas-processed anonymity — the other person cannot access your raw camera feed.</p>
            <p>Server-enforced reveal — identity unlock requires mutual consent at the database level.</p>
            <p>AI-assisted moderation — text monitoring during calls. System in active development.</p>
          </div>
          <div className="flex justify-center gap-6 pt-2">
            <Link
              href="/safety"
              className="text-gold text-sm hover:text-gold-light transition-colors"
            >
              Safety →
            </Link>
            <Link
              href="/privacy"
              className="text-gold text-sm hover:text-gold-light transition-colors"
            >
              Privacy →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-6 border-t border-border">
        <div className="max-w-md mx-auto text-center space-y-6">
          <h2 className="font-serif text-2xl text-foreground">
            Ready to stop performing?
          </h2>
          <Link href="/login" className="ghost-pill inline-block text-base px-8 py-3">
            Get started — free
          </Link>
          <p className="text-muted text-xs">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-gold hover:text-gold-light transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* ── CROSS-PROMO ── */}
      <section className="py-6 px-6 border-t border-border/50">
        <div className="max-w-md mx-auto text-center">
          <a
            href="https://aithreatbrief.com/tools?utm_source=verity&utm_medium=banner&utm_campaign=cross-promo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted/60 hover:text-muted transition-colors"
          >
            Privacy-first dating needs privacy-first tools.
            See what security pros actually use →
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© 2026 Verity. Made in Canberra, Australia.</p>
          <div className="flex gap-4">
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
      </footer>
    </main>
  );
}
