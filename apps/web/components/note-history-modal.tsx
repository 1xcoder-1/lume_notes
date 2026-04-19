"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Badge } from "@workspace/ui/components/badge";
import {
  History,
  Clock,
  RotateCcw,
  Loader2,
  Calendar,
  FileText,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";

interface NoteHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: {
    id: string;
    title: string;
  } | null;
  onRestoreSuccess?: () => void;
  onRestore?: (content: any) => void;
  canRestore?: boolean;
  currentContent?: any;
}

interface HistoryEntry {
  id: string;
  note_id: string;
  title: string;
  content: any;
  created_at: string;
}

const historyApi = {
  getHistory: async (noteId: string): Promise<HistoryEntry[]> => {
    try {
      const response = await fetch(`/api/notes/${noteId}/history`);
      if (!response.ok) throw new Error("Failed to fetch history");
      return response.json();
    } catch (err) {
      console.error("[FRONTEND] Fetch Error:", err);
      throw err;
    }
  },

  revertToVersion: async (noteId: string, historyId: string): Promise<any> => {
    const response = await fetch(`/api/notes/${noteId}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ historyId }),
    });
    if (!response.ok) throw new Error("Failed to revert to version");
    return response.json();
  },
};

// Helper to extract text from Tiptap JSON content with faithful formatting
const extractTextFromTiptap = (content: any): string => {
  if (!content) return "";
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      return extractTextFromTiptap(parsed);
    } catch (e) {
      return content;
    }
  }

  if (content.type === "text") return content.text || "";

  if (content.content && Array.isArray(content.content)) {
    const text = content.content.map(extractTextFromTiptap).join("");
    // Add newlines for block elements to preserve layout
    if (
      ["paragraph", "heading", "listItem", "blockquote", "codeBlock"].includes(
        content.type
      )
    ) {
      return text + "\n";
    }
    return text;
  }
  return "";
};

// Advanced word-level diffing helper that preserves EXACT layout
const getDiff = (oldStr: string = "", newStr: string = "") => {
  // Regex that captures whitespace as its own part to preserve formatting
  const oldParts = oldStr.split(/([ \t\n\r]+)/).filter(Boolean);
  const newParts = newStr.split(/([ \t\n\r]+)/).filter(Boolean);
  const diff: { value: string; added?: boolean; removed?: boolean }[] = [];

  let i = 0,
    j = 0;
  while (i < oldParts.length || j < newParts.length) {
    const oldPart = oldParts[i];
    const newPart = newParts[j];

    if (i < oldParts.length && j < newParts.length && oldPart === newPart) {
      if (oldPart !== undefined) diff.push({ value: oldPart });
      i++;
      j++;
    } else if (i < oldParts.length) {
      const currentOldPart = oldParts[i];
      if (currentOldPart === undefined) {
        i++;
        continue;
      }

      const searchLimit = 50;
      const nextMatch = newParts
        .slice(j, j + searchLimit)
        .indexOf(currentOldPart);

      if (nextMatch !== -1) {
        // Words in newParts before the match were ADDED
        for (let k = j; k < j + nextMatch; k++) {
          const addedPart = newParts[k];
          if (addedPart !== undefined)
            diff.push({ value: addedPart, added: true });
        }
        j += nextMatch;
      } else {
        // Current part in oldParts was REMOVED
        diff.push({ value: currentOldPart, removed: true });
        i++;
      }
    } else if (j < newParts.length) {
      const addedPart = newParts[j];
      if (addedPart !== undefined) diff.push({ value: addedPart, added: true });
      j++;
    } else {
      break;
    }
  }
  return diff;
};

export function NoteHistoryModal({
  open,
  onOpenChange,
  note,
  onRestoreSuccess,
  onRestore,
  canRestore = true,
  currentContent,
}: NoteHistoryModalProps) {
  const queryClient = useQueryClient();
  const [selectedEntry, setSelectedEntry] = React.useState<HistoryEntry | null>(
    null
  );
  const [mobileView, setMobileView] = React.useState<"list" | "preview">(
    "list"
  );
  const [showDiff, setShowDiff] = React.useState(false);

  const { data: history, isLoading } = useQuery({
    queryKey: ["note-history", note?.id],
    queryFn: () => (note?.id ? historyApi.getHistory(note.id) : []),
    enabled: open && !!note?.id,
  });

  const revertMutation = useMutation({
    mutationFn: (historyId: string) =>
      historyApi.revertToVersion(note!.id, historyId),
    onSuccess: () => {
      if (selectedEntry && onRestore) {
        onRestore(selectedEntry.content);
      }
      queryClient.invalidateQueries({ queryKey: ["note", note?.id] });
      toast.success("Note restored to this version!");
      if (onRestoreSuccess) onRestoreSuccess();
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to restore note"),
  });

  const handleSelectEntry = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
    setMobileView("preview");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:h-[85vh] sm:max-w-5xl">
        <DialogHeader className="relative border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 rounded-lg p-2">
                <History className="text-primary h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Version History
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {mobileView === "preview" && selectedEntry ? (
                    <button
                      onClick={() => setMobileView("list")}
                      className="text-primary hover:text-primary/80 flex items-center gap-1 md:hidden"
                    >
                      <RotateCcw className="h-3 w-3 rotate-180" />
                      Back to list
                    </button>
                  ) : (
                    `Viewing snapshots for "${note?.title}"`
                  )}
                </DialogDescription>
              </div>
            </div>

            {/* Centered View Only Badge */}
            {!canRestore && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge
                  variant="outline"
                  className="bg-muted/50 border-orange-200 px-3 py-1 text-[10px] tracking-wider text-orange-600 uppercase"
                >
                  View Only Mode
                </Badge>
              </div>
            )}

            {/* Empty div to maintain spacing if needed */}
            <div className="w-10 md:w-0" />
          </div>
        </DialogHeader>

        <div className="relative flex flex-1 overflow-hidden">
          <div
            className={cn(
              "bg-muted/20 flex w-full flex-col border-r transition-all duration-300 md:w-80",
              mobileView === "preview" ? "hidden md:flex" : "flex"
            )}
          >
            <div className="scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20 flex-1 overflow-y-auto">
              <div className="space-y-1 p-2">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-3 py-10">
                    <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                    <p className="text-muted-foreground text-xs font-medium">
                      Loading history...
                    </p>
                  </div>
                ) : history && history.length > 0 ? (
                  history.map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => handleSelectEntry(entry)}
                      className={cn(
                        "group relative w-full rounded-lg border p-3 text-left transition-all",
                        selectedEntry?.id === entry.id
                          ? "bg-background border-primary/30 ring-primary/20 shadow-sm ring-1"
                          : "hover:bg-background border-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-col">
                          <span className="text-foreground group-hover:text-primary truncate text-sm font-semibold transition-colors">
                            {entry.title || "Untitled"}
                          </span>
                          <div className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[10px] font-medium">
                            <Clock className="h-3 w-3" />
                            <span>
                              {format(
                                new Date(entry.created_at),
                                "MMM d, h:mm a"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                    <Clock className="text-muted-foreground mb-2 h-8 w-8" />
                    <p className="text-muted-foreground text-xs font-medium">
                      No history yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "bg-background flex flex-1 flex-col transition-all duration-300",
              mobileView === "list" ? "hidden md:flex" : "flex"
            )}
          >
            {selectedEntry ? (
              <>
                <div className="bg-muted/10 flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                      <Calendar className="text-primary h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-foreground text-sm leading-none font-bold">
                        {selectedEntry.title}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-[10px] font-medium">
                        Snapshot taken{" "}
                        {formatDistanceToNow(
                          new Date(selectedEntry.created_at)
                        )}{" "}
                        ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "h-8 gap-2",
                        showDiff
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : ""
                      )}
                      onClick={() => setShowDiff(!showDiff)}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {showDiff ? "Hide Changes" : "Show Changes"}
                    </Button>
                    {canRestore && (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 gap-2 shadow-sm"
                        onClick={() => revertMutation.mutate(selectedEntry.id)}
                        disabled={revertMutation.isPending}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
                <div className="w-full flex-1 overflow-y-auto">
                  <div className="mx-auto max-w-3xl p-6 sm:p-10">
                    <article className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="text-foreground/80 font-sans text-base leading-relaxed whitespace-pre-wrap">
                        {showDiff && history && history.length > 0
                          ? (() => {
                              const selectedIndex = history.findIndex(
                                e => e.id === selectedEntry.id
                              );
                              const previousEntry = history[selectedIndex + 1]; // history is desc, so +1 is older
                              const baseContent = previousEntry
                                ? extractTextFromTiptap(previousEntry.content)
                                : "";

                              return getDiff(
                                baseContent,
                                extractTextFromTiptap(selectedEntry.content)
                              ).map((part, index) => (
                                <span
                                  key={index}
                                  className={cn(
                                    part.removed
                                      ? "bg-red-500/20 text-red-600 line-through decoration-red-400/50"
                                      : "",
                                    part.added
                                      ? "bg-green-500/20 font-medium text-green-600 no-underline"
                                      : ""
                                  )}
                                >
                                  {part.value}
                                </span>
                              ));
                            })()
                          : extractTextFromTiptap(selectedEntry.content)}
                      </div>
                    </article>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-muted/5 flex flex-1 flex-col items-center justify-center p-12 text-center">
                <FileText className="text-primary mb-4 h-10 w-10" />
                <h3 className="text-foreground mb-2 text-lg font-bold">
                  Select a version to preview
                </h3>
                <p className="text-muted-foreground text-sm">
                  Choose any snapshot to see its content.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
