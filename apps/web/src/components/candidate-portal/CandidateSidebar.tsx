"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  FileSpreadsheet,
  ClipboardCheck,
  Calendar,
  Settings,
} from "lucide-react";

export function CandidateSidebar() {
  const pathname = usePathname();
  const [hasSoonExam, setHasSoonExam] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const checkSoonExam = async () => {
      try {
        const supabase = createClient();
        const authRes = await supabase.auth.getUser().catch(() => null);
        const user = authRes?.data?.user;
        if (!user) return;

        const { data: candidate } = await supabase
          .schema("candidate")
          .from("candidates")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!candidate) return;

        const { data: assignments } = await supabase
          .schema("assessment")
          .from("assignments")
          .select("status, scheduled_start_at, expires_at")
          .eq("candidate_id", candidate.id);

        if (!active) return;

        const soon = (assignments || []).some((item) => {
          if (item.status === "completed") return false;
          if (!item.scheduled_start_at) return false;

          const startTime = new Date(item.scheduled_start_at);
          const now = new Date();
          const oneDay = 24 * 60 * 60 * 1000;
          const timeDiff = startTime.getTime() - now.getTime();

          // Starts in the next 24 hours
          const startsSoon = timeDiff > 0 && timeDiff <= oneDay;
          // Already started but not expired
          const isCurrent = timeDiff <= 0 && (!item.expires_at || new Date(item.expires_at) > now);

          return startsSoon || isCurrent;
        });

        setHasSoonExam(soon);
      } catch {
        // Silent catch for potential connection errors
      }
    };

    checkSoonExam();
    
    // Check every 30 seconds for dynamic updates
    const interval = setInterval(checkSoonExam, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const links = [
    { label: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard },
    { label: "Profile Specs", href: "/candidate/profile", icon: User },
    { label: "Resume Hub", href: "/candidate/resume", icon: FileText },
    { label: "Search Jobs", href: "/candidate/jobs", icon: Briefcase },
    { label: "My Applications", href: "/candidate/applications", icon: FileSpreadsheet },
    { label: "Assessments", href: "/candidate/assessments", icon: ClipboardCheck },
    { label: "Interviews", href: "/candidate/interviews", icon: Calendar },
    { label: "Settings", href: "/candidate/settings", icon: Settings },
  ];

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-zinc-200 bg-white px-4 py-6 text-zinc-800 md:flex shrink-0 text-left">
      <div className="mb-8 px-3.5 flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
          S
        </div>
        <span className="text-base font-extrabold tracking-tight text-zinc-800">
          Smart Hire Portal
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/10"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{link.label}</span>
              </div>
              {link.label === "Assessments" && hasSoonExam && (
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
