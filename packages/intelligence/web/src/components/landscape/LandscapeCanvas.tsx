/**
 * LandscapeCanvas – Full Business Landscape Visualization
 *
 * A pure rendering component that paints the landscape from
 * pre-computed positions supplied by a layout engine.
 *
 * Layers (bottom → top):
 *  1. Grid background
 *  2. Subdomain group boxes
 *  3. Domain-event flow arrows (workflow-aware: highlighted when filter active)
 *  4. Invisible workflow chain paths (for persona dot animation)
 *  5. Animated persona dots (only when workflow filter active)
 *  6. Persona flow lines (persona → capability)
 *  7. Capability port nodes (orange diamonds)
 *  8. Context nodes (coloured circles)
 *  9. Persona badges
 * 10. Inferred unknown systems (dashed boxes)
 * 11. Detail panel (slide-in on click)
 */

import { useState, useMemo } from "react";
import type {
  LandscapeGraph,
  LandscapePositions,
  ResolvedContext,
  LandscapeEvent,
  LandscapeCapability,
  LandscapePersona,
  LandscapeWorkflow,
  InferredSystem,
  SystemBounds,
  GroupBox,
  PersonaWorkflowDot,
  PersonaStoryLine,
  UserStoryBox,
  CollapsedPersonaGroup,
  Position,
} from "../../types/landscape.js";
import { useSvgPanZoom } from "../domain/svg/useSvgPanZoom.js";
import { curvedPath, COLLAPSED_GROUP_H, COLLAPSED_PERSONA_GAP } from "../../utils/layout/layout-helpers.js";
import { useCollapseAnimation } from "./useCollapseAnimation.js";
import type { DynamicLayoutSnapshot } from "./useCollapseAnimation.js";

/* ── colour palette ─────────────────────────────────────────────────── */
const CTX_COLORS: Record<string, string> = {
  internal: "#3b82f6",
  "external-system": "#ef4444",
  "human-process": "#f59e0b",
  unknown: "#6b7280",
};
const SUBDOMAIN_BG: Record<string, string> = {
  core: "rgba(139,92,246,0.06)",
  supporting: "rgba(59,130,246,0.06)",
  generic: "rgba(107,114,128,0.04)",
  external: "rgba(239,68,68,0.05)",
};
const SUBDOMAIN_BORDER: Record<string, string> = {
  core: "#a78bfa",
  supporting: "#93c5fd",
  generic: "#d1d5db",
  external: "#fca5a5",
};

/* ── system hierarchy colours by depth ─────────────────────────────── */
const SYSTEM_BG: string[] = [
  "rgba(51,65,85,0.06)",     // depth 0 — system (slate)
  "rgba(99,102,241,0.05)",   // depth 1 — subsystem (indigo)
  "rgba(14,165,233,0.05)",   // depth 2 — stack (sky)
  "rgba(168,85,247,0.04)",   // depth 3+ (purple)
];
const SYSTEM_BORDER: string[] = [
  "#64748b",  // depth 0 — slate
  "#818cf8",  // depth 1 — indigo
  "#38bdf8",  // depth 2 — sky
  "#a78bfa",  // depth 3+
];
const SYSTEM_LABEL_COLOR: string[] = [
  "#334155",  // depth 0
  "#6366f1",  // depth 1
  "#0284c7",  // depth 2
  "#7c3aed",  // depth 3+
];
const NODE_TYPE_ICON: Record<string, string> = {
  system: "\u25A0",      // ■
  subsystem: "\u25CB",   // ○
  stack: "\u25A1",        // □
  layer: "\u25B3",        // △
};
const EVENT_COLOR = "#8b5cf6";
const UNRESOLVED_COLOR = "#dc2626";
const WORKFLOW_COLOR = "#14b8a6";
const CAP_COLOR = "#f97316";
// Capability colors by derivedStatus
const CAP_STATUS_COLOR: Record<string, string> = {
  stable: "#f97316",       // orange
  planned: "#eab308",      // yellow
  deprecated: "#ef4444",   // red
};
const CAP_STATUS_LABEL_COLOR: Record<string, string> = {
  stable: "#9a3412",
  planned: "#713f12",
  deprecated: "#991b1b",
};
const STORY_LINE_COLOR = EVENT_COLOR; // Same as event flows — story lines are the start of the flow

const PERSONA_COLORS = ["#ec4899", "#06b6d4", "#84cc16", "#f59e0b", "#8b5cf6", "#ef4444"];

/* ── Props ──────────────────────────────────────────────────────────── */
interface Props {
  graph: LandscapeGraph;
  positions: LandscapePositions;
  /** When provided, only render workflows whose ID is in this set */
  activeWorkflowIds?: Set<string>;
  /** Set of persona IDs whose story groups are collapsed */
  collapsedPersonas: Set<string>;
  /** Toggle a single persona's collapsed state */
  onTogglePersona: (personaId: string) => void;
  /** Called when a persona badge is clicked (for filtering) */
  onSelectPersona?: (personaId: string) => void;
  /** Called when an individual user story is clicked (for filtering) */
  onSelectStory?: (storyId: string) => void;
  /** Currently active persona filter (to highlight) */
  activePersonaId?: string | null;
  /** Currently active story filter (to highlight) */
  activeStoryId?: string | null;
}

type Selection =
  | { kind: "context"; data: ResolvedContext }
  | { kind: "event"; data: LandscapeEvent }
  | { kind: "capability"; data: LandscapeCapability }
  | { kind: "persona"; data: LandscapePersona }
  | { kind: "inferred"; data: InferredSystem }
  | { kind: "workflow"; data: LandscapeWorkflow }
  | null;

/* ══════════════════════════════════════════════════════════════════════ */
export function LandscapeCanvas({ graph, positions, activeWorkflowIds, collapsedPersonas, onTogglePersona, onSelectPersona, onSelectStory, activePersonaId, activeStoryId }: Props) {
  const [selection, setSelection] = useState<Selection>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [animationPaused, setAnimationPaused] = useState(false);

  const { viewBox, handlers, svgRef } = useSvgPanZoom();
  const vb = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;

  // ── Dynamic layout based on which personas are collapsed ───────
  // Recompute Y positions, story boxes, group boxes, and connection
  // lines whenever the collapsed set changes.
  const targetLayout = useMemo((): DynamicLayoutSnapshot => {
    const STORY_BOX_X = 200;
    const STORY_BOX_W = 220;
    const STORY_BOX_H = 28;
    const STORY_GAP = 6;
    const PERSONA_GAP = 20;
    const PERSONA_X = 160; // fallback; use actual X from positions if available

    // Group stories by persona
    const storiesByPersona = new Map<string, typeof graph.userStories>();
    for (const story of graph.userStories) {
      if (!storiesByPersona.has(story.persona)) storiesByPersona.set(story.persona, []);
      storiesByPersona.get(story.persona)!.push(story);
    }

    const personaPositions = new Map<string, Position>();
    const storyBoxes: UserStoryBox[] = [];
    const storyLines: PersonaStoryLine[] = [];
    const collapsedGroups: CollapsedPersonaGroup[] = [];
    const collapsedLines: PersonaStoryLine[] = [];

    // Use the first persona's X from pre-computed positions, or default
    const firstPersonaPos = graph.personas.length > 0
      ? positions.personaPositions.get(graph.personas[0].id)
      : null;
    const pX = firstPersonaPos?.x ?? PERSONA_X;

    let cursorY = 50;

    for (let pi = 0; pi < graph.personas.length; pi++) {
      const persona = graph.personas[pi];
      const stories = storiesByPersona.get(persona.id) || [];
      const isCollapsed = collapsedPersonas.has(persona.id);

      if (isCollapsed) {
        // Collapsed: single group box
        const groupHeight = COLLAPSED_GROUP_H;
        const personaCenterY = cursorY + groupHeight / 2;
        personaPositions.set(persona.id, { x: pX, y: personaCenterY });

        const uniqueCaps = [...new Set(stories.flatMap((s) => s.capabilities))];
        const groupY = personaCenterY - COLLAPSED_GROUP_H / 2;

        collapsedGroups.push({
          personaId: persona.id,
          personaIndex: pi,
          personaName: persona.name,
          storyCount: stories.length,
          uniqueCapabilities: uniqueCaps,
          x: STORY_BOX_X,
          y: groupY,
          width: STORY_BOX_W,
          height: COLLAPSED_GROUP_H,
        });

        // Connection lines from collapsed group to capabilities
        const boxCenterY = groupY + COLLAPSED_GROUP_H / 2;
        const boxRightX = STORY_BOX_X + STORY_BOX_W;
        for (let ci = 0; ci < uniqueCaps.length; ci++) {
          const capId = uniqueCaps[ci];
          const cPos = positions.capabilityPositions.get(capId);
          if (!cPos) continue;

          const baseAngle = (pi * 0.02) + (ci * 0.025);
          const dist = Math.abs(cPos.x - boxRightX);
          const distFactor = Math.min(1, 400 / Math.max(dist, 100));
          const curvature = (0.08 + baseAngle) * distFactor;

          collapsedLines.push({
            personaId: persona.id,
            personaIndex: pi,
            userStoryId: `collapsed-${persona.id}`,
            userStoryTitle: `${stories.length} stories`,
            userStoryStatus: "approved",
            capabilityId: capId,
            storyBoxPos: { x: boxRightX, y: boxCenterY },
            path: {
              d: curvedPath(boxRightX, boxCenterY, cPos.x, cPos.y, curvature),
              points: [{ x: boxRightX, y: boxCenterY }, cPos],
            },
          });
        }

        cursorY += groupHeight + COLLAPSED_PERSONA_GAP;
      } else {
        // Expanded: individual story boxes
        const groupHeight = Math.max(1, stories.length) * (STORY_BOX_H + STORY_GAP) - STORY_GAP;
        const personaCenterY = cursorY + groupHeight / 2;
        personaPositions.set(persona.id, { x: pX, y: personaCenterY });

        const startY = personaCenterY - groupHeight / 2;
        stories.forEach((story, si) => {
          const boxY = startY + si * (STORY_BOX_H + STORY_GAP);
          const boxCenterY = boxY + STORY_BOX_H / 2;
          const boxRightX = STORY_BOX_X + STORY_BOX_W;

          storyBoxes.push({
            id: story.id,
            title: story.title,
            personaId: persona.id,
            personaIndex: pi,
            capabilities: story.capabilities,
            status: story.status,
            x: STORY_BOX_X,
            y: boxY,
            width: STORY_BOX_W,
            height: STORY_BOX_H,
          });

          for (let ci = 0; ci < story.capabilities.length; ci++) {
            const capId = story.capabilities[ci];
            const cPos = positions.capabilityPositions.get(capId);
            if (!cPos) continue;

            const baseAngle = (pi * 0.02) + (si * 0.015) + (ci * 0.03);
            const dist = Math.abs(cPos.x - boxRightX);
            const distFactor = Math.min(1, 400 / Math.max(dist, 100));
            const curvature = (0.08 + baseAngle) * distFactor;

            storyLines.push({
              personaId: persona.id,
              personaIndex: pi,
              userStoryId: story.id,
              userStoryTitle: story.title,
              userStoryStatus: story.status,
              capabilityId: capId,
              storyBoxPos: { x: boxRightX, y: boxCenterY },
              path: {
                d: curvedPath(boxRightX, boxCenterY, cPos.x, cPos.y, curvature),
                points: [{ x: boxRightX, y: boxCenterY }, cPos],
              },
            });
          }
        });

        cursorY += groupHeight + PERSONA_GAP;
      }
    }

    // Build lookup for collapsed groups
    const collapsedGroupsByPersona = new Map<string, CollapsedPersonaGroup>();
    for (const g of collapsedGroups) {
      collapsedGroupsByPersona.set(g.personaId, g);
    }

    return {
      personaPositions,
      storyBoxes,
      storyLines,
      collapsedGroups,
      collapsedLines,
      collapsedGroupsByPersona,
    };
  }, [graph, positions.capabilityPositions, positions.personaPositions, collapsedPersonas]);

  // ── Smooth animation layer ─────────────────────────────────────
  const animatedLayout = useCollapseAnimation(targetLayout, collapsedPersonas);

  return (
    <div className="relative w-full h-[calc(100vh-120px)] overflow-hidden bg-white dark:bg-gray-950">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move"
        viewBox={vb}
        {...handlers}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── defs ─────────────────────────────────────────────────── */}
        <defs>
          <pattern id="lg" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="#cbd5e1" opacity="0.25" />
          </pattern>
          <marker id="ea" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3z" fill={EVENT_COLOR} />
          </marker>
          <marker id="ea-h" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3z" fill="#6366f1" />
          </marker>
          <marker id="wa" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3z" fill={WORKFLOW_COLOR} />
          </marker>
          <marker id="ua" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3z" fill={UNRESOLVED_COLOR} />
          </marker>
          <marker id="ua-h" markerWidth="10" markerHeight="10" refX="9" refY="4" orient="auto">
            <path d="M0,0 L0,8 L9,4z" fill={UNRESOLVED_COLOR} />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* 1 ── grid ──────────────────────────────────────────────── */}
        <rect width={positions.canvasWidth} height={positions.canvasHeight} fill="url(#lg)" style={{ pointerEvents: "none" }} />

        {/* 2 ── system hierarchy boxes OR flat subdomain group boxes ── */}
        {positions.systemBounds.size > 0 ? (
          /* Render nested taxonomy system boxes */
          (() => {
            // Identify external system FQTNs from context types
            const externalFqtns = new Set<string>();
            for (const ctx of graph.contexts) {
              if (ctx.contextType === "external-system" && ctx.taxonomyNode) {
                externalFqtns.add(ctx.taxonomyNode);
                // Also mark parent FQTNs
                const parts = ctx.taxonomyNode.split(".");
                for (let i = 1; i <= parts.length; i++) {
                  externalFqtns.add(parts.slice(0, i).join("."));
                }
              }
            }

            return Array.from(positions.systemBounds.values()).map((sys: SystemBounds) => {
              const isExternal = externalFqtns.has(sys.fqtn);
              const d = Math.min(sys.depth, SYSTEM_BG.length - 1);

              // External systems get distinct styling
              const bg = isExternal ? "rgba(239,68,68,0.04)" : SYSTEM_BG[d];
              const border = isExternal ? "#f87171" : SYSTEM_BORDER[d];
              const labelColor = isExternal ? "#dc2626" : SYSTEM_LABEL_COLOR[d];
              const icon = isExternal ? "\u2B12" : (NODE_TYPE_ICON[sys.nodeType] || ""); // ⬒ for external
              const fontSize = sys.depth === 0 ? 14 : sys.depth === 1 ? 12 : 11;
              const strokeW = sys.depth === 0 ? 2.5 : sys.depth === 1 ? 2 : 1.5;
              const rx = sys.depth === 0 ? 16 : sys.depth === 1 ? 12 : 8;
              const dashArray = isExternal ? "8,4" : sys.nodeType === "stack" ? "6,3" : undefined;
              const nodeTypeLabel = isExternal ? "external system" : sys.nodeType;

              return (
                <g key={sys.fqtn} style={{ pointerEvents: "none" }}>
                  <rect
                    x={sys.x} y={sys.y} width={sys.width} height={sys.height}
                    fill={bg}
                    stroke={border}
                    strokeWidth={strokeW} rx={rx}
                    strokeDasharray={dashArray}
                  />
                  <text
                    x={sys.x + 14} y={sys.y + 20}
                    fill={labelColor}
                    fontSize={fontSize} fontWeight="700" letterSpacing="0.5"
                  >
                    {icon} {sys.name.replace(/-/g, " ").toUpperCase()}
                  </text>
                  <text
                    x={sys.x + 14} y={sys.y + 20 + fontSize + 2}
                    fill={labelColor}
                    fontSize="9" fontWeight="400" opacity="0.6"
                  >
                    {nodeTypeLabel}
                  </text>
                </g>
              );
            });
          })()
        ) : (
          /* Fallback: flat subdomain group boxes (no taxonomy) */
          positions.groupBoxes.map((box: GroupBox) => (
            <g key={box.type} style={{ pointerEvents: "none" }}>
              <rect
                x={box.x} y={box.y} width={box.width} height={box.height}
                fill={SUBDOMAIN_BG[box.type] || SUBDOMAIN_BG.generic}
                stroke={SUBDOMAIN_BORDER[box.type] || SUBDOMAIN_BORDER.generic}
                strokeWidth="2" rx="12"
              />
              <text
                x={box.x + 16} y={box.y + 22}
                fill={SUBDOMAIN_BORDER[box.type] || "#9ca3af"}
                fontSize="13" fontWeight="700" letterSpacing="0.5"
              >
                {box.label.toUpperCase()}
              </text>
            </g>
          ))
        )}

        {/* 3 ── event flow arrows (cap-to-cap, workflow-aware) ──────── */}
        {(() => {
          const hasWorkflowFilter = activeWorkflowIds !== undefined;

          // Build a lookup: event ID → event object
          const eventById = new Map(graph.events.map((e) => [e.id, e]));

          return Array.from(positions.eventPaths.entries()).map(([key, path]) => {
            // Extract event ID from key (format: "{eventId}-r{index}")
            const eventId = key.replace(/-r\d+$/, "");
            const event = eventById.get(eventId);
            if (!event) return null;

            const isHovered = hoveredEvent === key;

            // Workflow-aware styling
            const edgeWorkflows = positions.eventWorkflowMap.get(key) || [];
            const belongsToActiveWorkflow = hasWorkflowFilter &&
              edgeWorkflows.some((wfId) => activeWorkflowIds!.has(wfId));
            const isDimmed = hasWorkflowFilter && !belongsToActiveWorkflow;

            // Hide non-matching flows when filter is active
            if (isDimmed && !isHovered) return null;

            const strokeWidth = isHovered ? 3 : belongsToActiveWorkflow ? 2.5 : 1.5;
            const strokeOpacity = isHovered ? 1 : belongsToActiveWorkflow ? 0.7 : 0.35;
            const stroke = isHovered ? "#6366f1" : EVENT_COLOR;

            return (
              <g
                key={key}
                onMouseEnter={() => setHoveredEvent(key)}
                onMouseLeave={() => setHoveredEvent(null)}
                onClick={() => setSelection({ kind: "event", data: event })}
                style={{ cursor: "pointer" }}
              >
                {/* Wider invisible hit area for easier hovering */}
                <path
                  d={path.d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="12"
                />
                <path
                  d={path.d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  markerEnd={isHovered ? "url(#ea-h)" : "url(#ea)"}
                  filter={isHovered || belongsToActiveWorkflow ? "url(#glow)" : undefined}
                />
                {/* Hover-only event name label */}
                {isHovered && path.points && path.points.length >= 2 && (
                  <text
                    x={(path.points[0].x + path.points[1].x) / 2}
                    y={(path.points[0].y + path.points[1].y) / 2 - 14}
                    textAnchor="middle" fill="#6366f1" fontSize="11" fontWeight="700"
                    style={{ pointerEvents: "none" }}
                  >
                    {event.title}
                  </text>
                )}
              </g>
            );
          });
        })()}

        {/* 4 ── invisible workflow chain paths (for dot animation) ──── */}
        {graph.workflows
          .filter((wf) => !activeWorkflowIds || activeWorkflowIds.has(wf.id))
          .map((wf) => {
          const chain = positions.workflowEventChains.get(wf.id);
          if (!chain) return null;
          return (
            <path
              key={`wf-chain-${wf.id}`}
              id={`wf-chain-${wf.id}`}
              d={chain.d}
              fill="none"
              stroke="none"
            />
          );
        })}

        {/* 4b ── animated persona dots riding event chains ──────────── */}
        {!animationPaused &&
          positions.personaFlowDots
            .filter((dot) =>
              (!activeWorkflowIds || activeWorkflowIds.has(dot.workflowId)) &&
              (!activePersonaId || dot.personaId === activePersonaId)
            )
            .map((dot: PersonaWorkflowDot) => {
            const chain = positions.workflowEventChains.get(dot.workflowId);
            if (!chain) return null;

            const color = PERSONA_COLORS[dot.personaIndex % PERSONA_COLORS.length];

            // Duration scales with path length so all dots move at ~same velocity.
            // Target: ~150 px/s, clamped 6s–20s, with ±10% random jitter.
            let pathLen = 0;
            if (chain.points && chain.points.length >= 2) {
              for (let i = 1; i < chain.points.length; i++) {
                const dx = chain.points[i].x - chain.points[i - 1].x;
                const dy = chain.points[i].y - chain.points[i - 1].y;
                pathLen += Math.sqrt(dx * dx + dy * dy);
              }
            }
            const baseDuration = Math.max(6, Math.min(20, pathLen / 150));
            const seed = (dot.personaIndex * 7 + dot.staggerIndex * 13 + dot.workflowId.length * 3) % 100;
            const duration = baseDuration * (0.9 + (seed / 100) * 0.2); // ±10%
            const staggerDelay = (dot.staggerIndex / Math.max(dot.totalOnWorkflow, 1)) * duration + (seed % 2);
            const dotKey = `dot-${dot.personaId}-${dot.workflowId}`;

            return (
              <g key={dotKey}>
                {/* Glowing outer ring */}
                <circle r="10" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1" strokeOpacity="0.4">
                  <animateMotion
                    dur={`${duration}s`}
                    begin={`${staggerDelay}s`}
                    repeatCount="indefinite"
                    fill="freeze"
                  >
                    <mpath href={`#wf-chain-${dot.workflowId}`} />
                  </animateMotion>
                </circle>
                {/* Inner solid dot */}
                <circle r="6" fill={color} fillOpacity="0.9" stroke="#fff" strokeWidth="1.5">
                  <animateMotion
                    dur={`${duration}s`}
                    begin={`${staggerDelay}s`}
                    repeatCount="indefinite"
                    fill="freeze"
                  >
                    <mpath href={`#wf-chain-${dot.workflowId}`} />
                  </animateMotion>
                </circle>
                {/* Persona initial label */}
                <text
                  textAnchor="middle"
                  dy="3.5"
                  fill="#fff"
                  fontSize="7"
                  fontWeight="800"
                  style={{ pointerEvents: "none" }}
                >
                  {dot.personaName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  <animateMotion
                    dur={`${duration}s`}
                    begin={`${staggerDelay}s`}
                    repeatCount="indefinite"
                    fill="freeze"
                  >
                    <mpath href={`#wf-chain-${dot.workflowId}`} />
                  </animateMotion>
                </text>
              </g>
            );
          })}

        {/* 5 ── user story boxes / collapsed groups (left column) ──── */}
        {(() => {
          const hasWorkflowFilter = activeWorkflowIds !== undefined;
          const activeCaps = hasWorkflowFilter
            ? new Set(graph.workflows
                .filter(wf => activeWorkflowIds!.has(wf.id))
                .flatMap(wf => wf.capabilityIds || []))
            : null;

          const elements: React.ReactNode[] = [];

          // ── Render ALL collapsed group boxes from animation (includes fade-outs) ──
          const isPersonaFilter = !!activePersonaId;

          for (const group of animatedLayout.collapsedGroups) {
            const pi = group.personaIndex;
            const personaColor = PERSONA_COLORS[pi % PERSONA_COLORS.length] || "#999";
            const groupOpacity = animatedLayout.collapsedGroupOpacity.get(group.personaId) ?? 1;

            // Only apply activeCaps filter when there's a pure workflow filter (no persona selection)
            if (!isPersonaFilter && activeCaps && !group.uniqueCapabilities.some((c: string) => activeCaps.has(c))) continue;
            // Skip fully transparent elements
            if (groupOpacity <= 0.01) continue;

            // Dim non-selected personas when a persona filter is active
            const isSelectedPersona = group.personaId === activePersonaId;
            const groupDim = isPersonaFilter && !isSelectedPersona ? 0.25 : 1;

            // Label: show plain count when persona filter active; show "X of Y" only for pure workflow filter
            const label = (!isPersonaFilter && activeCaps)
              ? (() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const matchingStories = graph.userStories.filter((s: any) =>
                    s.persona === group.personaId &&
                    s.capabilities.some((c: string) => activeCaps.has(c))
                  ).length;
                  return `${matchingStories} of ${group.storyCount} ${group.storyCount === 1 ? "story" : "stories"}`;
                })()
              : `${group.storyCount} ${group.storyCount === 1 ? "story" : "stories"}`;

            elements.push(
              <g
                key={`collapsed-${group.personaId}`}
                onClick={(e) => { e.stopPropagation(); onTogglePersona(group.personaId); }}
                style={{ cursor: "pointer", opacity: groupOpacity * groupDim }}
              >
                <rect
                  x={group.x} y={group.y}
                  width={group.width} height={group.height}
                  rx="6"
                  fill="rgba(0,0,0,0.45)"
                  stroke={personaColor} strokeWidth="1.5" strokeOpacity="0.5"
                />
                {/* Persona color accent on left edge */}
                <rect
                  x={group.x} y={group.y}
                  width="3" height={group.height}
                  rx="1"
                  fill={personaColor} fillOpacity="0.8"
                />
                {/* Expand chevron */}
                <text
                  x={group.x + 11} y={group.y + group.height / 2 + 4}
                  fill={personaColor} fontSize="10" fontWeight="700"
                  style={{ pointerEvents: "none" }}
                >
                  {"\u25B8"}
                </text>
                {/* Story count label */}
                <text
                  x={group.x + 22} y={group.y + group.height / 2 + 4}
                  fill="#e2e8f0"
                  fontSize="9.5"
                  fontWeight="600"
                  style={{ pointerEvents: "none" }}
                >
                  {label}
                </text>
                {/* Subtle capability count badge */}
                <text
                  x={group.x + group.width - 8} y={group.y + group.height / 2 + 3}
                  textAnchor="end"
                  fill={personaColor} fontSize="7" opacity="0.5"
                  style={{ pointerEvents: "none" }}
                >
                  {group.uniqueCapabilities.length} cap{group.uniqueCapabilities.length !== 1 ? "s" : ""}
                </text>
              </g>
            );
          }

          // ── Render ALL expanded story boxes from animation (includes fade-outs) ──
          for (const box of animatedLayout.storyBoxes) {
            const pi = box.personaIndex;
            const personaColor = PERSONA_COLORS[pi % PERSONA_COLORS.length] || "#999";
            const boxOpacity = animatedLayout.storyBoxOpacity.get(box.id) ?? 1;

            // Hide story boxes that have no capability overlap with active workflows (pure workflow filter only)
            if (!isPersonaFilter && activeCaps && !box.capabilities.some((c: string) => activeCaps.has(c))) continue;
            // Skip fully transparent
            if (boxOpacity <= 0.01) continue;

            const isImplementing = box.status === "implementing";
            const isActiveStory = activeStoryId === box.id;
            const boxDim = isPersonaFilter && box.personaId !== activePersonaId ? 0.25 : 1;

            elements.push(
              <g key={box.id}
                onClick={(e) => { e.stopPropagation(); onSelectStory?.(box.id); }}
                style={{ cursor: "pointer", opacity: boxOpacity * boxDim }}
              >
                <rect
                  x={box.x} y={box.y}
                  width={box.width} height={box.height}
                  rx="4"
                  fill={isActiveStory ? "rgba(139,92,246,0.15)" : "rgba(0,0,0,0.5)"}
                  stroke={isActiveStory ? "#a78bfa" : personaColor}
                  strokeWidth={isActiveStory ? 2 : 1}
                  strokeOpacity={isImplementing && !isActiveStory ? 0.3 : 0.6}
                />
                {/* Persona color accent on left edge */}
                <rect
                  x={box.x} y={box.y}
                  width="3" height={box.height}
                  rx="1"
                  fill={personaColor} fillOpacity={isImplementing ? 0.4 : 0.8}
                />
                <text
                  x={box.x + 10} y={box.y + box.height / 2 + 4}
                  fill="#e2e8f0"
                  fontSize="9"
                  fontWeight={isActiveStory ? "700" : "500"}
                  opacity={isImplementing && !isActiveStory ? 0.4 : 0.8}
                  style={{ pointerEvents: "none" }}
                >
                  {box.title.length > 30 ? box.title.slice(0, 30) + "..." : box.title}
                </text>
                {isImplementing && (
                  <text
                    x={box.x + box.width - 8} y={box.y + box.height / 2 + 3}
                    textAnchor="end"
                    fill="#f59e0b" fontSize="7" opacity="0.5" fontStyle="italic"
                    style={{ pointerEvents: "none" }}
                  >
                    wip
                  </text>
                )}
              </g>
            );
          }

          return elements;
        })()}

        {/* 5b ── story box → capability connection lines (collapse-aware) */}
        {(() => {
          const hasWorkflowFilter = activeWorkflowIds !== undefined;
          const activeCaps = hasWorkflowFilter
            ? new Set(graph.workflows
                .filter(wf => activeWorkflowIds!.has(wf.id))
                .flatMap(wf => wf.capabilityIds || []))
            : null;

          const elements: React.ReactNode[] = [];

          // ── Render ALL collapsed lines from animation (includes fade-outs) ──
          for (const line of animatedLayout.collapsedLines) {
            if (activePersonaId && line.personaId !== activePersonaId) continue;
            if (activeCaps && !activeCaps.has(line.capabilityId)) continue;
            const key = `collapsed-${line.personaId}-${line.capabilityId}`;
            const lineOpacity = animatedLayout.collapsedLineOpacity.get(key) ?? 1;
            if (lineOpacity <= 0.01) continue;

            const isHighlighted = !!activePersonaId && line.personaId === activePersonaId;
            const lineColor = isHighlighted
              ? PERSONA_COLORS[line.personaIndex % PERSONA_COLORS.length]
              : STORY_LINE_COLOR;

            elements.push(
              <path
                key={key}
                d={line.path.d}
                fill="none"
                stroke={lineColor}
                strokeWidth={isHighlighted ? "2.5" : "1.8"}
                strokeOpacity={(isHighlighted ? 0.8 : 0.4) * lineOpacity}
                markerEnd="url(#ea)"
              />
            );
          }

          // ── Render ALL expanded lines from animation (includes fade-outs) ──
          for (const line of animatedLayout.storyLines) {
            if (activePersonaId && line.personaId !== activePersonaId) continue;
            const isImplementing = line.userStoryStatus === "implementing";
            if (activeCaps && !activeCaps.has(line.capabilityId)) continue;
            const key = `${line.userStoryId}-${line.capabilityId}`;
            const lineOpacity = animatedLayout.storyLineOpacity.get(key) ?? 1;
            if (lineOpacity <= 0.01) continue;

            const isHighlighted = !!activePersonaId && line.personaId === activePersonaId;
            const baseOpacity = isHighlighted
              ? (isImplementing ? 0.5 : 0.8)
              : (isImplementing ? 0.15 : 0.35);
            const lineColor = isHighlighted
              ? PERSONA_COLORS[line.personaIndex % PERSONA_COLORS.length]
              : STORY_LINE_COLOR;

            elements.push(
              <path
                key={key}
                d={line.path.d}
                fill="none"
                stroke={lineColor}
                strokeWidth={isHighlighted ? "2" : "1.5"}
                strokeOpacity={baseOpacity * lineOpacity}
                markerEnd={isImplementing && !isHighlighted ? undefined : "url(#ea)"}
              />
            );
          }

          return elements;
        })()}

        {/* 5c ── persona dots riding story→capability lines ────────── */}
        {/* Only render when a persona or story filter is active to avoid visual clutter */}
        {!animationPaused && (activePersonaId || activeStoryId) && (() => {
          const hasWorkflowFilter = activeWorkflowIds !== undefined;
          const activeCaps = hasWorkflowFilter
            ? new Set(graph.workflows
                .filter(wf => activeWorkflowIds!.has(wf.id))
                .flatMap(wf => wf.capabilityIds || []))
            : null;

          const paths: React.ReactNode[] = [];
          const dots: React.ReactNode[] = [];

          for (const persona of graph.personas) {
            // Only show dots for the actively filtered persona
            if (activePersonaId && persona.id !== activePersonaId) continue;

            const pi = graph.personas.indexOf(persona);
            const isCollapsed = collapsedPersonas.has(persona.id);
            const color = PERSONA_COLORS[pi % PERSONA_COLORS.length];
            const initials = persona.name.split(" ").map(w => w[0]).join("").slice(0, 2);

            let lines = isCollapsed
              ? targetLayout.collapsedLines.filter(l => l.personaId === persona.id)
              : targetLayout.storyLines.filter(l => l.personaId === persona.id);

            // If a specific story is selected, only show dots for that story's lines
            if (activeStoryId) {
              lines = lines.filter(l => l.userStoryId === activeStoryId);
            }

            let lineIdx = 0;
            for (const line of lines) {
              if (activeCaps && !activeCaps.has(line.capabilityId)) continue;

              const pathId = `story-path-${persona.id}-${line.userStoryId}-${line.capabilityId}`;
              const duration = 4 + (lineIdx * 0.7) % 3; // 4-7s, staggered
              const delay = (lineIdx * 1.3) % 3;

              // Invisible path for animateMotion to follow
              paths.push(
                <path
                  key={pathId}
                  id={pathId}
                  d={line.path.d}
                  fill="none"
                  stroke="none"
                />
              );

              // Animated dot
              dots.push(
                <g key={`sdot-${pathId}`}>
                  <circle r="7" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="0.8" strokeOpacity="0.3">
                    <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" fill="freeze">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                  <circle r="4.5" fill={color} fillOpacity="0.85" stroke="#fff" strokeWidth="1">
                    <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" fill="freeze">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                  <text textAnchor="middle" dy="2.5" fill="#fff" fontSize="5" fontWeight="800" style={{ pointerEvents: "none" }}>
                    {initials}
                    <animateMotion dur={`${duration}s`} begin={`${delay}s`} repeatCount="indefinite" fill="freeze">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </text>
                </g>
              );

              lineIdx++;
            }
          }

          return [...paths, ...dots];
        })()}

        {/* 6 ── capability nodes ────────────────────────────────────── */}
        {/* In taxonomy mode: rounded rect port nodes on system edges */}
        {/* In legacy mode: floating orange diamonds */}
        {(() => {
          const isTaxonomyMode = positions.systemBounds.size > 0;

          // Pre-compute label positions and detect collisions.
          // For each cap, the label sits below the diamond/rect by default.
          // If two labels would overlap, alternate above/below.
          const capPositions = graph.capabilities
            .map((cap) => ({ cap, pos: positions.capabilityPositions.get(cap.id) }))
            .filter((c): c is { cap: LandscapeCapability; pos: { x: number; y: number } } => !!c.pos);

          // Sort by X so we can detect horizontal neighbors
          const sorted = [...capPositions].sort((a, b) => a.pos.x - b.pos.x);
          // Determine label placement: +1 = below, -1 = above
          const labelDir = new Map<string, number>();
          for (let i = 0; i < sorted.length; i++) {
            const cur = sorted[i];
            let needsFlip = false;
            // Check proximity to previous cap that kept its label below
            for (let j = i - 1; j >= 0 && j >= i - 2; j--) {
              const prev = sorted[j];
              const dx = Math.abs(cur.pos.x - prev.pos.x);
              const dy = Math.abs(cur.pos.y - prev.pos.y);
              if (dx < 110 && dy < 50 && labelDir.get(prev.cap.id) === 1) {
                needsFlip = true;
                break;
              }
            }
            labelDir.set(cur.cap.id, needsFlip ? -1 : 1);
          }

           return graph.capabilities.map((cap) => {
            const pos = positions.capabilityPositions.get(cap.id);
            if (!pos) return null;
            const isSelected = selection?.kind === "capability" && selection.data.id === cap.id;
            const dir = labelDir.get(cap.id) || 1;
            // Use derivedStatus for color if available, fall back to status
            const effectiveStatus = (cap as { derivedStatus?: string }).derivedStatus ?? cap.status;
            const fillColor = CAP_STATUS_COLOR[effectiveStatus] ?? CAP_COLOR;
            const labelColor = CAP_STATUS_LABEL_COLOR[effectiveStatus] ?? "#9a3412";
            // Show a small indicator for non-root capabilities (has a parent)
            const hasParent = !!(cap as { parentName?: string | null }).parentName;

            if (isTaxonomyMode) {
              const pw = 18;
              const ph = 18;
              const labelY = dir === 1 ? pos.y + ph + 14 : pos.y - ph - 6;
              return (
                <g key={cap.id} onClick={() => setSelection({ kind: "capability", data: cap })} style={{ cursor: "pointer" }}>
                  <rect
                    x={pos.x - pw} y={pos.y - ph}
                    width={pw * 2} height={ph * 2}
                    fill={fillColor} fillOpacity="0.9"
                    stroke={isSelected ? "#fff" : "#fff"}
                    strokeWidth={isSelected ? 3 : 1.5}
                    rx="5"
                    filter={isSelected ? "url(#glow)" : undefined}
                  />
                  {/* Port connectors */}
                  <circle cx={pos.x - pw} cy={pos.y} r="4" fill={fillColor} stroke="#fff" strokeWidth="1.5" />
                  <circle cx={pos.x + pw} cy={pos.y} r="4" fill={fillColor} stroke="#fff" strokeWidth="1.5" />
                  {/* Small indent indicator for child capabilities */}
                  {hasParent && (
                    <circle cx={pos.x} cy={pos.y - ph + 4} r="2.5" fill="#fff" fillOpacity="0.6" />
                  )}
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">
                    {cap.tag || cap.id}
                  </text>
                  <text x={pos.x} y={labelY} textAnchor="middle" fill={labelColor} fontSize="9" fontWeight="600">
                    {cap.name.length > 20 ? cap.name.slice(0, 20) + ".." : cap.name}
                  </text>
                  {/* Status badge for non-stable */}
                  {effectiveStatus !== "stable" && (
                    <text x={pos.x} y={dir === 1 ? labelY + 10 : labelY - 10} textAnchor="middle" fill={labelColor} fontSize="8" fontStyle="italic">
                      {effectiveStatus}
                    </text>
                  )}
                </g>
              );
            } else {
              return (
                <g key={cap.id} onClick={() => setSelection({ kind: "capability", data: cap })} style={{ cursor: "pointer" }}>
                  <polygon
                    points={`${pos.x},${pos.y - 14} ${pos.x + 14},${pos.y} ${pos.x},${pos.y + 14} ${pos.x - 14},${pos.y}`}
                    fill={fillColor} fillOpacity="0.85" stroke="#fff" strokeWidth="2"
                  />
                  <text x={pos.x} y={pos.y + 30} textAnchor="middle" fill={labelColor} fontSize="10" fontWeight="600">
                    {cap.name.length > 18 ? cap.name.slice(0, 18) + ".." : cap.name}
                  </text>
                  <text x={pos.x} y={pos.y + 42} textAnchor="middle" fill={labelColor} fontSize="9">
                    {cap.tag || cap.id}
                  </text>
                  {effectiveStatus !== "stable" && (
                    <text x={pos.x} y={pos.y + 53} textAnchor="middle" fill={labelColor} fontSize="8" fontStyle="italic">
                      {effectiveStatus}
                    </text>
                  )}
                </g>
              );
            }
          });
        })()}

        {/* 7 ── context overlays (transparent bounding boxes) ─────────── */}
        {graph.contexts.map((ctx) => {
          const overlay = positions.contextOverlays.get(ctx.id);
          if (!overlay) return null;
          
          // Color based on subdomain type
          const fillColor = ctx.subdomainType === "core" 
            ? "rgba(139,92,246,0.08)" 
            : ctx.subdomainType === "supporting"
            ? "rgba(59,130,246,0.08)"
            : "rgba(107,114,128,0.05)";
          const strokeColor = ctx.subdomainType === "core"
            ? "#a78bfa"
            : ctx.subdomainType === "supporting"
            ? "#93c5fd"
            : "#d1d5db";
          
          const isSelected = selection?.kind === "context" && selection.data.id === ctx.id;

           return (
            <g key={ctx.id} onClick={() => setSelection({ kind: "context", data: ctx })} style={{ cursor: "pointer" }}>
              <rect
                x={overlay.x}
                y={overlay.y}
                width={overlay.width}
                height={overlay.height}
                fill={fillColor}
                stroke={isSelected ? "#fff" : strokeColor}
                strokeWidth={isSelected ? 3 : 1.5}
                strokeDasharray={ctx.contextType === "external-system" ? "6,4" : undefined}
                rx="8"
                filter={isSelected ? "url(#glow)" : undefined}
              />
              {/* Context label at BOTTOM of box to avoid collision with system hierarchy label at top */}
              <text 
                x={overlay.x + overlay.width / 2} 
                y={overlay.y + overlay.height - 18} 
                textAnchor="middle" 
                fill={strokeColor} 
                fontSize="11" 
                fontWeight="600"
                opacity="0.8"
              >
                {ctx.title}
              </text>
              <text 
                x={overlay.x + overlay.width / 2} 
                y={overlay.y + overlay.height - 6} 
                textAnchor="middle" 
                fill={strokeColor} 
                fontSize="9"
                opacity="0.5"
              >
                {ctx.contextType}
              </text>
            </g>
          );
        })}

        {/* 8 ── persona badges ─────────────────────────────────────── */}
        {graph.personas.map((persona, pi) => {
          const isCollapsed = collapsedPersonas.has(persona.id);
          // Use dynamically computed position (accounts for mixed collapsed/expanded)
          const pos = animatedLayout.personaPositions.get(persona.id);
          if (!pos) return null;

          const color = PERSONA_COLORS[pi % PERSONA_COLORS.length];
          const isActiveFilter = activePersonaId === persona.id;
          const badgeDim = activePersonaId && !isActiveFilter ? 0.3 : 1;
          return (
            <g key={persona.id} style={{ opacity: badgeDim }}>
              {/* Persona name + tag anchored to the LEFT of the badge */}
              <g onClick={() => { onSelectPersona?.(persona.id); setSelection({ kind: "persona", data: persona }); }} style={{ cursor: "pointer" }}>
                <text
                  x={pos.x - 24} y={pos.y - 4}
                  textAnchor="end"
                  fill={color} fontSize="10" fontWeight="700"
                  opacity={isActiveFilter ? 1 : 0.8}
                  style={{ pointerEvents: "none" }}
                >
                  {persona.name}
                </text>
                <text
                  x={pos.x - 24} y={pos.y + 9}
                  textAnchor="end"
                  fill={color} fontSize="8" fontWeight="400" opacity={isActiveFilter ? 0.8 : 0.6}
                  style={{ pointerEvents: "none" }}
                >
                  {persona.tag}
                </text>
              </g>
              {/* Clickable persona circle badge → filters graph */}
              <g onClick={() => { onSelectPersona?.(persona.id); setSelection({ kind: "persona", data: persona }); }} style={{ cursor: "pointer" }}>
                <circle cx={pos.x} cy={pos.y} r="18"
                  fill={isActiveFilter ? color : color} fillOpacity={isActiveFilter ? 0.3 : 0.15}
                  stroke={color} strokeWidth={isActiveFilter ? 3 : 2}
                />
                {isActiveFilter && (
                  <circle cx={pos.x} cy={pos.y} r="22"
                    fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,3"
                  />
                )}
                <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill={color} fontSize="16">&#9786;</text>
              </g>
              {/* Collapse/expand toggle chevron */}
              <g
                onClick={(e) => { e.stopPropagation(); onTogglePersona(persona.id); }}
                style={{ cursor: "pointer" }}
              >
                <circle cx={pos.x + 22} cy={pos.y - 14} r="7" fill="rgba(0,0,0,0.4)" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
                <text
                  x={pos.x + 22} y={pos.y - 11}
                  textAnchor="middle"
                  fill={color} fontSize="8" fontWeight="700"
                  style={{ pointerEvents: "none" }}
                >
                  {isCollapsed ? "\u25B8" : "\u25BE"}
                </text>
              </g>
            </g>
          );
        })}

        {/* 9 ── inferred unknown systems ───────────────────────────── */}
        {graph.inferredSystems.map((sys) => {
          const pos = positions.inferredPositions.get(sys.slug);
          if (!pos) return null;
          return (
            <g key={sys.slug} onClick={() => setSelection({ kind: "inferred", data: sys })} style={{ cursor: "pointer" }}>
              <rect
                x={pos.x - 80} y={pos.y - 35} width="160" height="70"
                fill="rgba(107,114,128,0.08)" stroke="#9ca3af" strokeWidth="2" strokeDasharray="6,4" rx="10"
              />
              <text x={pos.x} y={pos.y - 8} textAnchor="middle" fill="#6b7280" fontSize="18" fontWeight="700">???</text>
              <text x={pos.x} y={pos.y + 12} textAnchor="middle" fill="#6b7280" fontSize="11" fontWeight="500">
                {sys.slug}
              </text>
              <text x={pos.x} y={pos.y + 26} textAnchor="middle" fill="#9ca3af" fontSize="9">
                inferred from {sys.inferredFrom.length} event{sys.inferredFrom.length > 1 ? "s" : ""}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── Legend (bottom-left) ───────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 text-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Legend</h3>
          {positions.personaFlowDots.length > 0 && (
            <button
              onClick={() => setAnimationPaused((p) => !p)}
              className="ml-3 px-2 py-0.5 rounded text-xs font-medium border transition-colors"
              style={{
                borderColor: animationPaused ? "#9ca3af" : EVENT_COLOR,
                color: animationPaused ? "#6b7280" : EVENT_COLOR,
                background: animationPaused ? "rgba(156,163,175,0.1)" : "rgba(139,92,246,0.1)",
              }}
            >
              {animationPaused ? "▶ Play" : "⏸ Pause"}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: CTX_COLORS.internal }} /><span className="text-gray-600 dark:text-gray-400">Internal</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: CTX_COLORS["external-system"] }} /><span className="text-gray-600 dark:text-gray-400">External System</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: CTX_COLORS["human-process"] }} /><span className="text-gray-600 dark:text-gray-400">Human Process</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: CTX_COLORS.unknown }} /><span className="text-gray-600 dark:text-gray-400">Unknown / Inferred</span></div>
          <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-200 dark:border-gray-700"><div className="w-6 h-0.5" style={{ background: EVENT_COLOR }} /><span className="text-gray-600 dark:text-gray-400">Event / Story Flow</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-0.5 border-t-2 border-dashed" style={{ borderColor: UNRESOLVED_COLOR }} /><span className="text-gray-600 dark:text-gray-400">Unresolved Flow</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rotate-45" style={{ background: CAP_COLOR }} /><span className="text-gray-600 dark:text-gray-400">Capability</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-3 border-2 border-dashed border-gray-400 rounded" /><span className="text-gray-600 dark:text-gray-400">Inferred System</span></div>
          {positions.systemBounds.size > 0 && (
            <>
              <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-200 dark:border-gray-700"><div className="w-4 h-3 rounded border-2" style={{ borderColor: SYSTEM_BORDER[0], background: SYSTEM_BG[0] }} /><span className="text-gray-600 dark:text-gray-400">System</span></div>
              <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-200 dark:border-gray-700"><div className="w-4 h-3 rounded border-2" style={{ borderColor: SYSTEM_BORDER[1], background: SYSTEM_BG[1] }} /><span className="text-gray-600 dark:text-gray-400">Subsystem</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-3 rounded border-2 border-dashed" style={{ borderColor: SYSTEM_BORDER[2], background: SYSTEM_BG[2] }} /><span className="text-gray-600 dark:text-gray-400">Stack</span></div>
              <div className="flex items-center gap-2"><div className="w-4 h-3 rounded border-2 border-dashed" style={{ borderColor: "#f87171", background: "rgba(239,68,68,0.04)" }} /><span className="text-gray-600 dark:text-gray-400">External System</span></div>
            </>
          )}
          {/* Persona colors */}
          {graph.personas.length > 0 && (
            <>
              <div className="col-span-2 mt-1 pt-1 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold text-[10px] uppercase tracking-wider">Personas</div>
              {graph.personas.map((p, pi) => {
                const color = PERSONA_COLORS[pi % PERSONA_COLORS.length];
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <span className="text-gray-600 dark:text-gray-400">{p.name}</span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Detail Panel (right side) ─────────────────────────────── */}
      {selection && (
        <div className="absolute top-14 right-2 w-80 max-h-[calc(100vh-180px)] overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 z-20">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              {selection.kind === "context" && selection.data.title}
              {selection.kind === "event" && selection.data.title}
              {selection.kind === "capability" && selection.data.name}
              {selection.kind === "persona" && selection.data.name}
              {selection.kind === "inferred" && selection.data.slug}
              {selection.kind === "workflow" && selection.data.title}
            </h3>
            <button onClick={() => setSelection(null)} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-base leading-none transition-colors">&times;</button>
          </div>

          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-3"
            style={{
              background:
                selection.kind === "context" ? CTX_COLORS[selection.data.contextType] + "22"
                : selection.kind === "event" ? EVENT_COLOR + "22"
                : selection.kind === "capability" ? (CAP_STATUS_COLOR[(selection.data as LandscapeCapability & { derivedStatus?: string }).derivedStatus ?? selection.data.status] ?? CAP_COLOR) + "22"
                : "#e5e7eb",
              color:
                selection.kind === "context" ? CTX_COLORS[selection.data.contextType]
                : selection.kind === "event" ? EVENT_COLOR
                : selection.kind === "capability" ? (CAP_STATUS_COLOR[(selection.data as LandscapeCapability & { derivedStatus?: string }).derivedStatus ?? selection.data.status] ?? CAP_COLOR)
                : "#6b7280",
            }}
          >
            {selection.kind}
          </span>

          {/* Context detail */}
          {selection.kind === "context" && (
            <dl className="text-sm space-y-2">
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Slug</dt><dd className="font-mono text-gray-800 dark:text-gray-200">{selection.data.slug}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Type</dt><dd>{selection.data.contextType}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Subdomain</dt><dd>{selection.data.subdomainType || "—"}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Taxonomy Node</dt><dd className="font-mono">{selection.data.taxonomyNode || "—"}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Team</dt><dd>{selection.data.teamOwnership || "—"}</dd></div>
            </dl>
          )}

          {/* Event detail */}
          {selection.kind === "event" && (
            <dl className="text-sm space-y-2">
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Source</dt><dd className="font-mono">{selection.data.sourceContextSlug}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Consumers</dt>
                <dd>{selection.data.resolvedConsumers.map((c) => <span key={c.slug} className="inline-block mr-1 px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs">{c.slug}</span>)}</dd>
              </div>
              {selection.data.unresolvedConsumers.length > 0 && (
                <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Unknown Consumers</dt>
                  <dd>{selection.data.unresolvedConsumers.map((s) => <span key={s} className="inline-block mr-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">{s}</span>)}</dd>
                </div>
              )}
              {selection.data.payload && selection.data.payload.length > 0 && (
                <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Payload</dt>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <dd className="font-mono text-xs space-y-0.5">{selection.data.payload.map((p: any) => <div key={p.name || p.field}>{p.name || p.field}: <span className="text-blue-600 dark:text-blue-400">{p.type}</span></div>)}</dd>
                </div>
              )}
              {selection.data.triggers && selection.data.triggers.length > 0 && (
                <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Triggers</dt><dd>{selection.data.triggers.join(", ")}</dd></div>
              )}
            </dl>
          )}

          {/* Capability detail */}
          {selection.kind === "capability" && (() => {
            const cap = selection.data as LandscapeCapability & {
              derivedStatus?: string; source?: string; parentName?: string | null; taxonomyNodes?: string[];
            };
            const effectiveStatus = cap.derivedStatus ?? cap.status;
            const statusColor = CAP_STATUS_COLOR[effectiveStatus] ?? CAP_COLOR;
            return (
              <dl className="text-sm space-y-2">
                <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Tag / ID</dt><dd className="font-mono">{cap.tag || cap.id}</dd></div>
                {cap.source && (
                  <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Source</dt>
                    <dd><span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800">{cap.source}</span></dd>
                  </div>
                )}
                <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Status</dt>
                  <dd style={{ color: statusColor }} className="font-semibold capitalize">{effectiveStatus}</dd>
                </div>
                {effectiveStatus !== cap.status && (
                  <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Declared status</dt><dd className="capitalize text-gray-500">{cap.status}</dd></div>
                )}
                {cap.parentName && (
                  <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Parent capability</dt><dd className="font-mono text-xs">{cap.parentName}</dd></div>
                )}
                {cap.taxonomyNodes && cap.taxonomyNodes.length > 0 && (
                  <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Taxonomy nodes</dt>
                    <dd className="space-y-0.5">{cap.taxonomyNodes.map((n: string) => <div key={n} className="font-mono text-xs">{n}</div>)}</dd>
                  </div>
                )}
                {(!cap.taxonomyNodes || cap.taxonomyNodes.length === 0) && cap.taxonomyNode && (
                  <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Taxonomy node</dt><dd className="font-mono">{cap.taxonomyNode}</dd></div>
                )}
                {cap.category && (
                  <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Category</dt><dd>{cap.category}</dd></div>
                )}
              </dl>
            );
          })()}

          {/* Persona detail */}
          {selection.kind === "persona" && (
            <dl className="text-sm space-y-2">
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Type</dt><dd>{selection.data.type}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Archetype</dt><dd>{selection.data.archetype || "—"}</dd></div>
              {selection.data.typicalCapabilities && selection.data.typicalCapabilities.length > 0 && (
                <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Capabilities</dt>
                  <dd>{selection.data.typicalCapabilities.map((c) => <span key={c} className="inline-block mr-1 px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs">{c}</span>)}</dd>
                </div>
              )}
            </dl>
          )}

          {/* Inferred system detail */}
          {selection.kind === "inferred" && (
            <dl className="text-sm space-y-2">
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Status</dt><dd>Inferred from unresolved event references</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Referenced by</dt><dd>{selection.data.inferredFrom.length} event(s)</dd></div>
            </dl>
          )}

          {/* Workflow detail */}
          {selection.kind === "workflow" && (
            <dl className="text-sm space-y-2">
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">States</dt><dd>{selection.data.states.length}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Transitions</dt><dd>{selection.data.transitions.length}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400 text-xs">Spans Contexts</dt><dd>{selection.data.contextIds.length}</dd></div>
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
