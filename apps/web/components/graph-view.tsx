"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
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
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";

interface Node {
  id: string;
  name: string;
  val: number;
  color?: string;
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
      val: 1,
      color: note.tags?.some(t => t.startsWith("status:"))
        ? "#10b981"
        : "#3b82f6",
    }));

    const links: Link[] = [];
    const noteIds = new Set(notesData.map(n => n.id));

    notesData.forEach(note => {
      if (note.content && typeof note.content === "object") {
        // Deep search for fileLink nodes in Tiptap JSON
        const findLinks = (node: any) => {
          if (node.type === "fileLink" && node.attrs?.id) {
            if (noteIds.has(node.attrs.id)) {
              links.push({
                source: note.id,
                target: node.attrs.id,
              });
            }
          }
          if (node.content && Array.isArray(node.content)) {
            node.content.forEach(findLinks);
          }
        };
        findLinks(note.content);
      }
    });

    // Remove duplicates
    const uniqueLinks = links.filter(
      (link, index, self) =>
        index ===
        self.findIndex(
          t => t.source === link.source && t.target === link.target
        )
    );

    return { nodes, links };
  }, [notesData]);

  const handleNodeClick = (node: any) => {
    if (onClose) onClose();
    router.push(`/notes?note=${node.id}`);
  };

  const handleZoomIn = () =>
    graphRef.current?.zoom(graphRef.current.zoom() * 1.2, 400);
  const handleZoomOut = () =>
    graphRef.current?.zoom(graphRef.current.zoom() * 0.8, 400);
  const handleReset = () => {
    graphRef.current?.zoomToFit(400, 20);
    graphRef.current?.centerAt(0, 0, 400);
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
      className="bg-background relative h-full w-full overflow-hidden rounded-xl border shadow-2xl"
    >
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <Card className="bg-background/60 border-primary/10 flex flex-col gap-1 p-2 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="Reset View"
          >
            <RefreshCw className="size-4" />
          </Button>
        </Card>
      </div>

      {onClose && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={onClose}
            className="bg-background/60 rounded-full backdrop-blur-md"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-background/60 border-primary/10 rounded-lg border p-3 shadow-sm backdrop-blur-md">
          <h3 className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
            Legend
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-[#10b981]" />
              <span className="text-[10px] font-medium">Task Note</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-[#3b82f6]" />
              <span className="text-[10px] font-medium">Standard Note</span>
            </div>
            <div className="border-border/50 mt-1 border-t pt-1">
              <span className="text-muted-foreground text-[10px] italic">
                Total: {graphData.nodes.length} nodes, {graphData.links.length}{" "}
                links
              </span>
            </div>
          </div>
        </div>
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel="name"
        nodeColor={(node: any) => node.color}
        linkColor={() => "rgba(156, 163, 175, 0.2)"}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(
          node: any,
          ctx: CanvasRenderingContext2D,
          globalScale: number
        ) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter, sans-serif`;
          const textWidth = ctx.measureText(label).width;

          const bgW = textWidth + fontSize * 0.2;
          const bgH = fontSize + fontSize * 0.2;
          const x = node.x - bgW / 2;
          const y = node.y - bgH / 2 - 8;
          const w = bgW;
          const h = bgH;
          const r = 2; // radius
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.fill();

          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#000";
          ctx.fillText(label, node.x, node.y - 8);

          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
      />
    </div>
  );
}
