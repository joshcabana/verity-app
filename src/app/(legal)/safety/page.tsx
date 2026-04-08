import Link from "next/link";
import { ArrowLeft, ShieldCheck, Eye, AlertTriangle, Heart, Lock, Phone } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety Centre â Verity",
  description:
    "How Verity keeps you safe â AI moderation, identity verification, anonymous video, and reporting tools.",
};

export default function SafetyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-muted hover:text-foreground transition-colors text-sm mb-6"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </Link>

      <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
        Safety Centre
      </h1>
      <p className="text-muted text-sm mb-8">
        Your safety is our top priority. Here&apos;s how Verity keeps you safe.
      </p>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Lock className="w-6 h-6 text-gold" aria-hidden="true" />
            <h2 className="font-serif text-lg text-foreground">
              Anonymous by Default
            </h2>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Your face is pixelated on your own device before any video is
            transmitted. Neither the other participant nor Verity&apos;s servers
            receive your raw camera feed. Identity reveal only happens when both
            people mutually choose &ldquo;Spark&rdquo; â and it&apos;s enforced
            at the database level, not just in the app.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-6 h-6 text-gold" aria-hidden="true" />
            <h2 className="font-serif text-lg text-foreground">
              AI Moderation
            </h2>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Every video call is monitored by our AI moderation system in real
            time. It detects and flags harmful behaviour including harassment,
            nudity, and hate speech â keeping everyone safe without compromising
            your privacy. Flagged calls are reviewed by our moderation team
            within 24 hours.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-6 h-6 text-gold" aria-hidden="true" />
            <h2 className="font-serif text-lg text-foreground">
              Verified Users
            </h2>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Every user goes through age verification (18+) and agrees to the
            Verity Safety Pledge before joining a drop. Optional phone and
            selfie verification add additional layers of trust. This ensures
            you&apos;re meeting real, genuine people.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-gold" aria-hidden="true" />
            <h2 className="font-serif text-lg text-foreground">
              Report &amp; Block
            </h2>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            If someone makes you feel uncomfortable, you can report or block
            them instantly. Our moderation team reviews all reports within 24
            hours and takes appropriate action. Repeat offenders are permanently
            banned from the platform.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-6 h-6 text-gold" aria-hidden="true" />
            <h2 className="font-serif text-lg text-foreground">
              Safe Exit
            </h2>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            During any video call, you can tap the Safe Exit button to
            immediately end the call and optionally report the other user. No
            questions asked. Your wellbeing always comes first.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-6 h-6 text-gold" aria-hidden="true" />
            <h2 className="font-serif text-lg text-foreground">
              No Rejection Signals
            </h2>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Verity never sends rejection notifications. If you both don&apos;t
            spark, neither of you will know who passed. This protects
            everyone&apos;s dignity and makes the experience safer and more
            enjoyable for all.
          </p>
        </div>
      </div>

      <div className="mt-10 bg-surface border border-border rounded-xl p-6 space-y-3">
        <h2 className="font-serif text-base text-foreground">
          Safety Resources
        </h2>
        <p className="text-muted text-sm leading-relaxed">
          If you&apos;re experiencing a safety emergency, please contact local
          emergency services (Australia: 000). For platform safety concerns,
          our team is available 7 days a week.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <a
            href="mailto:safety@getverity.com.au"
            className="ghost-pill text-sm text-center"
          >
            Contact Safety Team
          </a>
          <Link
            href="/privacy"
            className="text-gold text-sm hover:text-gold-light transition-colors self-center"
          >
            Privacy Policy â
          </Link>
          <Link
            href="/terms"
            className="text-gold text-sm hover:text-gold-light transition-colors self-center"
          >
            Terms of Service â
          </Link>
        </div>
      </div>
    </div>
  );
}
