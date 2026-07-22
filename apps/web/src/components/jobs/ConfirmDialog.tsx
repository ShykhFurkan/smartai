"use client";

import * as React from "react";
import { Button } from "@smarthire/ui";
import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  destructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  destructive = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1D1F]/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[20px] border border-[#D2D2D7] bg-white p-6 shadow-xl relative overflow-hidden text-left sh-scale-in">
        <h3 className="text-[17px] font-semibold text-[#1D1D1F]">{title}</h3>
        <p className="mt-2 text-[13px] text-[#6E6E73] leading-relaxed">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3 border-t border-[#E8E8ED] pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-[#D2D2D7] text-[#1D1D1F] hover:bg-[#F2F2F2] rounded-[12px] h-10 px-4 text-[13px] font-medium"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-1.5 h-10 px-4 rounded-[12px] text-[13px] font-semibold text-white transition-colors duration-150 ${
              destructive
                ? "bg-[#FF3B30] hover:bg-[#E03126] disabled:bg-[#FF3B30]/50"
                : "bg-[#0071E3] hover:bg-[#006ACC] disabled:bg-[#0071E3]/50"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin text-white" />}
            <span>{confirmText}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
