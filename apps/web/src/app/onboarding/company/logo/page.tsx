"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AuthCard } from "@/components/auth";
import { Button } from "@smarthire/ui";
import { ArrowLeft, ArrowRight, Upload, Loader2, Sparkles } from "lucide-react";
import { logger } from "@smarthire/logger";

const supabase = createClient();

export default function BrandingPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [logoUploading, setLogoUploading] = React.useState(false);
  const [bannerUploading, setBannerUploading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Form State
  const [logoUrl, setLogoUrl] = React.useState<string>("");
  const [bannerUrl, setBannerUrl] = React.useState<string>("");
  const [primaryColor, setPrimaryColor] = React.useState<string>("#3b82f6");
  const [accentColor, setAccentColor] = React.useState<string>("#4f46e5");

  // Retrieve company ID on mount
  React.useEffect(() => {
    const id = localStorage.getItem("smarthire_onboarding_company_id");
    if (!id) {
      setErrorMsg("No active company found. Please return to the previous step.");
    } else {
      setCompanyId(id);
      // Try to load any previously saved company info to prefill colors
      const fetchCompany = async () => {
        try {
          const res = await fetch(`/api/organization/companies/${id}`);
          if (res.ok) {
            const { data } = await res.json();
            if (data.logo_url) setLogoUrl(data.logo_url);
            if (data.banner_url) setBannerUrl(data.banner_url);
            if (data.primary_color) setPrimaryColor(data.primary_color);
            if (data.accent_color) setAccentColor(data.accent_color);
          }
        } catch (err) {
          logger.error("Failed to fetch company details for branding preview", err);
        }
      };
      fetchCompany();
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "banner") => {
    const file = e.target.files?.[0];
    if (!file || !companyId) return;

    // Local validation
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Only image files (PNG, JPG, JPEG) are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size must be under 5MB.");
      return;
    }

    if (type === "logo") setLogoUploading(true);
    else setBannerUploading(true);
    setErrorMsg(null);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${companyId}/${type}-${Date.now()}.${fileExt}`;

      // Upload file directly to Supabase storage bucket
      const { error } = await supabase.storage
        .from("company-assets")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("company-assets")
        .getPublicUrl(filePath);

      logger.info(`Uploaded branding ${type} file: ${publicUrl}`);

      if (type === "logo") setLogoUrl(publicUrl);
      else setBannerUrl(publicUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "File upload failed. Please try again.";
      setErrorMsg(message);
      logger.error(`Branding ${type} upload error`, err);
    } finally {
      setLogoUploading(false);
      setBannerUploading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!companyId) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/organization/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl: logoUrl || null,
          bannerUrl: bannerUrl || null,
          primaryColor: primaryColor,
          accentColor: accentColor,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update branding settings");
      }

      logger.info("[BrandingPage] Company branding colors saved successfully");
      router.push("/onboarding/company/team");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update branding settings. Please try again.";
      setErrorMsg(message);
      logger.error("Error updating company branding settings", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Customize your Brand & Logos"
      subtitle="Upload company branding elements to personalize applicant views."
    >
      <div className="space-y-6">
        {errorMsg && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs font-medium text-red-500">
            {errorMsg}
          </div>
        )}

        {/* Logo upload row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Company Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center overflow-hidden shrink-0 relative">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo Preview" className="h-full w-full object-contain p-1" />
                ) : (
                  <Sparkles className="h-6 w-6 text-zinc-500" />
                )}
                {logoUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 cursor-pointer transition-colors">
                <Upload className="h-4 w-4" /> Upload PNG/JPG
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="sr-only"
                  onChange={(e) => handleFileUpload(e, "logo")}
                  disabled={logoUploading || !companyId}
                />
              </label>
            </div>
          </div>

          {/* Banner upload row */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Header Banner Image
            </label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-28 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center overflow-hidden shrink-0 relative">
                {bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bannerUrl} alt="Banner Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] text-zinc-500">No Banner</span>
                )}
                {bannerUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 cursor-pointer transition-colors">
                <Upload className="h-4 w-4" /> Upload
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="sr-only"
                  onChange={(e) => handleFileUpload(e, "banner")}
                  disabled={bannerUploading || !companyId}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Color picker row */}
        <div className="grid grid-cols-2 gap-4 text-left border-t border-zinc-200/20 pt-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-9 w-9 rounded-lg border border-zinc-800 cursor-pointer bg-transparent"
                disabled={!companyId}
              />
              <span className="text-sm font-mono uppercase text-zinc-300">{primaryColor}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider block">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-9 w-9 rounded-lg border border-zinc-800 cursor-pointer bg-transparent"
                disabled={!companyId}
              />
              <span className="text-sm font-mono uppercase text-zinc-300">{accentColor}</span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-zinc-200/20 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/onboarding/company")}
            disabled={loading || logoUploading || bannerUploading}
            className="flex items-center gap-1 border-zinc-800 text-zinc-350 hover:bg-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <Button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={loading || logoUploading || bannerUploading || !companyId}
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
      </div>
    </AuthCard>
  );
}
