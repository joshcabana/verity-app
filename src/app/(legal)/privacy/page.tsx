import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy â Verity",
  description:
    "Verity's Privacy Policy â how we collect, use, and protect your personal information under the Australian Privacy Act 1988.",
};

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
      <p className="text-muted text-sm mb-8">Last updated: April 2026</p>

      <div className="prose-invert space-y-6 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            1. About This Policy
          </h2>
          <p>
            Verity (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is
            operated from Canberra, Australia. This Privacy Policy explains how
            we collect, use, store, and disclose personal information in
            accordance with the <em>Privacy Act 1988</em> (Cth) and the
            Australian Privacy Principles (APPs). By using the Verity platform
            at app.getverity.com.au you consent to the practices described in
            this policy.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            2. Information We Collect
          </h2>
          <p>We collect the following categories of personal information:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Account data:</strong> email address, date of birth,
              display name, city, and gender preference.
            </li>
            <li>
              <strong>Verification data:</strong> optional phone number and
              selfie image used for identity verification.
            </li>
            <li>
              <strong>Usage data:</strong> drop attendance, call history, spark
              and pass decisions, and chat messages between matched users.
            </li>
            <li>
              <strong>Moderation data:</strong> call metadata and, where
              harmful behaviour is flagged, limited transcript excerpts processed
              by our AI moderation system.
            </li>
            <li>
              <strong>Payment data:</strong> Stripe customer ID and
              subscription/token purchase history. We do not store raw card
              details â these are held securely by Stripe.
            </li>
            <li>
              <strong>Technical data:</strong> IP address, device type, browser,
              and Vercel Analytics data used for performance monitoring.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            3. How We Use Your Information
          </h2>
          <p>We use your personal information to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Provide and improve the Verity service, including matchmaking,
              video calling, and messaging.
            </li>
            <li>
              Verify your age (18+) and identity to protect the safety of our
              community.
            </li>
            <li>
              Detect, prevent, and respond to harmful behaviour through
              AI-assisted and human moderation.
            </li>
            <li>
              Process payments and manage token balances and subscriptions via
              Stripe.
            </li>
            <li>
              Send transactional communications (magic-link sign-in emails, drop
              reminders, safety notifications).
            </li>
            <li>
              Comply with legal obligations including responding to lawful
              requests from regulatory authorities.
            </li>
          </ul>
          <p className="mt-2">
            We do <strong>not</strong> sell your personal data to third parties,
            and we do not use your data for targeted advertising.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            4. AI Moderation
          </h2>
          <p>
            Verity uses an AI-powered moderation system to help keep the
            platform safe. This system analyses call metadata in real time to
            detect and flag harmful behaviour such as harassment, hate speech,
            and nudity. Where calls are flagged above a severity threshold,
            limited transcript data may be processed to inform moderation
            decisions. Moderation data is handled in accordance with applicable
            privacy laws. We do not use your video or audio streams for any
            purpose other than safety moderation and service delivery.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            5. Anonymisation During Calls
          </h2>
          <p>
            During a video call, your face is pixelated on your own device
            before being transmitted. Neither the other participant nor Verity&apos;s
            servers receive your raw camera feed during the anonymous phase.
            Identity reveal only occurs when both participants have mutually
            chosen &ldquo;Spark&rdquo;, and is enforced at the database level.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            6. Disclosure to Third Parties
          </h2>
          <p>We share personal information with the following third parties:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Supabase Inc.</strong> â authentication, database, and
              server infrastructure (data hosted in the Asia-Pacific region).
            </li>
            <li>
              <strong>Agora.io</strong> â real-time video and audio streaming
              infrastructure. Agora processes anonymised video streams only
              during live calls.
            </li>
            <li>
              <strong>Stripe Inc.</strong> â payment processing. Stripe&apos;s
              privacy policy governs data they hold.
            </li>
            <li>
              <strong>Vercel Inc.</strong> â application hosting and analytics.
            </li>
          </ul>
          <p className="mt-2">
            Each third-party provider has contractual obligations to handle your
            data securely and in accordance with applicable privacy laws.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            7. Data Retention
          </h2>
          <p>We retain personal information as follows:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Account data:</strong> retained while your account is
              active. Deleted within 30 days of account deletion request.
            </li>
            <li>
              <strong>Call metadata:</strong> retained for 90 days, then
              anonymised or deleted.
            </li>
            <li>
              <strong>Chat messages:</strong> retained for 180 days from the
              date sent, then deleted.
            </li>
            <li>
              <strong>Moderation records:</strong> retained for 12 months for
              safety and appeals purposes, then deleted.
            </li>
            <li>
              <strong>Payment records:</strong> retained for 7 years as required
              by Australian tax law.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            8. Your Rights
          </h2>
          <p>
            Under the Australian Privacy Act 1988, you have the right to access
            the personal information we hold about you, request corrections, and
            request deletion of your account and associated data. To exercise
            these rights, contact us at{" "}
            <a
              href="mailto:privacy@getverity.com.au"
              className="text-gold hover:text-gold-light transition-colors"
            >
              privacy@getverity.com.au
            </a>
            . We will respond within 30 days.
          </p>
          <p className="mt-2">
            You may also export your personal data at any time from
            the Settings page within the app.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            9. Cookies and Tracking
          </h2>
          <p>
            Verity uses essential cookies for authentication and session
            management. We use Vercel Analytics for anonymised usage statistics.
            We do not use advertising or cross-site tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            10. Security
          </h2>
          <p>
            We implement industry-standard security measures including TLS
            encryption in transit, database-level row security policies, and
            server-enforced access controls. However, no method of transmission
            over the internet is completely secure, and we cannot guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            11. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of material changes via email or an in-app notice. Continued use
            of Verity after changes are posted constitutes your acceptance of
            the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            12. Contact
          </h2>
          <p>
            For privacy-related enquiries, please contact us at{" "}
            <a
              href="mailto:privacy@getverity.com.au"
              className="text-gold hover:text-gold-light transition-colors"
            >
              privacy@getverity.com.au
            </a>
            . If you are not satisfied with our response, you may contact the
            Office of the Australian Information Commissioner (OAIC) at{" "}
            <a
              href="https://www.oaic.gov.au"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
            >
              www.oaic.gov.au
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
