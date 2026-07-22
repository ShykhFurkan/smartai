"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@smarthire/ui";
import { Building2, Palette, Users, ArrowRight } from "lucide-react";
import { AuthCard } from "@/components/auth";

export default function OnboardingWelcomePage() {
  return (
    <AuthCard
      title="Welcome to Smart Hire!"
      subtitle="Let's establish your organization workspace to unlock AI screening and interview panels."
    >
      <div className="space-y-6">
        {/* Intro features list */}
        <div className="space-y-4 py-2">
          <div className="flex gap-4 items-start text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-200">Organization Registry</h4>
              <p className="text-xs text-zinc-450 mt-0.5 leading-relaxed">
                Define your corporate domain, locations, and timezone to localize candidate schedulers.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-500">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-200">Custom Workspace Branding</h4>
              <p className="text-xs text-zinc-450 mt-0.5 leading-relaxed">
                Upload your company logo and banner, and customize brand hex colors for application portals.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-600/10 text-purple-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-200">Invite Recruiter Teammates</h4>
              <p className="text-xs text-zinc-450 mt-0.5 leading-relaxed">
                Add administrators, hiring managers, or co-recruiters to share scorecard evaluations.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <Link href="/onboarding/company">
            <Button
              variant="primary"
              className="w-full justify-center bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-1.5 h-10"
            >
              Continue to Company Information <ArrowRight className="h-4.5 w-4.5" />
            </Button>
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
