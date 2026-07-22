"use client";

import * as React from "react";
import { Button } from "@smarthire/ui";
import { MessageSquare, Pin, Trash2, Loader2, Edit3 } from "lucide-react";

export interface NoteItem {
  id: string;
  content: string;
  is_pinned: boolean;
  author: string;
  created_at: string;
}

interface NotesPanelProps {
  notes: NoteItem[];
  onAddNote: (content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
  onTogglePin?: (noteId: string, currentPin: boolean) => Promise<void>;
}

export function NotesPanel({ notes, onAddNote, onDeleteNote, onTogglePin }: NotesPanelProps) {
  const [content, setContent] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      await onAddNote(content);
      setContent("");
    } finally {
      setSaving(false);
    }
  };

  const sortedNotes = React.useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [notes]);

  return (
    <div className="space-y-6 text-left">
      <h3 className="text-[15px] font-semibold text-[#1D1D1F] flex items-center gap-2">
        <MessageSquare className="h-4.5 w-4.5 text-[#6E6E73]" /> Private Recruiter Notes
      </h3>

      {/* Note input form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          placeholder="Type private feedback about applicant. Use @mentions for team members..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={saving}
          className="w-full rounded-[12px] border border-[#D2D2D7] bg-white px-4 py-3 text-[13px] text-[#1D1D1F] placeholder-[#6E6E73] focus:border-[#0071E3] focus:ring-1 focus:ring-[#0071E3] focus:outline-none transition-all duration-150 resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving || !content.trim()}
            className="bg-[#0071E3] hover:bg-[#006ACC] text-white flex items-center gap-1.5 h-10 px-4 rounded-[12px] text-[13px] font-semibold transition-colors duration-150"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <>Add Private Note <Edit3 className="h-3.5 w-3.5" /></>
            )}
          </Button>
        </div>
      </form>

      {/* Notes list */}
      <div className="space-y-3">
        {sortedNotes.map((note) => {
          const isDeleting = deletingId === note.id;

          return (
            <div
              key={note.id}
              className={`rounded-[16px] border p-4 text-[12px] space-y-3 transition-all relative ${
                note.is_pinned
                  ? "border-[#C5DCFF] bg-[#EAF3FF]"
                  : "border-[#D2D2D7] bg-[#F5F5F7]"
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-center text-[11px] text-[#6E6E73]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1D1D1F]">{note.author}</span>
                  <span>•</span>
                  <span className="tabular-nums">
                    {new Date(note.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {onTogglePin && (
                    <button
                      type="button"
                      onClick={() => onTogglePin(note.id, note.is_pinned)}
                      className={`p-1.5 rounded-[8px] transition-colors ${
                        note.is_pinned
                          ? "text-[#0071E3] hover:bg-[#0071E3]/10"
                          : "text-[#AEAEB2] hover:text-[#6E6E73] hover:bg-black/5"
                      }`}
                      title={note.is_pinned ? "Unpin note" : "Pin note"}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      setDeletingId(note.id);
                      try {
                        await onDeleteNote(note.id);
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                    disabled={isDeleting}
                    className="text-[#AEAEB2] hover:text-[#FF3B30] p-1.5 rounded-[8px] hover:bg-black/5 transition-colors"
                    title="Delete note"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#AEAEB2]" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Note Content */}
              <p className="text-[#1D1D1F] leading-relaxed whitespace-pre-line text-left">
                {note.content}
              </p>
            </div>
          );
        })}

        {sortedNotes.length === 0 && (
          <div className="text-center py-8 text-[#AEAEB2] text-[13px] italic">
            No private recruiter logs or notes yet.
          </div>
        )}
      </div>
    </div>
  );
}
