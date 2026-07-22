import * as React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface JobAnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number; // percentage change (e.g. +12 or -4)
  icon?: React.ReactNode;
}

export function JobAnalyticsCard({ title, value, description, change, icon }: JobAnalyticsCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="rounded-[16px] border border-[#D2D2D7] bg-white p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:border-[#AEAEB2] cursor-default">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
          {title}
        </span>
        {icon && <div className="text-[#AEAEB2]">{icon}</div>}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-none">
          {value}
        </span>

        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-1.5 py-0.5 ${
              isPositive
                ? "bg-[#EAFBEE] text-[#1A7F36]"
                : "bg-[#FFF0EE] text-[#C0392B]"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            <span>{Math.abs(change)}%</span>
          </span>
        )}
      </div>

      {description && (
        <p className="mt-3 text-[11px] text-[#6E6E73] leading-relaxed border-t border-[#E8E8ED] pt-3">
          {description}
        </p>
      )}
    </div>
  );
}
