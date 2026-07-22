import * as React from "react";

export const metadata = {
  title: "Smart Hire - Terms of Service",
  description: "Read the Terms of Service of the Smart Hire recruitment SaaS platform.",
};

export default function TermsPage() {
  const lastUpdated = "July 12, 2026";

  return (
    <div className="bg-[#030303] text-zinc-100 min-h-screen font-sans antialiased selection:bg-blue-500/30 selection:text-white py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-zinc-500 font-mono">Last updated: {lastUpdated}</p>

        <div className="mt-12 space-y-8 text-zinc-350 leading-relaxed text-sm md:text-base">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-200">1. SaaS Platform License</h2>
            <p>
              Smart Hire grants your organization a revocable, non-exclusive, seat-licensed right to use our platform to manage your corporate recruitment pipelines, assessments, and interview bookings.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-200">2. Responsible Use of AI</h2>
            <p>
              Hiring decisions are the sole responsibility of the customer. Smart Hire provides compatibility scores and resume summaries for informational screening assistance. We strongly advise utilizing anonymized screening mode toggles.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-200">3. Fee Tiers & Subscriptions</h2>
            <p>
              Fees are billed on a monthly or annual subscription tier per recruiter seat. Subscription tier limits (e.g. active job counts, API limits, fine-tuned LLM models) are strictly enforced in our systems.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-200">4. Service SLAs & Limits</h2>
            <p>
              We guarantee 99.9% platform availability bounds for Enterprise subscription customers. Assessment test run results and databases updates are maintained in real-time, subject to standard cloud provider connectivity.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
