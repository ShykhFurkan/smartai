import { Users, ClipboardList, CalendarClock, Award, FileSpreadsheet } from "lucide-react";

interface MetricsBarProps {
  total: number;
  screening: number;
  interview: number;
  offer: number;
  rejected: number;
}

export function MetricsBar({ total, screening, interview, offer, rejected }: MetricsBarProps) {
  const conversionRate = total > 0 ? Math.round(((total - rejected) / total) * 100) : 0;

  const stats = [
    { label: "Active Pipelines", value: total, icon: Users, color: "text-[#0071E3] bg-[#EAF3FF] border-[#C5DCFF]" },
    { label: "Screening Rounds", value: screening, icon: ClipboardList, color: "text-[#5E5CE6] bg-[#EEEEFF] border-[#D4D4FF]" },
    { label: "Interviews Booked", value: interview, icon: CalendarClock, color: "text-[#0071E3] bg-[#EAF3FF] border-[#C5DCFF]" },
    { label: "Offers Sent Out", value: offer, icon: Award, color: "text-[#34C759] bg-[#EAFBEE] border-[#C5F0D2]" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: FileSpreadsheet, color: "text-[#FF9F0A] bg-[#FFF8EE] border-[#FFE8C2]" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;

        return (
          <div
            key={idx}
            className="rounded-[16px] border border-[#D2D2D7] bg-white p-5 flex items-center gap-4 text-left transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:border-[#AEAEB2] cursor-default"
          >
            <div className={`h-10 w-10 rounded-[12px] border flex items-center justify-center shrink-0 ${stat.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block truncate">
                {stat.label}
              </span>
              <span className="text-xl font-bold text-[#1D1D1F] mt-0.5 block tracking-tight truncate tabular-nums">
                {stat.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
