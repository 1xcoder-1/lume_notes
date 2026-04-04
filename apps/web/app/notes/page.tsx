"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@workspace/ui/components/tooltip";
import { SheetContent } from "@workspace/ui/components/sheet";
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
import { Label } from "@workspace/ui/components/label";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { EasterEgg } from "@workspace/ui/components/easter-egg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { SidebarContent } from "../../components/sidebar-content";
import { Topbar } from "../../components/topbar";




import { Loader2, AlertTriangle, Copy, Eye, EyeOff, Share2 } from "lucide-react";
import { toast } from "sonner";
const Confetti = React.lazy(() => import("react-confetti"));

const getPdfLib = () => (window as any).pdfjsLib;


import {
  useNotes,
  useTenant,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  useUpgradeTenant,
  useInviteUser,
  type Note,
  type User as UserType,
} from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { NoteEditorContainer } from "@/components/note-editor-container";
import { ExportModal } from "@/components/export-modal";
import { ShareModal } from "@/components/share-modal";
import {
  createNoteSchema,
  updateNoteSchema,
  inviteUserSchema,
} from "@/lib/validations";


function generateRandomPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}



function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return size;
}


export default function NotesDashboard() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <NotesDashboardContent />
    </React.Suspense>
  );
}

function NotesDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();


  const { data: session, status } = useSession();


  const user = session?.user as UserType | null;


  const {
    data: notesData,
    isLoading: notesLoading,
    error: notesError,
  } = useNotes();
  const { data: tenantData, isLoading: tenantLoading } = useTenant();


  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const upgradeTenantMutation = useUpgradeTenant();
  const inviteUserMutation = useInviteUser();


  const queryClient = useQueryClient();


  const notes = useMemo(() => notesData || [], [notesData]);
  const tenant = useMemo(() => tenantData || {
    name: "Organization",
    slug: "tenant",
    plan: "free" as const,
    noteCount: 0,
    limit: 3,
    members_can_edit: true,
    members_can_create: true,
  }, [tenantData]);


  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isEditorDirty, setIsEditorDirty] = useState(false);

  // Safety reset: every time we switch to a new note, it starts as 'clean'
  useEffect(() => {
    setIsEditorDirty(false);
    console.log("Parent reset: switching note, setting dirty: false");
  }, [selectedId]);

  const saveCurrentNoteRef = useRef<(() => Promise<void>) | null>(null);

  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);


  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);


  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [invitePassword, setInvitePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [createNoteError, setCreateNoteError] = useState("");


  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [exportNote, setExportNoteState] = useState<Note | null>(null);
  const [shareNote, setShareNoteState] = useState<Note | null>(null);


  const updateNoteInList = useCallback((noteId: string, updates: Partial<Note>) => {
    queryClient.setQueryData<Note[]>(["notes"], (old) => {
      if (!old) return old;
      return old.map(n => n.id === noteId ? { ...n, ...updates } : n);
    });
  }, [queryClient]);


  const [showConfetti, setShowConfetti] = useState(false);

  const [confettiFading, setConfettiFading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { width, height } = useWindowSize();

  const confettiTimers = useRef<{ fade: number | null; hide: number | null }>({
    fade: null,
    hide: null,
  });


  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/login");
    }
  }, [session, status, router]);


  const hasInitializedRef = useRef(false);
  useEffect(() => {
    if (notes.length === 0 || hasInitializedRef.current) return;

    const noteParam = searchParams.get("note");

    if (noteParam) {
      const noteExists = notes.some(note => note.id === noteParam);
      if (noteExists) {
        setSelectedId(noteParam);
        setIsEditorDirty(false); // Reset dirty flag on initial load
        hasInitializedRef.current = true;
        return;
      }
    }


    const firstNoteId = notes[0]!?.id;
    if (firstNoteId) {
      setSelectedId(firstNoteId);
      setIsEditorDirty(false); // Reset dirty flag on initial load
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("note", firstNoteId);
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    }
    hasInitializedRef.current = true;
  }, [notes, router, searchParams]);


  const limitReached = useMemo(() => {
    if (tenantLoading || tenant.plan === "pro" || tenant.limit === null)
      return false;
    return tenant.noteCount >= tenant.limit;
  }, [tenant.noteCount, tenant.limit, tenant.plan, tenantLoading]);

  const onInviteUser = useCallback(() => setShowInviteForm(true), []);
  const onCreateNote = () => {
    if (isEditorDirty) {
      setPendingAction("create");
      setShowUnsavedDialog(true);
      return;
    }
    setShowCreateForm(true);
  };
  const registerSaveFn = useCallback((fn: () => Promise<void>) => {
    saveCurrentNoteRef.current = fn;
  }, []);


  const createRestricted = useMemo(() => {
    if (user?.role === "admin") return false;
    return !tenant.members_can_create;
  }, [user, tenant.members_can_create]);


  const editRestricted = useMemo(() => {
    if (user?.role === "admin") return false;
    return !tenant.members_can_edit;
  }, [user, tenant.members_can_edit]);


  const canUpgrade = useMemo(() => {
    return (
      user?.role === "admin" && user?.tenantPlan === "free" && limitReached
    );
  }, [user, limitReached]);


  const handleSelectNote = useCallback(
    (id: string) => {

      if (isEditorDirty && id !== selectedId) {
        setPendingSelectId(id);
        setShowUnsavedDialog(true);
        return;
      }


      setSelectedId(id);
      setIsSheetOpen(false);


      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("note", id);
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    },

    [isEditorDirty, selectedId, searchParams, router]
  );


  const handleSelectNoteProceed = useCallback(
    (id: string) => {
      setPendingSelectId(null);
      setPendingAction(null);
      setSelectedId(id);
      setIsEditorDirty(false); // CRITICAL: Reset dirty flag when actually switching!
      setIsSheetOpen(false);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("note", id);
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleCreateNote = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (limitReached) {
        toast.error("Upgrade to Pro to create more notes.");
        return;
      }
      if (createRestricted) {
        toast.error("An administrator has restricted note creation for members.");
        return;
      }


      const validationResult = createNoteSchema.safeParse({
        title: newTitle,
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Start writing your note here...",
                },
              ],
            },
          ],
        },
      });

      if (!validationResult.success) {
        setCreateNoteError(
          validationResult.error.issues?.[0]?.message || "Validation failed"
        );
        return;
      }

      const validatedData = validationResult.data;
      const noteData = {
        title: validatedData.title!,
        content: validatedData.content,
      };


      setShowCreateForm(false);
      setNewTitle("");
      setCreateNoteError("");

      try {
        const result = await createNoteMutation.mutateAsync(noteData);
        handleSelectNote(result.id);
        toast.success(`"${result.title || "Untitled"}" is ready.`);
        setIsSheetOpen(false);
      } catch (err) {
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [
      limitReached,
      newTitle,
      createNoteMutation,
      handleSelectNote,
      setShowCreateForm,
      setNewTitle,
      setCreateNoteError,
      setIsSheetOpen,
    ]
  );

  const handleDeleteNote = useCallback((id: string) => {
    setDeleteNoteId(id);
  }, []);

  const confirmDeleteNote = useCallback(async () => {
    if (!deleteNoteId) return;
    try {
      await toast.promise(deleteNoteMutation.mutateAsync(deleteNoteId), {
        loading: "Deleting note...",
        success: "Note deleted successfully",
        error: "Failed to delete note",
      });
      const remaining = (notes || []).filter(
        (n: Note) => n.id !== deleteNoteId
      );
      setSelectedId(remaining[0]?.id || null);


      const newSearchParams = new URLSearchParams(searchParams);
      if (remaining[0]?.id) {
        newSearchParams.set("note", remaining[0].id);
      } else {
        newSearchParams.delete("note");
      }
      router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    } catch (err) {

    }
    setDeleteNoteId(null);
  }, [deleteNoteId, deleteNoteMutation, notes, searchParams, router]);


  const handleExportNote = useCallback(async (note: Note) => {

    if (note.content) {
      setExportNoteState(note);
      setShowExportModal(true);
      return;
    }


    try {
      const response = await fetch(`/api/notes/${note.id}`);
      if (!response.ok) throw new Error("Failed to fetch note");
      const fullNote = await response.json();
      setExportNoteState(fullNote);
      setShowExportModal(true);
    } catch (error) {
      toast.error("Failed to load note for export");
    }
  }, []);


  const handleShareNote = useCallback(async (note: Note) => {

    if (note.content) {
      setShareNoteState(note);
      setShowShareModal(true);
      return;
    }


    try {
      const response = await fetch(`/api/notes/${note.id}`);
      if (!response.ok) throw new Error("Failed to fetch note");
      const fullNote = await response.json();
      setShareNoteState(fullNote);
      setShowShareModal(true);
    } catch (error) {
      toast.error("Failed to load note for sharing");
    }
  }, []);

  const handleInviteUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setInviteError("");


      const validationResult = inviteUserSchema.safeParse({
        email: inviteEmail,
        role: inviteRole,
      });

      if (!validationResult.success) {
        setInviteError(
          validationResult.error.issues?.[0]?.message || "Validation failed"
        );
        return;
      }

      const validatedData = validationResult.data;

      try {
        const result = await inviteUserMutation.mutateAsync({
          email: validatedData.email,
          role: validatedData.role as "admin" | "member",
          password: invitePassword || undefined,
        });

        toast.success(`User ${inviteEmail} invited successfully!`);


        if (result.password) {
          copyToClipboard(result.password);
          toast.success("Password copied to clipboard!");
        }

        setShowInviteForm(false);
        setInviteEmail("");
        setInviteRole("member");
        setInvitePassword("");
        setShowPassword(false);
        setInviteError("");
      } catch (err: any) {

        let errorMessage = "Failed to invite user";
        if (err && typeof err.json === "function") {
          try {
            const errorData = await err.json();
            errorMessage = errorData.error || errorMessage;
          } catch {

          }
        }
        setInviteError(errorMessage);
      }
    },
    [
      inviteEmail,
      inviteRole,
      invitePassword,
      inviteUserMutation,
      setInviteError,
      setShowInviteForm,
      setInviteEmail,
      setInviteRole,
      setInvitePassword,
      setShowPassword,
    ]
  );

  const handleLogout = useCallback(async () => {

    queryClient.clear();

    await toast.promise(signOut({ callbackUrl: "/" }), {
      loading: "Signing out...",
      success: "Signed out successfully",
      error: "Failed to sign out",
    });
  }, [queryClient]);


  const upgradingRef = useRef(false);
  const onUpgrade = useCallback(async () => {
    if (upgradingRef.current) return;
    upgradingRef.current = true;

    setShowConfetti(false);
    setConfettiFading(false);
    try {
      await toast.promise(upgradeTenantMutation.mutateAsync(tenant.slug), {
        loading: "Upgrading to Pro...",
        success: result => {



          const DURATION = 6000;
          const FADE_MS = 1000;

          if (confettiTimers.current.fade)
            clearTimeout(confettiTimers.current.fade);
          if (confettiTimers.current.hide)
            clearTimeout(confettiTimers.current.hide);

          setConfettiFading(false);
          setShowConfetti(true);

          confettiTimers.current.fade = setTimeout(
            () => setConfettiFading(true),
            DURATION - FADE_MS
          ) as unknown as number;

          confettiTimers.current.hide = setTimeout(() => {
            setShowConfetti(false);
            setConfettiFading(false);
          }, DURATION) as unknown as number;

          return "Upgraded to Pro successfully!";
        },
        error: async err => {
          if (err?.json) {
            try {
              const data = await err.json();
              return data.error || "Upgrade failed to process.";
            } catch {
              return "Upgrade failed to process.";
            }
          }
          return "Upgrade failed to process.";
        },
      });
    } catch (err) {

    }
    upgradingRef.current = false;
  }, [
    upgradeTenantMutation,
    tenant.slug,
    setConfettiFading,
    setShowConfetti,
    confettiTimers,
  ]);


  useEffect(() => {
    if (!showCreateForm) {
      setCreateNoteError("");
    }
  }, [showCreateForm]);

  useEffect(() => {
  }, [showInviteForm]);

  const handlePDFUpload = useCallback(async (file: File) => {
    if (limitReached) {
      toast.error("Upgrade to Pro to upload more files.");
      return;
    }
    if (createRestricted) {
      toast.error("An administrator has restricted file uploads for members.");
      return;
    }

    const toastId = toast.loading(`Processing ${file.type.startsWith("image/") ? "Image" : file.name.endsWith(".pdf") ? "PDF" : "Document"}...`);

    try {
      let noteContent: any[] = [];
      let tags = ["Imported"];

      if (file.type.startsWith("image/")) {

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const res = reader.result;
            if (typeof res === "string") resolve(res.split(",")[1] || "");
            else reject(new Error("Failed to read file"));
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;

        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            option: "summarize",
            context: "Describe this image in detail including any visible text, objects, and overall context.",
            fileData: base64,
            mimeType: file.type
          }),
        });

        if (!response.ok) throw new Error("Vision AI failed");

        const text = await response.text();
        noteContent = [
          { type: "paragraph", content: [{ type: "text", text: `[Image Description from ${file.name}]` }] },
          { type: "paragraph", content: [{ type: "text", text: text }] }
        ];
        tags.push("Image", "AI-Parsed");

      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/msword") {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        noteContent = result.value.split("\n\n").map(p => ({
          type: "paragraph",
          content: p.trim() ? [{ type: "text", text: p.trim() }] : []
        })).filter(p => (p.content?.length ?? 0) > 0);

        tags.push("Word", "Document");
      } else {

        const pdfLib = getPdfLib();
        if (!pdfLib) throw new Error("PDF library not loaded");

        pdfLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfLib.getDocument({ data: arrayBuffer }).promise;

        let totalLength = 0;
        const MAX_LENGTH = 15000;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const items = textContent.items as any[];
          if (items.length === 0) continue;

          const lines: { y: number, height: number, text: string }[] = [];
          let currentLine: { y: number, height: number, text: string } | null = null;
          items.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);

          for (const item of items) {
            if (!item.str?.trim()) continue;
            const y = item.transform[5];
            const height = item.height || 0;
            if (!currentLine || Math.abs(currentLine.y - y) > height / 2) {
              currentLine = { y, height, text: item.str };
              lines.push(currentLine);
            } else {
              currentLine.text += " " + item.str;
              if (height > currentLine.height) currentLine.height = height;
            }
          }

          let currentParagraph = "";
          let lastY = 0;
          for (let j = 0; j < lines.length; j++) {
            if (totalLength > MAX_LENGTH) break;
            const line = lines[j];
            if (!line) continue;
            const isHeading = line.height > 13;
            const isLargeGap = j > 0 && Math.abs(lastY - line.y) > line.height * 1.8;

            if (isHeading || isLargeGap) {
              if (currentParagraph.trim()) {
                noteContent.push({ type: "paragraph", content: [{ type: "text", text: currentParagraph.trim() }] });
                totalLength += currentParagraph.length;
                currentParagraph = "";
              }
              if (isHeading && totalLength <= MAX_LENGTH) {
                noteContent.push({ type: "heading", attrs: { level: line.height > 18 ? 2 : 3 }, content: [{ type: "text", text: line.text.trim() }] });
                totalLength += line.text.length;
              } else if (totalLength <= MAX_LENGTH) {
                currentParagraph = line.text;
              }
            } else {
              currentParagraph += (currentParagraph ? " " : "") + line.text;
            }
            lastY = line.y;
          }
          if (currentParagraph.trim() && totalLength <= MAX_LENGTH) {
            noteContent.push({ type: "paragraph", content: [{ type: "text", text: currentParagraph.trim() }] });
            totalLength += currentParagraph.length;
          }
          if (totalLength > MAX_LENGTH) break;
        }

        if (totalLength > MAX_LENGTH) {
          noteContent.push({ type: "paragraph", content: [{ type: "text", text: "... [Content truncated for chat context]" }] });
        }
        tags.push("PDF");
      }

      // 3. TITLE CLEANUP: Remove extensions and format title
      const cleanTitle = file.name
        .replace(/\.(pdf|csv|xlsx|xls|docx?|txt)$/i, "")
        .substring(0, 40);

      const noteData = {
        title: cleanTitle || "Imported Note",
        content: { type: "doc", content: noteContent },
        tags: tags
      };

      const result = await createNoteMutation.mutateAsync(noteData);
      handleSelectNote(result.id);
      toast.success(`File "${file.name}" imported and preserved as a Note!`, { id: toastId });
    } catch (err) {
      console.error("File processing error:", err);
      toast.error(`Failed to process ${file.name}`, { id: toastId });
    }
  }, [limitReached, createNoteMutation, handleSelectNote]);

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      { }
      {showConfetti && (
        <div
          className={`pointer-events-none fixed inset-0 z-40 transition-opacity duration-700 ${confettiFading ? "opacity-0" : "opacity-100"
            }`}
        >
          <React.Suspense fallback={null}>
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={400}
              gravity={0.15}
              colors={[
                "#10b981",
                "#3b82f6",
                "#8b5cf6",
                "#f59e0b",
                "#ef4444",
                "#ec4899",
              ]}
              tweenDuration={3000}
            />
          </React.Suspense>
        </div>
      )}

      <div style={{ display: "none" }}>
        <EasterEgg />
      </div>

      { }
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
            <DialogDescription>
              Add a new note to your collection.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter note title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            {createNoteError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{createNoteError}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={createNoteMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createNoteMutation.isPending}>
                {createNoteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Note"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      { }
      {user?.role === "admin" && (
        <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Add a new user to your tenant organization.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="Enter user email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="inviteRole">Role</Label>
                <Select
                  value={inviteRole}
                  onValueChange={value =>
                    setInviteRole(value as "admin" | "member")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="invitePassword">Password (Optional)</Label>
                  <button
                    type="button"
                    className="text-primary h-auto cursor-pointer p-0 text-sm font-bold"
                    onClick={() => setInvitePassword(generateRandomPassword())}
                  >
                    Generate
                  </button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="invitePassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Leave empty to generate random password"
                      value={invitePassword}
                      onChange={e => setInvitePassword(e.target.value)}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Toggle password visibility
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!invitePassword}
                        onClick={() => {
                          copyToClipboard(invitePassword);
                          toast.success("Password copied to clipboard!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy password</TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-muted-foreground text-xs">
                  If no password is provided, a secure random password will be
                  generated and copied to your clipboard.
                </p>
              </div>
              {inviteError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{inviteError}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteEmail("");
                    setInviteRole("member");
                    setInvitePassword("");
                    setShowPassword(false);
                    setInviteError("");
                  }}
                  disabled={inviteUserMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteUserMutation.isPending}>
                  {inviteUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Inviting...
                    </>
                  ) : (
                    "Invite User"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      { }
      <ExportModal
        open={showExportModal}
        onOpenChange={open => {
          setShowExportModal(open);
          if (!open) setExportNoteState(null);
        }}
        note={
          exportNote && exportNote.content
            ? (exportNote as { id: string; title: string; content: any })
            : null
        }
      />
      { }
      <ShareModal
        open={showShareModal}
        onOpenChange={open => {
          setShowShareModal(open);
          if (!open) setShareNoteState(null);
        }}
        note={
          shareNote && shareNote.content
            ? (shareNote as { id: string; title: string; content: any })
            : null
        }
      />

      <div className="flex h-svh w-full overflow-hidden">
        { }
        <aside className="bg-card hidden w-72 shrink-0 flex-col border-r md:flex">
          <SidebarContent
            notes={notes}
            notesLoading={notesLoading}
            notesError={notesError}
            tenant={tenant}
            user={user}
            tenantLoading={tenantLoading}
            limitReached={limitReached}
            selectedId={selectedId}
            onSelectNote={handleSelectNote}
            onCreateNote={onCreateNote}
            onDeleteNote={handleDeleteNote}
            onConfirmDelete={confirmDeleteNote}
            onInviteUser={onInviteUser}
            onUpgrade={onUpgrade}
            onLogout={handleLogout}
            deleteNoteId={deleteNoteId}
            setDeleteNoteId={setDeleteNoteId}
            deleteNotePending={deleteNoteMutation.isPending}
            onExportNote={handleExportNote}
            onShareNote={handleShareNote}
            onPDFUpload={handlePDFUpload}
          />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <Topbar
            limitReached={limitReached}
            canUpgrade={canUpgrade}
            onUpgrade={onUpgrade}
            tenant={tenant}
            user={user}
            tenantLoading={tenantLoading}
            onOpenSheet={() => setIsSheetOpen(!isSheetOpen)}
            isSheetOpen={isSheetOpen}
            onLogout={handleLogout}
          >
            { }
            <SheetContent side="left" className="w-72 gap-0 p-0">
              <SidebarContent
                notes={notes}
                notesLoading={notesLoading}
                notesError={notesError}
                tenant={tenant}
                user={user}
                tenantLoading={tenantLoading}
                limitReached={limitReached}
                selectedId={selectedId}
                onSelectNote={handleSelectNote}
                onCreateNote={onCreateNote}
                onDeleteNote={handleDeleteNote}
                onConfirmDelete={confirmDeleteNote}
                onInviteUser={onInviteUser}
                onUpgrade={onUpgrade}
                onLogout={handleLogout}
                deleteNoteId={deleteNoteId}
                setDeleteNoteId={setDeleteNoteId}
                deleteNotePending={deleteNoteMutation.isPending}
                onExportNote={handleExportNote}
                onShareNote={handleShareNote}
                onPDFUpload={handlePDFUpload}
              />
            </SheetContent>
          </Topbar>
          <div className="min-w-0 flex-1">
            {notesLoading || tenantLoading || status === "loading" ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 px-4 pb-2 pt-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <div className="flex-1 space-y-4 px-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ) : selectedId ? (
              <>
                <NoteEditorContainer
                  noteId={selectedId}
                  onNoteUpdate={updateNoteInList}
                  isDirty={isEditorDirty}
                  onDirtyChange={setIsEditorDirty}
                  onPDFUpload={handlePDFUpload}
                  onInviteUser={onInviteUser}
                  onExportNote={handleExportNote}
                  onShareNote={handleShareNote}
                  registerSaveFn={registerSaveFn}
                  isAdmin={user?.role === "admin"}
                  readOnly={editRestricted}
                />

                { }
                <AlertDialog
                  open={showUnsavedDialog}
                  onOpenChange={open => {
                    if (!open) {
                      setPendingSelectId(null);
                    }
                    setShowUnsavedDialog(open);
                  }}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                      <AlertDialogDescription>
                        You have unsaved changes. What would you like to do?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel
                        className="flex-1"
                        onClick={() => {
                          setShowUnsavedDialog(false);
                          setPendingSelectId(null);
                        }}
                      >
                        Stay on Note
                      </AlertDialogCancel>

                      <AlertDialogAction
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex-1"
                        disabled={isSavingInProgress}
                        onClick={async (e) => {
                          e.preventDefault();
                          if (saveCurrentNoteRef.current) {
                            try {
                              setIsSavingInProgress(true);
                              await saveCurrentNoteRef.current();
                              setIsSavingInProgress(false);
                              setShowUnsavedDialog(false);
                              if (pendingSelectId) {
                                handleSelectNoteProceed(pendingSelectId);
                              } else if (pendingAction === "create") {
                                setPendingAction(null);
                                setShowCreateForm(true);
                              }
                            } catch (err) {
                              setIsSavingInProgress(false);
                              toast.error("Failed to save changes.");
                            }
                          } else {
                            setShowUnsavedDialog(false);
                            if (pendingSelectId) {
                              handleSelectNoteProceed(pendingSelectId);
                            } else if (pendingAction === "create") {
                              setPendingAction(null);
                              setShowCreateForm(true);
                            }
                          }
                        }}
                      >
                        {isSavingInProgress ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save & Proceed"
                        )}
                      </AlertDialogAction>

                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90 text-white flex-1"
                        onClick={() => {
                          setIsEditorDirty(false);
                          setShowUnsavedDialog(false);
                          if (pendingSelectId) {
                            handleSelectNoteProceed(pendingSelectId);
                          } else if (pendingAction === "create") {
                            setPendingAction(null);
                            setShowCreateForm(true);
                          }
                        }}
                      >
                        Discard Changes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <div className="grid h-full place-items-center">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    Select or create a note
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </React.Suspense>
  );
}
