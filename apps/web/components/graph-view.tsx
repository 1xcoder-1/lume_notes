"use client";

import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useRouter } from "next/navigation";
import { useNotes } from "@/lib/api";
import {
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  X,
  Info,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { cn } from "@workspace/ui/lib/utils";

interface Node {
  id: string;
  name: string;
  val: number;
  color?: string;
  neighbors?: string[];
  links?: any[];
  x?: number;
  y?: number;
}

interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

export function GraphView({ onClose }: { onClose?: () => void }) {
  const { data: notesData, isLoading } = useNotes();
  const router = useRouter();
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoverNode, setHoverNode] = useState<Node | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({ width: clientWidth, height: clientHeight });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const graphData = useMemo(() => {
    if (!notesData) return { nodes: [], links: [] };

    const nodes: Node[] = notesData.map(note => ({
      id: note.id,
      name: note.title || "Untitled",
      val: note.content?.content?.length
        ? Math.max(1, Math.min(note.content.content.length / 5, 5))
        : 1,
      color: note.tags?.some(
        t => t.toLowerCase() === "task" || t.toLowerCase() === "todo"
      )
        ? "#10b981" // Green for tasks
        : note.tags?.some(t => t.toLowerCase() === "important")
          ? "#f59e0b" // Amber for important
          : "#3b82f6", // Blue for default
    }));

    const links: Link[] = [];
    const noteIds = new Set(notesData.map(n => n.id));

    notesData.forEach(note => {
      if (note.content && typeof note.content === "object") {
        const findLinks = (n: any) => {
          if (n.type === "fileLink" && n.attrs?.id) {
            if (noteIds.has(n.attrs.id)) {
              links.push({
                source: note.id,
                target: n.attrs.id,
              });
            }
          }
          if (n.content && Array.isArray(n.content)) {
            n.content.forEach(findLinks);
          }
        };
        findLinks(note.content);
      }
    });

    const uniqueLinks = links.filter(
      (link, index, self) =>
        index ===
        self.findIndex(
          t => t.source === link.source && t.target === link.target
        )
    );

    // Build neighbor relationships for highlighting
    uniqueLinks.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      if (sourceNode && targetNode) {
        !sourceNode.neighbors && (sourceNode.neighbors = []);
        !targetNode.neighbors && (targetNode.neighbors = []);
        sourceNode.neighbors.push(targetNode.id);
        targetNode.neighbors.push(sourceNode.id);

        !sourceNode.links && (sourceNode.links = []);
        !targetNode.links && (targetNode.links = []);
        sourceNode.links.push(link);
        targetNode.links.push(link);
      }
    });

    return { nodes, links: uniqueLinks };
  }, [notesData]);

  const updateHighlight = useCallback(() => {
    setHighlightNodes(new Set(highlightNodes));
    setHighlightLinks(new Set(highlightLinks));
  }, [highlightNodes, highlightLinks]);

  const handleNodeHover = (node: any) => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node.id);
      node.neighbors?.forEach((neighbor: string) =>
        highlightNodes.add(neighbor)
      );
      node.links?.forEach((link: any) => highlightLinks.add(link));
    }

    setHoverNode(node || null);
    updateHighlight();
  };

  const handleNodeClick = (node: any) => {
    if (onClose) onClose();
    router.push(`/notes?note=${node.id}`);
  };

  const handleZoomIn = () =>
    graphRef.current?.zoom(graphRef.current.zoom() * 1.5, 500);
  const handleZoomOut = () =>
    graphRef.current?.zoom(graphRef.current.zoom() * 0.7, 500);
  const handleReset = () => {
    graphRef.current?.zoomToFit(600, 40);
  };

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return [];
    return graphData.nodes.filter(n =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [graphData.nodes, searchQuery]);

  const handleSearchSelect = (node: Node) => {
    if (node.x !== undefined && node.y !== undefined) {
      graphRef.current?.centerAt(node.x, node.y, 1000);
      graphRef.current?.zoom(4, 1000);
    }
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="bg-background/80 flex h-full items-center justify-center backdrop-blur-sm">
        <Loader2 className="text-primary size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-background/90 relative h-full w-full overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
    >
      {}
      <div className="absolute top-6 left-6 z-20 flex w-72 flex-col gap-4">
        <Card className="bg-background/40 flex flex-col gap-1 border-white/10 p-1.5 shadow-xl backdrop-blur-xl">
          <div className="relative mb-2 px-1 pt-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-background/50 h-8 border-white/5 pl-9 text-xs ring-offset-transparent focus-visible:ring-1"
            />
            {filteredNodes.length > 0 && (
              <div className="bg-background/95 absolute top-full mt-1 w-full overflow-hidden rounded-md border border-white/10 shadow-2xl backdrop-blur-xl">
                {filteredNodes.slice(0, 5).map(node => (
                  <button
                    key={node.id}
                    onClick={() => handleSearchSelect(node)}
                    className="hover:bg-primary/10 flex w-full items-center px-3 py-2 text-left text-xs transition-colors"
                  >
                    <div
                      className="mr-2 size-1.5 rounded-full"
                      style={{ backgroundColor: node.color }}
                    />
                    <span className="truncate">{node.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-1 border-t border-white/5 pt-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/5"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/5"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white/5"
              onClick={handleReset}
              title="Reset View"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </Card>
      </div>

      {}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        <Badge
          variant="outline"
          className="bg-background/40 border-white/10 font-mono text-[10px] backdrop-blur-xl"
        >
          {graphData.nodes.length} Notes • {graphData.links.length} Connections
        </Badge>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-background/40 hover:bg-destructive/20 hover:border-destructive/30 size-9 rounded-full border border-white/10 text-white shadow-xl backdrop-blur-xl transition-all"
          >
            <X className="size-5" />
          </Button>
        )}
      </div>

      {}
      <div className="absolute bottom-6 left-6 z-20">
        <div className="bg-background/40 rounded-xl border border-white/10 p-4 shadow-2xl backdrop-blur-xl">
          <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
            <Layers className="size-3" />
            Graph Legend
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div
                className="size-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ backgroundColor: "#10b981" }}
              />
              <span className="text-[11px] font-medium opacity-80">
                Task / To-do
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="size-2 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <span className="text-[11px] font-medium opacity-80">
                Important
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="size-2 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                style={{ backgroundColor: "#3b82f6" }}
              />
              <span className="text-[11px] font-medium opacity-80">
                Standard Note
              </span>
            </div>
          </div>
        </div>
      </div>

      {}
      {hoverNode && (
        <div className="animate-in fade-in slide-in-from-bottom-2 absolute right-6 bottom-6 z-20 max-w-xs">
          <Card className="bg-background/60 border-primary/20 p-4 shadow-2xl backdrop-blur-2xl">
            <div className="mb-2 flex items-center gap-2">
              <div
                className="size-2 rounded-full"
                style={{ backgroundColor: hoverNode.color }}
              />
              <h4 className="line-clamp-1 text-sm font-bold">
                {hoverNode.name}
              </h4>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Connected to {hoverNode.neighbors?.length || 0} other notes. Click
              to open and edit this note.
            </p>
          </Card>
        </div>
      )}

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
        nodeRelSize={6}
        nodeColor={(node: any) =>
          highlightNodes.size > 0 && !highlightNodes.has(node.id)
            ? "rgba(50, 50, 50, 0.2)"
            : node.color
        }
        linkColor={(link: any) =>
          highlightLinks.size > 0 && !highlightLinks.has(link)
            ? "rgba(50, 50, 50, 0.1)"
            : "rgba(100, 116, 139, 0.2)"
        }
        linkWidth={(link: any) => (highlightLinks.has(link) ? 2 : 1)}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={(link: any) =>
          highlightLinks.has(link) ? 3 : 0
        }
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={(link: any) =>
          highlightLinks.has(link) ? "#3b82f6" : "transparent"
        }
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400, 40)}
        nodeCanvasObject={(
          node: any,
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => {
          const isHighlighted = highlightNodes.has(node.id);
          const isDimmed = highlightNodes.size > 0 && !isHighlighted;

          const label = node.name;
          const fontSize = 14 / globalScale;
          ctx.font = `${isHighlighted ? "bold" : "normal"} ${fontSize}px "Inter", sans-serif`;
          const textWidth = ctx.measureText(label).width;
          const bgW = textWidth + fontSize * 0.8;
          const bgH = fontSize + fontSize * 0.4;

          // Draw node glow if highlighted
          if (isHighlighted && !isDimmed) {
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 15 / globalScale;
          } else {
            ctx.shadowBlur = 0;
          }

          // Draw label background
          if (!isDimmed) {
            ctx.fillStyle = "rgba(10, 10, 10, 0.8)";
            const x = node.x - bgW / 2;
            const y = node.y - bgH / 2 - 12 / globalScale;

            // Rounded rect for label
            const r = 4 / globalScale;
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + bgW - r, y);
            ctx.arcTo(x + bgW, y, x + bgW, y + bgH, r);
            ctx.lineTo(x + bgW, y + bgH - r);
            ctx.arcTo(x + bgW, y + bgH, x, y + bgH, r);
            ctx.lineTo(x + r, y + bgH);
            ctx.arcTo(x, y + bgH, x, y, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + bgW, y, r);
            ctx.closePath();
            ctx.fill();

            // Label text
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = isHighlighted ? "#fff" : "rgba(255, 255, 255, 0.9)";
            ctx.fillText(label, node.x, node.y - 12 / globalScale);
          }

          // Node circle
          ctx.shadowBlur = 0;
          ctx.fillStyle = isDimmed ? "rgba(50, 50, 50, 0.2)" : node.color;
          ctx.beginPath();
          ctx.arc(
            node.x,
            node.y,
            (isHighlighted ? 6 : 4) / globalScale,
            0,
            2 * Math.PI,
            false
          );
          ctx.fill();

          if (isHighlighted) {
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1 / globalScale;
            ctx.stroke();
          }
        }}
      />
    </div>
  );
}
