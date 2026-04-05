"use client";

import React, { useMemo } from "react";
import { useNotes } from "@/lib/api";
import { Link2, ExternalLink, Hash } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BacklinksProps {
  currentNoteId: string;
  onSelectNote: (id: string) => void;
}

export function Backlinks({ currentNoteId, onSelectNote }: BacklinksProps) {
  const { data: notesData, isLoading } = useNotes();

  const backlinks = useMemo(() => {
    if (!notesData) return [];

    return notesData.filter(note => {
      if (note.id === currentNoteId) return false;
      if (!note.content || typeof note.content !== "object") return false;

      let found = false;
      const scan = (node: any) => {
        if (found) return;
        if (node.type === "fileLink" && node.attrs?.id === currentNoteId) {
          found = true;
          return;
        }
        if (node.content && Array.isArray(node.content)) {
          node.content.forEach(scan);
        }
      };
      scan(note.content);
      return found;
    });
  }, [notesData, currentNoteId]);

  if (isLoading)
    return (
      <div className="text-muted-foreground p-4 text-xs">
        Scanning for links...
      </div>
    );
  if (backlinks.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-t py-4">
      <div className="flex items-center gap-2 px-1">
        <Link2 className="text-primary size-3 animate-pulse" />
        <h3 className="text-muted-foreground/70 text-[10px] font-bold tracking-widest uppercase">
          Backlinks ({backlinks.length})
        </h3>
      </div>

      <div className="grid gap-2">
        {backlinks.map(note => (
          <button
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            className="group border-border/40 bg-card/40 hover:bg-accent/50 hover:border-primary/30 relative flex flex-col gap-1 rounded-xl border p-3 text-left transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-2 overflow-hidden">
              <span className="group-hover:text-primary truncate text-xs font-semibold transition-colors">
                {note.title || "Untitled Note"}
              </span>
              <ExternalLink className="text-primary size-2.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {note.tags.map(tag => (
                  <div
                    key={tag}
                    className="bg-primary/5 border-primary/10 text-primary/70 flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[8px] font-medium"
                  >
                    <Hash className="size-2" />
                    {tag}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground text-[9px] italic">
                {note.updated_at
                  ? formatDistanceToNow(new Date(note.updated_at), {
                      addSuffix: true,
                    })
                  : "Recently"}
              </span>
            </div>

            <div className="bg-primary absolute inset-y-0 left-0 w-0.5 origin-center scale-y-0 rounded-full transition-transform group-hover:scale-y-75" />
          </button>
        ))}
      </div>
    </div>
  );
}
