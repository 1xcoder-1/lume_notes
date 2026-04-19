import {
  useEffect,
  useState,
  useRef,
  useMemo,
  Fragment,
  useCallback,
  memo,
} from "react";
import { EditorContent, useEditor, BubbleMenu } from "@tiptap/react";
import { Sparkles } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@workspace/ui/components/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Undo,
  Redo,
  Save,
  ListChecks,
  Link,
  MoreHorizontal,
  Heading,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Underline,
  Superscript,
  Subscript,
  ChevronDown,
  Minus,
  PanelLeft,
  UserPlus,
  Heading1,
  Heading2,
  Heading3,
  Check,
  Table as TableIcon,
  Image as ImageIcon,
  Wand2,
  Upload,
  Download,
  Share2,
  Loader2,
  History,
} from "lucide-react";
import { AIAssistant } from "./ai-assistant";
import { NoteHistoryModal } from "./note-history-modal";
import { useUpdateNote } from "@/lib/api";
import { toast } from "sonner";
// @ts-ignore
import "./note-styles.css";
import { cn } from "@workspace/ui/lib/utils";

const ToolbarItem = memo(
  ({ tool, isVisible }: { tool: any; isVisible: boolean }) => {
    return isVisible ? <>{tool.jsx}</> : null;
  }
);

const ToolbarDropdownItem = memo(({ tool }: { tool: any }) => {
  return <>{tool.dropdownJsx}</>;
});

const SelectionObserver = memo(
  ({ editor, onUpdate }: { editor: any; onUpdate: () => void }) => {
    useEffect(() => {
      const handleUpdate = () => onUpdate();
      editor.on("update", handleUpdate);
      editor.on("selectionUpdate", handleUpdate);
      return () => {
        editor.off("update", handleUpdate);
        editor.off("selectionUpdate", handleUpdate);
      };
    }, [editor, onUpdate]);
    return null;
  }
);

export type ToolbarProps = {
  editor: any;
  noteId?: string;
  tags?: string[];
  onUpdateTags?: (tags: string[]) => void;
  onPDFUpload?: (file: File) => void;
  onInviteUser?: () => void;
  onShareNote?: (note: any) => void;
  onExportNote?: (note: any) => void;
  onSave: () => void | Promise<void>;
  onToggleLeftSidebar?: () => void;
  isLeftSidebarOpen?: boolean;
  activeUsers?: readonly any[];
  readOnly?: boolean;
  saving?: boolean;
  disabled?: boolean;
  isDirty?: boolean;
  canShare?: boolean;
  canRestore?: boolean;
  currentContent?: any;
  onShowGraph?: () => void;
};

export function Toolbar({
  editor,
  noteId,
  tags = [],
  onUpdateTags,
  onPDFUpload,
  onInviteUser,
  onShareNote,
  onExportNote,
  onSave,
  onToggleLeftSidebar,
  isLeftSidebarOpen,
  activeUsers = [] as readonly any[],
  readOnly = false,
  saving = false,
  disabled = false,
  isDirty = false,
  canShare = true,
  canRestore = true,
  currentContent,
  onShowGraph,
}: ToolbarProps) {
  if (!editor) return null;

  const [linkUrl, setLinkUrl] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isHighlightPopoverOpen, setIsHighlightPopoverOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const [visibleItemsCount, setVisibleItemsCount] = useState(20);

  useEffect(() => {
    if (isPopoverOpen) {
      const attrs = editor.getAttributes("link");
      setLinkUrl(attrs.href || "");
    }
  }, [isPopoverOpen, editor]);

  const [updateCounter, setUpdateCounter] = useState(0);
  const triggerUpdate = useCallback(() => setUpdateCounter(c => c + 1), []);

  const updateNoteMutation = useUpdateNote();

  const handleUpdateTags = async (newTags: string[]) => {
    if (!noteId) return;
    try {
      await toast.promise(
        updateNoteMutation.mutateAsync({
          id: noteId,
          data: { tags: newTags },
        }),
        {
          loading: "Updating tags...",
          success: "Tags updated!",
          error: "Failed to update tags",
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width) {
        const avgItemWidth = 42;
        const count = Math.floor(width / avgItemWidth);
        setVisibleItemsCount(Math.max(0, count));
      }
    });

    observer.observe(toolbar);

    return () => {
      observer.disconnect();
    };
  }, []);

  const itemCls = (active: boolean) =>
    "h-8 px-2 text-xs border rounded-md " +
    (active
      ? "bg-primary/10 border-primary text-primary"
      : "bg-card hover:bg-accent/60");

  const allTools = useMemo(
    () => [
      {
        id: "undo",
        jsx: (
          <Tooltip key="undo">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(false)}
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo() || disabled}
                aria-label="Undo"
              >
                <Undo className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || readOnly || saving}
          >
            <Undo className="mr-2 size-4" /> Undo
          </DropdownMenuItem>
        ),
      },
      {
        id: "redo",
        jsx: (
          <Tooltip key="redo">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(false)}
                onClick={() => editor.chain().focus().redo().run()}
                disabled={
                  !editor.can().redo() || disabled || readOnly || saving
                }
                aria-label="Redo"
              >
                <Redo className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || readOnly || saving}
          >
            <Redo className="mr-2 size-4" /> Redo
          </DropdownMenuItem>
        ),
      },
      {
        id: "divider-1",
        jsx: <div key="divider-1" className="bg-border mx-1 h-5 w-px" />,
        dropdownJsx: <DropdownMenuSeparator key="d-sep-1" />,
      },
      {
        id: "headings",
        jsx: (
          <DropdownMenu key="headings">
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={itemCls(editor.isActive("heading"))}
                    aria-label="Headings"
                    style={{ width: "36px", gap: "1px" }}
                    disabled={disabled || readOnly || saving}
                  >
                    {editor.isActive("heading", { level: 1 }) ? (
                      <span
                        className={`text-xs font-bold ${editor.isActive("heading") ? "text-primary" : ""}`}
                      >
                        H1
                      </span>
                    ) : editor.isActive("heading", { level: 2 }) ? (
                      <span
                        className={`text-xs font-bold ${editor.isActive("heading") ? "text-primary" : ""}`}
                      >
                        H2
                      </span>
                    ) : editor.isActive("heading", { level: 3 }) ? (
                      <span
                        className={`text-xs font-bold ${editor.isActive("heading") ? "text-primary" : ""}`}
                      >
                        H3
                      </span>
                    ) : (
                      <Heading
                        className={`size-4 ${editor.isActive("heading") ? "text-primary" : ""}`}
                      />
                    )}
                    <ChevronDown className="ml-0 size-2 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Headings</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
              >
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
              >
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
              >
                Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        dropdownJsx: (
          <Fragment key="headings-dropdown">
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              disabled={disabled || readOnly || saving}
            >
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              disabled={disabled || readOnly || saving}
            >
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              disabled={disabled || readOnly || saving}
            >
              Heading 3
            </DropdownMenuItem>
          </Fragment>
        ),
      },
      {
        id: "lists",
        jsx: (
          <DropdownMenu key="lists">
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={itemCls(
                      editor.isActive("bulletList") ||
                        editor.isActive("orderedList") ||
                        editor.isActive("taskList")
                    )}
                    aria-label="Lists"
                    style={{ width: "36px", gap: "1px" }}
                    disabled={disabled || readOnly || saving}
                  >
                    {editor.isActive("bulletList") ? (
                      <List
                        className={`size-4 ${editor.isActive("bulletList") ? "text-primary" : ""}`}
                      />
                    ) : editor.isActive("orderedList") ? (
                      <ListOrdered
                        className={`size-4 ${editor.isActive("orderedList") ? "text-primary" : ""}`}
                      />
                    ) : editor.isActive("taskList") ? (
                      <ListChecks
                        className={`size-4 ${editor.isActive("taskList") ? "text-primary" : ""}`}
                      />
                    ) : (
                      <List
                        className={`size-4 ${editor.isActive("bulletList") || editor.isActive("orderedList") || editor.isActive("taskList") ? "text-primary" : ""}`}
                      />
                    )}
                    <ChevronDown className="ml-0 size-2 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Lists</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="mr-2 size-4" />
                Bullet List
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="mr-2 size-4" />
                Numbered List
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => editor.chain().focus().toggleTaskList().run()}
              >
                <ListChecks className="mr-2 size-4" />
                Task List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        dropdownJsx: (
          <Fragment key="lists-dropdown">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={disabled || readOnly || saving}
            >
              <List className="mr-2 size-4" />
              Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={disabled || readOnly || saving}
            >
              <ListOrdered className="mr-2 size-4" />
              Numbered List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              disabled={disabled || readOnly || saving}
            >
              <ListChecks className="mr-2 size-4" />
              Task List
            </DropdownMenuItem>
          </Fragment>
        ),
      },
      {
        id: "blockquote",
        jsx: (
          <Tooltip key="blockquote">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive("blockquote"))}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                aria-label="Quote"
                disabled={disabled || readOnly || saving}
              >
                <Quote
                  className={`size-4 ${editor.isActive("blockquote") ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quote</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="blockquote-dropdown"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled || readOnly || saving}
          >
            <Quote className="mr-2 size-4" />
            Quote
          </DropdownMenuItem>
        ),
      },
      {
        id: "codeblock",
        jsx: (
          <Tooltip key="codeblock">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive("codeBlock"))}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                aria-label="Code Block"
                disabled={disabled || readOnly || saving}
              >
                <Code2
                  className={`size-4 ${editor.isActive("codeBlock") ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="codeblock-dropdown"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            disabled={disabled || readOnly || saving}
          >
            <Code2 className="mr-2 size-4" />
            Code Block
          </DropdownMenuItem>
        ),
      },
      {
        id: "divider",
        jsx: (
          <Tooltip key="divider">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive("horizontalRule"))}
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                aria-label="Divider"
                disabled={disabled || readOnly || saving}
              >
                <Minus
                  className={`size-4 ${editor.isActive("horizontalRule") ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Divider</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="divider-dropdown"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={disabled || readOnly || saving}
          >
            <Minus className="mr-2 size-4" />
            Divider
          </DropdownMenuItem>
        ),
      },
      {
        id: "divider-2",
        jsx: <div key="divider-2" className="bg-border mx-1 h-5 w-px" />,
        dropdownJsx: <DropdownMenuSeparator key="d-sep-2" />,
      },
      {
        id: "bold",
        jsx: (
          <Tooltip key="bold">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive("bold"))}
                onClick={() => editor.chain().focus().toggleBold().run()}
                aria-label="Bold"
                disabled={disabled || readOnly || saving}
              >
                <Bold
                  className={`size-4 ${editor.isActive("bold") ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="bold-dropdown"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled || readOnly || saving}
          >
            <Bold className="mr-2 size-4" />
            Bold
          </DropdownMenuItem>
        ),
      },
      {
        id: "italic",
        jsx: (
          <Tooltip key="italic">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive("italic"))}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Italic"
                disabled={disabled || readOnly || saving}
              >
                <Italic
                  className={`size-4 ${editor.isActive("italic") ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="italic-dropdown"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled || readOnly || saving}
          >
            <Italic className="mr-2 size-4" />
            Italic
          </DropdownMenuItem>
        ),
      },
      {
        id: "highlight",
        jsx: (
          <Popover
            key="highlight"
            open={isHighlightPopoverOpen}
            onOpenChange={setIsHighlightPopoverOpen}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={itemCls(editor.isActive("highlight"))}
                    aria-label="Highlight"
                    disabled={disabled || readOnly || saving}
                  >
                    <Highlighter
                      className={`size-4 ${editor.isActive("highlight") ? "text-primary" : ""}`}
                    />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Highlight</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-64">
              <div className="space-y-4">
                <Label>Highlight Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    "#78350f",
                    "#92400e",
                    "#b45309",
                    "#b91c1c",
                    "#9d174d",
                    "#5b21b6",
                    "#1d4ed8",
                    "#065f46",
                    "#374151",
                    "#064e3b",
                    "#312e81",
                    "#000000",
                  ].map(color => (
                    <button
                      key={color}
                      className="hover:border-ring h-8 w-8 rounded border-2 border-transparent transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color }).run();
                        setIsHighlightPopoverOpen(false);
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run();
                      setIsHighlightPopoverOpen(false);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="highlight-dropdown"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            disabled={disabled || readOnly || saving}
          >
            <Highlighter className="mr-2 size-4" />
            Highlight
          </DropdownMenuItem>
        ),
      },
      {
        id: "code",
        jsx: (
          <Tooltip key="code">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive("code"))}
                onClick={() => editor.chain().focus().toggleCode().run()}
                aria-label="Inline Code"
                disabled={disabled || readOnly || saving}
              >
                <Code
                  className={`size-4 ${editor.isActive("code") ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inline Code</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="code-dropdown"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={disabled || readOnly || saving}
          >
            <Code className="mr-2 size-4" />
            Inline Code
          </DropdownMenuItem>
        ),
      },
      {
        id: "underline",
        jsx: (
          <Tooltip key="underline">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive("underline"))}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                aria-label="Underline"
                disabled={disabled || readOnly || saving}
              >
                <Underline
                  className={`size-4 ${editor.isActive("underline") ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="underline-dropdown"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={disabled || readOnly || saving}
          >
            <Underline className="mr-2 size-4" />
            Underline
          </DropdownMenuItem>
        ),
      },
      {
        id: "strike",
        jsx: (
          <Tooltip key="strike">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive("strike"))}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                aria-label="Strikethrough"
                disabled={disabled || readOnly || saving}
              >
                <Strikethrough
                  className={`size-4 ${editor.isActive("strike") ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="strike-dropdown"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={disabled || readOnly || saving}
          >
            <Strikethrough className="mr-2 size-4" />
            Strikethrough
          </DropdownMenuItem>
        ),
      },
      {
        id: "link",
        jsx: (
          <Popover
            key="link"
            open={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={itemCls(editor.isActive("link"))}
                    aria-label="Link"
                    disabled={disabled || readOnly || saving}
                  >
                    <Link
                      className={`size-4 ${editor.isActive("link") ? "text-primary" : ""}`}
                    />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>Link</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      editor.chain().focus().unsetLink().run();
                      setIsPopoverOpen(false);
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (linkUrl) {
                        editor.chain().focus().setLink({ href: linkUrl }).run();
                      }
                      setIsPopoverOpen(false);
                    }}
                  >
                    Set Link
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="link-dropdown"
            onClick={() => {
              setIsPopoverOpen(true);
            }}
            disabled={disabled || readOnly || saving}
          >
            <Link className="mr-2 size-4" />
            Link
          </DropdownMenuItem>
        ),
      },
      {
        id: "divider-3",
        jsx: <div key="divider-3" className="bg-border mx-1 h-5 w-px" />,
        dropdownJsx: <DropdownMenuSeparator key="d-sep-3" />,
      },
      {
        id: "superscript",
        jsx: (
          <Tooltip key="superscript">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive("superscript"))}
                onClick={() => {
                  if (editor.can().toggleSuperscript?.()) {
                    editor.chain().focus().toggleSuperscript().run();
                  }
                }}
                aria-label="Superscript"
                disabled={disabled || readOnly || saving}
              >
                <Superscript
                  className={`size-4 ${editor.isActive("superscript") ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Superscript</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="superscript-dropdown"
            onClick={() => {
              if (editor.can().toggleSuperscript?.()) {
                editor.chain().focus().toggleSuperscript().run();
              }
            }}
            disabled={disabled || readOnly || saving}
          >
            <Superscript className="mr-2 size-4" />
            Superscript
          </DropdownMenuItem>
        ),
      },
      {
        id: "subscript",
        jsx: (
          <Tooltip key="subscript">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive("subscript"))}
                onClick={() => {
                  if (editor.can().toggleSubscript?.()) {
                    editor.chain().focus().toggleSubscript().run();
                  }
                }}
                aria-label="Subscript"
                disabled={disabled || readOnly || saving}
              >
                <Subscript
                  className={`size-4 ${editor.isActive("subscript") ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Subscript</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="subscript-dropdown"
            onClick={() => {
              if (editor.can().toggleSubscript?.()) {
                editor.chain().focus().toggleSubscript().run();
              }
            }}
            disabled={disabled || readOnly || saving}
          >
            <Subscript className="mr-2 size-4" />
            Subscript
          </DropdownMenuItem>
        ),
      },
      {
        id: "divider-4",
        jsx: <div key="divider-4" className="bg-border mx-0.5 h-5 w-px" />,
        dropdownJsx: <DropdownMenuSeparator key="d-sep-4" />,
      },
      {
        id: "align-left",
        jsx: (
          <Tooltip key="align-left">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive({ textAlign: "left" }))}
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                aria-label="Align Left"
                disabled={disabled || readOnly || saving}
              >
                <AlignLeft
                  className={`size-4 ${editor.isActive({ textAlign: "left" }) ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="align-left-dropdown"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            disabled={disabled || readOnly || saving}
          >
            <AlignLeft className="mr-2 size-4" />
            Align Left
          </DropdownMenuItem>
        ),
      },
      {
        id: "align-center",
        jsx: (
          <Tooltip key="align-center">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive({ textAlign: "center" }))}
                onClick={() =>
                  editor.chain().focus().setTextAlign("center").run()
                }
                aria-label="Align Center"
                disabled={disabled || readOnly || saving}
              >
                <AlignCenter
                  className={`size-4 ${editor.isActive({ textAlign: "center" }) ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="align-center-dropdown"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            disabled={disabled || readOnly || saving}
          >
            <AlignCenter className="mr-2 size-4" />
            Align Center
          </DropdownMenuItem>
        ),
      },
      {
        id: "align-right",
        jsx: (
          <Tooltip key="align-right">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive({ textAlign: "right" }))}
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                aria-label="Align Right"
                disabled={disabled || readOnly || saving}
              >
                <AlignRight
                  className={`size-4 ${editor.isActive({ textAlign: "right" }) ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="align-right-dropdown"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            disabled={disabled || readOnly || saving}
          >
            <AlignRight className="mr-2 size-4" />
            Align Right
          </DropdownMenuItem>
        ),
      },
      {
        id: "align-justify",
        jsx: (
          <Tooltip key="align-justify">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(editor.isActive({ textAlign: "justify" }))}
                onClick={() =>
                  editor.chain().focus().setTextAlign("justify").run()
                }
                aria-label="Justify"
                disabled={disabled || readOnly || saving}
              >
                <AlignJustify
                  className={`size-4 ${editor.isActive({ textAlign: "justify" }) ? "text-primary" : ""}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Justify</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="align-justify-dropdown"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            disabled={disabled || readOnly || saving}
          >
            <AlignJustify className="mr-2 size-4" />
            Justify
          </DropdownMenuItem>
        ),
      },
      {
        id: "divider-5",
        jsx: <div key="divider-5" className="bg-border mx-1 h-5 w-px" />,
        dropdownJsx: <DropdownMenuSeparator key="d-sep-5" />,
      },
      {
        id: "format",
        jsx: (
          <Tooltip key="format">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(false)}
                onClick={() => (editor as any).commands.formatDocument()}
                aria-label="Format Document"
                disabled={disabled || readOnly || saving}
              >
                <Wand2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Format Document
              <span className="text-muted-foreground ml-2 text-[9px]">
                Shift+Alt+F
              </span>
            </TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="format-dropdown"
            onClick={() => (editor as any).commands.formatDocument()}
          >
            <Wand2 className="mr-2 size-4" /> Format Document
          </DropdownMenuItem>
        ),
      },
      {
        id: "image",
        jsx: (
          <Tooltip key="image">
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className={itemCls(false)}
                onClick={() => {
                  let count = 0;
                  editor.state.doc.descendants((node: any) => {
                    if (node.type.name === "image") count++;
                  });
                  if (count >= 7) {
                    toast.error("Image Limit Reached", {
                      description: "Each note can contain at most 7 images.",
                    });
                    return;
                  }
                  const url = window.prompt("Enter image URL");
                  if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                  }
                }}
                aria-label="Insert Image"
                disabled={disabled || readOnly || saving}
              >
                <ImageIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Image</TooltipContent>
          </Tooltip>
        ),
        dropdownJsx: (
          <DropdownMenuItem
            key="image-dropdown"
            onClick={() => document.getElementById("image-upload")?.click()}
            disabled={disabled || readOnly || saving}
          >
            <ImageIcon className="mr-2 size-4" /> Upload Image
          </DropdownMenuItem>
        ),
      },
    ],
    [
      editor,
      disabled,
      readOnly,
      saving,
      isPopoverOpen,
      isHighlightPopoverOpen,
      updateCounter,
      isDirty,
    ]
  );

  const visibleTools = allTools.slice(0, visibleItemsCount);
  const hiddenTools = allTools.slice(visibleItemsCount);

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    let currentImageCount = 0;
    editor.state.doc.descendants((node: any) => {
      if (node.type.name === "image") currentImageCount++;
    });

    const MAX_IMAGES = 7;
    const remainingSlots = MAX_IMAGES - currentImageCount;

    if (remainingSlots <= 0) {
      toast.error("Image Limit Reached", {
        description: "Max 7 images per note.",
      });
      e.target.value = "";
      return;
    }

    const toastId = toast.loading("Optimizing images...");

    Array.from(files)
      .slice(0, remainingSlots)
      .forEach(async file => {
        const reader = new FileReader();

        reader.onload = event => {
          const rawUrl = event.target?.result as string;
          if (!rawUrl) return;

          // --- OPTIMIZATION STEP: Resize large images before insertion ---
          const img = new Image();
          img.src = rawUrl;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const MAX_SIZE = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to a slightly compressed image for better performance
            const optimizedUrl = canvas.toDataURL("image/webp", 0.75);

            // Insert Image AND a trailing paragraph so the cursor isn't stuck
            editor
              .chain()
              .focus()
              .insertContent([
                {
                  type: "image",
                  attrs: { src: optimizedUrl },
                },
                {
                  type: "paragraph",
                },
              ])
              .run();

            toast.success(`Image "${file.name}" ready!`, { id: toastId });
          };
        };
        reader.readAsDataURL(file);
      });

    e.target.value = "";
  };

  return (
    <div className="toolbar-container bg-background/95 supports-backdrop-filter:bg-background/60 flex h-14 w-full items-center justify-between border-b px-4 backdrop-blur">
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        multiple
        onChange={onImageUpload}
      />
      <div className="flex items-center gap-1.5">
        <div>
          {onToggleLeftSidebar && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onToggleLeftSidebar}
              className="h-8 w-8 p-0"
            >
              <PanelLeft
                className={cn(
                  "size-5",
                  isLeftSidebarOpen ? "text-primary" : "text-muted-foreground"
                )}
              />
            </Button>
          )}
        </div>
        {onShowGraph && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onShowGraph}
            className={itemCls(false)}
          >
            <span className="text-[10px] font-bold">Graph</span>
          </Button>
        )}
      </div>
      <div
        ref={toolbarRef}
        className="flex min-w-0 flex-1 items-center justify-start md:justify-center"
      >
        <div className="toolbar-inner flex items-center gap-1 overflow-hidden">
          <SelectionObserver editor={editor} onUpdate={triggerUpdate} />
          {allTools.map((tool, idx) => (
            <ToolbarItem
              key={tool.id}
              tool={tool}
              isVisible={idx < visibleItemsCount}
            />
          ))}
          {hiddenTools.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 px-2">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="max-h-[400px] w-48 overflow-y-auto shadow-md"
              >
                {hiddenTools.map(tool => (
                  <ToolbarDropdownItem key={tool.id} tool={tool} />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onInviteUser && (
          <Button
            size="sm"
            variant="outline"
            onClick={onInviteUser}
            className="h-8 w-8 shrink-0 border-white/60 bg-transparent p-0 text-white transition-colors hover:border-white hover:bg-white/10"
            title="Invite People"
            disabled={readOnly}
          >
            <UserPlus className="size-4" />
          </Button>
        )}
        {onShareNote && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShareNote(editor.getHTML())}
                className="h-8 w-8 shrink-0 p-0"
                disabled={readOnly || !canShare}
              >
                <Share2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {!canShare
                ? "Sharing disabled by organization admin"
                : "Share & Publish"}
            </TooltipContent>
          </Tooltip>
        )}
        {noteId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsHistoryOpen(true)}
                className="h-8 w-8 shrink-0 p-0"
              >
                <History className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Version History</TooltipContent>
          </Tooltip>
        )}
        {onExportNote && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExportNote(editor.getHTML())}
            className="h-8 w-8 shrink-0 p-0"
            title="Export Note"
          >
            <Download className="size-4" />
          </Button>
        )}
        <div className="flex flex-col items-stretch gap-1">
          <Button
            size="sm"
            onClick={onSave}
            disabled={disabled || saving || (!isDirty && !saving)}
            className={cn(
              "relative h-8 w-14 shrink-0 overflow-hidden rounded-lg font-semibold transition-all",
              isDirty
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                : "text-muted-foreground hover:bg-accent border border-gray-600/30 bg-transparent"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              {saving ? (
                <>
                  <Loader2 className="text-primary-foreground size-3 animate-spin" />
                  <span className="text-[10px]">Saving...</span>
                </>
              ) : (
                <span className="text-[10px]">
                  {isDirty ? "Save" : "Saved"}
                </span>
              )}
            </div>
          </Button>
        </div>
      </div>
      {noteId && (
        <NoteHistoryModal
          open={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
          note={{ id: noteId, title: "Current Note" }}
          canRestore={canRestore}
          currentContent={currentContent}
          onRestore={content => {
            editor.commands.setContent(content);
          }}
        />
      )}
    </div>
  );
}

export function NoteEditor({
  editor,
  readOnly = false,
}: {
  editor: any;
  readOnly?: boolean;
}) {
  if (!editor) return null;

  return (
    <div className="min-h-0 flex-1">
      <div className="relative">
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, from, to }) => {
            // Robust check to HIDE the menu on images or if selection is empty/readonly
            const nodeName = (editor.state.selection as any)?.node?.type.name;
            if (
              readOnly ||
              from === to ||
              editor.isActive("image") ||
              nodeName === "image"
            ) {
              return false;
            }
            return true;
          }}
          tippyOptions={{
            duration: 100,
            zIndex: 99,
            placement: "top",
            appendTo: "parent",
          }}
          className="bg-background animate-in fade-in zoom-in flex items-center gap-1 rounded-lg border p-1 shadow-md duration-200"
        >
          {!readOnly && (
            <div className="flex items-center gap-1 px-1">
              <AIAssistant editor={editor} disabled={readOnly} />
              <div className="bg-border mx-1 h-4 w-px" />
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={readOnly}
              >
                <Bold className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={readOnly}
              >
                <Italic className="size-4" />
              </Button>
            </div>
          )}
        </BubbleMenu>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
