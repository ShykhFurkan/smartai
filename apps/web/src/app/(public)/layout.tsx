import * as React from "react";
import { Header } from "@/components/shared/header";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header />
      <div className="flex-grow">{children}</div>
    </div>
  );
}
