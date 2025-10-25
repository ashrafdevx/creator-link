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

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-5xl space-y-12 px-4 py-12">
      <header className="space-y-4 text-slate-200">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-blue-400">
            Crelance Legal
          </p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Terms of Service
          </h1>
        </div>
        <p className="max-w-3xl text-lg leading-relaxed">
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of the Crelance platform and website located at{" "}
          <a
            href="https://crelance.io"
            className="text-blue-400 underline decoration-blue-600 underline-offset-4 hover:text-blue-300"
          >
            crelance.io
          </a>
          , along with our products and services (collectively, the
          &quot;Services&quot;). Crelance connects brands and content creators
          with video, design, and strategy specialists, providing collaboration
          tools, escrow-backed payments, and support. By creating an account,
          accessing the site, or transacting on Crelance, you agree to be bound
          by these Terms.
        </p>
        <p className="text-sm text-slate-400">Last updated: March 2025</p>
      </header>

      <Section number="1" title="Account Eligibility and Registration">
        <p>
          You must be at least 18 years old and able to form legally binding
          contracts to use Crelance. When creating an account, you agree to:
        </p>
        <BulletList
          items={[
            "Provide accurate and complete information, including your real name and contact details.",
            "Maintain the security of your credentials and promptly update information that changes.",
            "Use your account only for yourself; account transfers or sharing login details are prohibited.",
            "Notify us immediately at support@crelance.io if you suspect unauthorized access.",
          ]}
        />
      </Section>

      <Section number="2" title="Roles on the Platform">
        <p>
          Crelance supports both creators (clients) and specialists
          (service providers). Each account may act in either role, but you
          must accurately represent your status in listings, applications, and
          messages. When operating as a specialist, you confirm that you have
          the skills, licenses, and rights necessary to deliver the services
          you offer. When operating as a creator, you confirm that you possess
          the necessary rights to commission and receive the requested work.
        </p>
      </Section>

      <Section number="3" title="Platform Usage and Project Lifecycle">
        <p>
          Crelance enables job postings, service listings, messaging, file
          sharing, and project tracking. You agree to use these tools solely
          for legitimate professional collaboration. A project on Crelance
          typically includes: job or gig discovery, pre-project messaging,
          agreement on scope and price, delivery through the platform, review
          and acceptance, and feedback.
        </p>
        <BulletList
          items={[
            "Keep all project-related communication and deliverables within the platform to ensure support protection and accurate records.",
            "Do not solicit or accept payments outside of Crelance or attempt to circumvent platform fees.",
            "Respect deadlines, provide timely responses, and maintain a professional tone in all communications.",
            "Use messaging responsibly; spamming, harassment, and sharing malicious files are prohibited.",
          ]}
        />
      </Section>

      <Section number="4" title="Payments, Fees, and Escrow">
        <p>
          All financial transactions on Crelance are processed through
          Stripe and governed by Stripe’s own terms. When a creator orders a
          service or accepts an offer, the quoted amount plus the applicable
          platform fee (currently 10% unless stated otherwise) is authorized
          or captured through our escrow system. Funds are released to the
          specialist after the creator marks the work as complete or after an
          automated acceptance window closes.
        </p>
        <BulletList
          items={[
            "Creators must ensure sufficient funds and authorize payment at the time of booking.",
            "Specialists receive payouts to their connected Stripe account subject to Stripe’s onboarding and compliance checks.",
            "Crelance may withhold or delay payouts when fraud, disputes, or compliance reviews are pending.",
            "Platform fees are non-refundable except where required by law or expressly stated by Crelance.",
          ]}
        />
      </Section>

      <Section number="5" title="Cancellations and Disputes">
        <p>
          We encourage creators and specialists to resolve concerns directly
          through platform messaging. If you cannot reach a resolution,
          contact support within 7 days of delivery or the agreed deadline.
          Crelance may review project history, files, and messages to issue
          a partial or full refund, credit, or payout based on the evidence
          available. Our decision is final and intended to maintain a fair
          marketplace.
        </p>
      </Section>

      <Section number="6" title="Prohibited Conduct">
        <p>
          You agree not to engage in activities that harm the Crelance
          community or violate applicable law. Prohibited conduct includes:
        </p>
        <BulletList
          items={[
            "Uploading or distributing content that infringes intellectual property or privacy rights.",
            "Posting false listings, misleading profiles, or fabricated reviews.",
            "Attempting to reverse-engineer, scrape, or overload the platform’s infrastructure.",
            "Sharing or requesting personally identifiable information outside of what is necessary to complete a project.",
            "Engaging in hate speech, harassment, discrimination, or any other abusive behavior.",
          ]}
        />
      </Section>

      <Section number="7" title="Intellectual Property">
        <p>
          Unless otherwise agreed in writing between the parties, specialists
          grant creators a license to use deliverables for the specific purpose
          defined in the project scope once full payment is released. Both
          creators and specialists are responsible for negotiating broader
          usage rights in advance. Crelance does not claim ownership of
          user-generated content but may host, display, or use it to operate
          and promote the Services. You confirm that any content you upload,
          including portfolios and deliverables, does not infringe third-party
          rights.
        </p>
      </Section>

      <Section number="8" title="Reviews and Feedback">
        <p>
          Reviews must reflect genuine project experiences. Crelance may
          moderate, remove, or request edits to feedback that is abusive,
          retaliatory, or irrelevant. You may not coerce, manipulate, or offer
          incentives for positive reviews.
        </p>
      </Section>

      <Section number="9" title="Non-Circumvention">
        <p>
          To protect the integrity of the marketplace, you agree not to offer
          or accept work outside of Crelance with a user you first met
          through the platform for at least 12 months after your most recent
          project together unless you pay a conversion fee approved by
          Crelance. Soliciting contact details solely to take a project off
          platform is a material breach of these Terms.
        </p>
      </Section>

      <Section number="10" title="Confidentiality">
        <p>
          Parties may obtain confidential or proprietary information while
          working together. You agree to use such information solely for the
          project and to safeguard it with at least reasonable care. You are
          responsible for ensuring any subcontractors or collaborators follow
          the same obligations.
        </p>
      </Section>

      <Section number="11" title="Warranties, Disclaimers, and Limitation of Liability">
        <p>
          Crelance provides the Services on an “as is” and “as available”
          basis. We make no warranties of accuracy, completeness, or fitness
          for a particular purpose. We do not control or guarantee the quality
          of user content, services, or communications. To the fullest extent
          permitted by law, Crelance (including its officers, directors,
          employees, and suppliers) is not liable for any indirect, incidental,
          special, consequential, or punitive damages, or for lost profits,
          revenues, data, or goodwill arising from your use of the Services.
          Our aggregate liability will not exceed the total fees you paid to
          Crelance in the six months preceding the event giving rise to the
          claim.
        </p>
      </Section>

      <Section number="12" title="Indemnification">
        <p>
          You agree to indemnify and hold harmless Crelance, its affiliates,
          and their respective officers, directors, employees, and agents from
          and against any claims, damages, losses, liabilities, and expenses
          (including reasonable attorney fees) arising out of or related to
          your breach of these Terms, your use of the Services, or your
          violation of any law or third-party rights.
        </p>
      </Section>

      <Section number="13" title="Termination and Suspension">
        <p>
          Crelance may suspend or terminate your account at any time if we
          believe you have violated these Terms, engaged in fraudulent or
          harmful behavior, or created risk for other users. You may close your
          account at any time by contacting support. Certain provisions,
          including those regarding fees owed, intellectual property,
          confidentiality, limitation of liability, and dispute resolution,
          survive termination.
        </p>
      </Section>

      <Section number="14" title="Governing Law and Dispute Resolution">
        <p>
          These Terms are governed by the laws of the State of Delaware,
          United States, without regard to conflict of law principles. Any
          dispute that cannot be resolved informally will be handled through
          binding arbitration conducted in English under the rules of the
          American Arbitration Association. Either party may seek injunctive or
          equitable relief in a court of competent jurisdiction for matters
          involving intellectual property or unauthorized access.
        </p>
      </Section>

      <Section number="15" title="Changes to These Terms">
        <p>
          We may update these Terms to reflect changes in our Services or
          applicable laws. When we make material updates, we will provide
          reasonable notice through the platform or via email. Continued use of
          Crelance after updates take effect constitutes your acceptance of
          the revised Terms.
        </p>
      </Section>

      <Section number="16" title="Contact Information">
        <p>
          Questions about these Terms can be sent to{" "}
          <a
            href="mailto:support@crelance.io"
            className="text-blue-400 underline decoration-blue-600 underline-offset-4 hover:text-blue-300"
          >
            support@crelance.io
          </a>
          . If you reside in the European Economic Area or United Kingdom, you
          may also reach out to us for information about dispute resolution
          bodies applicable in your jurisdiction.
        </p>
        <p className="text-sm text-slate-400">
          You should also review our{" "}
          <Link
            to="/legal/privacy-policy"
            className="text-blue-400 underline decoration-blue-600 underline-offset-4 hover:text-blue-300"
          >
            Privacy Policy
          </Link>{" "}
          to understand how we collect and process personal data in connection
          with the Services.
        </p>
      </Section>
    </div>
  );
}

