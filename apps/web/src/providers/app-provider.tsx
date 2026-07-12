"use client";

import * as React from "react";

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <>
      {/* Centralized context providers go here (e.g. ThemeProvider, AuthProvider, QueryClientProvider) */}
      {children}
    </>
  );
}
