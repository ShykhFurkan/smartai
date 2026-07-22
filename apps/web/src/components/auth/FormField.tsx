import * as React from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full text-left">
        <label
          htmlFor={id}
          className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-[12px] border px-3.5 py-2.5 text-[13px] text-[#1D1D1F] placeholder-[#AEAEB2] focus:ring-1 focus:ring-[#0071E3] focus:outline-none transition-all duration-150 ${
            error
              ? "border-[#FF3B30] bg-[#FFF0EE] focus:border-[#FF3B30]"
              : "border-[#D2D2D7] bg-white focus:border-[#0071E3]"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-[11px] font-semibold text-[#FF3B30] animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
