"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";

interface TagSelectorProps {
  tags: string[];
  onAddTag: (tag: string) => Promise<void>;
  onRemoveTag: (tag: string) => Promise<void>;
}

export function TagSelector({ tags, onAddTag, onRemoveTag }: TagSelectorProps) {
  const [newTag, setNewTag] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    setSaving(true);
    try {
      await onAddTag(newTag.trim());
      setNewTag("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 text-left">
      <label className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider block">
        Candidate Tags
      </label>

      {/* Tags Chips Group */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 rounded-full bg-[#EAF3FF] border border-[#C5DCFF] px-2.5 py-0.5 text-[11px] font-semibold text-[#0071E3]"
          >
            <span>{t}</span>
            <button
              type="button"
              onClick={() => onRemoveTag(t)}
              className="text-[#0071E3] hover:text-[#FF3B30] rounded-full transition-colors ml-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {tags.length === 0 && (
          <span className="text-[12px] text-[#AEAEB2] italic">No tags attached.</span>
        )}
      </div>

      {/* Add tag form */}
      <form onSubmit={handleAdd} className="flex gap-2 items-center max-w-[240px] pt-1">
        <input
          type="text"
          placeholder="New tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          disabled={saving}
          className="w-full rounded-[12px] border border-[#D2D2D7] bg-white px-3.5 py-2 text-[13px] text-[#1D1D1F] placeholder-[#AEAEB2] focus:border-[#0071E3] focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={saving || !newTag.trim()}
          className="h-9 w-9 flex items-center justify-center rounded-[12px] bg-[#F5F5F7] hover:bg-[#F2F2F2] border border-[#D2D2D7] text-[#6E6E73] hover:text-[#1D1D1F] shrink-0 disabled:opacity-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
