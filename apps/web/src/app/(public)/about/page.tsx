import * as React from "react";
import { Sparkles, Heart, Scale, Users2, Shield } from "lucide-react";

export const metadata = {
  title: "Smart Hire - About Us",
  description: "Learn about the mission, values, and story behind the Smart Hire AI-powered recruitment platform.",
};

const values = [
  {
    title: "Equity & Fair Hiring",
    icon: Scale,
    description: "We design AI tools with bias mitigation at the core, allowing companies to evaluate candidates purely on merit.",
  },
  {
    title: "Candidate First Experience",
    icon: Heart,
    description: "Recruiting should respect candidate timelines. Our self-booking scheduler and assessments respect applicant time.",
  },
  {
    title: "Security & RLS Privacy",
    icon: Shield,
    description: "We enforce strict row-level isolation guarantees across corporate workspaces, safeguarding corporate assessment data.",
  },
  {
    title: "Collaborative Synergy",
    icon: Users2,
    description: "Hiring is a team sport. We coordinate panels, compile recruiter scorecards, and align hiring managers in real time.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#030303] text-zinc-100 min-h-screen relative overflow-hidden font-sans antialiased selection:bg-blue-500/30 selection:text-white py-16 md:py-24">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-full max-w-7xl bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(139,92,246,0.12),rgba(255,255,255,0))]" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-950/20 px-3 py-1 text-xs font-semibold text-purple-400">
            <Sparkles className="h-3.5 w-3.5" /> Our Story
          </div>
          <h1 className="text-4xl font-extrabold sm:text-5xl leading-tight">
            Democratizing Fair, AI-Assisted Recruiting
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Smart Hire was created by recruitment architects frustrated by disjointed tools, opaque candidate pipelines, and bias-prone evaluations.
          </p>
        </div>

        {/* Narrative / Mission Section */}
        <div className="mt-20 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-100">Our Mission</h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              We believe hiring should be a transparent, high-integrity process for both recruiters and candidates. By engineering an integrated ecosystem containing resume parsing, logical evaluations, and panel bookings, we help scaling teams save time and construct highly accurate hiring funnels.
            </p>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Our microservices-based SaaS platform is built on enterprise software architecture. Every boundary is strictly defined, and candidate schemas are isolated using row-level policies.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 blur-[50px] rounded-full" />
            <h3 className="text-xl font-bold text-zinc-200">The Smart Hire Standards</h3>
            <div className="space-y-4 text-xs font-mono text-zinc-500">
              <div>
                <span className="text-zinc-300">ESTABLISHED:</span> 2026
              </div>
              <div>
                <span className="text-zinc-300">ARCHITECTURE:</span> Next.js 15 Monorepo
              </div>
              <div>
                <span className="text-zinc-300">TIERS SUPPORTED:</span> Starter, Growth, Enterprise
              </div>
              <div>
                <span className="text-zinc-300">INTEGRITY POLICIES:</span> Zero-Bias Screening Mode
              </div>
            </div>
          </div>
        </div>

        {/* Value Grid */}
        <div className="mt-32">
          <h2 className="text-2xl font-bold text-center text-zinc-100 mb-12">Core Principles & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <div key={val.title} className="rounded-xl border border-zinc-900 bg-zinc-950 p-6 space-y-4 hover:border-zinc-800 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-zinc-200">{val.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
