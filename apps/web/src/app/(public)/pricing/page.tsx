"use client";

import * as React from "react";
import { PricingCard, pricingPlans } from "@/components/marketing/PricingCard";
import { ShieldAlert, Sparkles } from "lucide-react";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = React.useState(true);

  return (
    <div className="bg-[#030303] text-zinc-100 min-h-screen relative overflow-hidden font-sans antialiased selection:bg-blue-500/30 selection:text-white py-16 md:py-24">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-full max-w-7xl bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(59,130,246,0.12),rgba(255,255,255,0))]" />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-950/20 px-3 py-1 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5" /> Pricing Options
          </div>
          <h1 className="text-4xl font-extrabold sm:text-5xl leading-tight">
            Flexible Plans for Scaling Squads
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            All plans include access to our PostgreSQL database layer, secure JWT auth, and unified logs. Choose a tier that fits your hiring velocity.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="mt-12 flex justify-center items-center gap-4">
          <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-white" : "text-zinc-500"}`}>
            Billed Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle annual billing"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-semibold transition-colors ${isAnnual ? "text-white" : "text-zinc-500"} flex items-center gap-1.5`}>
            Billed Annually
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} isAnnual={isAnnual} />
          ))}
        </div>

        {/* Enterprise Notice */}
        <div className="mt-16 rounded-2xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-zinc-200">Need custom hosting bounds?</h4>
              <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">
                We support private cloud instances, multi-region database replicates, and isolated custom LLMs.
              </p>
            </div>
          </div>
          <a
            href="/contact"
            className="text-sm font-semibold text-blue-500 hover:text-blue-450 hover:underline shrink-0"
          >
            Request custom proposal &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
