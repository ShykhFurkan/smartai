import * as React from "react";
import { CheckCircle2, FileText, Sparkles, Calendar, MessageSquare, ClipboardCheck } from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "applied" | "screening" | "assessment" | "interview" | "note" | "offer";
  content: string;
  timestamp: string;
  author?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "applied":
        return <FileText className="h-4 w-4 text-[#0071E3]" />;
      case "screening":
        return <Sparkles className="h-4 w-4 text-[#5E5CE6]" />;
      case "assessment":
        return <ClipboardCheck className="h-4 w-4 text-[#FF9F0A]" />;
      case "interview":
        return <Calendar className="h-4 w-4 text-[#0071E3]" />;
      case "note":
        return <MessageSquare className="h-4 w-4 text-[#6E6E73]" />;
      case "offer":
        return <CheckCircle2 className="h-4 w-4 text-[#34C759]" />;
      default:
        return <FileText className="h-4 w-4 text-[#6E6E73]" />;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="relative border-l border-[#E8E8ED] pl-6 space-y-6">
        {activities.map((act) => (
          <div key={act.id} className="relative">
            <span className="absolute -left-[34px] top-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#D2D2D7] bg-white text-[#6E6E73] shadow-sm ring-8 ring-white">
              {getIcon(act.type)}
            </span>
            <div className="space-y-0.5">
              <p className="text-[13px] font-semibold text-[#1D1D1F]">
                {act.content}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#6E6E73] font-medium">
                {act.author && <span>By {act.author}</span>}
                {act.author && <span>•</span>}
                <span className="tabular-nums">{new Date(act.timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-8 text-[#AEAEB2] text-[13px] italic">
            No chronological activities found.
          </div>
        )}
      </div>
    </div>
  );
}
