import * as React from "react";

export function Header() {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 text-zinc-100">
      <div className="flex items-center gap-4">
        <span className="font-bold tracking-wide">Smart Hire</span>
      </div>
      <nav className="flex items-center gap-6">{/* Navigation placeholder links */}</nav>
    </header>
  );
}
