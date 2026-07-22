"use client";

import * as React from "react";
import { ShieldCheck } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const plans = [
    { name: "Starter Tier", price: "$49/mo", seats: "5 Recruiters limit", activeCompanies: 12, features: ["Standard Job post limits", "Resume upload parsing", "In-app notifications queue"] },
    { name: "Growth Tier", price: "$199/mo", seats: "25 Recruiters limit", activeCompanies: 28, features: ["Custom Categories custom metrics", "AI Resume Score scoring", "Calendly integrations"] },
    { name: "Enterprise Custom", price: "Custom quote", seats: "Unlimited seats limit", activeCompanies: 6, features: ["Priority AI limits support", "Dedicated DB cluster isolation", "Custom SSO authentication"] },
  ];

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto py-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
          Platform Operations Console
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-150 mt-1">
          Subscription Tier Plans
        </h1>
        <p className="text-sm text-zinc-555 dark:text-zinc-400 mt-1">
          Review SaaS plans, company seat limits allocations, and pricing catalog.
        </p>
      </div>

      {/* Plans List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-[360px] text-left shadow-sm hover:border-zinc-300 transition-colors"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900">{p.name}</h3>
                <span className="text-2xl font-extrabold text-blue-500 block mt-1">{p.price}</span>
                <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">{p.seats}</span>
              </div>

              <div className="space-y-2 border-t border-zinc-100 pt-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Included Features</span>
                <ul className="space-y-1.5 text-xs text-zinc-600">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs mt-4 pt-3 border-t border-zinc-100">
              <span className="text-zinc-500">Active Clients:</span>
              <span className="font-bold text-zinc-700 font-mono">{p.activeCompanies} Companies</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
