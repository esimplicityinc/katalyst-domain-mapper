import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

// ── Badge type definitions ──────────────────────────────────────────────────

export type TreeNodeType =
  | "aggregate"
  | "entity"
  | "value-object"
  | "command"
  | "event"
  | "invariant"
  | "property"
  | "category";

const BADGE_STYLES: Record<
  TreeNodeType,
  { bg: string; text: string; darkBg: string; darkText: string } | null
> = {
  aggregate: null, // Aggregate uses its own styling (no badge pill)
  entity: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    darkBg: "dark:bg-blue-900/20",
    darkText: "dark:text-blue-300",
  },
  "value-object": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    darkBg: "dark:bg-amber-900/20",
    darkText: "dark:text-amber-300",
  },
  command: {
    bg: "bg-green-50",
    text: "text-green-700",
    darkBg: "dark:bg-green-900/20",
    darkText: "dark:text-green-300",
  },
  event: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    darkBg: "dark:bg-purple-900/20",
    darkText: "dark:text-purple-300",
  },
  invariant: {
    bg: "bg-red-50",
    text: "text-red-700",
    darkBg: "dark:bg-red-900/20",
    darkText: "dark:text-red-300",
  },
  property: null, // Properties use inline mono styling
  category: null, // Category headers have no badge
};

// ── Badge component ─────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: TreeNodeType }) {
  const style = BADGE_STYLES[type];
  if (!style) return null;

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded ${style.bg} ${style.text} ${style.darkBg} ${style.darkText}`}
    >
      {type === "value-object" ? "VO" : type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
}

// ── Tree Node props ─────────────────────────────────────────────────────────

interface TreeNodeProps {
  /** Display label */
  label: string;
  /** Node type determines badge styling */
  type: TreeNodeType;
  /** Nesting depth (0 = root) for indentation */
  depth: number;
  /** Whether this node is expandable */
  expandable?: boolean;
  /** Whether the node is currently expanded (controlled) */
  expanded?: boolean;
  /** Toggle callback for expand/collapse */
  onToggle?: () => void;
  /** Optional description shown on hover */
  description?: string;
  /** data-testid for BDD testing */
  dataTestId?: string;
  /** Inline annotation (e.g., ": string") for property nodes */
  annotation?: string;
  /** Optional icon to render before the label */
  icon?: ReactNode;
  /** Child nodes rendered when expanded */
  children?: ReactNode;
}

export function TreeNode({
  label,
  type,
  depth,
  expandable = false,
  expanded = false,
  onToggle,
  description,
  dataTestId,
  annotation,
  icon,
  children,
}: TreeNodeProps) {
  // Indentation: 16px per depth level
  const paddingLeft = depth * 16;

  return (
    <div data-testid={dataTestId}>
      {/* Node row */}
      <div
        className="group relative"
        style={{ paddingLeft }}
      >
        {/* Vertical tree line */}
        {depth > 0 && (
          <div
            className="absolute top-0 bottom-0 border-l border-gray-200 dark:border-gray-700"
            style={{ left: (depth - 1) * 16 + 8 }}
          />
        )}

        {expandable ? (
          <button
            onClick={onToggle}
            className="w-full flex items-center gap-2 py-1.5 px-2 text-left rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            title={description}
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            )}
            {icon}
            <span className="text-sm text-gray-900 dark:text-white font-medium truncate">
              {label}
            </span>
            <TypeBadge type={type} />
            {annotation && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                {annotation}
              </span>
            )}
          </button>
        ) : (
          <div
            className="flex items-center gap-2 py-1 px-2 pl-[calc(0.5rem+18px)]"
            title={description}
          >
            {icon}
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {label}
            </span>
            <TypeBadge type={type} />
            {annotation && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                {annotation}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Children (rendered when expanded or always for non-expandable) */}
      {expandable && expanded && children}
      {!expandable && children}
    </div>
  );
}
