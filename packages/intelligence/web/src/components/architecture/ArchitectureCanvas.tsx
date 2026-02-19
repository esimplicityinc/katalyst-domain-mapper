/**
 * ArchitectureCanvas
 *
 * Renders the TaxonomySystemNode hierarchy as a nested-box SVG diagram.
 * Each system/subsystem/stack/layer node becomes a labeled box containing
 * its children. No ELK — layout is computed recursively in-component.
 *
 * Supports:
 *  - Zoom/pan via mouse wheel + drag
 *  - Click-to-select with detail panel
 *  - Color-coding by nodeType
 *  - Light + dark mode
 *  - Legend panel (bottom-left)
 */

import { useRef, useState, useCallback, useEffect } from "react";
import type { TaxonomySystemNode } from "../../types/landscape.js";
import { X, Building2 } from "lucide-react";

// ── Layout constants ─────────────────────────────────────────────────────────

const PADDING = 20;        // Inner padding within each container
const HEADER_H = 36;       // Height of the node label header
const MIN_NODE_W = 180;    // Minimum width for a leaf node
const MIN_NODE_H = 80;     // Minimum height for a leaf node
const GAP = 16;            // Gap between sibling nodes

// ── Color palette per nodeType ───────────────────────────────────────────────

interface NodeStyle {
  headerBg: string;
  headerText: string;
  border: string;
  bodyBg: string;
  badge: string;
  badgeText: string;
}

const NODE_STYLES: Record<string, NodeStyle> = {
  system: {
    headerBg: "#4f46e5",      // indigo-600
    headerText: "#ffffff",
    border: "#4338ca",        // indigo-700
    bodyBg: "#eef2ff",        // indigo-50
    badge: "#c7d2fe",         // indigo-200
    badgeText: "#3730a3",     // indigo-800
  },
  subsystem: {
    headerBg: "#0284c7",      // sky-600
    headerText: "#ffffff",
    border: "#0369a1",        // sky-700
    bodyBg: "#f0f9ff",        // sky-50
    badge: "#bae6fd",         // sky-200
    badgeText: "#0c4a6e",     // sky-900
  },
  stack: {
    headerBg: "#0d9488",      // teal-600
    headerText: "#ffffff",
    border: "#0f766e",        // teal-700
    bodyBg: "#f0fdfa",        // teal-50
    badge: "#99f6e4",         // teal-200
    badgeText: "#134e4a",     // teal-900
  },
  layer: {
    headerBg: "#64748b",      // slate-500
    headerText: "#ffffff",
    border: "#475569",        // slate-600
    bodyBg: "#f8fafc",        // slate-50
    badge: "#cbd5e1",         // slate-300
    badgeText: "#1e293b",     // slate-800
  },
};

// Dark-mode overrides (applied via CSS variables)
const NODE_STYLES_DARK: Record<string, NodeStyle> = {
  system: {
    headerBg: "#4338ca",
    headerText: "#e0e7ff",
    border: "#3730a3",
    bodyBg: "#1e1b4b",
    badge: "#3730a3",
    badgeText: "#c7d2fe",
  },
  subsystem: {
    headerBg: "#0369a1",
    headerText: "#e0f2fe",
    border: "#075985",
    bodyBg: "#082f49",
    badge: "#075985",
    badgeText: "#bae6fd",
  },
  stack: {
    headerBg: "#0f766e",
    headerText: "#ccfbf1",
    border: "#115e59",
    bodyBg: "#042f2e",
    badge: "#115e59",
    badgeText: "#99f6e4",
  },
  layer: {
    headerBg: "#475569",
    headerText: "#e2e8f0",
    border: "#334155",
    bodyBg: "#0f172a",
    badge: "#334155",
    badgeText: "#cbd5e1",
  },
};

// ── Layout types ─────────────────────────────────────────────────────────────

interface LayoutNode {
  node: TaxonomySystemNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
  depth: number;
}

// ── Recursive layout computation ─────────────────────────────────────────────

function measureNode(node: TaxonomySystemNode, depth: number): LayoutNode {
  if (node.children.length === 0) {
    return {
      node,
      x: 0,
      y: 0,
      width: MIN_NODE_W,
      height: MIN_NODE_H,
      children: [],
      depth,
    };
  }

  const childLayouts = node.children.map((child) =>
    measureNode(child, depth + 1)
  );

  // Lay children out left-to-right
  let cx = PADDING;
  const childY = HEADER_H + PADDING;
  let maxChildH = 0;

  for (const cl of childLayouts) {
    cl.x = cx;
    cl.y = childY;
    cx += cl.width + GAP;
    if (cl.height > maxChildH) maxChildH = cl.height;
  }

  // Normalize child heights to the tallest sibling
  for (const cl of childLayouts) {
    cl.height = maxChildH;
  }

  const totalChildW = childLayouts.reduce((s, cl) => s + cl.width, 0) +
    GAP * (childLayouts.length - 1);
  const innerW = Math.max(totalChildW, MIN_NODE_W - PADDING * 2);
  const innerH = maxChildH;

  return {
    node,
    x: 0,
    y: 0,
    width: innerW + PADDING * 2,
    height: HEADER_H + innerH + PADDING * 2,
    children: childLayouts,
    depth,
  };
}

function layoutForest(roots: TaxonomySystemNode[]): {
  nodes: LayoutNode[];
  totalW: number;
  totalH: number;
} {
  const measured = roots.map((r) => measureNode(r, 0));

  // Place root nodes top-to-bottom with gap
  let cy = PADDING;
  for (const m of measured) {
    m.x = PADDING;
    m.y = cy;
    cy += m.height + GAP * 2;
  }

  const totalW = Math.max(...measured.map((m) => m.x + m.width)) + PADDING;
  const totalH = cy + PADDING;

  return { nodes: measured, totalW, totalH };
}

// ── SVG node renderer ─────────────────────────────────────────────────────────

interface RenderNodeProps {
  layout: LayoutNode;
  offsetX: number;
  offsetY: number;
  isDark: boolean;
  selected: TaxonomySystemNode | null;
  onSelect: (node: TaxonomySystemNode) => void;
}

function RenderNode({
  layout,
  offsetX,
  offsetY,
  isDark,
  selected,
  onSelect,
}: RenderNodeProps) {
  const { node, x, y, width, height, children, depth } = layout;
  const ax = offsetX + x;
  const ay = offsetY + y;

  const styles = isDark
    ? NODE_STYLES_DARK[node.nodeType] ?? NODE_STYLES_DARK.layer
    : NODE_STYLES[node.nodeType] ?? NODE_STYLES.layer;

  const isSelected = selected?.fqtn === node.fqtn;
  const cornerR = depth === 0 ? 10 : 8;

  // Truncate description to 40 chars for leaf display
  const descSnippet =
    node.description && node.description.length > 40
      ? node.description.slice(0, 40) + "…"
      : node.description;

  const isLeaf = children.length === 0;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node);
      }}
      style={{ cursor: "pointer" }}
    >
      {/* Body */}
      <rect
        x={ax}
        y={ay}
        width={width}
        height={height}
        rx={cornerR}
        ry={cornerR}
        fill={styles.bodyBg}
        stroke={isSelected ? "#f59e0b" : styles.border}
        strokeWidth={isSelected ? 2.5 : 1.5}
      />

      {/* Header */}
      <rect
        x={ax}
        y={ay}
        width={width}
        height={HEADER_H}
        rx={cornerR}
        ry={cornerR}
        fill={styles.headerBg}
      />
      {/* Cover bottom radius of header */}
      <rect
        x={ax}
        y={ay + HEADER_H - cornerR}
        width={width}
        height={cornerR}
        fill={styles.headerBg}
      />

      {/* Node label */}
      <text
        x={ax + 12}
        y={ay + HEADER_H / 2 + 5}
        fontSize={13}
        fontWeight={600}
        fill={styles.headerText}
        dominantBaseline="middle"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {node.name.length > 22 ? node.name.slice(0, 22) + "…" : node.name}
      </text>

      {/* nodeType badge */}
      <rect
        x={ax + width - 72}
        y={ay + 8}
        width={64}
        height={20}
        rx={4}
        fill={styles.badge}
      />
      <text
        x={ax + width - 72 + 32}
        y={ay + 18}
        fontSize={10}
        fontWeight={600}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={styles.badgeText}
        style={{ pointerEvents: "none", userSelect: "none", textTransform: "uppercase" }}
      >
        {node.nodeType.toUpperCase()}
      </text>

      {/* Leaf: show description snippet */}
      {isLeaf && descSnippet && (
        <text
          x={ax + 12}
          y={ay + HEADER_H + 20}
          fontSize={11}
          fill={isDark ? "#94a3b8" : "#64748b"}
          dominantBaseline="middle"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {descSnippet}
        </text>
      )}

      {/* Render children recursively */}
      {children.map((cl) => (
        <RenderNode
          key={cl.node.fqtn}
          layout={cl}
          offsetX={ax}
          offsetY={ay}
          isDark={isDark}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </g>
  );
}

// ── Detail panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  node: TaxonomySystemNode;
  isDark: boolean;
  onClose: () => void;
}

function DetailPanel({ node, isDark, onClose }: DetailPanelProps) {
  const styles = isDark
    ? NODE_STYLES_DARK[node.nodeType] ?? NODE_STYLES_DARK.layer
    : NODE_STYLES[node.nodeType] ?? NODE_STYLES.layer;

  return (
    <div
      className="absolute right-4 top-4 w-80 rounded-xl shadow-xl border overflow-hidden z-10"
      style={{
        background: isDark ? "#1e293b" : "#ffffff",
        borderColor: isDark ? "#334155" : "#e2e8f0",
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: styles.headerBg }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: styles.headerText }} />
          <span
            className="text-sm font-semibold truncate"
            style={{ color: styles.headerText }}
          >
            {node.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 rounded p-0.5 hover:bg-white/20 transition-colors"
          style={{ color: styles.headerText }}
          aria-label="Close detail panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel body */}
      <div className="p-4 space-y-3 text-sm">
        {/* Type badge */}
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide"
            style={{ background: styles.badge, color: styles.badgeText }}
          >
            {node.nodeType}
          </span>
        </div>

        {/* FQTN */}
        <div>
          <div
            className="text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: isDark ? "#94a3b8" : "#64748b" }}
          >
            FQTN
          </div>
          <code
            className="text-xs rounded px-2 py-1 block break-all"
            style={{
              background: isDark ? "#0f172a" : "#f1f5f9",
              color: isDark ? "#e2e8f0" : "#1e293b",
            }}
          >
            {node.fqtn}
          </code>
        </div>

        {/* Description */}
        {node.description && (
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wide mb-1"
              style={{ color: isDark ? "#94a3b8" : "#64748b" }}
            >
              Description
            </div>
            <p style={{ color: isDark ? "#cbd5e1" : "#475569" }}>
              {node.description}
            </p>
          </div>
        )}

        {/* Owners */}
        {node.owners && node.owners.length > 0 && (
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wide mb-1"
              style={{ color: isDark ? "#94a3b8" : "#64748b" }}
            >
              Owners
            </div>
            <div className="flex flex-wrap gap-1">
              {node.owners.map((o) => (
                <span
                  key={o}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: isDark ? "#1e3a5f" : "#dbeafe",
                    color: isDark ? "#93c5fd" : "#1e40af",
                  }}
                >
                  {o}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Environments */}
        {node.environments && node.environments.length > 0 && (
          <div>
            <div
              className="text-xs font-semibold uppercase tracking-wide mb-1"
              style={{ color: isDark ? "#94a3b8" : "#64748b" }}
            >
              Environments
            </div>
            <div className="flex flex-wrap gap-1">
              {node.environments.map((env) => (
                <span
                  key={env}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: isDark ? "#14532d" : "#dcfce7",
                    color: isDark ? "#86efac" : "#166534",
                  }}
                >
                  {env}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Children count */}
        {node.children.length > 0 && (
          <div
            className="text-xs pt-1 border-t"
            style={{
              color: isDark ? "#64748b" : "#94a3b8",
              borderColor: isDark ? "#334155" : "#e2e8f0",
            }}
          >
            {node.children.length} child node
            {node.children.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Legend ───────────────────────────────────────────────────────────────────

interface LegendProps {
  isDark: boolean;
}

const LEGEND_ITEMS = [
  { type: "system", label: "System" },
  { type: "subsystem", label: "Subsystem" },
  { type: "stack", label: "Stack" },
  { type: "layer", label: "Layer" },
] as const;

function Legend({ isDark }: LegendProps) {
  return (
    <div
      className="absolute bottom-4 left-4 rounded-xl px-4 py-3 shadow-lg border"
      style={{
        background: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.95)",
        borderColor: isDark ? "#334155" : "#e2e8f0",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: isDark ? "#94a3b8" : "#64748b" }}
      >
        Node Types
      </div>
      <div className="space-y-1.5">
        {LEGEND_ITEMS.map(({ type, label }) => {
          const s = isDark ? NODE_STYLES_DARK[type] : NODE_STYLES[type];
          return (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: s.headerBg }}
              />
              <span
                className="text-xs"
                style={{ color: isDark ? "#cbd5e1" : "#475569" }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ArchitectureCanvasProps {
  systems: TaxonomySystemNode[];
}

export function ArchitectureCanvas({ systems }: ArchitectureCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);
  const [selected, setSelected] = useState<TaxonomySystemNode | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Track dark mode
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Compute layout
  const { nodes, totalW, totalH } = layoutForest(systems);

  // Fit to viewport on first load
  useEffect(() => {
    if (!containerRef.current || systems.length === 0) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const scaleX = (width - 40) / totalW;
    const scaleY = (height - 40) / totalH;
    const fit = Math.min(scaleX, scaleY, 1);
    setScale(fit);
    setTranslate({
      x: (width - totalW * fit) / 2,
      y: (height - totalH * fit) / 2,
    });
  }, [systems, totalW, totalH]);

  // Mouse wheel zoom
  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((s) => Math.min(Math.max(s * delta, 0.1), 4));
    },
    []
  );

  // Pan
  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      dragStart.current = {
        mx: e.clientX,
        my: e.clientY,
        tx: translate.x,
        ty: translate.y,
      };
    },
    [translate]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !dragStart.current) return;
      setTranslate({
        x: dragStart.current.tx + (e.clientX - dragStart.current.mx),
        y: dragStart.current.ty + (e.clientY - dragStart.current.my),
      });
    },
    [isDragging]
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Clear selection on background click
  const onBackgroundClick = useCallback(() => {
    setSelected(null);
  }, []);

  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const dotColor = isDark ? "#1e293b" : "#e2e8f0";

  if (systems.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ background: bgColor }}
      >
        <div className="text-center space-y-2">
          <Building2
            className="w-12 h-12 mx-auto"
            style={{ color: isDark ? "#475569" : "#94a3b8" }}
          />
          <p
            className="text-sm"
            style={{ color: isDark ? "#64748b" : "#94a3b8" }}
          >
            No taxonomy systems found for this domain model.
          </p>
          <p
            className="text-xs"
            style={{ color: isDark ? "#475569" : "#cbd5e1" }}
          >
            Taxonomy systems are populated from a linked taxonomy snapshot.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ background: bgColor, cursor: isDragging ? "grabbing" : "grab" }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={onBackgroundClick}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        {/* Dot-grid background */}
        <defs>
          <pattern id="arch-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill={dotColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#arch-dot-grid)" />

        {/* Main transform group */}
        <g transform={`translate(${translate.x},${translate.y}) scale(${scale})`}>
          {nodes.map((layout) => (
            <RenderNode
              key={layout.node.fqtn}
              layout={layout}
              offsetX={0}
              offsetY={0}
              isDark={isDark}
              selected={selected}
              onSelect={setSelected}
            />
          ))}
        </g>
      </svg>

      {/* Legend */}
      <Legend isDark={isDark} />

      {/* Zoom hint */}
      <div
        className="absolute top-4 right-4 text-xs px-2 py-1 rounded"
        style={{
          background: isDark ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.8)",
          color: isDark ? "#64748b" : "#94a3b8",
          backdropFilter: "blur(4px)",
          pointerEvents: "none",
        }}
      >
        Scroll to zoom · Drag to pan · Click node for details
      </div>

      {/* Detail panel */}
      {selected && (
        <DetailPanel
          node={selected}
          isDark={isDark}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
