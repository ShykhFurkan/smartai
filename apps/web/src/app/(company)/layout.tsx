import * as React from "react";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";

interface CompanyLayoutProps {
  children: React.ReactNode;
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 text-zinc-100">{children}</main>
      </div>
    </div>
  );
}
