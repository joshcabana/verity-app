import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
        Privacy Policy
      </h1>
      <p className="text-muted text-sm mb-8">Last updated: January 2025</p>

      <div className="prose-invert space-y-6 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            1. Information We Collect
          </h2>
          <p>
            Verity collects information you provide directly, including your
            email address, date of birth, display name, city, and gender. We
            also collect usage data such as drop attendance, match history, and
            chat messages to improve your experience.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            2. How We Use Your Information
          </h2>
          <p>
            We use your information to provide the Verity service, match you
            with compatible users, ensure safety through AI moderation, and
            improve our platform. We do not sell your personal data to third
            parties.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            3. AI Moderation
          </h2>
          <p>
            Verity uses AI-powered moderation during video calls to detect and
            prevent harmful behaviour. This may include analysis of video and
            audio content in real time. Moderation data is processed in
            accordance with applicable privacy laws.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            4. Data Retention
          </h2>
          <p>
            We retain your data for as long as your account is active. You may
            request deletion of your account and associated data at any time by
            contacting us.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            5. Contact
          </h2>
          <p>
            For privacy-related enquiries, please contact us at
            privacy@verity.dating.
          </p>
        </section>
      </div>
    </div>
  );
}
