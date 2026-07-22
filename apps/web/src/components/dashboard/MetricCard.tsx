import * as React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  color?: string;
  trend?: number; // optional % change
}

export function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  color = "bg-[#EAF3FF] text-[#0071E3]",
  trend,
}: MetricCardProps) {
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div className="group rounded-[16px] border border-[#D2D2D7] bg-white p-5 flex flex-col gap-4 text-left transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:border-[#AEAEB2] cursor-default">
      {/* Icon */}
      <div className={`flex h-11 w-11 items-center justify-center rounded-[12px] ${color}`}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Value */}
      <div className="space-y-0.5">
        <p className="text-[28px] font-bold text-[#1D1D1F] leading-none tracking-tight">
          {value}
        </p>
        <p className="text-[12px] font-medium text-[#6E6E73]">{label}</p>
      </div>

      {/* Subtext / Trend */}
      {(subtext || trend !== undefined) && (
        <div className="flex items-center gap-2 border-t border-[#E8E8ED] pt-3">
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-1.5 py-0.5 ${
                isPositive
                  ? "bg-[#EAFBEE] text-[#1A7F36]"
                  : "bg-[#FFF0EE] text-[#C0392B]"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
          {subtext && (
            <span className="text-[11px] text-[#AEAEB2] font-medium">{subtext}</span>
          )}
        </div>
      )}
    </div>
  );
}
