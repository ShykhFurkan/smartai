import * as React from "react";

export type JobStatus = "draft" | "published" | "closed";

interface JobStatusBadgeProps {
  status: JobStatus;
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-[#FFF8EE] text-[#C07A00] border-[#FFE8C2]",
  },
  published: {
    label: "Published",
    className: "bg-[#EAFBEE] text-[#1A7F36] border-[#C5F0D2]",
  },
  closed: {
    label: "Closed",
    className: "bg-[#F5F5F7] text-[#6E6E73] border-[#D2D2D7]",
  },
};

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.closed;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
