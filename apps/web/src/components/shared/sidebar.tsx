import * as React from "react";

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 px-4 py-6 text-zinc-100 md:flex">
      <div className="mb-8 px-2">
        <span className="text-xl font-bold tracking-wider">Smart Hire Console</span>
      </div>
      <nav className="flex flex-1 flex-col gap-2">{/* Navigation placeholder actions */}</nav>
    </aside>
  );
}
