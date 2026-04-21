"use client";

import React, { useState } from "react";
import {
  Folder as FolderIcon,
  FileText,
  Calendar,
  ArrowRight,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@workspace/ui/lib/utils";

interface SharedFolderTreeProps {
  folderId: string;
  allFolders: any[];
  isRoot?: boolean;
  sharedFolderToken: string;
  depth?: number;
}

export function SharedFolderTree({
  folderId,
  allFolders,
  isRoot = false,
  sharedFolderToken,
  depth = 0,
}: SharedFolderTreeProps) {
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
    <div className={cn("flex flex-col gap-2", !isRoot && "mt-2")}>
      {!isRoot && (
        <button
          onClick={toggleOpen}
          className={cn(
            "group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300",
            isOpen
              ? "bg-primary/5 border-primary/20 ring-primary/10 shadow-sm ring-1"
              : "bg-card/50 hover:bg-card border-border hover:border-primary/20 backdrop-blur-sm"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500",
              isOpen
                ? "bg-primary shadow-primary/20 scale-110 text-white shadow-lg"
                : "bg-primary/10 text-primary group-hover:scale-105"
            )}
          >
            <FolderIcon
              className={cn(
                "size-5 transition-transform duration-500",
                isOpen && "rotate-12"
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-extrabold tracking-tight">
              {currentFolder.name}
            </h2>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase opacity-60">
                {notes.length} {notes.length === 1 ? "Note" : "Notes"}
              </span>
              <span className="bg-border h-1 w-1 rounded-full" />
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase opacity-60">
                {childFolders.length}{" "}
                {childFolders.length === 1 ? "Folder" : "Folders"}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "bg-muted/50 group-hover:bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300",
              isOpen && "bg-primary/10 text-primary rotate-180"
            )}
          >
            <ChevronDown className="size-4" />
          </div>
        </button>
      )}

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={
              isRoot
                ? { opacity: 1, height: "auto" }
                : { opacity: 0, height: 0, y: -10 }
            }
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "flex flex-col gap-4",
                !isRoot &&
                  "border-primary/10 relative ml-5 border-l-2 py-4 pl-6"
              )}
            >
              {!isRoot && (
                <div className="from-primary/20 via-primary/10 absolute top-0 left-[-2px] h-full w-[2px] bg-gradient-to-b to-transparent" />
              )}

              {/* Notes in this folder */}
              {notes.length > 0 && (
                <div className="flex flex-col gap-3">
                  {notes.map((note: any, index: number) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10, x: -5 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="group bg-card/40 hover:bg-card hover:border-primary/20 hover:shadow-primary/5 relative flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-xl sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="bg-primary/5 group-hover:bg-primary/10 shrink-0 rounded-xl p-3 transition-colors duration-300">
                          <FileText className="text-primary size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-foreground group-hover:text-primary truncate text-base font-bold tracking-tight transition-colors">
                            {note.title || "Untitled Note"}
                          </h3>
                          <div className="mt-1.5 flex items-center gap-4">
                            <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase opacity-70">
                              <Calendar className="size-3" />
                              {new Date(note.created_at).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </div>
                            {note.tags && note.tags.length > 0 && (
                              <div className="flex gap-2">
                                {note.tags
                                  .slice(0, 2)
                                  .map((tag: string, i: number) => (
                                    <span
                                      key={i}
                                      className="text-primary/60 bg-primary/5 rounded-md px-2 py-0.5 text-[9px] font-black tracking-tighter uppercase"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-border/50 mt-5 flex shrink-0 items-center justify-between gap-4 border-t pt-4 sm:mt-0 sm:ml-8 sm:justify-end sm:border-t-0 sm:pt-0">
                        <Link
                          href={`/s/f/${sharedFolderToken}/n/${note.id}`}
                          className="bg-foreground text-background hover:bg-primary shadow-foreground/10 hover:shadow-primary/20 flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-black tracking-widest shadow-lg transition-all duration-300 hover:scale-105 hover:text-white active:scale-95"
                        >
                          OPEN <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Child Folders */}
              {childFolders.length > 0 && (
                <div className="flex flex-col gap-2">
                  {childFolders.map((child, index) => (
                    <motion.div
                      key={child.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: (notes.length + index) * 0.05,
                        duration: 0.3,
                      }}
                    >
                      <SharedFolderTree
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
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="bg-primary/5 ring-primary/10 mb-6 rounded-full p-10 ring-1">
                    <FolderIcon className="text-primary size-12 animate-pulse opacity-40" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">
                    Nothing here yet
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-xs text-sm font-medium">
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
