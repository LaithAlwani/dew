import type { Metadata } from "next";
import { LegalShell } from "../../components/legal-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Dew — the platform that matches you with vetted, independent beauty experts.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms of Service · Dew", url: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated="July 2026"
      intro="These Terms of Service (“Terms”) govern your access to and use of Dew’s website, apps, and services (together, the “Service”). By using the Service, you agree to these Terms."
    >
      <h2>1. What Dew is</h2>
      <p>
        Dew is a marketplace that connects people seeking beauty guidance (“Clients”)
        with independent beauty professionals (“Experts”). Dew provides the platform,
        matching, and tools — it does not itself provide beauty, cosmetic, or medical
        services, and it is not a party to the agreements between Clients and Experts.
      </p>

      <h2>2. Eligibility &amp; accounts</h2>
      <p>
        You must be at least 18 years old to use the Service. You are responsible for
        the activity under your account and for keeping your credentials secure.
        Authentication is handled by our identity provider; you agree to provide
        accurate information and to keep it up to date.
      </p>

      <h2>3. Experts</h2>
      <p>
        Experts are independent contractors, not employees or agents of Dew. While we
        apply a verification process, Dew does not guarantee the qualifications,
        licensing, availability, or results of any Expert. Any advice or service is
        provided by the Expert, and your dealings with them are between you and them.
      </p>

      <h2>4. Bookings, payments &amp; fees</h2>
      <p>
        Consultations and services may be booked and paid for through the Service.
        Prices are set by Experts or Dew and shown before you confirm. Dew may charge
        service or platform fees, disclosed at checkout. Payment processing is handled
        by a third-party processor subject to its own terms.
      </p>

      <h2>5. Acceptable use</h2>
      <ul>
        <li>Don’t misuse, disrupt, reverse-engineer, or scrape the Service.</li>
        <li>Don’t upload unlawful, infringing, harmful, or misleading content.</li>
        <li>Don’t impersonate others or misrepresent your affiliation.</li>
        <li>Don’t use the Service to harass, spam, or defraud anyone.</li>
      </ul>

      <h2>6. Content &amp; intellectual property</h2>
      <p>
        You retain rights to content you submit, and grant Dew a non-exclusive,
        worldwide license to host and display it to operate the Service. The Dew name,
        logo, and software are owned by Dew and may not be used without permission.
      </p>

      <h2>7. No medical advice</h2>
      <p>
        Content and guidance on Dew are for general informational and cosmetic purposes
        only and are <strong>not medical advice</strong>. Always consult a licensed
        healthcare professional for medical or dermatological concerns.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        The Service is provided “as is” and “as available,” without warranties of any
        kind, to the fullest extent permitted by law. Dew does not warrant that the
        Service will be uninterrupted, error-free, or meet your expectations.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Dew and its affiliates will not be
        liable for indirect, incidental, special, consequential, or punitive damages,
        or for the acts or omissions of any Expert or Client.
      </p>

      <h2>10. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate access
        if you violate these Terms or to protect the Service and its users.
      </p>

      <h2>11. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be posted
        here with an updated date, and where required, we’ll provide notice. Continued
        use of the Service means you accept the revised Terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms? Email <a href="mailto:legal@dewbeautyapp.com">legal@dewbeautyapp.com</a>.
      </p>
    </LegalShell>
  );
}
