import * as React from "react";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 text-zinc-800">{children}</main>
      </div>
    </div>
  );
}
