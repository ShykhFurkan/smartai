"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthCard, FormField, SubmitButton } from "@/components/auth";
import { authService } from "@/services/auth";
import { logger } from "@smarthire/logger";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    logger.info(`[ForgotPassword] Trigger reset email for: ${values.email}`);
    setLoading(true);
    setErrorMsg(null);

    try {
      await authService.forgotPassword(values.email);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to trigger email link. Please try again.";
      setErrorMsg(message);
      logger.error("[ForgotPassword] Error sending link", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email address and we will mail you a link to reset your password credentials."
    >
      {success ? (
        <div className="space-y-6 text-center animate-in fade-in duration-200">
          <div className="flex justify-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-zinc-100">Verification Link Sent</h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            Check your inbox. We have dispatched a secure authentication link to your email.
          </p>
          <div className="pt-2">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 hover:text-blue-450 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errorMsg && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-medium text-red-500">
              {errorMsg}
            </div>
          )}

          <FormField
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@company.com"
            error={errors.email?.message}
            disabled={loading}
            {...register("email")}
          />

          <SubmitButton loading={loading}>Send Reset Link</SubmitButton>

          <div className="text-center pt-2">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-550 dark:text-zinc-400 hover:text-blue-500 hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
