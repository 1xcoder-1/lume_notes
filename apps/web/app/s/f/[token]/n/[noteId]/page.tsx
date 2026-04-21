import React from "react";
import { prisma } from "@/lib/db";
import { jsonToHtml } from "@/lib/export-utils";
import { notFound } from "next/navigation";
import { Badge } from "@workspace/ui/components/badge";
import { Tags, Calendar, Share2, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import "@/components/note-styles.css";
import { ThemeToggle } from "@/components/theme-toggle";

interface PageProps {
  params: Promise<{ token: string; noteId: string }>;
}

export default async function SharedFolderNotePage({ params }: PageProps) {
  const { token, noteId } = await params;

  // 1. Fetch the shared folder
  const sharedFolder = await prisma.sharedFolder.findUnique({
    where: { token },
    include: { folder: true },
  });

  if (!sharedFolder || !sharedFolder.is_public) {
    notFound();
  }

  if (
    sharedFolder.expires_at &&
    new Date(sharedFolder.expires_at) < new Date()
  ) {
    notFound();
  }

  // 2. Fetch the note
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: { author: { select: { name: true } } },
  });

  if (!note) {
    notFound();
  }

  // 3. Verify the note is a descendant of the shared folder
  // We'll fetch all ancestor folders of the note to see if the shared folder is among them
  let isDescendant = false;
  let currentFolderId = note.folderId;

  // Simple iterative check for ancestors (limit depth to 20 to avoid loops)
  for (let i = 0; i < 20; i++) {
    if (!currentFolderId) break;
    if (currentFolderId === sharedFolder.folder_id) {
      isDescendant = true;
      break;
    }
    const parentFolder = await prisma.folder.findUnique({
      where: { id: currentFolderId },
      select: { parentId: true },
    });
    currentFolderId = parentFolder?.parentId || null;
  }

  if (!isDescendant) {
    notFound();
  }

  const contentHtml = jsonToHtml(note.content, undefined, false);

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 min-h-screen">
      <header className="bg-background/80 sticky top-0 z-10 w-full border-b backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={`/s/f/${token}`}
              className="hover:bg-accent flex shrink-0 items-center gap-2 rounded-md px-2 py-1 transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden text-sm font-semibold tracking-tight sm:inline">
                Back to Portfolio
              </span>
              <span className="text-sm font-semibold tracking-tight sm:hidden">
                Back
              </span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            <div className="text-muted-foreground bg-primary/5 border-primary/10 hover:bg-primary/10 flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px] transition-colors md:px-3 md:text-xs">
              <Globe className="text-primary size-3" />
              <span className="hidden sm:inline">Public View Only</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-4xl px-4 py-12 duration-700 md:px-6 md:py-20">
        <div className="mb-12 space-y-4">
          <h1 className="text-foreground text-3xl leading-[1.1] font-extrabold tracking-tight md:text-5xl">
            {note.title}
          </h1>

          <div className="text-muted-foreground flex items-center gap-4 text-[10px] font-medium tracking-widest uppercase opacity-70 md:text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3 md:size-4" />
              {new Date(note.created_at).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="border-border/50 flex flex-wrap items-center gap-2 border-b pb-8">
              {note.tags.map((tag: string, i: number) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-primary/5 text-primary hover:bg-primary border-primary/10 cursor-default px-3 py-1 text-[9px] font-bold tracking-wide uppercase transition-all hover:text-white md:text-[11px]"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <article className="max-w-none">
          <div
            className="tiptap animate-in fade-in slide-in-from-bottom-2 delay-150 duration-1000"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>

        <footer className="mt-20 border-t pt-12 pb-24 text-center">
          <p className="text-muted-foreground flex flex-col items-center gap-4 text-sm">
            <span className="font-serif italic opacity-60">
              Note generated by Lume Notes
            </span>
            <a
              href="/"
              className="bg-foreground text-background shadow-foreground/10 rounded-full px-6 py-2.5 text-xs font-bold tracking-wide shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              GET STARTED FOR FREE
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
