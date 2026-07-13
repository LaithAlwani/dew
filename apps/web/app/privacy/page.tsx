import type { Metadata } from "next";
import { LegalShell } from "../../components/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Dew collects, uses, and protects your information when you use our beauty-guidance marketplace.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy Policy · Dew", url: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="July 2026"
      intro="This Privacy Policy explains what information Dew collects, how we use it, and the choices you have. It applies to our website and apps (the “Service”)."
    >
      <h2>1. Information we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> — name and email, handled through our
          authentication provider when you sign up or sign in (including via Google or
          Apple).
        </li>
        <li>
          <strong>Profile &amp; onboarding answers</strong> — your goals, concerns,
          budget, skin type, and preferences, which power matching and personalization.
        </li>
        <li>
          <strong>Usage data</strong> — interactions, device and log information, used
          to operate and improve the Service.
        </li>
        <li>
          <strong>Booking &amp; payment data</strong> — handled by our payment processor;
          Dew does not store full card details.
        </li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>Match you with relevant Experts and personalize your experience.</li>
        <li>Provide, maintain, secure, and improve the Service.</li>
        <li>Process bookings, payments, and support requests.</li>
        <li>Communicate with you about your account and updates.</li>
        <li>Comply with legal obligations and prevent abuse.</li>
      </ul>

      <h2>3. How we share information</h2>
      <ul>
        <li>
          <strong>With Experts</strong> you choose to book — the details needed to
          provide their service.
        </li>
        <li>
          <strong>With service providers</strong> that run the Service on our behalf
          (for example, authentication, backend/database, and payment processing),
          under contracts that limit their use of your data.
        </li>
        <li>
          <strong>For legal reasons</strong> — to comply with law or protect rights,
          safety, and the integrity of the Service.
        </li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>4. Cookies &amp; analytics</h2>
      <p>
        We use essential cookies to keep you signed in and, where enabled, privacy-
        respecting analytics to understand usage. You can control cookies through your
        browser settings.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We keep your information for as long as your account is active or as needed to
        provide the Service, then delete or anonymize it unless a longer period is
        required by law.
      </p>

      <h2>6. Your rights &amp; choices</h2>
      <p>
        Depending on where you live, you may have the right to access, correct, export,
        or delete your personal information, and to object to or restrict certain
        processing. To exercise these rights, contact us using the details below.
      </p>

      <h2>7. Security</h2>
      <p>
        We use administrative, technical, and organizational safeguards to protect your
        information. No method of transmission or storage is 100% secure, but we work to
        protect your data and to notify you of significant incidents where required.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is intended for adults (18+). We do not knowingly collect personal
        information from children. If you believe a child has provided us information,
        contact us and we will delete it.
      </p>

      <h2>9. International transfers</h2>
      <p>
        Your information may be processed in countries other than your own. Where
        required, we use appropriate safeguards for such transfers.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We’ll post changes here with an
        updated date and, where required, provide additional notice.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions or requests? Email <a href="mailto:privacy@dewbeautyapp.com">privacy@dewbeautyapp.com</a>.
      </p>
    </LegalShell>
  );
}
