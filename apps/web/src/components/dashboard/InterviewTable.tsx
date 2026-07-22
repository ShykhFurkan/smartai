import * as React from "react";
import { Video, ExternalLink } from "lucide-react";

export interface DashboardInterview {
  id: string;
  candidate_name: string;
  job_title: string;
  scheduled_at: string;
  interview_type: string;
  meeting_link?: string;
}

interface InterviewTableProps {
  interviews: DashboardInterview[];
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-8 w-8 shrink-0 rounded-full bg-[#EAF3FF] text-[#0071E3] text-[11px] font-bold flex items-center justify-center">
      {initials}
    </div>
  );
}

export function InterviewTable({ interviews }: InterviewTableProps) {
  return (
    <div className="rounded-[16px] border border-[#D2D2D7] bg-white text-left overflow-hidden transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:border-[#AEAEB2]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8ED]">
        <h3 className="text-[13px] font-semibold text-[#1D1D1F]">Upcoming Interviews</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF3FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#0071E3]">
          <Video className="h-3 w-3" />
          {interviews.length} Scheduled
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E8ED] bg-[#F5F5F7]">
              {["Candidate", "Role", "Type", "Time", ""].map((h, i) => (
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
            {interviews.map((int) => (
              <tr
                key={int.id}
                className="hover:bg-[#F5F5F7] transition-colors duration-100"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={int.candidate_name} />
                    <span className="text-[13px] font-semibold text-[#1D1D1F]">
                      {int.candidate_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[12px] text-[#6E6E73] truncate max-w-[160px] block">
                    {int.job_title}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-[#F5F5F7] border border-[#D2D2D7] px-2.5 py-0.5 text-[11px] font-medium text-[#1D1D1F] capitalize">
                    {int.interview_type.replace("-", " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[12px] font-medium text-[#1D1D1F] tabular-nums">
                    {new Date(int.scheduled_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {int.meeting_link ? (
                    <a
                      href={int.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#0071E3] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#0077ED] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Join
                    </a>
                  ) : (
                    <span className="text-[11px] text-[#AEAEB2]">No link</span>
                  )}
                </td>
              </tr>
            ))}

            {interviews.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[13px] text-[#AEAEB2]">
                  No interviews scheduled
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
