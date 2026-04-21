import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  X,
  PanelLeft,
  Plus as PlusIcon,
  Tags,
  Calendar,
  FileText,
  Folder as FolderIcon,
  ChevronDown,
  Check,
} from "lucide-react";
import type { Note, Folder } from "@/lib/api";
import { Backlinks } from "./backlinks";

export interface NoteEditorSidebarProps {
  note: Note;
  isLeftSidebarOpen: boolean;
  setIsLeftSidebarOpen: (open: boolean) => void;
  newTag: string;
  setNewTag: (tag: string) => void;
  handleAddTag: (e?: React.FormEvent) => Promise<void>;
  handleRemoveTag: (tagToRemove: string) => Promise<void>;
  onPDFUpload?: (file: File) => void;
  readOnly?: boolean;
  folders: Folder[];
  handleUpdateFolder: (folderName: string | null) => Promise<void>;
  onSelectNote: (id: string) => void;
}

export const NoteEditorSidebar = React.memo(function NoteEditorSidebar({
  note,
  isLeftSidebarOpen,
  setIsLeftSidebarOpen,
  newTag,
  setNewTag,
  handleAddTag,
  handleRemoveTag,
  onPDFUpload,
  readOnly = false,
  folders = [],
  handleUpdateFolder,
  onSelectNote,
}: NoteEditorSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.aside
      initial={false}
      animate={{
        x: isLeftSidebarOpen ? 0 : "-100%",
        opacity: isLeftSidebarOpen ? 1 : 0,
        width: isLeftSidebarOpen
          ? typeof window !== "undefined" && window.innerWidth < 1024
            ? "100%"
            : 320
          : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 },
      }}
      className={cn(
        "bg-background/95 flex flex-col overflow-hidden border-r backdrop-blur-xl",
        "fixed inset-0 z-[100] h-svh lg:relative lg:inset-auto lg:z-0 lg:h-auto",
        !isLeftSidebarOpen && "pointer-events-none border-none lg:flex"
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <PanelLeft className="text-primary size-4" />
          <h3 className="text-sm font-semibold">Note Details & Tags</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setIsLeftSidebarOpen(false)}
        >
          <X className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-5">
        <div className="space-y-8">
          {}
          <div className="space-y-3">
            <Label className="text-muted-foreground block text-[12px] font-bold tracking-normal">
              Folder Location
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={readOnly}
                  className={cn(
                    "bg-card hover:bg-accent hover:text-accent-foreground border-border/60 focus-visible:ring-primary/20 h-9 w-full justify-between text-xs font-normal shadow-sm transition-all",
                    note.folder && "border-border shadow-inner"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon className="text-muted-foreground/60 size-3.5" />
                    <span className="truncate">
                      {note.folder || "Main (Unassigned)"}
                    </span>
                  </div>
                  <ChevronDown className="size-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 border-primary/10 max-h-[300px] w-64 overflow-y-auto shadow-lg backdrop-blur-xl">
                <DropdownMenuGroup>
                  {note.folder && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleUpdateFolder(null)}
                        className="mb-1 cursor-pointer rounded-sm text-xs"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-muted-foreground hover:text-foreground font-medium">
                            Move to Main
                          </span>
                          <Check className="text-muted-foreground ml-2 size-3 opacity-0 group-hover:opacity-100" />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="opacity-50" />
                    </>
                  )}
                  {folders.length === 0 ? (
                    <div className="text-muted-foreground px-3 py-4 text-center text-[10px] italic">
                      No folders created yet.
                    </div>
                  ) : (
                    folders.map(f => (
                      <DropdownMenuItem
                        key={f.id}
                        onClick={() => handleUpdateFolder(f.name)}
                        className={cn(
                          "my-0.5 cursor-pointer rounded-sm text-xs transition-colors",
                          note.folder === f.name
                            ? "bg-accent text-foreground font-semibold"
                            : "hover:bg-accent"
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "size-1.5 rounded-full",
                                note.folder === f.name
                                  ? "bg-primary"
                                  : "bg-muted-foreground/30"
                              )}
                            />
                            <span className="truncate">{f.name}</span>
                          </div>
                          {note.folder === f.name && (
                            <Check className="text-muted-foreground ml-2 size-3" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="border-border/20 border-t pt-1" />

          {}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                Tags
              </Label>
              <Badge
                variant="outline"
                className="px-1.5 py-0 text-[10px] opacity-60"
              >
                {note.tags?.length || 0}
              </Badge>
            </div>

            <div className="flex min-h-8 flex-wrap gap-2">
              {note.tags && note.tags.length > 0 ? (
                note.tags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30 group gap-1 py-1 pr-1 pl-2 text-xs transition-all"
                  >
                    {tag}
                    {!readOnly && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-primary/20 rounded-full p-0.5 opacity-40 transition-opacity hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-xs italic">
                  No tags assigned
                </p>
              )}
            </div>

            <form onSubmit={handleAddTag} className="flex gap-2 pt-2">
              <div className="relative flex-1">
                <Input
                  placeholder={
                    readOnly ? "Tags are locked" : "Add manual tag..."
                  }
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  className="focus-visible:ring-primary/30 h-8 pr-8 text-xs"
                  disabled={readOnly}
                />
                <Tags className="text-muted-foreground/50 absolute top-2 right-2.5 size-3.5" />
              </div>
              <Button
                type="submit"
                size="icon"
                className="bg-primary/10 text-primary hover:bg-primary size-8 border-0 transition-all hover:text-white"
                disabled={!newTag.trim() || readOnly}
              >
                <PlusIcon className="size-4" />
              </Button>
            </form>
          </div>

          {}
          <div className="border-border/40 space-y-4 border-t pt-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                Created
              </Label>
              <div className="text-foreground/80 flex items-center gap-2 text-xs">
                <Calendar className="text-muted-foreground size-3" />
                {new Date(note.created_at).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </div>
            </div>

            <div className="text-foreground/80 space-y-1 text-xs">
              <Label className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                Last Modified
              </Label>
              <div className="flex items-center gap-2">
                <Calendar className="text-muted-foreground size-3" />
                {new Date(note.updated_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
          </div>

          <Backlinks currentNoteId={note.id} onSelectNote={onSelectNote} />
        </div>
      </ScrollArea>
    </motion.aside>
  );
});
