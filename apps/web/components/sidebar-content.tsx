"use client";

import React, { useMemo } from "react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { useTheme } from "next-themes";
import {
  Trash2,
  Plus,
  Sparkles,
  UserPlus,
  Users,
  ShieldCheck,
  Loader2,
  MoreHorizontal,
  User,
  ChevronsUpDown,
  Moon,
  Sun,
  LogOut,
  Monitor,
  Share2,
  Download,
  ExternalLink,
  Copy as CopyIcon,
  FileText,
  Tags as TagsIcon,
  FolderOpen,
  Folder as FolderIcon,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  useOrganizationStats,
  useUpdateNote,
  useFolders,
  useCreateFolder,
  useDeleteFolder,
  type Note,
  type Folder,
  Tenant,
  User as UserType
} from "@/lib/api";
import Image from "next/image";
import { SearchBar } from "./search-bar";

interface SidebarContentProps {
  notes: Note[];
  notesLoading: boolean;
  notesError: Error | null;
  tenant: Tenant;
  user: UserType | null;
  tenantLoading: boolean;
  limitReached: boolean;
  selectedId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;

  onDeleteNote: (id: string) => void;
  onConfirmDelete: () => void;
  onInviteUser: () => void;
  onUpgrade: () => void;
  onLogout: () => void;
  deleteNoteId: string | null;
  setDeleteNoteId: (id: string | null) => void;
  deleteNotePending: boolean;
  onExportNote?: (note: Note) => void;
  onShareNote?: (note: Note) => void;
  onPDFUpload?: (file: File) => void;
}



function UpgradeBanner({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="bg-muted mx-3 mb-3 rounded-md border p-3">
      <p className="text-xs">
        You've reached the Free plan limit. Upgrade to Pro for unlimited notes.
      </p>
      <div className="mt-2">
        <Button size="sm" onClick={onUpgrade} className="w-full">
          <Sparkles className="mr-1.5 size-4" />
          Upgrade to Pro
        </Button>
      </div>
    </div>
  );
}


function UserMenu({ user, tenant, onLogout, onUpgrade, onInviteUser }: any) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-accent h-auto w-full justify-start p-2"
        >
          <div className="flex w-full items-center gap-2">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
              {user?.image ? (
                <Image
                  width={32}
                  height={32}
                  src={user.image}
                  alt=""
                  className="rounded-lg object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              {user?.role === "admin" ? "Admin" : "Member"}
              {" • "}
              {tenant?.name || tenant?.slug || "Tenant"}
              <span className="truncate text-xs font-medium">
                {user?.email || "User"}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
              {user?.image ? (
                <Image
                  width={32}
                  height={32}
                  src={user.image}
                  alt=""
                  className="rounded-lg object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user?.email || "User"}
              </span>
              <span className="truncate text-xs">
                {user?.role === "admin" ? "Admin" : "Member"} •{" "}
                {user?.tenantPlan === "pro" ? "Pro" : "Free"}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user?.role === "admin" && (
            <>
              <DropdownMenuItem onClick={() => (window.location.href = "/organization/management")}>
                <Users className="mr-2 h-4 w-4" />
                Organization Management
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onInviteUser}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </DropdownMenuItem>
            </>
          )}
          {user?.tenantPlan !== "pro" && (
            <DropdownMenuItem onClick={onUpgrade}>
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Sun className="mr-2 h-4 w-4" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


function UpgradeFooter({ tenant, onUpgrade, user, onLogout, onInviteUser }: any) {
  const { data: stats } = useOrganizationStats(user?.role === "admin");

  return (
    <div className="flex flex-col gap-4">
      {user?.role === "admin" && stats && (
        <div className="flex items-center justify-between px-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            <span>{stats.memberCount} Members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" />
            <span>{stats.adminCount} Admins</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <UserMenu
            user={user}
            tenant={tenant}
            onLogout={onLogout}
            onUpgrade={onUpgrade}
            onInviteUser={onInviteUser}
          />
        </div>
      </div>
    </div>
  );
}




interface SidebarNoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onShare: (note: Note) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
  editRestricted: boolean;
}

const SidebarNoteItem = React.memo(({
  note,
  isSelected,
  onSelect,
  onShare,
  onDelete,
  isDeletePending,
  editRestricted
}: SidebarNoteItemProps) => {
  return (
    <div
      draggable={!editRestricted}
      onDragStart={(e) => {
        if (editRestricted) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.setData("noteId", note.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      role="button"
      tabIndex={0}
      className={cn(
        "hover:bg-accent/70 group w-full cursor-pointer select-none rounded-md px-3 py-1.5 text-left text-xs transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 border-l-2 border-transparent",
        isSelected && "bg-accent/80 text-foreground font-medium border-primary pl-3"
      )}
      onClick={() => onSelect(note.id)}
      aria-current={isSelected ? "page" : undefined}
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
        <div className="flex flex-col min-w-0">
          <span className="truncate">{note.title || "Untitled"}</span>
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {note.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="text-[8px] leading-none font-medium text-primary px-1.5 py-0.5 bg-primary/10 border border-primary/20 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onShare(note); }}
            className="p-1 hover:bg-background rounded-md"
            title="Share"
          >
            <Share2 className="size-3 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="p-1 hover:bg-background rounded-md text-destructive"
            title="Delete"
            disabled={isDeletePending}
          >
            {isDeletePending ? (
              <div className="size-3 animate-spin rounded-full border border-current border-t-transparent" />
            ) : (
              <Trash2 className="size-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

interface SidebarFolderItemProps {
  folder: Folder & { children: any[] };
  depth: number;
  expandedFolders: Record<string, boolean>;
  toggleFolder: (id: string) => void;
  notesByFolderId: Record<string, Note[]>;
  selectedTag: string | null;
  selectedId: string | null;
  onSelectNote: (id: string) => void;
  onShareNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  deleteNoteId: string | null;
  deleteNotePending: boolean;
  editRestricted: boolean;
  createRestricted: boolean;
  onAddSubfolder: (id: string, name: string) => void;
  onDeleteFolder: (e: React.MouseEvent, id: string, name: string) => void;
  updateNoteMutation: any;
  setExpandedFolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  ancestorIds: string[];
}

const SidebarFolderItem = React.memo(({
  folder,
  depth,
  expandedFolders,
  toggleFolder,
  notesByFolderId,
  selectedTag,
  selectedId,
  onSelectNote,
  onShareNote,
  onDeleteNote,
  deleteNoteId,
  deleteNotePending,
  editRestricted,
  createRestricted,
  onAddSubfolder,
  onDeleteFolder,
  updateNoteMutation,
  setExpandedFolders,
  ancestorIds
}: SidebarFolderItemProps) => {
  if (depth > 20) return null;
  if (ancestorIds.includes(folder.id)) return null;
  
  const newAncestorIds = [...ancestorIds, folder.id];

  const isExpanded = !!expandedFolders[folder.id];
  const currentFolderNotes = notesByFolderId[folder.id] || [];

  const filterMatch = (note: Note) => !selectedTag || (note.tags && note.tags.includes(selectedTag));
  const filteredNotes = currentFolderNotes.filter(filterMatch);

  const hasVisibleContent = filteredNotes.length > 0 || folder.children.some(child => {
    const childNotes = notesByFolderId[child.id] || [];
    return childNotes.some(filterMatch) || child.children.length > 0;
  });

  if (selectedTag && !hasVisibleContent) return null;

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "group relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 transition-colors focus-visible:outline-2",
          isExpanded ? "bg-accent/40" : "hover:bg-accent/50"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => toggleFolder(folder.id)}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("bg-primary/10");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("bg-primary/10");
        }}
        onDrop={async (e) => {
          e.currentTarget.classList.remove("bg-primary/10");
          const noteId = e.dataTransfer.getData("noteId");
          if (noteId && !editRestricted) {
            try {
              await updateNoteMutation.mutateAsync({
                id: noteId,
                data: { folderId: folder.id, folder: folder.name },
              });
              toast.success(`Note moved to ${folder.name}`);
              setExpandedFolders(prev => ({ ...prev, [folder.id]: true }));
            } catch (err) {
              toast.error("Failed to move note");
            }
          }
        }}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <div className="flex items-center justify-center size-4 relative">
            {isExpanded ? (
              <ChevronDown className="size-3 text-muted-foreground transition-transform" />
            ) : (
              <ChevronRight className="size-3 text-muted-foreground transition-transform group-hover:text-primary" />
            )}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <FolderIcon className={cn("size-3.5", isExpanded ? "text-primary" : "text-muted-foreground/70 group-hover:text-primary")} />
            <span className="truncate text-xs font-medium tracking-tight overflow-hidden whitespace-nowrap">
              {folder.name}
            </span>
            {currentFolderNotes.length > 0 && !isExpanded && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[8px] opacity-40">
                {currentFolderNotes.length}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (createRestricted) {
                toast.error("Restricted: Members cannot create folders");
                return;
              }
              onAddSubfolder(folder.id, folder.name);
            }}
            disabled={createRestricted}
            className="p-1 hover:bg-background rounded-md disabled:opacity-30"
            title={createRestricted ? "Restricted" : "New Sub-folder"}
          >
            <Plus className="size-3 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => {
              if (createRestricted) {
                e.stopPropagation();
                toast.error("Restricted: Members cannot delete folders");
                return;
              }
              onDeleteFolder(e, folder.id, folder.name);
            }}
            disabled={createRestricted}
            className="p-1 hover:bg-background rounded-md text-destructive disabled:opacity-30"
            title={createRestricted ? "Restricted" : "Delete Folder"}
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-0.5 mt-0.5">
          {folder.children.map(child => (
            <SidebarFolderItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              notesByFolderId={notesByFolderId}
              selectedTag={selectedTag}
              selectedId={selectedId}
              onSelectNote={onSelectNote}
              onShareNote={onShareNote}
              onDeleteNote={onDeleteNote}
              deleteNoteId={deleteNoteId}
              deleteNotePending={deleteNotePending}
              editRestricted={editRestricted}
              createRestricted={createRestricted}
              onAddSubfolder={onAddSubfolder}
              onDeleteFolder={onDeleteFolder}
              updateNoteMutation={updateNoteMutation}
              setExpandedFolders={setExpandedFolders}
              ancestorIds={newAncestorIds}
            />
          ))}
          {filteredNotes.map(note => (
            <SidebarNoteItem
              key={note.id}
              note={note}
              isSelected={selectedId === note.id}
              onSelect={onSelectNote}
              onShare={onShareNote}
              onDelete={onDeleteNote}
              isDeletePending={deleteNoteId === note.id && deleteNotePending}
              editRestricted={editRestricted}
            />
          ))}

          {filteredNotes.length === 0 && folder.children.length === 0 && (
            <div
              className="py-2 text-[10px] text-muted-foreground italic text-center border border-dashed border-border/40 rounded-md mx-2 opacity-50"
              style={{ marginLeft: `${(depth + 1) * 12 + 8}px` }}
            >
              no notes here
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export const SidebarContent = React.memo(function SidebarContent({
  notes,
  notesLoading,
  notesError,
  tenant,
  user,
  tenantLoading,
  limitReached,
  selectedId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onConfirmDelete,
  onInviteUser,
  onUpgrade,
  onLogout,
  deleteNoteId,
  setDeleteNoteId,
  deleteNotePending,
  onExportNote,
  onShareNote,
  onPDFUpload,
}: SidebarContentProps) {
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);
  const isLoading = tenantLoading || notesLoading;
  const updateNoteMutation = useUpdateNote();
  const { data: foldersData } = useFolders();
  const createFolderMutation = useCreateFolder();
  const deleteFolderMutation = useDeleteFolder();
  const [expandedFolders, setExpandedFolders] = React.useState<Record<string, boolean>>({ "All Notes": true });
  const [isCreatingFolder, setIsCreatingFolder] = React.useState(false);
  const [newFolderName, setNewFolderName] = React.useState("");
  const [deleteFolderId, setDeleteFolderId] = React.useState<string | null>(null);
  const [deleteFolderName, setDeleteFolderName] = React.useState<string | null>(null);

  const [isCreatingSubfolder, setIsCreatingSubfolder] = React.useState(false);
  const [parentIdForSubfolder, setParentIdForSubfolder] = React.useState<string | null>(null);
  const [parentNameForSubfolder, setParentNameForSubfolder] = React.useState<string | null>(null);
  const [newSubfolderName, setNewSubfolderName] = React.useState("");

  const createRestricted = user?.role !== "admin" && !tenant.members_can_create;
  const editRestricted = user?.role !== "admin" && !tenant.members_can_edit;

  const toggleFolder = React.useCallback((folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  }, []);

  const handleDeleteFolder = React.useCallback((e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setDeleteFolderId(id);
    setDeleteFolderName(name);
  }, []);

  const onConfirmDeleteFolder = async () => {
    if (!deleteFolderId) return;
    try {
      await deleteFolderMutation.mutateAsync(deleteFolderId);
      toast.success("Folder deleted");
      setDeleteFolderId(null);
    } catch (err) {
      toast.error("Failed to delete folder");
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await createFolderMutation.mutateAsync({ name });
      toast.success(`Folder "${name}" created`);
      setNewFolderName("");
      setIsCreatingFolder(false);
    } catch (err) {
      toast.error("Failed to create folder");
    }
  };

  const handleCreateSubfolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSubfolderName.trim();
    if (!name || !parentIdForSubfolder) return;

    try {
      await createFolderMutation.mutateAsync({ name, parentId: parentIdForSubfolder });
      toast.success(`Sub-folder "${name}" created inside "${parentNameForSubfolder}"`);
      setNewSubfolderName("");
      setIsCreatingSubfolder(false);
      setParentIdForSubfolder(null);
      setParentNameForSubfolder(null);
      setExpandedFolders(prev => ({ ...prev, [parentIdForSubfolder]: true }));
    } catch (err) {
      toast.error("Failed to create sub-folder");
    }
  };

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    (notes || []).forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(t => tags.add(t));
      }
    });
    return Array.from(tags).sort();
  }, [notes]);

  const folderContent = useMemo(() => {
    const notesList = notes || [];
    const folderTree: (Folder & { children: any[] })[] = [];
    const folderMapId: Record<string, Folder & { children: any[] }> = {};

    (foldersData || []).forEach(f => {
      folderMapId[f.id] = { ...f, children: [] };
    });

    (foldersData || []).forEach(f => {
      const folder = folderMapId[f.id];
      if (!folder) return;
      
      const parent = f.parentId ? folderMapId[f.parentId] : null;
      if (parent && f.id !== f.parentId) {
        parent.children.push(folder);
      } else {
        folderTree.push(folder);
      }
    });

    const notesByFolderId: Record<string, Note[]> = {};
    if (notesList) {
      notesList.forEach(note => {
        const fid = note.folderId || "root";
        if (!notesByFolderId[fid]) notesByFolderId[fid] = [];
        notesByFolderId[fid]!.push(note);
      });
    }

    const onAddSubfolder = (id: string, name: string) => {
      setParentIdForSubfolder(id);
      setParentNameForSubfolder(name);
      setIsCreatingSubfolder(true);
    };

    return (
      <div className="space-y-4">
        {selectedTag ? (
          <div className="space-y-0.5 px-1">
            <p className="text-[10px] text-muted-foreground/50 font-semibold px-2 mb-2 uppercase">Results for #{selectedTag}</p>
            {notesList.filter(n => n.tags && n.tags.includes(selectedTag)).length === 0 ? (
              <p className="text-xs text-muted-foreground italic px-2 text-center py-4">No notes with this tag</p>
            ) : (
              notesList.filter(n => n.tags && n.tags.includes(selectedTag)).map(note => (
                <SidebarNoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedId === note.id}
                  onSelect={onSelectNote}
                  onShare={onShareNote!}
                  onDelete={onDeleteNote}
                  isDeletePending={deleteNoteId === note.id && deleteNotePending}
                  editRestricted={editRestricted}
                />
              ))
            )}
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {/* Main Workspace Drop Target */}
              <div
                className={cn(
                  "group relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 transition-all text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent",
                  "drag-target-root"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-primary/10", "border-primary/20", "text-primary");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("bg-primary/10", "border-primary/20", "text-primary");
                }}
                onDrop={async (e) => {
                  e.currentTarget.classList.remove("bg-primary/10", "border-primary/20", "text-primary");
                  const noteId = e.dataTransfer.getData("noteId");
                  if (noteId && !editRestricted) {
                    try {
                      await updateNoteMutation.mutateAsync({
                        id: noteId,
                        data: { folderId: null, folder: null },
                      });
                      toast.success("Note moved to Main Library");
                    } catch (err) {
                      toast.error("Failed to move note");
                    }
                  }
                }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex items-center justify-center size-4">
                    <FileText className="size-3.5" />
                  </div>
                  <span className="truncate text-xs font-semibold uppercase tracking-wider opacity-70">
                    Main Library
                  </span>
                </div>
              </div>

              {folderTree.map(f => (
                <SidebarFolderItem
                  key={f.id}
                  folder={f}
                  depth={0}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  notesByFolderId={notesByFolderId}
                  selectedTag={selectedTag}
                  selectedId={selectedId}
                  onSelectNote={onSelectNote}
                  onShareNote={onShareNote!}
                  onDeleteNote={onDeleteNote}
                  deleteNoteId={deleteNoteId}
                  deleteNotePending={deleteNotePending}
                  editRestricted={editRestricted}
                  createRestricted={createRestricted}
                  onAddSubfolder={onAddSubfolder}
                  onDeleteFolder={handleDeleteFolder}
                  updateNoteMutation={updateNoteMutation}
                  setExpandedFolders={setExpandedFolders}
                  ancestorIds={[]}
                />
              ))}
            </div>

            <div
              className="space-y-0.5 min-h-[40px] pt-2"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("bg-primary/5"); }}
              onDragLeave={(e) => e.currentTarget.classList.remove("bg-primary/5")}
              onDrop={async (e) => {
                e.currentTarget.classList.remove("bg-primary/5");
                const noteId = e.dataTransfer.getData("noteId");
                if (noteId && !editRestricted) {
                  try {
                    await updateNoteMutation.mutateAsync({ id: noteId, data: { folderId: null, folder: null } });
                    toast.success("Note moved to Main Library");
                  } catch (err) {
                    toast.error("Failed to move note");
                  }
                }
              }}
            >
              {notesByFolderId["root"]?.map(note => (
                <SidebarNoteItem
                  key={note.id}
                  note={note}
                  isSelected={selectedId === note.id}
                  onSelect={onSelectNote}
                  onShare={onShareNote!}
                  onDelete={onDeleteNote}
                  isDeletePending={deleteNoteId === note.id && deleteNotePending}
                  editRestricted={editRestricted}
                />
              ))}
              {(!notesByFolderId["root"] || notesByFolderId["root"].length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 opacity-20 group-hover:opacity-40 transition-opacity">
                   <Sparkles className="size-6 mb-2" />
                   <p className="text-[10px] font-medium tracking-tighter uppercase">Library Empty</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }, [notes, foldersData, selectedTag, expandedFolders, selectedId, editRestricted, deleteNoteId, deleteNotePending, onSelectNote, onDeleteNote, onShareNote, onExportNote, updateNoteMutation, toggleFolder, handleDeleteFolder]);

  if (isLoading) {
    return (
      <>
        <div className="min-w-0 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex h-8 items-center gap-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-10" />
            </div>
          </div>
        </div>
        <Separator className="mb-4" />
        <div className="mb-4 px-2">
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
        <div className="space-y-2 px-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Separator className="my-4" />
        <div className="flex-1 space-y-2 px-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="border-t p-3">
          <Skeleton className="h-10 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-w-0 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex h-8 items-center gap-2">
              <img src="/logo.svg" alt="lume notes Logo" className="h-6 w-6" />
              <span className="text-lg font-semibold">lume notes</span>
              <Badge
                variant="secondary"
                className="px-1.5 py-0.5 text-xs font-medium"
              >
                {tenant?.plan?.toLowerCase() === "free" ? "Free" : "Pro"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator className="mb-4" />
      <div className="mb-4 px-2">
        <SearchBar onSelectNote={onSelectNote} />
      </div>
      <div className="flex flex-col gap-2 px-2">
        <Button
          size="sm"
          onClick={onCreateNote}
          disabled={limitReached || createRestricted}
          variant="default"
          className="w-full h-9 font-semibold shadow-sm transition-all hover:shadow-primary/20 hover:scale-[1.01]"
        >
          <Plus className="mr-1.5 size-4" />
          New Note
        </Button>
        <div className="relative mb-2">
          <input
            type="file"
            id="sidebar-file-upload"
            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,image/*,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onPDFUpload) {
                onPDFUpload(file);
              }
            }}
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-between h-9 text-xs font-normal shadow-sm bg-card transition-all hover:bg-accent hover:text-accent-foreground border-border/60 group"
            onClick={() => document.getElementById("sidebar-file-upload")?.click()}
            disabled={createRestricted}
          >
            <div className="flex items-center gap-2">
              <FileText className="size-3.5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
              <span className="truncate">Chat / Import File</span>
            </div>
            <ChevronRight className="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </div>
      <div className="mb-4 px-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full justify-between h-9 text-xs font-normal shadow-sm bg-card transition-all hover:bg-accent hover:text-accent-foreground border-border/60",
                selectedTag && "border-primary/50 text-primary bg-primary/5 hover:bg-primary/10"
              )}
            >
              <div className="flex items-center gap-2">
                <TagsIcon className={cn("size-3.5", selectedTag ? "text-primary" : "text-muted-foreground/70")} />
                <span className="truncate">
                  {selectedTag ? `Filtered: ${selectedTag}` : "Smart Tags Filter"}
                </span>
              </div>
              <ChevronDown className="size-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) max-h-[300px] overflow-y-auto shadow-lg backdrop-blur-xl bg-background/95 border-border/10"
          >
            {uniqueTags.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground italic">
                No tags yet. Use AI to auto tag!
              </div>
            ) : (
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    "text-xs font-medium cursor-pointer rounded-sm mb-1",
                    !selectedTag && "bg-secondary text-secondary-foreground"
                  )}
                >
                  All Notes (Clear Filter)
                </DropdownMenuItem>
                <DropdownMenuSeparator className="opacity-50" />
                <div className="px-2 py-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">
                  Available Tags
                </div>
                {uniqueTags.map(tag => (
                  <DropdownMenuItem
                    key={tag}
                    onClick={() => setSelectedTag(prev => prev === tag ? null : tag)}
                    className={cn(
                      "text-xs transition-colors cursor-pointer rounded-sm my-0.5",
                      selectedTag === tag
                        ? "bg-primary/15 text-primary font-semibold"
                        : "hover:bg-accent"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "size-1.5 rounded-full",
                          selectedTag === tag ? "bg-primary" : "bg-muted-foreground/30"
                        )} />
                        <span className="truncate">{tag}</span>
                      </div>
                      {selectedTag === tag && <Check className="size-3 text-primary ml-2" />}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator className="my-2" />

      <div className="mb-2 px-3 flex items-center justify-between">
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Explorer</p>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 opacity-60 hover:opacity-100"
          onClick={() => {
            if (createRestricted) {
              toast.error("Restricted: Members cannot create folders");
              return;
            }
            setIsCreatingFolder(true);
          }}
          disabled={createRestricted}
          title={createRestricted ? "Creation Restricted" : "New Folder"}
        >
          <Plus className="size-3" />
        </Button>
      </div>

      <ScrollArea type="always" className="min-h-0 flex-1">
        <div className="px-2 space-y-1 pb-4">
          {notesError && (
            <p className="text-destructive px-2 py-1.5 text-xs text-center">
              Failed to load explorer
            </p>
          )}

          {isCreatingFolder && (
            <form onSubmit={handleCreateFolder} className="px-2 py-1 flex items-center gap-2 bg-accent/20 rounded-md mb-2">
              <FolderIcon className="size-3.5 text-primary/60" />
              <input
                autoFocus
                className="bg-transparent border-none text-xs outline-none w-full placeholder:text-muted-foreground/50"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onBlur={() => !newFolderName && setIsCreatingFolder(false)}
              />
            </form>
          )}

          {folderContent}
        </div>
      </ScrollArea>

      {limitReached && user?.role === "admin" && (
        <UpgradeBanner onUpgrade={onUpgrade} />
      )}
      <div className="border-t p-3">
        <UpgradeFooter
          tenant={tenant}
          user={user}
          onUpgrade={onUpgrade}
          onLogout={onLogout}
          onInviteUser={onInviteUser}
        />
      </div>

      <AlertDialog
        open={!!deleteFolderId}
        onOpenChange={() => setDeleteFolderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the folder "{deleteFolderName}"? This will <strong>permanently delete all notes</strong> inside this folder. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteFolderMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={onConfirmDeleteFolder}
              disabled={deleteFolderMutation.isPending}
            >
              {deleteFolderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Folder & Notes"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isCreatingSubfolder}
        onOpenChange={(open) => {
          setIsCreatingSubfolder(open);
          if (!open) {
            setNewSubfolderName("");
            setParentIdForSubfolder(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Sub-folder</DialogTitle>
            <DialogDescription>
              Create a new folder inside "{parentNameForSubfolder}".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubfolder}>
            <div className="grid gap-4 py-4">
              <Input
                autoFocus
                placeholder="Folder name..."
                value={newSubfolderName}
                onChange={(e) => setNewSubfolderName(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={!newSubfolderName.trim() || createFolderMutation.isPending}>
                {createFolderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Folder
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteNoteId}
        onOpenChange={() => setDeleteNoteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{notes?.find((n: Note) => n.id === deleteNoteId)?.title || "Untitled"}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteNotePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={onConfirmDelete}
              disabled={deleteNotePending}
            >
              {deleteNotePending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});