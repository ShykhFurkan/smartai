import * as React from "react";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface TaskItem {
  id: string;
  type: "review" | "feedback" | "expiry";
  content: string;
  dueText: string;
}

interface TaskListProps {
  tasks: TaskItem[];
}

const taskConfig = {
  review: {
    icon: CheckCircle2,
    iconClass: "text-[#0071E3]",
    dotClass: "bg-[#0071E3]",
  },
  feedback: {
    icon: Clock,
    iconClass: "text-[#FF9F0A]",
    dotClass: "bg-[#FF9F0A]",
  },
  expiry: {
    icon: AlertTriangle,
    iconClass: "text-[#FF3B30]",
    dotClass: "bg-[#FF3B30]",
  },
};

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="rounded-[16px] border border-[#D2D2D7] bg-white p-6 text-left space-y-4 transition-all duration-200 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:border-[#AEAEB2]">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[#1D1D1F]">Action Items</h3>
        <span className="text-[11px] font-medium text-[#AEAEB2]">{tasks.length} pending</span>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => {
          const config = taskConfig[task.type];
          const Icon = config.icon;
          return (
            <div
              key={task.id}
              className="flex items-center gap-3.5 rounded-[12px] border border-[#E8E8ED] bg-[#F5F5F7] px-4 py-3 hover:border-[#D2D2D7] transition-colors cursor-default"
            >
              <Icon className={`h-[15px] w-[15px] shrink-0 ${config.iconClass}`} />
              <p className="flex-1 text-[12px] font-medium text-[#1D1D1F] leading-snug min-w-0 truncate">
                {task.content}
              </p>
              <span className="shrink-0 text-[11px] font-medium text-[#AEAEB2] whitespace-nowrap">
                {task.dueText}
              </span>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center rounded-[12px] bg-[#F5F5F7]">
            <p className="text-[13px] text-[#AEAEB2]">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
