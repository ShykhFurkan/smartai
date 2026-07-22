"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthCard, FormField, PasswordInput, PasswordStrength, OAuthButton, SubmitButton } from "@/components/auth";
import { authService, UserRole } from "@/services/auth";
import { logger } from "@smarthire/logger";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/\d/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one symbol"),
  role: z.enum(["candidate", "recruiter", "company-admin"] as const),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "candidate",
    },
  });

  const passwordVal = useWatch({ control, name: "password" });

  const onSubmit = async (values: RegisterFormValues) => {
    logger.info(`[RegisterPage] Registering account: ${values.email}`);
    setLoading(true);
    setErrorMsg(null);

    try {
      await authService.signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role as UserRole,
      });

      logger.info("[RegisterPage] Sign up successful, verify email redirect");
      router.push("/verify-email");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed. Please try again.";
      setErrorMsg(message);
      logger.error("[RegisterPage] Sign up failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "microsoft") => {
    logger.info(`[RegisterPage] Trigger social registration: ${provider}`);
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-450 hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMsg && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-medium text-red-500">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="First Name"
            id="firstName"
            placeholder="Jane"
            error={errors.firstName?.message}
            disabled={loading}
            {...register("firstName")}
          />
          <FormField
            label="Last Name"
            id="lastName"
            placeholder="Doe"
            error={errors.lastName?.message}
            disabled={loading}
            {...register("lastName")}
          />
        </div>

        <FormField
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@company.com"
          error={errors.email?.message}
          disabled={loading}
          {...register("email")}
        />

        <div className="space-y-2">
          <PasswordInput
            label="Password"
            id="password"
            placeholder="••••••••"
            error={errors.password?.message}
            disabled={loading}
            {...register("password")}
          />
          <PasswordStrength password={passwordVal} />
        </div>

        {/* Role Selection */}
        <div className="space-y-1.5 w-full text-left">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Account Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center justify-center border border-zinc-250 dark:border-zinc-800 rounded-lg p-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/80 cursor-pointer hover:border-blue-500 transition-colors [&:has(input:checked)]:border-blue-600 [&:has(input:checked)]:bg-blue-500/5">
              <input
                type="radio"
                value="candidate"
                disabled={loading}
                className="sr-only"
                {...register("role")}
              />
              <span>Candidate</span>
            </label>
            <label className="flex items-center justify-center border border-zinc-250 dark:border-zinc-800 rounded-lg p-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/80 cursor-pointer hover:border-blue-500 transition-colors [&:has(input:checked)]:border-blue-600 [&:has(input:checked)]:bg-blue-500/5">
              <input
                type="radio"
                value="recruiter"
                disabled={loading}
                className="sr-only"
                {...register("role")}
              />
              <span>Recruiter</span>
            </label>
            <label className="flex items-center justify-center border border-zinc-250 dark:border-zinc-800 rounded-lg p-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950/80 cursor-pointer hover:border-blue-500 transition-colors [&:has(input:checked)]:border-blue-600 [&:has(input:checked)]:bg-blue-500/5">
              <input
                type="radio"
                value="company-admin"
                disabled={loading}
                className="sr-only"
                {...register("role")}
              />
              <span>Admin</span>
            </label>
          </div>
        </div>

        <div className="pt-2">
          <SubmitButton loading={loading}>Sign Up</SubmitButton>
        </div>

        {/* Separator */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-x-0 h-px bg-zinc-200 dark:bg-zinc-800/80" />
          <span className="relative px-3 text-xs text-zinc-500 bg-white dark:bg-[#09090c] font-semibold uppercase tracking-wider">
            Or register with
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <OAuthButton provider="google" onClick={() => handleSocialLogin("google")} disabled={loading} />
          <OAuthButton provider="microsoft" onClick={() => handleSocialLogin("microsoft")} disabled={loading} />
        </div>
      </form>
    </AuthCard>
  );
}
