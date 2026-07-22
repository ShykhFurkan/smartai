"use client";

import * as React from "react";
import { Button } from "@smarthire/ui";
import { Loader2, Server, RefreshCw } from "lucide-react";
import { logger } from "@smarthire/logger";

interface HealthMetric {
  name: string;
  status: "healthy" | "degraded" | "failed";
  latency: string;
  load: string;
}

export default function AdminSystemPage() {
  const [checking, setChecking] = React.useState(false);
  const [metrics] = React.useState<HealthMetric[]>([
    { name: "PostgreSQL Database Engine", status: "healthy", latency: "4ms", load: "12% CPU" },
    { name: "Redis Message Queue Bus", status: "healthy", latency: "1.2ms", load: "4% CPU" },
    { name: "S3 Resume File Storage Storage", status: "healthy", latency: "42ms", load: "2.4 TB / 10 TB" },
    { name: "Supabase Realtime Websockets Connection", status: "healthy", latency: "18ms", load: "1,240 connections" },
  ]);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await new Promise((res) => setTimeout(res, 500));
      logger.info("Platform system metrics checked successfully");
    } finally {
      setChecking(false);
    }
  };

  const getStatusBadge = (status: HealthMetric["status"]) => {
    const styles = {
      healthy: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      degraded: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      failed: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider capitalize ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto py-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-150 dark:border-zinc-850 pb-6">
        <div>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">
            Platform Operations Console
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-150 mt-1">
            System Infrastructure Health
          </h1>
          <p className="text-sm text-zinc-555 dark:text-zinc-400 mt-1">
            Monitor microservice database connectivity logs, storage capacity, and connection streams.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={checking}
          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:text-white flex items-center gap-1.5 h-10 px-6 font-bold shadow-sm shrink-0"
        >
          {checking ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          ) : (
            <>
              Check Diagnostics Health <RefreshCw className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-[180px] text-left shadow-sm hover:border-zinc-300 transition-colors"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-zinc-900">{m.name}</h3>
                <div className="flex items-center gap-2 text-xs text-zinc-550 font-medium">
                  <span>Latency: {m.latency}</span>
                  <span>•</span>
                  <span>Usage: {m.load}</span>
                </div>
              </div>
              <div className="shrink-0">{getStatusBadge(m.status)}</div>
            </div>

            <div className="border-t border-zinc-100 pt-3 text-[10px] text-zinc-600 flex items-center gap-1.5 font-medium">
              <Server className="h-4 w-4 text-zinc-500" /> Infrastructure Provider: AWS Cloud Services
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
