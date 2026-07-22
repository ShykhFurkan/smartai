"use client";

import * as React from "react";
import { Button } from "@smarthire/ui";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function SubmitButton({ loading, children, className, ...props }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={loading || props.disabled}
      className={`w-full justify-center bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 h-10 ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
      <span>{children}</span>
    </Button>
  );
}
