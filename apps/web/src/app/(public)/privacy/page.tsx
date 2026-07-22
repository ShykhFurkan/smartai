import * as React from "react";

export const metadata = {
  title: "Smart Hire - Privacy Policy",
  description: "Read the Privacy Policy of the Smart Hire recruitment SaaS platform.",
};

export default function PrivacyPage() {
  const lastUpdated = "July 12, 2026";

  return (
    <div className="bg-[#030303] text-zinc-100 min-h-screen font-sans antialiased selection:bg-blue-500/30 selection:text-white py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-500 font-mono">Last updated: {lastUpdated}</p>

        <div className="mt-12 space-y-8 text-zinc-350 leading-relaxed text-sm md:text-base">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-200">1. Data Collected & Ingested</h2>
            <p>
              Smart Hire collects candidate experience history, educations records, certificates, and resumes uploaded directly to our systems. We do not inspect personal content unrelated to the specific professional application context.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-200">2. Row Level Isolation</h2>
            <p>
              We implement Postgres Row Level Security (RLS) policies scoped strictly to the respective employer workspace (`company_id`). Recruiter panels have access only to evaluations under their assigned workspace bounds.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-200">3. AI Screening Transparency</h2>
            <p>
              AI parser predictions, skill extraction match scores, and automated questions generation are conducted to assist human selectors. Smart Hire provides explicit configurations for candidate profile anonymization switches to mitigate unconscious bias.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-200">4. Third-Party Integrations</h2>
            <p>
              If enabled, we sync calendar schedules and slots with Google Calendar or Microsoft Outlook APIs. Your calendar access is used exclusively to determine available booking windows.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
