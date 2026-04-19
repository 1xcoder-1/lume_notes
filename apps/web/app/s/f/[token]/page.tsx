import React from "react";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@workspace/ui/components/badge";
import {
  Folder,
  FileText,
  Calendar,
  Share2,
  Globe,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedFolderPage({ params }: PageProps) {
  const { token } = await params;

  // @ts-ignore
  const sharedFolder = await prisma.sharedFolder.findUnique({
    where: { token },
    include: {
      folder: {
        include: {
          notes: {
            orderBy: { created_at: "desc" },
            include: {
              author: { select: { name: true, image: true } },
              shared_note: true,
            },
          },
          tenant: true,
        },
      },
    },
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

  const { folder } = sharedFolder;

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 min-h-screen">
      <header className="bg-background/80 sticky top-0 z-10 w-full border-b backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary shadow-primary/20 flex h-8 w-8 items-center justify-center rounded-lg shadow-lg">
              <Folder className="size-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              {folder.tenant.name}'s Portfolio
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-muted-foreground bg-primary/5 border-primary/10 flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs">
              <Globe className="text-primary size-3" />
              Public Portfolio
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-5xl px-6 py-12 duration-700 md:py-20">
        <div className="mb-16 space-y-4 text-center">
          <h1 className="text-foreground text-4xl leading-[1.1] font-extrabold tracking-tight md:text-6xl">
            {folder.name}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            A collection of thoughts, notes, and resources curated by{" "}
            {folder.tenant.name}.
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-4">
          {folder.notes.map((note: any) => (
            <div
              key={note.id}
              className="group bg-card hover:border-primary/20 relative flex flex-col justify-between rounded-xl border p-4 transition-all hover:shadow-md sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="bg-primary/10 shrink-0 rounded-lg p-2">
                  <FileText className="text-primary size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-foreground truncate text-base font-bold tracking-tight">
                    {note.title || "Untitled Note"}
                  </h3>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium tracking-wider uppercase">
                      <Calendar className="size-3" />
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1.5">
                        {note.tags.slice(0, 2).map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="text-primary text-[10px] font-bold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex shrink-0 items-center justify-between gap-4 border-t pt-3 sm:mt-0 sm:ml-6 sm:justify-end sm:border-t-0 sm:pt-0">
                {note.shared_note ? (
                  <Link
                    href={`/s/${note.shared_note.token}`}
                    className="text-primary bg-primary/5 hover:bg-primary/10 flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all"
                  >
                    Read Note <ArrowRight className="size-3" />
                  </Link>
                ) : (
                  <Badge variant="outline" className="text-[10px] opacity-40">
                    Private
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {folder.notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-muted mb-4 rounded-full p-6">
              <Share2 className="text-muted-foreground size-10 opacity-20" />
            </div>
            <h3 className="text-xl font-bold">Empty Portfolio</h3>
            <p className="text-muted-foreground">
              This folder doesn't contain any notes yet.
            </p>
          </div>
        )}

        <footer className="mt-32 border-t pt-16 pb-24 text-center">
          <p className="text-muted-foreground flex flex-col items-center gap-4 text-sm">
            <span className="font-serif italic opacity-60">
              Powered by Lume Notes
            </span>
            <a
              href="/"
              className="bg-foreground text-background shadow-foreground/10 rounded-full px-8 py-3 text-xs font-bold tracking-wide shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              CREATE YOUR OWN PORTFOLIO
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
