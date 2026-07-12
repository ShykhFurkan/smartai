import * as React from "react";
import { Header } from "@/components/shared/header";

interface CandidateLayoutProps {
  children: React.ReactNode;
}

export default function CandidateLayout({ children }: CandidateLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header />
      <div className="flex flex-1">
        <main className="flex-1 p-8 text-zinc-100">{children}</main>
      </div>
    </div>
  );
}
