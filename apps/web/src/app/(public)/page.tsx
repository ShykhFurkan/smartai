import { Button } from "@smarthire/ui";
import { cn, formatDate } from "@smarthire/utils";
import { logger } from "@smarthire/logger";
import { User } from "@smarthire/types";

export default function Home() {
  logger.info("Smart Hire portal loaded - public index page");

  const mockUser: User = {
    id: "usr_01",
    email: "architect@smarthire.ai",
    firstName: "Smart",
    lastName: "Hire",
    role: "platform-admin",
    createdAt: new Date().toISOString(),
  };

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-[#fafafa] font-sans antialiased selection:bg-blue-500/30 selection:text-white relative overflow-hidden",
      )}
    >
      <div className="absolute inset-0 -z-10 h-full w-full bg-[#09090b] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />

      <main className="z-10 flex max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border border-blue-500/20 bg-blue-950/20 px-4 py-1.5 text-sm font-semibold tracking-wide text-blue-400 backdrop-blur-sm">
          Production-Grade Foundation
        </div>

        <h1 className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          Smart Hire
        </h1>
        <p className="mt-6 text-lg text-zinc-400 sm:text-xl max-w-2xl leading-relaxed">
          AI-powered recruitment platform built with a highly scalable Turborepo and pnpm workspaces
          monorepo architecture.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900/50 hover:text-white"
          >
            Architecture Docs
          </Button>
        </div>

        <div className="mt-16 w-full max-w-lg rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 text-left backdrop-blur-md shadow-2xl">
          <h2 className="text-xl font-bold text-zinc-200">Workspace Integration Status</h2>
          <p className="mt-1 text-sm text-zinc-500">Verifying shared libraries connectivity</p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
              <span className="text-sm font-medium text-zinc-400">@smarthire/ui</span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
              <span className="text-sm font-medium text-zinc-400">@smarthire/utils</span>
              <span className="text-sm text-zinc-300 font-mono text-right">
                {formatDate(mockUser.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
              <span className="text-sm font-medium text-zinc-400">@smarthire/types</span>
              <span className="text-sm text-zinc-300 font-mono">
                {mockUser.role} : {mockUser.email}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">@smarthire/logger</span>
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400">
                Initialized
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
