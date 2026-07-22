"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sparkles, Building2, Palette, UserPlus, CheckCircle } from "lucide-react";

interface Step {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const onboardingSteps: Step[] = [
  { name: "Welcome", href: "/onboarding", icon: Sparkles },
  { name: "Company Information", href: "/onboarding/company", icon: Building2 },
  { name: "Branding", href: "/onboarding/company/logo", icon: Palette },
  { name: "Invite Team", href: "/onboarding/company/team", icon: UserPlus },
  { name: "Complete", href: "/onboarding/complete", icon: CheckCircle },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Find active step index based on pathname
  const activeIndex = onboardingSteps.findIndex((step) => step.href === pathname);

  return (
    <div className="flex min-h-screen flex-col bg-[#030303] text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-white relative overflow-hidden">
      {/* Visual background glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_-25%,rgba(99,102,241,0.12),transparent)]" />

      {/* Sticky Onboarding Stepper Header */}
      <header className="border-b border-zinc-200/40 dark:border-zinc-800/50 bg-[#030303]/70 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Smart<span className="text-blue-500">Hire</span> Onboarding
            </span>
          </div>

          {/* Stepper Wizard Indicator */}
          <nav className="flex items-center gap-1.5 md:gap-4 overflow-x-auto max-w-full no-scrollbar pb-1 md:pb-0">
            {onboardingSteps.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isActive = idx === activeIndex;

              return (
                <div key={step.name} className="flex items-center gap-1.5 md:gap-3 text-xs md:text-sm shrink-0">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                      isActive
                        ? "border-blue-500 bg-blue-600/10 text-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.2)] font-bold"
                        : isCompleted
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-zinc-800 text-zinc-550"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-4.5 w-4.5" /> : <span>{idx + 1}</span>}
                  </div>
                  <span
                    className={`hidden sm:inline font-medium ${
                      isActive ? "text-zinc-150 font-semibold" : isCompleted ? "text-zinc-350" : "text-zinc-550"
                    }`}
                  >
                    {step.name}
                  </span>
                  {idx < onboardingSteps.length - 1 && (
                    <div className="h-px w-4 md:w-8 bg-zinc-800 hidden sm:block" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
