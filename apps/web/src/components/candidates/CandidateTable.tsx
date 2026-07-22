"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, MapPin, Calendar, ChevronRight } from "lucide-react";
import { CandidateItem } from "./CandidateCard";

interface CandidateTableProps {
  candidates: CandidateItem[];
  selectedIds: string[];
  onSelectChange: (ids: string[]) => void;
  stagesMap?: Record<string, string>;
  jobsMap?: Record<string, string>;
}

export function CandidateTable({
  candidates,
  selectedIds,
  onSelectChange,
  stagesMap = {},
  jobsMap = {},
}: CandidateTableProps) {
  const toggleSelectAll = () => {
    if (selectedIds.length === candidates.length) {
      onSelectChange([]);
    } else {
      onSelectChange(candidates.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter((x) => x !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="w-full overflow-x-auto rounded-[16px] border border-[#D2D2D7] bg-white overflow-hidden transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:border-[#AEAEB2]">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="border-b border-[#E8E8ED] bg-[#F5F5F7] text-[#6E6E73] font-semibold uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3.5 w-12">
              <input
                type="checkbox"
                checked={candidates.length > 0 && selectedIds.length === candidates.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded-[4px] border-[#D2D2D7] text-[#0071E3] accent-[#0071E3]"
              />
            </th>
            <th className="px-4 py-3.5 whitespace-nowrap">Candidate Name</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Location</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Job Applied</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Current Stage</th>
            <th className="px-4 py-3.5 whitespace-nowrap">Applied Date</th>
            <th className="px-4 py-3.5 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E8E8ED] text-[#1D1D1F]">
          {candidates.map((candidate) => {
            const isSelected = selectedIds.includes(candidate.id);
            const appliedJob = jobsMap[candidate.id] || "No Active Application";
            const currentStage = stagesMap[candidate.id] || "applied";

            return (
              <tr
                key={candidate.id}
                className={`transition-colors duration-100 ${
                  isSelected ? "bg-[#EAF3FF]" : "hover:bg-[#F5F5F7]"
                }`}
              >
                <td className="px-5 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectOne(candidate.id)}
                    className="h-4 w-4 rounded-[4px] border-[#D2D2D7] text-[#0071E3] accent-[#0071E3]"
                  />
                </td>
                <td className="px-4 py-4 min-w-[220px]">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#EAF3FF] text-[#0071E3] flex items-center justify-center text-[11px] font-bold shadow-sm shrink-0">
                      {getInitials(candidate.first_name, candidate.last_name)}
                    </div>
                    <div className="space-y-0.5 text-left">
                      <Link
                        href={`/recruiter/candidates/${candidate.id}`}
                        className="text-[13px] font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors"
                      >
                        {candidate.first_name} {candidate.last_name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[#6E6E73] text-[11px]">
                        <Mail className="h-3.5 w-3.5 text-[#AEAEB2] shrink-0" />
                        <span className="truncate max-w-[150px]">{candidate.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-[#6E6E73]">
                  {candidate.location ? (
                    <div className="flex items-center gap-1.5 text-left">
                      <MapPin className="h-4 w-4 text-[#AEAEB2] shrink-0" />
                      <span className="text-[12px]">{candidate.location}</span>
                    </div>
                  ) : (
                    <span className="text-[#AEAEB2] italic">Not set</span>
                  )}
                </td>
                <td className="px-4 py-4 font-semibold text-[#1D1D1F] text-[12px] text-left truncate max-w-[160px]">
                  {appliedJob}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-full bg-[#F5F5F7] px-2.5 py-0.5 text-[11px] font-semibold text-[#1D1D1F] capitalize border border-[#D2D2D7]">
                    {currentStage}
                  </span>
                </td>
                <td className="px-4 py-4 text-[#6E6E73]">
                  <div className="flex items-center gap-1.5 text-[12px]">
                    <Calendar className="h-3.5 w-3.5 text-[#AEAEB2]" />
                    <span className="tabular-nums">
                      {new Date(candidate.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 w-16 text-right">
                  <Link
                    href={`/recruiter/candidates/${candidate.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-[10px] text-[#AEAEB2] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] border border-transparent hover:border-[#D2D2D7] transition-all"
                    title="View Profile Details"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}

          {candidates.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-[13px] text-[#AEAEB2]">
                No candidates found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
