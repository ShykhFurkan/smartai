"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, MapPin, Briefcase, Calendar } from "lucide-react";

export interface CandidateItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  headline?: string;
  location?: string;
  tags?: string[];
  created_at: string;
}

interface CandidateCardProps {
  candidate: CandidateItem;
  jobApplied?: string;
  stage?: string;
}

export function CandidateCard({ candidate, jobApplied, stage }: CandidateCardProps) {
  const getInitials = (first: string, last: string) => {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="group rounded-[16px] border border-[#D2D2D7] bg-white p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:border-[#AEAEB2] relative text-left">
      <div>
        {/* Header with Avatar & Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#EAF3FF] text-[#0071E3] flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
            {getInitials(candidate.first_name, candidate.last_name)}
          </div>
          <div className="min-w-0">
            <Link href={`/recruiter/candidates/${candidate.id}`} className="hover:underline">
              <h3 className="text-[14px] font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors truncate">
                {candidate.first_name} {candidate.last_name}
              </h3>
            </Link>
            <p className="text-[11px] text-[#6E6E73] truncate max-w-[180px]">
              {candidate.headline || "Applicant"}
            </p>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="grid grid-cols-1 gap-2.5 my-4 text-[12px] text-[#6E6E73]">
          {candidate.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#AEAEB2] shrink-0" />
              <span className="truncate">{candidate.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#AEAEB2] shrink-0" />
            <span className="truncate">{candidate.email}</span>
          </div>
          {jobApplied && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#AEAEB2] shrink-0" />
              <span className="font-semibold text-[#1D1D1F] truncate">{jobApplied}</span>
            </div>
          )}
        </div>

        {/* Tags Row */}
        {candidate.tags && candidate.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {candidate.tags.slice(0, 3).map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-[#EAF3FF] border border-[#C5DCFF] px-2.5 py-0.5 text-[10px] font-semibold text-[#0071E3] uppercase tracking-wider"
              >
                {t}
              </span>
            ))}
            {candidate.tags.length > 3 && (
              <span className="text-[11px] text-[#6E6E73] font-semibold self-center">
                +{candidate.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Bottom Row */}
      <div className="flex justify-between items-center border-t border-[#E8E8ED] pt-4 mt-4 text-[11px] text-[#AEAEB2]">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Joined {new Date(candidate.created_at).toLocaleDateString()}</span>
        </div>
        {stage && (
          <span className="inline-flex items-center rounded-full bg-[#F5F5F7] px-2.5 py-0.5 text-[11px] font-semibold text-[#1D1D1F] capitalize border border-[#D2D2D7]">
            {stage}
          </span>
        )}
      </div>
    </div>
  );
}
