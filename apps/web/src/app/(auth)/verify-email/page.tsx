import * as React from "react";
import Link from "next/link";
import { AuthCard } from "@/components/auth";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@smarthire/ui";

export const metadata = {
  title: "Smart Hire - Verify Email",
  description: "Check your email verification status to complete your account setup.",
};

export default function VerifyEmailPage() {
  return (
    <AuthCard
      title="Verify your email"
      subtitle="We have dispatched a verification link to your email inbox."
    >
      <div className="space-y-6 text-center py-4">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-blue-600/10 text-blue-500 flex items-center justify-center">
            <Mail className="h-8 w-8" />
          </div>
        </div>
        <p className="text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
          Please click the confirmation link in the email to activate your recruiter or candidate account.
        </p>

        <div className="pt-4 flex flex-col gap-2">
          <Link href="/login" className="w-full">
            <Button variant="primary" className="w-full justify-center bg-blue-600 text-white flex items-center gap-1.5 h-10">
              Return to Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
