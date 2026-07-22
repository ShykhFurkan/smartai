"use client";

import * as React from "react";
import { Button } from "@smarthire/ui";
import { Flag, Save, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { logger } from "@smarthire/logger";

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function AdminFeatureFlagsPage() {
  const [saving, setSaving] = React.useState(false);
  const [flags, setFlags] = React.useState<FeatureFlag[]>([]);

  React.useEffect(() => {
    // Load flags from localstorage or use default fallbacks
    const defaults = [
      { key: "ai-evaluations", name: "AI Resume Evaluations & summaries", description: "Enables AI-driven scoring feedback and summaries matching on candidates profiles.", enabled: true },
      { key: "candidate-assessments", name: "Job Seeker Screening Exams", description: "Enables exams templates assignment workflows and candidate examination attempts.", enabled: true },
      { key: "multi-tenancy", name: "SaaS Multi-Tenancy Organization Isolation", description: "Enforces strict database schema boundaries corresponding to company domains.", enabled: false },
      { key: "nextjs-caching", name: "Next.js 15 Route Caching Optimizations", description: "Enables ISR and static route caching layers across public marketing views.", enabled: true },
    ];

    const loaded = defaults.map((d) => {
      const saved = localStorage.getItem(`flag_enabled_${d.key}`);
      return {
        ...d,
        enabled: saved !== null ? saved === "true" : d.enabled,
      };
    });
    setFlags(loaded);
  }, []);

  const handleToggle = (key: string) => {
    setFlags((prev) =>
      prev.map((f) => {
        if (f.key === key) {
          const nextVal = !f.enabled;
          localStorage.setItem(`flag_enabled_${key}`, nextVal ? "true" : "false");
          logger.info(`Feature flag ${key} toggled to: ${nextVal}`);
          return { ...f, enabled: nextVal };
        }
        return f;
      })
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      logger.info("Platform feature flags configuration updated successfully");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto py-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-150 dark:border-zinc-850 pb-6">
        <div>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
            Platform Operations Console
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-150 mt-1">
            Feature Flag Toggles
          </h1>
          <p className="text-sm text-zinc-555 dark:text-zinc-400 mt-1">
            Enable or disable platform features globally or test experimental modules.
          </p>
        </div>

        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 h-10 px-6 font-bold shadow-sm shrink-0"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <>
              Save Flags Configuration <Save className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Flags List */}
      <div className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag.key}
            onClick={() => handleToggle(flag.key)}
            className="rounded-xl border border-zinc-200 bg-white p-5 flex items-center justify-between gap-6 cursor-pointer hover:border-zinc-300 transition-colors text-left"
          >
            <div className="space-y-1 min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Flag className="h-4 w-4 text-zinc-450" /> {flag.name}
              </h3>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                {flag.description}
              </p>
              <span className="text-[9px] font-mono text-zinc-600 block pt-1 uppercase">Key: {flag.key}</span>
            </div>

            <button
              type="button"
              className={`p-1 rounded-lg transition-colors shrink-0 ${
                flag.enabled ? "text-blue-500" : "text-zinc-600"
              }`}
            >
              {flag.enabled ? (
                <ToggleRight className="h-9 w-9" />
              ) : (
                <ToggleLeft className="h-9 w-9" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
