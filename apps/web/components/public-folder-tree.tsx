"use client";

import React, { useState } from "react";
import {
  Folder as FolderIcon,
  FileText,
  Calendar,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
  id: string;
  title: string | null;
  created_at: Date | string;
  tags: string[];
  shared_note?: {
    token: string;
  };
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  notes: Note[];
}

interface PublicFolderTreeProps {
  folderId: string;
  allFolders: any[];
  sharedFolderToken: string;
  isRoot?: boolean;
  depth?: number;
}

export function PublicFolderTree({
  folderId,
  allFolders,
  sharedFolderToken,
  isRoot = false,
  depth = 0,
}: PublicFolderTreeProps) {
  const [isOpen, setIsOpen] = useState(isRoot);

  const currentFolder = allFolders.find(f => f.id === folderId);
  if (!currentFolder) return null;

  const childFolders = allFolders.filter(f => f.parentId === folderId);
  const notes = currentFolder.notes || [];

  const toggleOpen = () => {
    if (!isRoot) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn("flex flex-col gap-3", !isRoot && "mt-1 md:mt-2")}>
      {!isRoot && (
        <button
          onClick={toggleOpen}
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all duration-300 md:p-3",
            isOpen
              ? "bg-primary/5 border-primary/20 ring-primary/10 shadow-sm ring-1"
              : "bg-card/20 hover:bg-card/50 border-border/50 hover:border-primary/30 shadow-sm backdrop-blur-sm"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-500",
              isOpen
                ? "bg-primary shadow-primary/20 text-white shadow-md"
                : "bg-primary/5 text-primary/40 group-hover:text-primary group-hover:bg-primary/10"
            )}
          >
            <FolderIcon
              className={cn(
                "size-3.5 transition-transform duration-500 md:size-4",
                isOpen && "rotate-3"
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold tracking-tight">
              {currentFolder.name}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-muted-foreground hidden text-[10px] font-bold tracking-widest uppercase opacity-40 sm:block">
              {notes.length + childFolders.length} items
            </span>
            <div
              className={cn(
                "bg-muted/30 group-hover:bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300",
                isOpen && "text-primary rotate-180"
              )}
            >
              <ChevronDown className="size-3 md:size-3.5" />
            </div>
          </div>
        </button>
      )}

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={
              isRoot
                ? { opacity: 1, height: "auto" }
                : { opacity: 0, height: 0, y: -5 }
            }
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "flex flex-col gap-3 md:gap-4",
                !isRoot &&
                  "border-primary/10 relative ml-4 border-l-2 py-2 pl-4 md:ml-5 md:py-4 md:pl-6"
              )}
            >
              {!isRoot && (
                <div className="from-primary/20 via-primary/10 absolute top-0 left-[-2px] h-full w-[2px] bg-gradient-to-b to-transparent" />
              )}

              {/* Notes in this folder */}
              {notes.length > 0 && (
                <div className="flex flex-col gap-2">
                  {notes.map((note: any, index: number) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10, x: -5 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                    >
                      <Link
                        href={`/s/f/${sharedFolderToken}/n/${note.id}`}
                        className="group bg-card/20 hover:bg-card/50 border-border/50 hover:border-primary/30 relative flex items-center justify-between rounded-xl border p-3 backdrop-blur-sm transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="text-primary/40 group-hover:text-primary shrink-0 transition-colors duration-300">
                            <FileText className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-foreground group-hover:text-primary truncate text-sm font-medium tracking-tight transition-colors">
                              {note.title || "Untitled Note"}
                            </h3>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-muted-foreground hidden text-[10px] font-medium opacity-50 sm:block">
                            {new Date(note.created_at).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                          <div className="bg-muted/30 group-hover:bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full transition-all group-hover:translate-x-0.5">
                            <ChevronRight className="text-muted-foreground group-hover:text-primary size-3.5" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Child Folders */}
              {childFolders.length > 0 && (
                <div className="flex flex-col gap-2 md:gap-3">
                  {childFolders.map((child, index) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: (notes.length + index) * 0.04,
                        duration: 0.3,
                      }}
                    >
                      <PublicFolderTree
                        folderId={child.id}
                        allFolders={allFolders}
                        sharedFolderToken={sharedFolderToken}
                        depth={depth + 1}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {isRoot && notes.length === 0 && childFolders.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center md:py-32">
                  <div className="bg-primary/5 ring-primary/10 mb-6 rounded-full p-8 ring-1 md:p-10">
                    <FolderIcon className="text-primary size-10 animate-pulse opacity-40 md:size-12" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight md:text-2xl">
                    Nothing here yet
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-xs px-4 text-xs font-medium md:text-sm">
                    This workspace is currently empty. Check back later for
                    updates.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
