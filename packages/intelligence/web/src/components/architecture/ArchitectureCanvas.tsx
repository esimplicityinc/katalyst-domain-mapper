/**
 * ArchitectureCanvas
 *
 * Renders the TaxonomySystemNode hierarchy as a top-down tree SVG diagram.
 * Each node is a box whose width auto-fits its name (no truncation / wrapping).
 * Parent→child relationships are drawn with vertical connector lines.
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

const NODE_H = 40;            // Height of each tree node box
const CHAR_WIDTH = 7.8;       // Approximate px per character at fontSize 13
const BADGE_EXTRA = 80;       // Extra width for the nodeType badge + padding
const NODE_PAD_X = 24;        // Horizontal padding inside node
const H_GAP = 24;             // Horizontal gap between siblings
const V_GAP = 56;             // Vertical gap between depth levels
const TREE_GAP = 48;          // Gap between separate root trees
const MIN_NODE_W = 140;       // Minimum node width

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
    headerBg: "#4f46e5",
    headerText: "#ffffff",
    border: "#4338ca",
    bodyBg: "#eef2ff",
    badge: "#c7d2fe",
    badgeText: "#3730a3",
  },
  subsystem: {
    headerBg: "#0284c7",
    headerText: "#ffffff",
    border: "#0369a1",
    bodyBg: "#f0f9ff",
    badge: "#bae6fd",
    badgeText: "#0c4a6e",
  },
  stack: {
    headerBg: "#0d9488",
    headerText: "#ffffff",
    border: "#0f766e",
    bodyBg: "#f0fdfa",
    badge: "#99f6e4",
    badgeText: "#134e4a",
  },
  layer: {
    headerBg: "#64748b",
    headerText: "#ffffff",
    border: "#475569",
    bodyBg: "#f8fafc",
    badge: "#cbd5e1",
    badgeText: "#1e293b",
  },
};

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

// ── Tree layout types ────────────────────────────────────────────────────────

interface TreeNode {
  node: TaxonomySystemNode;
  x: number;        // center x of this node
  y: number;        // top y of this node
  width: number;    // width of this node box
  subtreeWidth: number;  // total width of subtree rooted here
  children: TreeNode[];
  depth: number;
}

// ── Compute node width from its name ─────────────────────────────────────────

function nodeWidth(name: string): number {
  return Math.max(MIN_NODE_W, name.length * CHAR_WIDTH + BADGE_EXTRA + NODE_PAD_X);
}

// ── Recursive tree layout ────────────────────────────────────────────────────

/** Phase 1: measure subtree widths bottom-up */
function measure(node: TaxonomySystemNode, depth: number): TreeNode {
  const w = nodeWidth(node.name);

  if (node.children.length === 0) {
    return {
      node,
      x: 0,
      y: 0,
      width: w,
      subtreeWidth: w,
      children: [],
      depth,
    };
  }

  const childTrees = node.children.map((c) => measure(c, depth + 1));
  const totalChildW = childTrees.reduce((s, c) => s + c.subtreeWidth, 0) +
    H_GAP * (childTrees.length - 1);

  return {
    node,
    x: 0,
    y: 0,
    width: w,
    subtreeWidth: Math.max(w, totalChildW),
    children: childTrees,
    depth,
  };
}

/** Phase 2: assign x/y positions top-down, given the center-x and top-y */
function position(tree: TreeNode, cx: number, ty: number): void {
  tree.x = cx;
  tree.y = ty;

  if (tree.children.length === 0) return;

  const childY = ty + NODE_H + V_GAP;
  const totalChildW = tree.children.reduce((s, c) => s + c.subtreeWidth, 0) +
    H_GAP * (tree.children.length - 1);
  let startX = cx - totalChildW / 2;

  for (const child of tree.children) {
    const childCx = startX + child.subtreeWidth / 2;
    position(child, childCx, childY);
    startX += child.subtreeWidth + H_GAP;
  }
}

/** Layout a forest of root nodes, placing them left-to-right */
function layoutForest(roots: TaxonomySystemNode[]): {
  trees: TreeNode[];
  totalW: number;
  totalH: number;
} {
  const measured = roots.map((r) => measure(r, 0));
  const totalW = measured.reduce((s, t) => s + t.subtreeWidth, 0) +
    TREE_GAP * (measured.length - 1);

  // Position each root
  let startX = 0;
  for (const tree of measured) {
    const cx = startX + tree.subtreeWidth / 2;
    position(tree, cx, 0);
    startX += tree.subtreeWidth + TREE_GAP;
  }

  // Compute total height from max depth
  let maxDepth = 0;
  function findMaxDepth(t: TreeNode) {
    if (t.depth > maxDepth) maxDepth = t.depth;
    t.children.forEach(findMaxDepth);
  }
  measured.forEach(findMaxDepth);
  const totalH = (maxDepth + 1) * NODE_H + maxDepth * V_GAP;

  return { trees: measured, totalW, totalH };
}

// ── SVG tree node renderer ───────────────────────────────────────────────────

interface RenderTreeNodeProps {
  tree: TreeNode;
  isDark: boolean;
  selected: TaxonomySystemNode | null;
  onSelect: (node: TaxonomySystemNode) => void;
}

function RenderTreeNode({ tree, isDark, selected, onSelect }: RenderTreeNodeProps) {
  const { node, x, y, width, children } = tree;
  const styles = isDark
    ? NODE_STYLES_DARK[node.nodeType] ?? NODE_STYLES_DARK.layer
    : NODE_STYLES[node.nodeType] ?? NODE_STYLES.layer;

  const isSelected = selected?.fqtn === node.fqtn;
  const boxX = x - width / 2;
  const boxY = y;
  const connectorColor = isDark ? "#475569" : "#94a3b8";

  // Badge dimensions
  const badgeW = 64;
  const badgeH = 18;
  const badgeX = boxX + width - badgeW - 8;
  const badgeY = boxY + (NODE_H - badgeH) / 2;

  return (
    <>
      {/* Connector lines from this node to children */}
      {children.map((child) => {
        const parentBottomX = x;
        const parentBottomY = y + NODE_H;
        const childTopX = child.x;
        const childTopY = child.y;
        const midY = parentBottomY + V_GAP / 2;

        return (
          <path
            key={child.node.fqtn}
            d={`M ${parentBottomX} ${parentBottomY} L ${parentBottomX} ${midY} L ${childTopX} ${midY} L ${childTopX} ${childTopY}`}
            fill="none"
            stroke={connectorColor}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        );
      })}

      {/* Node box */}
      <g
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        style={{ cursor: "pointer" }}
      >
        {/* Shadow */}
        <rect
          x={boxX + 1}
          y={boxY + 2}
          width={width}
          height={NODE_H}
          rx={8}
          ry={8}
          fill={isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.06)"}
        />

        {/* Background */}
        <rect
          x={boxX}
          y={boxY}
          width={width}
          height={NODE_H}
          rx={8}
          ry={8}
          fill={styles.headerBg}
          stroke={isSelected ? "#f59e0b" : styles.border}
          strokeWidth={isSelected ? 2.5 : 1.5}
        />

        {/* Name text */}
        <text
          x={boxX + 12}
          y={boxY + NODE_H / 2}
          fontSize={13}
          fontWeight={600}
          fill={styles.headerText}
          dominantBaseline="central"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {node.name}
        </text>

        {/* Type badge */}
        <rect
          x={badgeX}
          y={badgeY}
          width={badgeW}
          height={badgeH}
          rx={4}
          fill={styles.badge}
        />
        <text
          x={badgeX + badgeW / 2}
          y={badgeY + badgeH / 2}
          fontSize={9}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="central"
          fill={styles.badgeText}
          style={{ pointerEvents: "none", userSelect: "none", letterSpacing: "0.05em" }}
        >
          {node.nodeType.toUpperCase()}
        </text>
      </g>

      {/* Render children */}
      {children.map((child) => (
        <RenderTreeNode
          key={child.node.fqtn}
          tree={child}
          isDark={isDark}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </>
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
  const { trees, totalW, totalH } = layoutForest(systems);

  // Fit to viewport on first load
  useEffect(() => {
    if (!containerRef.current || systems.length === 0) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const padded = 60;
    const scaleX = (width - padded) / totalW;
    const scaleY = (height - padded) / totalH;
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
          {trees.map((tree) => (
            <RenderTreeNode
              key={tree.node.fqtn}
              tree={tree}
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
