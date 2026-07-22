"use client";

import * as React from "react";

interface ChartCardProps {
  title: string;
  type: "funnel" | "trend";
  data: { label: string; value: number }[];
}

const FUNNEL_COLORS = [
  "bg-[#0071E3]",
  "bg-[#3390F5]",
  "bg-[#66AFf8]",
  "bg-[#99CEFB]",
  "bg-[#CCEAFD]",
  "bg-[#E5F4FF]",
];

export function ChartCard({ title, type, data }: ChartCardProps) {
  const maxValue = React.useMemo(
    () => (data.length === 0 ? 1 : Math.max(...data.map((d) => d.value))),
    [data]
  );

  return (
    <div className="rounded-[16px] border border-[#D2D2D7] bg-white p-6 text-left space-y-5 transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:border-[#AEAEB2]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[#1D1D1F]">{title}</h3>
        <span className="text-[11px] font-medium text-[#AEAEB2]">
          {data.reduce((a, b) => a + b.value, 0)} total
        </span>
      </div>

      {/* Funnel Chart */}
      {type === "funnel" ? (
        <div className="space-y-4">
          {data.map((item, idx) => {
            const pct = maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0;
            const colorClass = FUNNEL_COLORS[Math.min(idx, FUNNEL_COLORS.length - 1)];

            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-medium text-[#1D1D1F]">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-[#1D1D1F]">{item.value}</span>
                    <span className="text-[11px] text-[#AEAEB2] w-8 text-right">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F5F5F7] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Trend Chart */
        <div className="h-48 flex flex-col justify-between">
          {/* Bars */}
          <div className="flex-grow flex items-end justify-between gap-1.5 pb-3">
            {data.map((item, idx) => {
              const heightPct = maxValue > 0 ? (item.value / maxValue) * 85 : 0;
              return (
                <div
                  key={idx}
                  className="group/bar flex flex-col items-center gap-1 flex-1 h-full justify-end relative"
                >
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-1.5 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-[#1D1D1F] text-white text-[10px] font-medium rounded-[6px] px-2 py-1 whitespace-nowrap">
                      {item.label}: {item.value}
                    </div>
                  </div>
                  {/* Bar */}
                  <div
                    className="w-full rounded-[6px] bg-[#EAF3FF] group-hover/bar:bg-[#0071E3] transition-colors duration-200 cursor-pointer"
                    style={{ height: `${Math.max(heightPct, 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
          {/* X axis */}
          <div className="flex justify-between border-t border-[#E8E8ED] pt-2">
            <span className="text-[10px] text-[#AEAEB2] font-medium">{data[0]?.label || "Start"}</span>
            <span className="text-[10px] text-[#AEAEB2] font-medium">
              {data[Math.floor(data.length / 2)]?.label || ""}
            </span>
            <span className="text-[10px] text-[#AEAEB2] font-medium">
              {data[data.length - 1]?.label || "End"}
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.length === 0 && (
        <div className="flex h-32 items-center justify-center text-[13px] text-[#AEAEB2]">
          No data available
        </div>
      )}
    </div>
  );
}
