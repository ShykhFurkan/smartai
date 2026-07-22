import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface DashboardApp {
  id: string;
  candidate_name: string;
  candidate_id: string;
  job_title: string;
  created_at: string;
  status: string;
}

interface ApplicationTableProps {
  applications: DashboardApp[];
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const styles: Record<string, string> = {
    applied: "bg-[#EAF3FF] text-[#0071E3] border-[#C5DCFF]",
    screening: "bg-[#FFF8EE] text-[#C07A00] border-[#FFE8C2]",
    interview: "bg-[#EEEEFF] text-[#5E5CE6] border-[#D4D4FF]",
    offer: "bg-[#EAFBEE] text-[#1A7F36] border-[#C5F0D2]",
    hired: "bg-[#EAFBEE] text-[#1A7F36] border-[#C5F0D2]",
    rejected: "bg-[#FFF0EE] text-[#C0392B] border-[#FFCFCC]",
  };
  const cls = styles[s] ?? "bg-[#F5F5F7] text-[#6E6E73] border-[#E8E8ED]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${cls}`}
    >
      {status}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-8 w-8 shrink-0 rounded-full bg-[#F5F5F7] border border-[#E8E8ED] text-[#6E6E73] text-[11px] font-bold flex items-center justify-center">
      {initials}
    </div>
  );
}

export function ApplicationTable({ applications }: ApplicationTableProps) {
  return (
    <div className="rounded-[16px] border border-[#D2D2D7] bg-white text-left overflow-hidden transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:border-[#AEAEB2]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8ED]">
        <h3 className="text-[13px] font-semibold text-[#1D1D1F]">Recent Applications</h3>
        <span className="text-[11px] font-medium text-[#AEAEB2]">
          Latest {applications.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E8ED] bg-[#F5F5F7]">
              {["Candidate", "Position", "Applied", "Status"].map((h, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-left text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8ED]">
            {applications.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-[#F5F5F7] transition-colors duration-100"
              >
                <td className="px-6 py-4">
                  <Link
                    href={`/recruiter/candidates/${app.candidate_id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar name={app.candidate_name} />
                    <span className="text-[13px] font-semibold text-[#1D1D1F] group-hover:text-[#0071E3] transition-colors">
                      {app.candidate_name}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#AEAEB2] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[12px] text-[#6E6E73] truncate max-w-[180px] block">
                    {app.job_title}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[12px] text-[#6E6E73] tabular-nums">
                    {new Date(app.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={app.status} />
                </td>
              </tr>
            ))}

            {applications.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[13px] text-[#AEAEB2]">
                  No recent applications
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
