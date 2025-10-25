import React from "react";
import { Link } from "react-router-dom";

const Section = ({ number, title, children }) => (
  <section className="space-y-3">
    <h2 className="text-2xl font-semibold text-white">
      {number}. {title}
    </h2>
    <div className="space-y-3 text-base leading-relaxed text-slate-200">
      {children}
    </div>
  </section>
);

const BulletList = ({ items }) => (
  <ul className="list-disc space-y-2 pl-6 text-slate-200">
    {items.map((item, index) => (
      <li key={index}>{item}</li>
    ))}
  </ul>
);

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-5xl space-y-12 px-4 py-12">
      <header className="space-y-4 text-slate-200">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-400">
            Crelance Legal
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Privacy Policy
          </h1>
        </div>
        <p className="max-w-3xl text-lg leading-relaxed">
          This Privacy Policy explains how Crelance (&quot;Crelance&quot;,
          &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses,
          shares, and safeguards information when you visit our website at{" "}
          <a
            href="https://crelance.io"
            className="text-blue-400 underline decoration-blue-600 underline-offset-4 hover:text-blue-300"
          >
            crelance.io
          </a>
          , create an account, post jobs, offer services, communicate through
          messaging, or otherwise interact with our products and services
          (collectively, the &quot;Services&quot;). By using Crelance, you
          consent to the practices described here.
        </p>
        <p className="text-sm text-slate-400">Last updated: March 2025</p>
      </header>

      <Section number="1" title="Information We Collect">
        <p>We collect the following categories of information:</p>
        <BulletList
          items={[
            "Account details such as name, email address, password, role selection, and profile preferences.",
            "Professional information including portfolio links, skills, pricing, availability, and work history that you provide to showcase or procure services.",
            "Project data such as job postings, proposals, contracts, deliverables, milestones, and payment history.",
            "Communications through messaging, chat, support requests, and reviews submitted on the platform.",
            "Payment and payout information collected or processed by our payment service provider (Stripe) when you authorize transactions or connect a bank account.",
            "Usage data including device and browser type, IP address, pages visited, referring URLs, and interactions with platform features, captured through cookies, pixels, and similar technologies.",
          ]}
        />
      </Section>

      <Section number="2" title="How We Use Information">
        <p>We use personal information to:</p>
        <BulletList
          items={[
            "Create and manage user accounts, authenticate logins, and personalize dashboards.",
            "Match creators and specialists, surface relevant listings, and enable messaging and collaboration.",
            "Process payments, calculate platform fees, facilitate escrow, and fulfill payouts through our payment partners.",
            "Provide customer support, investigate issues, and respond to inquiries.",
            "Monitor platform integrity, detect fraud or abuse, and enforce our Terms of Service.",
            "Improve and develop new features, conduct analytics, and understand how users engage with Crelance.",
            "Send transactional notices, security alerts, and—when permitted—marketing communications about new features or opportunities.",
          ]}
        />
        <p>
          We may aggregate or de-identify data for research, benchmarking, and
          product development. Aggregated data does not identify a specific
          individual and may be used for any lawful purpose.
        </p>
      </Section>

      <Section number="3" title="How We Share Information">
        <p>
          We share information only as necessary to operate Crelance and in
          accordance with this Policy:
        </p>
        <BulletList
          items={[
            "With other users when you participate in projects, post services, submit proposals, or leave feedback.",
            "With trusted service providers who perform services on our behalf, such as payment processing (Stripe), cloud hosting, analytics, communications, and customer support.",
            "With legal, governmental, or regulatory authorities when required to comply with law, enforce our agreements, or protect the rights, property, or safety of Crelance, our users, or others.",
            "In connection with a business transaction such as a merger, acquisition, financing, or sale of assets, subject to appropriate confidentiality protections.",
          ]}
        />
        <p>
          We do not sell personal information. If we ever plan to use your data
          for materially different purposes, we will update this Policy and, if
          required by law, obtain your consent.
        </p>
      </Section>

      <Section number="4" title="Cookies and Tracking Technologies">
        <p>
          Crelance uses cookies, local storage, and similar technologies to
          keep you signed in, remember preferences, measure performance, and
          personalize content. You may adjust cookie settings through your
          browser. If you disable cookies, some features of Crelance may not
          function properly.
        </p>
      </Section>

      <Section number="5" title="Data Retention">
        <p>
          We retain personal information for as long as needed to provide the
          Services, comply with legal obligations, resolve disputes, and enforce
          our agreements. Account information is retained while your account is
          active. After closure, we may keep limited data if necessary for
          compliance, fraud prevention, or legitimate business purposes.
        </p>
      </Section>

      <Section number="6" title="Security">
        <p>
          We implement administrative, technical, and physical safeguards to
          protect personal information, including encrypted transport, access
          controls, and routine security monitoring. No system can be guaranteed
          100% secure. You are responsible for protecting your account
          credentials and promptly notifying us of any unauthorized use.
        </p>
      </Section>

      <Section number="7" title="International Transfers">
        <p>
          Crelance is operated from the United States. If you access the
          Services from other regions, your information may be transferred to
          and processed in the United States or other jurisdictions where we or
          our service providers operate. We take steps to ensure transfers
          comply with applicable data protection laws, including appropriate
          contractual safeguards.
        </p>
      </Section>

      <Section number="8" title="Your Choices and Rights">
        <p>
          Depending on where you live, you may have rights regarding your
          personal information, including the right to access, correct, delete,
          or restrict certain processing. You may also have the right to object
          to processing or request data portability.
        </p>
        <p>
          To exercise these rights, contact us at{" "}
          <a
            href="mailto:privacy@crelance.io"
            className="text-blue-400 underline decoration-blue-600 underline-offset-4 hover:text-blue-300"
          >
            privacy@crelance.io
          </a>
          . We may request additional verification to protect your account.
        </p>
        <p>
          You can manage marketing communications by using the unsubscribe link
          in emails or adjusting notification preferences in your account
          settings. Please note that we may still send transactional or service
          messages.
        </p>
        <p>
          If you reside in the European Economic Area, United Kingdom, or
          certain other jurisdictions, you also have the right to lodge a
          complaint with your local data protection authority.
        </p>
      </Section>

      <Section number="9" title="Children’s Privacy">
        <p>
          Crelance is not directed to children under 18, and we do not
          knowingly collect personal information from anyone under 18. If we
          learn that we have collected such information, we will take steps to
          delete it. Parents or guardians who believe a child has provided us
          data should contact us immediately.
        </p>
      </Section>

      <Section number="10" title="Updates to This Policy">
        <p>
          We may revise this Privacy Policy from time to time. If changes are
          material, we will notify you through the platform, by email, or by
          other reasonable means. Continued use of the Services after the
          effective date of an update constitutes acceptance of the revised
          Policy.
        </p>
      </Section>

      <Section number="11" title="Contact Us">
        <p>
          For questions about this Privacy Policy or our data practices,
          please contact:
        </p>
        <div className="space-y-1 text-slate-200">
          <p>Crelance Legal</p>
          <p>
            <a
              href="mailto:privacy@crelance.io"
              className="text-blue-400 underline decoration-blue-600 underline-offset-4 hover:text-blue-300"
            >
              privacy@crelance.io
            </a>
          </p>
          <p>
            You may also reach our support team at{" "}
            <a
              href="mailto:support@crelance.io"
              className="text-blue-400 underline decoration-blue-600 underline-offset-4 hover:text-blue-300"
            >
              support@crelance.io
            </a>
            .
          </p>
        </div>
        <p className="text-sm text-slate-400">
          Please review our{" "}
          <Link
            to="/legal/terms-of-service"
            className="text-blue-400 underline decoration-blue-600 underline-offset-4 hover:text-blue-300"
          >
            Terms of Service
          </Link>{" "}
          for information about governing your use of Crelance.
        </p>
      </Section>
    </div>
  );
}

