"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AuthCard, FormField } from "@/components/auth";
import { Button } from "@smarthire/ui";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { logger } from "@smarthire/logger";

const companyInfoSchema = z.object({
  name: z.string().min(1, "Company name is required").max(255),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(255)
    .regex(/^[a-z0-9-]+$/, "Slug must be URL-friendly (lowercase, numbers, and dashes)"),
  domain: z.string().max(255).optional(),
  industry: z.string().min(1, "Industry is required").max(100),
  companySize: z.string().min(1, "Company size is required").max(50),
  phone: z.string().min(1, "Phone is required").max(50),
  email: z.string().email("Invalid email format").or(z.literal("")),
  timezone: z.string().min(1, "Timezone is required").max(100),
  description: z.string().optional(),
  country: z.string().min(1, "Country is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  city: z.string().min(1, "City is required").max(100),
});

type CompanyInfoValues = z.infer<typeof companyInfoSchema>;

const LOCAL_STORAGE_KEY = "smarthire_onboarding_company_info";

export default function CompanyInfoPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Load initial values from localStorage if available
  const [initialValues, setInitialValues] = React.useState<CompanyInfoValues>({
    name: "",
    slug: "",
    domain: "",
    industry: "",
    companySize: "1-10",
    phone: "",
    email: "",
    timezone: "UTC",
    description: "",
    country: "",
    state: "",
    city: "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CompanyInfoValues>({
    resolver: zodResolver(companyInfoSchema),
    values: initialValues,
  });

  // Watch fields for autosave
  const watchedValues = useWatch({ control });

  // Autosave to localStorage on value changes
  React.useEffect(() => {
    if (watchedValues && Object.keys(watchedValues).length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(watchedValues));
    }
  }, [watchedValues]);

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInitialValues((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        logger.error("Failed to parse onboarding autosave values", err);
      }
    }
  }, []);

  // Auto-generate slug from name if slug was not manually touched
  const companyName = watchedValues.name;
  React.useEffect(() => {
    if (companyName) {
      const generated = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [companyName, setValue]);

  const onSubmit = async (values: CompanyInfoValues) => {
    logger.info(`[CompanyInfoPage] Registering company: ${values.name}`);
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/organization/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          slug: values.slug,
          domain: values.domain || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create company profile");
      }

      const { data: company } = await res.json();
      logger.info("[CompanyInfoPage] Company created successfully", company.id);

      // Save secondary fields using company ID PATCH
      const patchRes = await fetch(`/api/organization/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: values.industry,
          companySize: values.companySize,
          phone: values.phone,
          email: values.email || null,
          timezone: values.timezone,
          description: values.description || null,
          country: values.country,
          state: values.state,
          city: values.city,
        }),
      });

      if (!patchRes.ok) {
        const data = await patchRes.json();
        throw new Error(data.error || "Failed to save company onboarding details");
      }

      // Store created company ID for branding step
      localStorage.setItem("smarthire_onboarding_company_id", company.id);

      router.push("/onboarding/company/logo");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please check your inputs.";
      setErrorMsg(message);
      logger.error("[CompanyInfoPage] Onboarding company details save failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Tell us about your Company"
      subtitle="Input basic coordinates to initialize your recruiter workspace."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMsg && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-medium text-red-500">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Company Name"
            id="name"
            placeholder="Acme Corp"
            error={errors.name?.message}
            disabled={loading}
            {...register("name")}
          />
          <FormField
            label="Workspace Slug (URL)"
            id="slug"
            placeholder="acme-corp"
            error={errors.slug?.message}
            disabled={loading}
            {...register("slug")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Industry"
            id="industry"
            placeholder="Technology"
            error={errors.industry?.message}
            disabled={loading}
            {...register("industry")}
          />
          <div className="space-y-1.5 w-full text-left">
            <label htmlFor="companySize" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Company Size
            </label>
            <select
              id="companySize"
              disabled={loading}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-400 focus:border-blue-500 focus:outline-none transition-colors"
              {...register("companySize")}
            >
              <option value="1-10">1 - 10 employees</option>
              <option value="11-50">11 - 50 employees</option>
              <option value="51-200">51 - 200 employees</option>
              <option value="201+">201+ employees</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Domain / Website"
            id="domain"
            placeholder="acme.com"
            error={errors.domain?.message}
            disabled={loading}
            {...register("domain")}
          />
          <FormField
            label="Company Phone"
            id="phone"
            placeholder="+12025550143"
            error={errors.phone?.message}
            disabled={loading}
            {...register("phone")}
          />
          <FormField
            label="Company Email"
            id="email"
            placeholder="hr@acme.com"
            error={errors.email?.message}
            disabled={loading}
            {...register("email")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Country"
            id="country"
            placeholder="United States"
            error={errors.country?.message}
            disabled={loading}
            {...register("country")}
          />
          <FormField
            label="State / Region"
            id="state"
            placeholder="California"
            error={errors.state?.message}
            disabled={loading}
            {...register("state")}
          />
          <FormField
            label="City"
            id="city"
            placeholder="San Francisco"
            error={errors.city?.message}
            disabled={loading}
            {...register("city")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 w-full text-left col-span-2">
            <label htmlFor="timezone" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
              Default Timezone
            </label>
            <select
              id="timezone"
              disabled={loading}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-400 focus:border-blue-500 focus:outline-none transition-colors"
              {...register("timezone")}
            >
              <option value="UTC">UTC (GMT+0)</option>
              <option value="America/New_York">Eastern Time (EST/EDT)</option>
              <option value="America/Chicago">Central Time (CST/CDT)</option>
              <option value="America/Denver">Mountain Time (MST/MDT)</option>
              <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
              <option value="Europe/London">London Time (GMT/BST)</option>
              <option value="Europe/Paris">Central European Time (CET/CEST)</option>
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="Asia/Singapore">Singapore Time (SGT)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 w-full text-left">
          <label htmlFor="description" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Company Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Brief details about what your organization does..."
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 px-3.5 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-650 focus:border-blue-500 focus:outline-none transition-colors resize-none"
            {...register("description")}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-zinc-200/20">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/onboarding")}
            disabled={loading}
            className="flex items-center gap-1 border-zinc-800 text-zinc-350 hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 h-10 px-6"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
            ) : (
              <>
                Continue <ArrowRight className="h-4.5 w-4.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
