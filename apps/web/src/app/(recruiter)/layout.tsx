import * as React from "react";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";

interface RecruiterLayoutProps {
  children: React.ReactNode;
}

export default function RecruiterLayout({ children }: RecruiterLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto px-8 py-8 text-[#1D1D1F]">
          {children}
        </main>
      </div>
    </div>
  );
}
