import React, { useRef } from "react";
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
import { X, PanelLeft, Plus as PlusIcon, Tags, Calendar, FileText, Folder as FolderIcon, ChevronDown, Check } from "lucide-react";
import type { Note, Folder } from "@/lib/api";

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
}: NoteEditorSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside 
      className={cn(
        "hidden lg:flex flex-col border-r bg-card/10 transition-all duration-300 overflow-hidden",
        isLeftSidebarOpen ? "w-80 opacity-100" : "w-0 opacity-0 border-r-0"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <PanelLeft className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Note Details & Tags</h3>
        </div>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsLeftSidebarOpen(false)}>
          <X className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-5">
        <div className="space-y-8">
          {}
          <div className="space-y-3">
            <Label className="text-[12px] font-bold tracking-normal text-muted-foreground block">
              Folder Location
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={readOnly}
                  className={cn(
                    "w-full justify-between h-9 text-xs font-normal shadow-sm bg-card transition-all hover:bg-accent hover:text-accent-foreground border-border/60 focus-visible:ring-primary/20",
                    note.folder && "border-border shadow-inner"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon className="size-3.5 text-muted-foreground/60" />
                    <span className="truncate">
                      {note.folder || "Main (Unassigned)"}
                    </span>
                  </div>
                  <ChevronDown className="size-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 max-h-[300px] overflow-y-auto shadow-lg backdrop-blur-xl bg-background/95 border-primary/10">
                <DropdownMenuGroup>
                   {note.folder && (
                     <>
                       <DropdownMenuItem 
                         onClick={() => handleUpdateFolder(null)} 
                         className="text-xs cursor-pointer rounded-sm mb-1"
                       >
                         <div className="flex items-center justify-between w-full">
                           <span className="font-medium text-muted-foreground hover:text-foreground">Move to Main</span>
                           <Check className="size-3 text-muted-foreground ml-2 opacity-0 group-hover:opacity-100" />
                         </div>
                       </DropdownMenuItem>
                       <DropdownMenuSeparator className="opacity-50" />
                     </>
                   )}
                   {folders.length === 0 ? (
                     <div className="px-3 py-4 text-center text-[10px] text-muted-foreground italic">
                       No folders created yet.
                     </div>
                   ) : (
                     folders.map(f => (
                       <DropdownMenuItem 
                         key={f.id} 
                         onClick={() => handleUpdateFolder(f.name)}
                         className={cn(
                           "text-xs transition-colors cursor-pointer rounded-sm my-0.5", 
                           note.folder === f.name 
                             ? "bg-accent text-foreground font-semibold" 
                             : "hover:bg-accent"
                         )}
                       >
                         <div className="flex items-center justify-between w-full">
                           <div className="flex items-center gap-2">
                             <div className={cn(
                               "size-1.5 rounded-full",
                               note.folder === f.name ? "bg-primary" : "bg-muted-foreground/30"
                             )} />
                             <span className="truncate">{f.name}</span>
                           </div>
                           {note.folder === f.name && <Check className="size-3 text-muted-foreground ml-2" />}
                         </div>
                       </DropdownMenuItem>
                     ))
                   )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="border-t border-border/20 pt-1" />

          {}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Tags
              </Label>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 opacity-60">
                {note.tags?.length || 0}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-8">
              {note.tags && note.tags.length > 0 ? (
                note.tags.map((tag, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="pl-2 pr-1 py-1 text-xs gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 hover:border-primary/30 transition-all group"
                  >
                    {tag}
                    {!readOnly && (
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="p-0.5 rounded-full hover:bg-primary/20 opacity-40 hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No tags assigned</p>
              )}
            </div>

            <form onSubmit={handleAddTag} className="flex gap-2 pt-2">
              <div className="relative flex-1">
                <Input
                  placeholder={readOnly ? "Tags are locked" : "Add manual tag..."}
                  value={newTag}
                  onChange={e => setNewTag(e.target.value)}
                  className="h-8 text-xs pr-8 focus-visible:ring-primary/30"
                  disabled={readOnly}
                />
                <Tags className="absolute right-2.5 top-2 size-3.5 text-muted-foreground/50" />
              </div>
              <Button 
                type="submit" 
                size="icon" 
                className="size-8 bg-primary/10 text-primary hover:bg-primary hover:text-white border-0 transition-all"
                disabled={!newTag.trim() || readOnly}
              >
                <PlusIcon className="size-4" />
              </Button>
            </form>
          </div>

          {}
          <div className="space-y-4 pt-4 border-t border-border/40">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Created
              </Label>
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <Calendar className="size-3 text-muted-foreground" />
                {new Date(note.created_at).toLocaleDateString(undefined, {
                  dateStyle: 'medium'
                })}
              </div>
            </div>

            <div className="space-y-1 text-xs text-foreground/80">
              <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Last Modified
              </Label>
              <div className="flex items-center gap-2">
                 <Calendar className="size-3 text-muted-foreground" />
                 {new Date(note.updated_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                 })}
              </div>
            </div>

          </div>
        </div>
      </ScrollArea>
    </aside>
  );
});
