"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Users,
  Building2,
  CreditCard,
  Flag,
  Settings2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
interface NavLink {
  label: string;
  href: string;
  icon: React.ElementType;
}

/* ─── Data ───────────────────────────────────────────────────── */
const adminLinks: NavLink[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Users & Roles", href: "/admin/users", icon: Users },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Feature Flags", href: "/admin/feature-flags", icon: Flag },
  { label: "System Health", href: "/admin/system", icon: Settings2 },
];

const recruiterLinks: NavLink[] = [
  { label: "Dashboard", href: "/recruiter/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
  { label: "Pipeline", href: "/recruiter/pipeline", icon: Layers },
  { label: "Candidates", href: "/recruiter/candidates", icon: FileSpreadsheet },
];

/* ─── Component ──────────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname() || "";
  const isAdmin = pathname.startsWith("/admin");
  const links = isAdmin ? adminLinks : recruiterLinks;
  const workspaceName = isAdmin ? "Admin Console" : "Recruiter";

  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={`
        relative flex h-screen flex-col border-r border-[#D2D2D7] bg-white
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? "w-[72px]" : "w-[240px]"}
      `}
      style={{ userSelect: "none" }}
    >
      {/* ── Logo lockup ── */}
      <div className="flex h-16 items-center gap-3 border-b border-[#E8E8ED] px-4 shrink-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#0071E3] text-white text-sm font-bold shadow-sm">
          S
        </div>
        {!collapsed && (
          <div className="min-w-0 overflow-hidden">
            <span className="block text-[15px] font-semibold text-[#1D1D1F] tracking-tight leading-tight truncate">
              Smart Hire
            </span>
            <span className="block text-[11px] text-[#6E6E73] font-medium truncate">
              {workspaceName}
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4 no-scrollbar">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/recruiter/dashboard" &&
              link.href !== "/admin/dashboard" &&
              pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.label}
              href={link.href}
              title={collapsed ? link.label : undefined}
              className={`
                group flex items-center gap-3 rounded-[12px] px-3 py-[10px] text-[13px] font-medium
                transition-all duration-150
                ${collapsed ? "justify-center" : ""}
                ${
                  isActive
                    ? "bg-[#0071E3] text-white shadow-sm"
                    : "text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
                }
              `}
            >
              <Icon
                className={`shrink-0 transition-colors ${
                  collapsed ? "h-[18px] w-[18px]" : "h-[16px] w-[16px]"
                } ${isActive ? "text-white" : "text-[#AEAEB2] group-hover:text-[#1D1D1F]"}`}
              />
              {!collapsed && <span className="truncate">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Collapse toggle ── */}
      <div className="flex shrink-0 items-center justify-center border-t border-[#E8E8ED] px-3 py-3">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#AEAEB2] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
