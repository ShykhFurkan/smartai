import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full rounded-[20px] border border-[#D2D2D7] bg-white p-6 sm:p-8 shadow-md relative overflow-hidden sh-animate-in">
      {/* Decorative Glow inside Card */}
      <div className="absolute top-0 right-0 -z-10 h-32 w-32 bg-[#0071E3]/5 blur-[40px] rounded-full" />

      {/* Header logo / Title */}
      <div className="flex flex-col items-center justify-center text-center space-y-3.5 mb-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0071E3] shadow-sm">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1D1D1F]">
            Smart<span className="text-[#0071E3]">Hire</span>
          </span>
        </Link>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
            {title}
          </h2>
          {subtitle && (
            <div className="text-[13px] text-[#6E6E73] font-medium leading-relaxed">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
