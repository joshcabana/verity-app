import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
        Terms of Service
      </h1>
      <p className="text-muted text-sm mb-8">Last updated: January 2025</p>

      <div className="prose-invert space-y-6 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Verity, you agree to be bound by these Terms
            of Service. If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            2. Eligibility
          </h2>
          <p>
            You must be at least 18 years of age to use Verity. By creating an
            account, you represent and warrant that you are 18 or older.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            3. User Conduct
          </h2>
          <p>
            You agree to treat all users with respect and to refrain from
            harassment, bullying, hate speech, or any behaviour that violates
            our Safety Pledge. Verity reserves the right to suspend or terminate
            accounts that violate these guidelines.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            4. Tokens and Payments
          </h2>
          <p>
            Tokens purchased through Verity are non-refundable unless required
            by applicable consumer protection laws. Prices are displayed in AUD
            unless otherwise stated.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            5. Limitation of Liability
          </h2>
          <p>
            Verity is provided &ldquo;as is&rdquo; without warranties of any
            kind. We are not liable for any damages arising from your use of the
            service.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            6. Contact
          </h2>
          <p>
            For questions about these terms, please contact legal@verity.dating.
          </p>
        </section>
      </div>
    </div>
  );
}
