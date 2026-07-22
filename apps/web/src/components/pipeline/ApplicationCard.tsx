"use client";

import * as React from "react";
import { ClipboardCheck, Code2, Star, Award } from "lucide-react";

export interface CandidateAppCard {
  id: string; // application id
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  headline?: string;
  job_title: string;
  status: string;
  created_at: string;
  score?: number; // legacy overall score
  interview_status?: string;
  tags?: string[];
  priority?: "high" | "medium" | "low";
  // Stage-specific scores
  screening_score?: number;
  mcq_score?: number;
  mcq_total?: number;
  mcq_passed?: boolean;
  coding_score?: number;
  coding_total?: number;
  coding_passed?: boolean;
  interview_avg_score?: number;
  interview_recommendation?: string;
}

interface ApplicationCardProps {
  card: CandidateAppCard;
  onClick: (card: CandidateAppCard) => void;
}

function ScoreBadge({ card }: { card: CandidateAppCard }) {
  const { status } = card;

  // Screening stage — show AI screening score
  if (status === "screening" && card.screening_score != null) {
    const pct = (card.screening_score / 10) * 100;
    const color =
      pct >= 70
        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
        : pct >= 40
          ? "text-amber-700 bg-amber-50 border-amber-200"
          : "text-red-700 bg-red-50 border-red-200";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${color}`}
      >
        <ClipboardCheck className="h-3 w-3" />
        {card.screening_score}/10 ATS
      </span>
    );
  }

  // MCQ stage — show test result
  if (status === "mcq") {
    if (card.mcq_score != null && card.mcq_total != null) {
      const pct = (card.mcq_score / card.mcq_total) * 100;
      return (
        <div className="flex flex-wrap items-center gap-1">
          <span className="inline-flex items-center gap-1 bg-[#EEEEFF] border border-[#D4D4FF] text-[#5E5CE6] px-2 py-0.5 rounded-full text-[10px] font-bold">
            <ClipboardCheck className="h-3 w-3" />
            {card.mcq_score}/{card.mcq_total} ({Math.round(pct)}%)
          </span>
          {card.mcq_passed != null && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                card.mcq_passed
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-red-700 bg-red-50 border-red-200"
              }`}
            >
              {card.mcq_passed ? "Passed" : "Failed"}
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 text-zinc-400 px-2 py-0.5 rounded-full text-[10px] font-semibold italic">
        <ClipboardCheck className="h-3 w-3" />
        Pending
      </span>
    );
  }

  // Coding stage — show coding result
  if (status === "coding") {
    if (card.coding_score != null && card.coding_total != null) {
      const pct = (card.coding_score / card.coding_total) * 100;
      return (
        <div className="flex flex-wrap items-center gap-1">
          <span className="inline-flex items-center gap-1 bg-[#FFF0EE] border border-[#FFCFCC] text-[#E04430] px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Code2 className="h-3 w-3" />
            {card.coding_score}/{card.coding_total} ({Math.round(pct)}%)
          </span>
          {card.coding_passed != null && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                card.coding_passed
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-red-700 bg-red-50 border-red-200"
              }`}
            >
              {card.coding_passed ? "Passed" : "Failed"}
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 text-zinc-400 px-2 py-0.5 rounded-full text-[10px] font-semibold italic">
        <Code2 className="h-3 w-3" />
        Pending
      </span>
    );
  }

  // Interview stage — show interview average + recommendation
  if (status === "interview") {
    if (card.interview_avg_score != null) {
      const recMap: Record<string, { label: string; color: string }> = {
        strong_hire: { label: "Strong Hire", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
        hire: { label: "Hire", color: "text-green-700 bg-green-50 border-green-200" },
        neutral: { label: "Neutral", color: "text-amber-700 bg-amber-50 border-amber-200" },
        no_hire: { label: "No Hire", color: "text-orange-700 bg-orange-50 border-orange-200" },
        strong_no_hire: { label: "Strong No Hire", color: "text-red-700 bg-red-50 border-red-200" },
      };
      const rec = card.interview_recommendation
        ? recMap[card.interview_recommendation]
        : null;
      return (
        <div className="flex flex-wrap items-center gap-1">
          <span className="inline-flex items-center gap-1 bg-[#EAF3FF] border border-[#C5DCFF] text-[#0071E3] px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Star className="h-3 w-3" />
            {card.interview_avg_score}/5
          </span>
          {rec && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${rec.color}`}
            >
              {rec.label}
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-zinc-50 border border-zinc-200 text-zinc-400 px-2 py-0.5 rounded-full text-[10px] font-semibold italic">
        <Star className="h-3 w-3" />
        Awaiting
      </span>
    );
  }

  // Offered / other stages — show best achievement summary
  if (status === "offered") {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
        <Award className="h-3 w-3" />
        Offered
      </span>
    );
  }

  // Default: no score badges for "applied" stage
  return null;
}

export function ApplicationCard({ card, onClick }: ApplicationCardProps) {
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return `${parts[0]?.charAt(0) || ""}${parts[1]?.charAt(0) || ""}`.toUpperCase();
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const getPriorityStyles = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-[#FFF0EE] text-[#FF3B30] border-[#FFCFCC]";
      case "medium":
        return "bg-[#FFF8EE] text-[#FF9F0A] border-[#FFE8C2]";
      case "low":
      default:
        return "bg-[#F5F5F7] text-[#6E6E73] border-[#D2D2D7]";
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(card)}
      className="group rounded-[16px] border border-[#D2D2D7] bg-white p-4 space-y-3.5 cursor-grab active:cursor-grabbing hover:border-[#AEAEB2] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] transition-all duration-150 select-none text-left active:scale-[0.98] shadow-sm"
    >
      {/* Name, Avatar, and Priority */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-[#EAF3FF] text-[#0071E3] flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0">
            {getInitials(card.candidate_name)}
          </div>
          <div className="min-w-0">
            <h4 className="text-[13px] font-semibold text-[#1D1D1F] leading-tight truncate">
              {card.candidate_name}
            </h4>
            <span className="text-[11px] text-[#6E6E73] truncate block max-w-[120px]">
              {card.headline || "Applicant"}
            </span>
          </div>
        </div>

        {card.priority && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${getPriorityStyles(
              card.priority
            )}`}
          >
            {card.priority}
          </span>
        )}
      </div>

      {/* Applied Opening Details */}
      <div className="text-[11px] text-[#6E6E73] space-y-1.5 border-t border-[#E8E8ED] pt-3">
        <div className="flex justify-between items-center">
          <span className="text-[#AEAEB2]">Job:</span>
          <span className="font-semibold text-[#1D1D1F] truncate max-w-[130px]">{card.job_title}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#AEAEB2]">Applied:</span>
          <span className="tabular-nums">{new Date(card.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stage-Specific Score Badge */}
      <div className="pt-1">
        <ScoreBadge card={card} />
      </div>

      {/* Tags Chips */}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {card.tags.slice(0, 2).map((t, idx) => (
            <span
              key={idx}
              className="text-[9px] font-semibold text-[#0071E3] bg-[#EAF3FF] border border-[#C5DCFF] px-2 py-0.5 rounded-full uppercase tracking-wider"
            >
              {t}
            </span>
          ))}
          {card.tags.length > 2 && (
            <span className="text-[10px] text-[#6E6E73] font-semibold self-center">
              +{card.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
