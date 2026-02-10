import type { BoundedContext, SubdomainType } from "../../types/domain";
import { NODE_WIDTH, NODE_HEIGHT } from "./svg/useAutoLayout";

interface ArtifactCounts {
  aggregates: number;
  events: number;
  vos: number;
}

interface ContextNodeProps {
  context: BoundedContext;
  x: number;
  y: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  artifactCounts: ArtifactCounts;
}

interface SubdomainColors {
  fill: string;
  stroke: string;
  label: string;
}

const SUBDOMAIN_COLORS: Record<SubdomainType, SubdomainColors> = {
  core: { fill: "#3B82F6", stroke: "#1D4ED8", label: "Core" },
  supporting: { fill: "#22C55E", stroke: "#15803D", label: "Supporting" },
  generic: { fill: "#9CA3AF", stroke: "#6B7280", label: "Generic" },
};

const DEFAULT_COLORS: SubdomainColors = {
  fill: "#94A3B8",
  stroke: "#64748B",
  label: "",
};

function getColors(subdomainType: SubdomainType | null): SubdomainColors {
  if (subdomainType && subdomainType in SUBDOMAIN_COLORS) {
    return SUBDOMAIN_COLORS[subdomainType];
  }
  return DEFAULT_COLORS;
}

/**
 * Truncate text to fit within SVG node width.
 * Approximates character width at ~7px for 12px font.
 */
function truncateTitle(title: string, maxChars: number = 20): string {
  if (title.length <= maxChars) return title;
  return title.slice(0, maxChars - 1) + "\u2026";
}

/**
 * Build a short artifact summary string, e.g. "2 agg, 3 evt, 1 vo"
 */
function artifactSummary(counts: ArtifactCounts): string {
  const parts: string[] = [];
  if (counts.aggregates > 0) parts.push(`${counts.aggregates} agg`);
  if (counts.events > 0) parts.push(`${counts.events} evt`);
  if (counts.vos > 0) parts.push(`${counts.vos} vo`);
  return parts.length > 0 ? parts.join(", ") : "No artifacts";
}

export function ContextNode({
  context,
  x,
  y,
  isSelected,
  isHighlighted,
  isDimmed,
  onClick,
  onMouseEnter,
  onMouseLeave,
  artifactCounts: counts,
}: ContextNodeProps) {
  const colors = getColors(context.subdomainType);
  const opacity = isDimmed ? 0.3 : 1.0;
  const strokeWidth = isSelected ? 3 : 1.5;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      opacity={opacity}
      style={{ cursor: "pointer", transition: "opacity 0.2s ease" }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label={`${context.title} bounded context${context.subdomainType ? `, ${context.subdomainType} subdomain` : ""}`}
      tabIndex={0}
    >
      {/* Glow effect for highlighted nodes */}
      {isHighlighted && (
        <rect
          x={-4}
          y={-4}
          width={NODE_WIDTH + 8}
          height={NODE_HEIGHT + 8}
          rx={12}
          ry={12}
          fill="none"
          stroke="#A855F7"
          strokeWidth={2}
          opacity={0.5}
        />
      )}

      {/* Main rectangle */}
      <rect
        x={0}
        y={0}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={8}
        ry={8}
        fill={colors.fill}
        stroke={isSelected ? "#FFFFFF" : colors.stroke}
        strokeWidth={strokeWidth}
      />

      {/* Title text */}
      <text
        x={NODE_WIDTH / 2}
        y={NODE_HEIGHT / 2 - 8}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FFFFFF"
        fontSize={12}
        fontWeight={500}
      >
        {truncateTitle(context.title)}
      </text>

      {/* Artifact count subtitle */}
      <text
        x={NODE_WIDTH / 2}
        y={NODE_HEIGHT / 2 + 12}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FFFFFF"
        fontSize={9}
        opacity={0.7}
      >
        {artifactSummary(counts)}
      </text>

      {/* Subdomain type badge (top-right) */}
      {colors.label && (
        <g>
          <rect
            x={NODE_WIDTH - 58}
            y={-8}
            width={54}
            height={16}
            rx={8}
            ry={8}
            fill={colors.stroke}
          />
          <text
            x={NODE_WIDTH - 31}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#FFFFFF"
            fontSize={8}
            fontWeight={600}
          >
            {colors.label}
          </text>
        </g>
      )}
    </g>
  );
}
