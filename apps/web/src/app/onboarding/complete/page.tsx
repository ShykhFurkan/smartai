"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "@/components/auth";
import { Button } from "@smarthire/ui";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { logger } from "@smarthire/logger";

export default function OnboardingCompletePage() {
  const router = useRouter();

  // Clear onboarding localStorage keys on completion
  React.useEffect(() => {
    localStorage.removeItem("smarthire_onboarding_company_info");
    localStorage.removeItem("smarthire_onboarding_company_id");

    const timer = setTimeout(() => {
      logger.info("[OnboardingComplete] Auto redirecting user to recruiter dashboard");
      router.push("/recruiter/jobs");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AuthCard
      title="Workspace Setup Complete!"
      subtitle="Your corporate workspace has been registered successfully."
    >
      <div className="space-y-6 text-center py-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
        </div>

        <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
          Welcome to your new recruitment suite. You are being redirected to your dashboard space in 3 seconds.
        </p>

        <div className="pt-4">
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push("/recruiter/jobs")}
            className="w-full justify-center bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-1.5 h-10"
          >
            Go to Dashboard Now <ArrowRight className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}
