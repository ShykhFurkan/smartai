import * as React from "react";
import { cn } from "@smarthire/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[12px] font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
          {
            "bg-[#0071E3] text-white hover:bg-[#0077ED] active:bg-[#006ACC]": variant === "primary",
            "bg-[#F5F5F7] text-[#1D1D1F] border border-[#D2D2D7] hover:bg-[#F2F2F2] active:bg-[#E8E8ED]": variant === "secondary",
            "border border-[#D2D2D7] bg-white text-[#1D1D1F] hover:bg-[#F2F2F2] active:bg-[#E8E8ED]": variant === "outline",
            "h-9 px-3.5 text-[12px]": size === "sm",
            "h-10 px-4.5 text-[13px]": size === "md",
            "h-12 px-7 text-[15px]": size === "lg",
          },
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
