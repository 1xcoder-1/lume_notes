"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useSearchNotes } from "@/lib/api";
import { cn } from "@workspace/ui/lib/utils";
import type { Note } from "@/lib/api";
import { Input } from "@workspace/ui/components/input";
import { Kbd } from "@workspace/ui/components/kbd";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

interface SearchBarProps {
  onSelectNote: (id: string) => void;
  className?: string;
}


export const SearchBar = React.memo(function SearchBar({
  onSelectNote,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400); 
    return () => clearTimeout(timer);
  }, [query]);

  const {
    data: results = [],
    isLoading,
    isError,
  } = useSearchNotes(debouncedQuery, {});

  useEffect(() => {
    if (isError) {
      toast.error("Search failed. Try again later.");
    }
  }, [isError]);

  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectNote = (noteId: string) => {
    onSelectNote(noteId);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };



  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
    if (e.key === "ArrowDown" && results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search notes... (Ctrl + K)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => query && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg pl-9 pr-12 transition-all focus-visible:ring-primary/20 bg-background border-border/60 hover:border-border/80"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 transform items-center gap-1">
            {query && (
              <button
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {}
      {isOpen && query && (
        <div className="border-border bg-popover absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[400px] overflow-y-auto rounded-xl border-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {isLoading && (
            <div className="flex items-center justify-center px-4 py-8">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="text-muted-foreground px-4 py-8 text-center text-sm">
              <p>No notes found matching your criteria</p>
              <p className="mt-1 text-xs opacity-60">
                Try removing some filters or changing your keyword.
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="divide-border divide-y">
              {results.map((note: Note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  className="hover:bg-accent focus:bg-accent group w-full cursor-pointer px-4 py-3 text-left transition-all focus:outline-none"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                       <h4 className="line-clamp-1 text-sm font-semibold group-hover:text-primary transition-colors">
                        {note.title || "Untitled"}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] text-primary bg-primary/5 px-1 rounded border border-primary/10">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
