import React from "react";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@workspace/ui/components/badge";
import {
  Folder as FolderIcon,
  FileText,
  Calendar,
  Share2,
  Globe,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { PublicFolderTree } from "@/components/public-folder-tree";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedFolderPage({ params }: PageProps) {
  const { token } = await params;

  const sharedFolder = await prisma.sharedFolder.findUnique({
    where: { token },
    include: {
      folder: {
        include: {
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

  // Fetch all folders and notes for this tenant to build the hierarchy
  const allFolders = await prisma.folder.findMany({
    where: { tenant_id: sharedFolder.folder.tenant_id },
    include: {
      notes: {
        orderBy: { created_at: "desc" },
        include: {
          author: { select: { name: true, image: true } },
          shared_note: true,
        },
      },
    },
  });

  const { folder } = sharedFolder;

  return (
    <div className="bg-background text-foreground selection:bg-primary/20 min-h-screen">
      <header className="bg-background/80 sticky top-0 z-10 w-full border-b backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <div className="bg-primary shadow-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-lg">
              <FolderIcon className="size-4 text-white" />
            </div>
            <span className="truncate text-sm font-semibold tracking-tight">
              {folder.tenant.name}'s Portfolio
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 md:gap-4">
            <div className="text-muted-foreground bg-primary/5 border-primary/10 flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-[10px] md:px-3 md:text-xs">
              <Globe className="text-primary size-3" />
              <span className="hidden sm:inline">Public Portfolio</span>
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

        <div className="mx-auto max-w-3xl">
          <PublicFolderTree
            folderId={folder.id}
            allFolders={allFolders}
            isRoot={true}
            sharedFolderToken={token}
          />
        </div>

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
