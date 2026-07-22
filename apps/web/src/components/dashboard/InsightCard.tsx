import * as React from "react";
import { Sparkles, TrendingUp, AlertCircle, Calendar } from "lucide-react";

interface InsightItem {
  id: string;
  type: "top" | "warning" | "alert" | "deadline";
  content: string;
  subtext: string;
}

interface InsightCardProps {
  insights: InsightItem[];
}

const insightConfig = {
  top: {
    icon: TrendingUp,
    bg: "bg-[#EAFBEE]",
    iconClass: "text-[#34C759]",
    border: "border-[#C5F0D2]",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-[#FFF8EE]",
    iconClass: "text-[#FF9F0A]",
    border: "border-[#FFE8C2]",
  },
  alert: {
    icon: AlertCircle,
    bg: "bg-[#FFF0EE]",
    iconClass: "text-[#FF3B30]",
    border: "border-[#FFCFCC]",
  },
  deadline: {
    icon: Calendar,
    bg: "bg-[#EAF3FF]",
    iconClass: "text-[#0071E3]",
    border: "border-[#C5DCFF]",
  },
};

export function InsightCard({ insights }: InsightCardProps) {
  return (
    <div className="rounded-[16px] border border-[#D2D2D7] bg-white p-6 text-left space-y-4 transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:border-[#AEAEB2]">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#0071E3]" />
        <h3 className="text-[13px] font-semibold text-[#1D1D1F]">AI Insights</h3>
      </div>

      <div className="space-y-2.5">
        {insights.map((ins) => {
          const config = insightConfig[ins.type];
          const Icon = config.icon;
          return (
            <div
              key={ins.id}
              className={`flex items-start gap-3 rounded-[12px] border px-4 py-3 ${config.bg} ${config.border}`}
            >
              <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${config.iconClass}`} />
              <div className="space-y-0.5 min-w-0">
                <p className="text-[12px] font-semibold text-[#1D1D1F] leading-snug">{ins.content}</p>
                <p className="text-[11px] text-[#6E6E73] leading-snug">{ins.subtext}</p>
              </div>
            </div>
          );
        })}

        {insights.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-[12px] bg-[#F5F5F7]">
            <p className="text-[13px] text-[#AEAEB2]">Gathering insights…</p>
          </div>
        )}
      </div>
    </div>
  );
}
