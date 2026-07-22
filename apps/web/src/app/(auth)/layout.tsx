import * as React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030303] text-zinc-100 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-white">
      {/* Glow effects */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_60%_60%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
      <div className="absolute top-[80%] left-[10%] -z-10 h-64 w-64 bg-indigo-900/10 blur-[80px] rounded-full animate-pulse-glow" />

      <div className="w-full max-w-md z-10">
        {children}
      </div>
    </div>
  );
}
