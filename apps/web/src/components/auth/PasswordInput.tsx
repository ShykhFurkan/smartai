"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="space-y-1.5 w-full text-left relative">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={showPassword ? "text" : "password"}
            className={`w-full rounded-lg border pl-3.5 pr-10 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none transition-colors ${
              error
                ? "border-red-500 bg-red-500/5 focus:border-red-555"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 focus:border-blue-500 dark:focus:border-blue-500"
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300"
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
        {error && (
          <p className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
