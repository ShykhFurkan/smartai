import Link from "next/link";
import { Plus, Users, Layers, FileSpreadsheet, ArrowRight } from "lucide-react";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  accent: string;
  iconBg: string;
}

const actions: QuickAction[] = [
  {
    label: "Create Job",
    description: "Post a new opening",
    href: "/recruiter/jobs/create",
    icon: Plus,
    accent: "hover:border-[#0071E3]/30",
    iconBg: "bg-[#EAF3FF] text-[#0071E3]",
  },
  {
    label: "View Pipeline",
    description: "Review applications",
    href: "/recruiter/pipeline",
    icon: Layers,
    accent: "hover:border-[#5E5CE6]/30",
    iconBg: "bg-[#EEEEFF] text-[#5E5CE6]",
  },
  {
    label: "Invite Member",
    description: "Grow your team",
    href: "/onboarding/company/team",
    icon: Users,
    accent: "hover:border-[#34C759]/30",
    iconBg: "bg-[#EAFBEE] text-[#1A7F36]",
  },
  {
    label: "Candidates",
    description: "Browse talent pool",
    href: "/recruiter/candidates",
    icon: FileSpreadsheet,
    accent: "hover:border-[#FF9F0A]/30",
    iconBg: "bg-[#FFF8EE] text-[#C07A00]",
  },
];

export function QuickActionGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((act, idx) => {
        const Icon = act.icon;
        return (
          <Link
            key={idx}
            href={act.href}
            className={`group flex items-center gap-4 rounded-[16px] border border-[#D2D2D7] bg-white p-5 transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] active:scale-[0.98] ${act.accent}`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${act.iconBg}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{act.label}</p>
              <p className="text-[11px] text-[#6E6E73] mt-0.5 truncate">{act.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#AEAEB2] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
