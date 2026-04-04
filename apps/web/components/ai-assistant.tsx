"use client";

import React, { useState } from "react";

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

interface AIAssistantProps {
  editor: any;
  noteId?: string;
  context?: string;
  currentTags?: string[];
  onUpdateTags?: (tags: string[]) => void;
  disabled?: boolean;
}

export function AIAssistant({ editor, noteId, context, currentTags = [], onUpdateTags, disabled }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedRange, setAppliedRange] = useState<{ from: number, to: number } | null>(null);

  const handleAIAction = async (option: string, label: string) => {
    setSelectedOption(label);
    setCompletion("");
    setIsLoading(true);

    const selection = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to, " ");

    try {

      const isSelection = !!selectedText;
      // Filter out any image markers or placeholders to ensure AI stays text-focused
      let textToProcess = isSelection ? selectedText : editor.getText();
      textToProcess = textToProcess.replace(/\[Image:.*?\]/g, "").replace(/<img.*?>/g, "").trim();

      if (!textToProcess) {
         toast.error("No text found for AI to analyze. Note: AI ignores images.");
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
        toast.error("Global AI limit reached. Please wait a minute before trying again.");
      } else {
        toast.error("AI Assistant is having trouble. Please check connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };


  const applyAIResult = () => {
    if (!completion || (!appliedRange && selectedOption !== "Tag Note")) return;

    if (selectedOption === "Tag Note") {
      const tags = completion.split(",").map(t => t.trim()).filter(Boolean);
      onUpdateTags?.(tags);
    } else if (appliedRange) {
      editor.chain()
        .focus()
        .insertContentAt({ from: appliedRange.from, to: appliedRange.to }, completion)
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
            className="h-8 gap-1.5 shadow-sm transition-all hover:shadow-primary/20 hover:scale-[1.02]"
            disabled={disabled}
          >
            <Sparkles className="size-4 animate-pulse fill-primary-foreground/20" />
            <span className="text-xs font-semibold">Ask AI</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-96 p-0 border-primary/20 shadow-2xl bg-popover"
          align="start"
          sideOffset={8}
        >
          {!completion && !isLoading ? (
            <Command className="border-none shadow-none bg-transparent **:data-[slot=command-input-wrapper]:border-none">
              <CommandInput
                placeholder="What should AI do?"
                className="focus:ring-0 focus:border-none focus-visible:ring-0 focus-visible:outline-none border-none py-6 h-12"
              />
              <CommandList>
                <CommandEmpty>No actions found.</CommandEmpty>
                <CommandGroup heading="Quick Actions">
                  <CommandItem
                    onSelect={() => handleAIAction("improve", "Improve Writing")}
                    className="cursor-pointer"
                  >
                    <Type className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Improve Writing</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleAIAction("summarize", "Summarize Selection")}
                    className="cursor-pointer"
                  >
                    <AlignLeft className="mr-2 h-4 w-4 text-green-500" />
                    <span>Summarize Selection</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleAIAction("rewrite", "Professional Rewrite")}
                    className="cursor-pointer"
                  >
                    <Briefcase className="mr-2 h-4 w-4 text-purple-500" />
                    <span>Make it Professional</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleAIAction("brainstorm", "Brainstorm Ideas")}
                    className="cursor-pointer"
                  >
                    <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>Brainstorm Ideas</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleAIAction("grammar", "Fix Grammar")}
                    className="cursor-pointer"
                  >
                    <CheckCheck className="mr-2 h-4 w-4 text-red-500" />
                    <span>Fix Grammar</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => handleAIAction("translate", "Translate")}
                    className="cursor-pointer"
                  >
                    <Languages className="mr-2 h-4 w-4 text-indigo-500" />
                    <span>Translate</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          ) : (
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                    {selectedOption || "AI Result"}
                  </span>
                </div>
                {isLoading && <Loader2 className="size-3 animate-spin text-primary" />}
              </div>

              <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap italic bg-accent/30 p-3 rounded-lg border border-accent">
                {selectedOption === "Tag Note" && completion ? (
                  <div className="flex flex-wrap gap-1.5 not-italic">
                    {completion.split(",").map((tag, i) => (
                      <Badge key={i} variant="secondary" className="px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  completion || "Generating response..."
                )}
              </div>

              {!isLoading && completion && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={discardAIResult}
                    className="h-8 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="mr-1 size-3" />
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyAIResult}
                    className="h-8 text-xs bg-primary text-primary-foreground"
                  >
                    <Check className="mr-1 size-3" />
                    {selectedOption === "Tag Note" ? "Apply Tags" : "Replace / Insert"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
