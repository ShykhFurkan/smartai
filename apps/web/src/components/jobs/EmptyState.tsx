import * as React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#D2D2D7] rounded-[16px] bg-white min-h-[320px] sh-animate-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F7] border border-[#E8E8ED] text-[#6E6E73] mb-5">
        <FolderOpen className="h-6 w-6" />
      </div>
      <h3 className="text-[16px] font-semibold text-[#1D1D1F]">{title}</h3>
      <p className="mt-2 text-[13px] text-[#6E6E73] max-w-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
