import * as React from "react";

export default function PublicJobsPage() {
  return (
    <main className="container mx-auto px-6 py-12 text-zinc-100">
      <h1 className="text-3xl font-extrabold tracking-tight">Open Positions</h1>
      <p className="mt-2 text-zinc-400">Discover your next opportunity at Smart Hire.</p>
      <div className="mt-8 grid gap-6">{/* Placeholder cards representing job listings */}</div>
    </main>
  );
}
