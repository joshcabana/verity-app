import Link from "next/link";
import { ArrowLeft, ShieldCheck, Eye, AlertTriangle, Heart } from "lucide-react";

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
            <ShieldCheck className="w-6 h-6 text-gold" />
            <h2 className="font-serif text-lg text-foreground">
              AI Moderation
            </h2>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            Every video call is monitored by our AI moderation system in real
            time. It detects and flags harmful behaviour including harassment,
            nudity, and hate speech — keeping everyone safe without compromising
            your privacy.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-6 h-6 text-gold" />
            <h2 className="font-serif text-lg text-foreground">
              Verified Users
            </h2>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            We verify every user through a multi-step process including age
            verification, phone verification, and optional selfie verification.
            This ensures you&apos;re meeting real, genuine people.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-gold" />
            <h2 className="font-serif text-lg text-foreground">
              Report & Block
            </h2>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            If someone makes you feel uncomfortable, you can report or block
            them instantly. Our moderation team reviews all reports within 24
            hours and takes appropriate action.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-6 h-6 text-gold" />
            <h2 className="font-serif text-lg text-foreground">
              Safe Exit
            </h2>
          </div>
          <p className="text-foreground/80 text-sm leading-relaxed">
            During any video call, you can tap the Safe Exit button to
            immediately end the call and optionally report the other user. No
            questions asked.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted text-sm">
          Need help?{" "}
          <a
            href="mailto:safety@verity.dating"
            className="text-gold hover:text-gold-light transition-colors"
          >
            Contact our safety team
          </a>
        </p>
      </div>
    </div>
  );
}
