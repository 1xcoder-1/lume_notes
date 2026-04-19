"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Check,
  X,
  Type,
  Briefcase,
  Lightbulb,
  AlignLeft,
  ChevronRight,
  Tags,
  ListChecks,
  ArrowDownToLine,
  CheckCheck,
  Languages,
  Zap,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command";
import { toast } from "sonner";
import { cn } from "@workspace/ui/lib/utils";

interface AIAssistantProps {
  editor: any;
  noteId?: string;
  context?: string;
  currentTags?: string[];
  onUpdateTags?: (tags: string[]) => void;
  disabled?: boolean;
}

export function AIAssistant({
  editor,
  noteId,
  context,
  currentTags = [],
  onUpdateTags,
  disabled,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [appliedRange, setAppliedRange] = useState<{
    from: number;
    to: number;
  } | null>(null);

  const handleAIAction = async (option: string, label: string) => {
    setSelectedOption(label);
    setCompletion("");
    setIsLoading(true);

    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(
      selection.from,
      selection.to,
      " "
    );

    try {
      const isSelection = !!selectedText;
      let textToProcess = isSelection ? selectedText : editor.getText();
      textToProcess = textToProcess
        .replace(/\[Image:.*?\]/g, "")
        .replace(/<img.*?>/g, "")
        .trim();

      if (!textToProcess) {
        toast.error(
          "No text found for AI to analyze. Note: AI ignores images."
        );
        return;
      }

      if (isSelection) {
        setAppliedRange({ from: selection.from, to: selection.to });
      } else {
        setAppliedRange({ from: 0, to: editor.state.doc.content.size });
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          option,
          context: textToProcess,
          prompt: label,
        }),
      });

      if (response.status === 429) {
        throw new Error("RATE_LIMIT");
      }

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to read stream");
      }

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setCompletion(prev => prev + chunk);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      if (error.message === "RATE_LIMIT") {
        toast.error(
          "Global AI limit reached. Please wait a minute before trying again."
        );
      } else {
        toast.error("AI Assistant is having trouble. Please check connection.");
      }
    } finally {
      setIsLoading(false);
      setInputValue("");
    }
  };

  const applyAIResult = () => {
    if (!completion || (!appliedRange && selectedOption !== "Tag Note")) return;

    if (selectedOption === "Tag Note") {
      const tags = completion
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);
      onUpdateTags?.(tags);
    } else if (appliedRange) {
      editor
        .chain()
        .focus()
        .insertContentAt(
          { from: appliedRange.from, to: appliedRange.to },
          completion
        )
        .run();
    }

    setCompletion("");
    setSelectedOption(null);
    setAppliedRange(null);
    setIsOpen(false);
    toast.success("AI changes applied!");
  };

  const discardAIResult = () => {
    setCompletion("");
    setSelectedOption(null);
    setAppliedRange(null);
  };

  return (
    <div className="flex items-center gap-1">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className={cn(
              "group relative h-8 gap-1.5 overflow-hidden rounded-lg px-4 font-semibold transition-all duration-300",
              "bg-primary text-primary-foreground hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(var(--primary),0.5)] active:scale-95"
            )}
            disabled={disabled}
          >
            <div className="group-hover:animate-shimmer absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent" />
            <Sparkles className="size-3.5 animate-pulse fill-current" />
            <span className="text-[11px] tracking-tight">Ask AI</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-primary/20 bg-background/95 w-[420px] overflow-hidden rounded-2xl p-0 shadow-2xl backdrop-blur-xl"
          align="start"
          sideOffset={12}
        >
          <AnimatePresence mode="wait">
            {!completion && !isLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Command className="border-none bg-transparent shadow-none **:data-[slot=command-input-wrapper]:border-none">
                  <div className="border-primary/10 relative flex items-center border-b px-3">
                    <Zap className="text-primary size-4 opacity-50" />
                    <CommandInput
                      placeholder="What should I do with this text?"
                      value={inputValue}
                      onValueChange={setInputValue}
                      onKeyDown={e => {
                        if (e.key === "Enter" && inputValue) {
                          handleAIAction("custom", inputValue);
                        }
                      }}
                      className="placeholder:text-muted-foreground/50 h-12 border-none py-6 font-medium focus:border-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                    />
                    <div className="text-muted-foreground/30 flex items-center gap-1 font-mono text-[10px]">
                      <kbd className="bg-muted rounded px-1">ENTER</kbd>
                    </div>
                  </div>
                  <CommandList className="max-h-[340px] p-2">
                    <CommandEmpty className="text-muted-foreground py-10 text-center text-sm">
                      No actions found.
                    </CommandEmpty>
                    {inputValue && (
                      <CommandGroup heading="Custom Action">
                        <CommandItem
                          onSelect={() => handleAIAction("custom", inputValue)}
                          className="bg-primary/5 hover:bg-primary/10 mb-2 cursor-pointer rounded-xl p-3 transition-colors"
                        >
                          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                            <Sparkles className="text-primary size-4 animate-pulse" />
                          </div>
                          <div className="ml-3 flex flex-col">
                            <span className="text-sm font-bold">
                              Ask AI to:
                            </span>
                            <span className="text-muted-foreground truncate text-xs">
                              {inputValue}
                            </span>
                          </div>
                          <ChevronRight className="ml-auto size-4 opacity-30" />
                        </CommandItem>
                      </CommandGroup>
                    )}
                    <CommandGroup heading="Intelligent Actions">
                      <div className="grid grid-cols-2 gap-1.5 p-1">
                        <CommandItem
                          onSelect={() =>
                            handleAIAction("improve", "Improve Writing")
                          }
                          className="hover:bg-accent group cursor-pointer rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                            <Type className="size-4" />
                          </div>
                          <span className="ml-3 text-xs font-semibold">
                            Improve Writing
                          </span>
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAIAction("summarize", "Summarize Selection")
                          }
                          className="hover:bg-accent group cursor-pointer rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
                            <AlignLeft className="size-4" />
                          </div>
                          <span className="ml-3 text-xs font-semibold">
                            Summarize
                          </span>
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAIAction("rewrite", "Professional Rewrite")
                          }
                          className="hover:bg-accent group cursor-pointer rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 transition-colors group-hover:bg-purple-500 group-hover:text-white">
                            <Briefcase className="size-4" />
                          </div>
                          <span className="ml-3 text-xs font-semibold">
                            Professional
                          </span>
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAIAction("brainstorm", "Brainstorm Ideas")
                          }
                          className="hover:bg-accent group cursor-pointer rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                            <Lightbulb className="size-4" />
                          </div>
                          <span className="ml-3 text-xs font-semibold">
                            Brainstorm
                          </span>
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAIAction("grammar", "Fix Grammar")
                          }
                          className="hover:bg-accent group cursor-pointer rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 transition-colors group-hover:bg-rose-500 group-hover:text-white">
                            <CheckCheck className="size-4" />
                          </div>
                          <span className="ml-3 text-xs font-semibold">
                            Fix Grammar
                          </span>
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAIAction("translate", "Translate")
                          }
                          className="hover:bg-accent group cursor-pointer rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-95"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                            <Languages className="size-4" />
                          </div>
                          <span className="ml-3 text-xs font-semibold">
                            Translate
                          </span>
                        </CommandItem>
                      </div>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex max-h-[500px] flex-col overflow-hidden"
              >
                <div className="border-primary/10 bg-muted/30 flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-md">
                      <Sparkles className="text-primary size-3 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.1em] uppercase opacity-60">
                      {selectedOption || "AI Result"}
                    </span>
                  </div>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-pulse text-[10px] font-medium opacity-50">
                        Thinking...
                      </span>
                      <Loader2 className="text-primary size-3 animate-spin" />
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/20 bg-emerald-500/10 text-[9px] font-bold text-emerald-500 uppercase"
                    >
                      Complete
                    </Badge>
                  )}
                </div>

                <div className="custom-scrollbar relative min-h-[120px] overflow-y-auto p-5">
                  {isLoading && (
                    <motion.div
                      initial={{ top: 0 }}
                      animate={{ top: "100%" }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="via-primary absolute left-0 z-20 h-px w-full bg-linear-to-r from-transparent to-transparent opacity-50 shadow-[0_0_10px_rgba(var(--primary),1)]"
                    />
                  )}

                  <div className="text-foreground/90 relative z-10 font-mono text-[13px] leading-[1.8] whitespace-pre-wrap">
                    {selectedOption === "Tag Note" && completion ? (
                      <div className="flex flex-wrap gap-2 py-2">
                        {completion.split(",").map((tag, i) => (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: i * 0.05,
                              type: "spring",
                              stiffness: 300,
                            }}
                            key={i}
                          >
                            <Badge
                              variant="secondary"
                              className="bg-primary/5 text-primary border-primary/20 px-3 py-1 text-xs font-bold"
                            >
                              #{tag.trim()}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      completion || (
                        <div className="space-y-3 py-4">
                          <div className="bg-primary/5 h-3 w-[95%] animate-pulse rounded-full" />
                          <div className="bg-primary/5 h-3 w-[80%] animate-pulse rounded-full" />
                          <div className="bg-primary/5 h-3 w-[85%] animate-pulse rounded-full" />
                          <div className="bg-primary/5 h-3 w-[60%] animate-pulse rounded-full" />
                        </div>
                      )
                    )}
                  </div>
                </div>

                {!isLoading && completion && (
                  <div className="border-primary/10 bg-muted/20 flex items-center justify-between gap-3 border-t p-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={discardAIResult}
                      className="text-muted-foreground h-9 rounded-xl px-4 text-xs font-bold transition-all hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <RotateCcw className="mr-2 size-3.5" />
                      Retry
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        className="text-muted-foreground h-9 rounded-xl px-4 text-xs font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={applyAIResult}
                        className="bg-primary text-primary-foreground hover:shadow-primary/30 h-9 rounded-xl px-5 text-xs font-black shadow-lg transition-all hover:scale-[1.05] active:scale-95"
                      >
                        <Check className="mr-2 size-3.5" />
                        {selectedOption === "Tag Note"
                          ? "Apply Tags"
                          : "Replace Content"}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </div>
  );
}
