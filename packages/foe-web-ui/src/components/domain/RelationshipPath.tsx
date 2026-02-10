import type { ContextRelationship } from "../../types/domain";
import { NODE_WIDTH, NODE_HEIGHT } from "./svg/useAutoLayout";
import { RELATIONSHIP_LABELS } from "./constants";

interface RelationshipPathProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  type: ContextRelationship["type"];
  isHighlighted: boolean;
  isDimmed: boolean;
}

/**
 * Compute the center of a node given its top-left position.
 */
function nodeCenter(x: number, y: number): { cx: number; cy: number } {
  return { cx: x + NODE_WIDTH / 2, cy: y + NODE_HEIGHT / 2 };
}

/**
 * Compute the point on the node border where a line from the center
 * toward a target point exits the rectangle.
 */
function borderIntersection(
  nodeX: number,
  nodeY: number,
  targetCx: number,
  targetCy: number,
): { bx: number; by: number } {
  const cx = nodeX + NODE_WIDTH / 2;
  const cy = nodeY + NODE_HEIGHT / 2;
  const dx = targetCx - cx;
  const dy = targetCy - cy;

  if (dx === 0 && dy === 0) return { bx: cx, by: cy };

  const halfW = NODE_WIDTH / 2 + 4; // small padding
  const halfH = NODE_HEIGHT / 2 + 4;

  // Which edge does the ray hit first?
  const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
  const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
  const scale = Math.min(scaleX, scaleY);

  return { bx: cx + dx * scale, by: cy + dy * scale };
}

/**
 * SVG relationship path between two context nodes with a quadratic
 * bezier curve and a label at the midpoint.
 */
export function RelationshipPath({
  sourceX,
  sourceY,
  targetX,
  targetY,
  type,
  isHighlighted,
  isDimmed,
}: RelationshipPathProps) {
  const source = nodeCenter(sourceX, sourceY);
  const target = nodeCenter(targetX, targetY);

  // Compute actual start/end at node borders
  const start = borderIntersection(sourceX, sourceY, target.cx, target.cy);
  const end = borderIntersection(targetX, targetY, source.cx, source.cy);

  // Control point: offset perpendicular to the midpoint for a curve
  const midX = (start.bx + end.bx) / 2;
  const midY = (start.by + end.by) / 2;
  const dx = end.bx - start.bx;
  const dy = end.by - start.by;
  const len = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(40, len * 0.2); // perpendicular offset

  // Perpendicular unit vector (rotate 90 degrees)
  const perpX = len > 0 ? -dy / len : 0;
  const perpY = len > 0 ? dx / len : 0;
  const cpX = midX + perpX * offset;
  const cpY = midY + perpY * offset;

  // Label position: slightly offset from the control point
  const labelX = (midX + cpX) / 2;
  const labelY = (midY + cpY) / 2;

  // Styling
  let strokeColor: string;
  let markerUrl: string;
  let opacity: number;

  if (isHighlighted) {
    strokeColor = "#A855F7"; // purple-500
    markerUrl = "url(#arrowhead-highlighted)";
    opacity = 1;
  } else if (isDimmed) {
    strokeColor = "#D1D5DB"; // gray-300
    markerUrl = "url(#arrowhead-dimmed)";
    opacity = 0.2;
  } else {
    strokeColor = "#9CA3AF"; // gray-400
    markerUrl = "url(#arrowhead)";
    opacity = 1;
  }

  const label = RELATIONSHIP_LABELS[type] ?? type;
  const pathD = `M ${start.bx} ${start.by} Q ${cpX} ${cpY} ${end.bx} ${end.by}`;

  return (
    <g opacity={opacity} style={{ transition: "opacity 0.2s ease" }}>
      {/* Path */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        markerEnd={markerUrl}
      />

      {/* Label background */}
      <rect
        x={labelX - 28}
        y={labelY - 8}
        width={56}
        height={16}
        rx={4}
        ry={4}
        fill={isDimmed ? "#F3F4F6" : "#FFFFFF"}
        stroke={strokeColor}
        strokeWidth={0.5}
        opacity={0.9}
      />

      {/* Label text */}
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={8}
        fill={isHighlighted ? "#7C3AED" : "#6B7280"}
        fontWeight={isHighlighted ? 600 : 400}
      >
        {label}
      </text>
    </g>
  );
}
