import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service â Verity",
  description:
    "Verity's Terms of Service â the rules and conditions governing use of the Verity anonymous video dating platform.",
};

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
      <p className="text-muted text-sm mb-8">Last updated: April 2026</p>

      <div className="prose-invert space-y-6 text-sm text-foreground/80 leading-relaxed">
        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Verity at app.getverity.com.au
            (&ldquo;the Service&rdquo;), you agree to be bound by these Terms
            of Service (&ldquo;Terms&rdquo;). If you do not agree, please do
            not use the Service. These Terms form a legally binding agreement
            between you and Verity, operated from Canberra, Australia.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            2. Eligibility
          </h2>
          <p>
            You must be at least 18 years of age to use Verity. By creating an
            account, you represent and warrant that you are 18 or older. Verity
            is intended for adults seeking genuine human connection. We reserve
            the right to terminate accounts where the 18+ requirement is found
            to have been misrepresented.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            3. Account Registration
          </h2>
          <p>
            You must register using a valid email address. You are responsible
            for maintaining the confidentiality of your account and for all
            activity that occurs under it. You agree to notify us immediately of
            any unauthorised use of your account at{" "}
            <a
              href="mailto:hello@getverity.com.au"
              className="text-gold hover:text-gold-light transition-colors"
            >
              hello@getverity.com.au
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            4. User Conduct
          </h2>
          <p>
            You agree to treat all users with respect and dignity. The following
            behaviours are strictly prohibited and may result in immediate
            account suspension or termination:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Harassment, bullying, threats, or intimidation of any kind.
            </li>
            <li>
              Hate speech, discrimination, or content that demeans others based
              on race, gender, religion, sexual orientation, disability, or
              nationality.
            </li>
            <li>
              Nudity, sexual content, or explicit material during video calls or
              in messages.
            </li>
            <li>
              Impersonating another person or providing false identity
              information.
            </li>
            <li>
              Using the Service to solicit commercial transactions, spam, or
              unsolicited contact.
            </li>
            <li>
              Attempting to circumvent anonymisation features or record another
              user&apos;s video without consent.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            5. Safety Pledge
          </h2>
          <p>
            All users must accept the Verity Safety Pledge during onboarding.
            The Safety Pledge is an integral part of your agreement to these
            Terms. Violation of the Safety Pledge is a violation of these Terms
            and may result in account suspension.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            6. Tokens and Payments
          </h2>
          <p>
            Verity operates a token-based economy. Tokens are used to
            participate in drops and access premium features. The following
            applies to all purchases:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Tokens purchased through Verity are non-refundable unless
              required by applicable Australian consumer protection laws,
              including the <em>Australian Consumer Law</em> (Schedule 2 of the
              Competition and Consumer Act 2010).
            </li>
            <li>
              Prices are displayed in Australian dollars (AUD) unless otherwise
              stated.
            </li>
            <li>
              Subscription plans renew automatically unless cancelled before the
              renewal date. You may cancel at any time from the Settings page.
            </li>
            <li>
              Unused tokens do not expire while your account remains active.
              Tokens will be forfeited upon account deletion.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            7. Moderation and Enforcement
          </h2>
          <p>
            Verity uses AI-assisted and human moderation to enforce these Terms.
            We reserve the right to remove content, issue warnings, suspend
            access, or permanently ban accounts that violate these Terms. Where
            an account is suspended, you may submit an appeal via the Settings
            page or by contacting{" "}
            <a
              href="mailto:safety@getverity.com.au"
              className="text-gold hover:text-gold-light transition-colors"
            >
              safety@getverity.com.au
            </a>
            . Appeals will be reviewed within 5 business days.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            8. Intellectual Property
          </h2>
          <p>
            All content, design, code, trademarks, and intellectual property on
            the Verity platform are owned by or licensed to Verity. You may not
            reproduce, distribute, modify, or create derivative works without
            our express written permission. You retain ownership of content you
            create on the platform (e.g., profile display names), but grant
            Verity a limited, non-exclusive licence to display that content
            within the Service.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            9. Disclaimers
          </h2>
          <p>
            Verity is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, express or implied.
            We do not warrant that the Service will be uninterrupted, error-free,
            or meet your specific requirements. We are not responsible for the
            conduct of other users on the platform.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            10. Limitation of Liability
          </h2>
          <p>
            To the maximum extent permitted by law, Verity&apos;s liability for
            any claim arising from your use of the Service is limited to the
            amount you paid to Verity in the 12 months prior to the claim. We
            are not liable for indirect, incidental, consequential, or punitive
            damages. Nothing in these Terms limits any rights you may have under
            the Australian Consumer Law that cannot be excluded.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            11. Governing Law and Disputes
          </h2>
          <p>
            These Terms are governed by the laws of the Australian Capital
            Territory, Australia. Any disputes will be subject to the exclusive
            jurisdiction of the courts of the ACT. We encourage you to contact
            us first to resolve any dispute informally before pursuing formal
            legal action.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            12. Changes to These Terms
          </h2>
          <p>
            We may update these Terms from time to time. We will notify you of
            material changes via email or an in-app notice at least 14 days
            before they take effect. Continued use of the Service after the
            effective date constitutes acceptance of the updated Terms. If you
            do not agree to the updated Terms, you must stop using the Service
            and may request account deletion.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg text-foreground mb-2">
            13. Contact
          </h2>
          <p>
            For questions about these Terms, please contact us at{" "}
            <a
              href="mailto:legal@getverity.com.au"
              className="text-gold hover:text-gold-light transition-colors"
            >
              legal@getverity.com.au
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
