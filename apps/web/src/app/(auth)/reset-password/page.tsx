"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthCard, PasswordInput, PasswordStrength, SubmitButton } from "@/components/auth";
import { authService } from "@/services/auth";
import { logger } from "@smarthire/logger";
import { CheckCircle2 } from "lucide-react";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/\d/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one symbol"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordVal = useWatch({ control, name: "password" });

  const onSubmit = async (values: ResetFormValues) => {
    logger.info("[ResetPassword] Updating credentials credentials");
    setLoading(true);
    setErrorMsg(null);

    try {
      await authService.resetPassword(values.password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Password reset failed. Please request link again.";
      setErrorMsg(message);
      logger.error("[ResetPassword] Error during password update", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create new password"
      subtitle="Enter your new password below. Ensure it fulfills the complexity requirements."
    >
      {success ? (
        <div className="space-y-6 text-center animate-in fade-in duration-200">
          <div className="flex justify-center">
            <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-zinc-100">Password Changed</h3>
          <p className="text-sm text-zinc-450 leading-relaxed max-w-sm mx-auto">
            Your credentials have been updated. Redirecting you to the sign-in portal...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {errorMsg && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-medium text-red-500">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <PasswordInput
              label="New Password"
              id="password"
              placeholder="••••••••"
              error={errors.password?.message}
              disabled={loading}
              {...register("password")}
            />
            <PasswordStrength password={passwordVal} />
          </div>

          <PasswordInput
            label="Confirm Password"
            id="confirmPassword"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            disabled={loading}
            {...register("confirmPassword")}
          />

          <SubmitButton loading={loading}>Save Password</SubmitButton>
        </form>
      )}
    </AuthCard>
  );
}
