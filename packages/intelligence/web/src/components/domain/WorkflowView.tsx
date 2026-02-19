import { useState, useMemo, useCallback } from "react";
import {
  GitBranch,
  ArrowRight,
  ArrowLeft,
  CircleDot,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import type {
  DomainModelFull,
  WorkflowState,
  WorkflowTransition,
} from "../../types/domain";
import { DDDTooltip } from "./DDDTooltip";

// ── Constants ────────────────────────────────────────────────────────────────

const NODE_WIDTH = 160;
const NODE_HEIGHT = 56;
const VIEWBOX_PADDING = 60;
const ARROW_SIZE = 8;

// ── Auto-layout for states without x/y positions ────────────────────────────

/** A WorkflowState guaranteed to have x/y coordinates. */
interface PositionedState extends WorkflowState {
  x: number;
  y: number;
}

/**
 * Normalize raw state data from the API.
 * The API may return states with only { name, type, isError? }
 * but the component needs { id, name, isTerminal, isError, x?, y? }.
 * Transitions reference states by name, so id = name.
 */
function normalizeStates(rawStates: WorkflowState[]): WorkflowState[] {
  return rawStates.map((s) => ({
    ...s,
    id: s.id || s.name,
    isTerminal: s.isTerminal ?? (s as any).type === "terminal",
    isError: s.isError ?? (s as any).isError === true,
  }));
}

/**
 * Assign x/y positions to workflow states that are missing them.
 * Uses a simple topological layout: arrange states by their
 * distance (rank) from initial states, flowing left-to-right.
 * States at the same rank are stacked vertically.
 */
function autoLayoutStates(
  rawStates: WorkflowState[],
  transitions: WorkflowTransition[],
): PositionedState[] {
  const states = normalizeStates(rawStates);

  // If all states already have positions, return as-is
  if (states.every((s) => s.x != null && s.y != null)) {
    return states as PositionedState[];
  }

  const H_GAP = 220;
  const V_GAP = 100;

  // Build adjacency from transitions (which reference states by name/id)
  const adj = new Map<string, string[]>();
  for (const s of states) adj.set(s.id, []);
  for (const t of transitions) {
    adj.get(t.from)?.push(t.to);
  }

  const rank = new Map<string, number>();
  const initials = states.filter(
    (s) => (s as any).type === "initial" || !transitions.some((t) => t.to === s.id),
  );
  const queue: Array<{ id: string; r: number }> = initials.map((s) => ({
    id: s.id,
    r: 0,
  }));
  for (const s of initials) rank.set(s.id, 0);

  while (queue.length > 0) {
    const { id, r } = queue.shift()!;
    for (const next of adj.get(id) ?? []) {
      if (!rank.has(next) || rank.get(next)! < r + 1) {
        rank.set(next, r + 1);
        queue.push({ id: next, r: r + 1 });
      }
    }
  }

  // States not reached by BFS (disconnected) get appended at the end
  let maxRank = 0;
  for (const v of rank.values()) if (v > maxRank) maxRank = v;
  for (const s of states) {
    if (!rank.has(s.id)) rank.set(s.id, ++maxRank);
  }

  // Group by rank
  const byRank = new Map<number, WorkflowState[]>();
  for (const s of states) {
    const r = rank.get(s.id) ?? 0;
    if (!byRank.has(r)) byRank.set(r, []);
    byRank.get(r)!.push(s);
  }

  // Assign positions: rank → x column, index-within-rank → y row
  return states.map((s) => {
    if (s.x != null && s.y != null) return s as PositionedState;
    const r = rank.get(s.id) ?? 0;
    const siblings = byRank.get(r) ?? [s];
    const idx = siblings.indexOf(s);
    return {
      ...s,
      x: VIEWBOX_PADDING + r * H_GAP,
      y: VIEWBOX_PADDING + idx * V_GAP,
    };
  });
}

// ── Color helpers ────────────────────────────────────────────────────────────

function stateColor(state: WorkflowState): {
  fill: string;
  stroke: string;
  text: string;
  badge: string;
  badgeText: string;
} {
  if (state.isError)
    return {
      fill: "#FEF2F2",
      stroke: "#EF4444",
      text: "#991B1B",
      badge: "#FCA5A5",
      badgeText: "#7F1D1D",
    };
  if (state.isTerminal)
    return {
      fill: "#F0FDF4",
      stroke: "#22C55E",
      text: "#166534",
      badge: "#BBF7D0",
      badgeText: "#14532D",
    };
  return {
    fill: "#EFF6FF",
    stroke: "#3B82F6",
    text: "#1E3A5F",
    badge: "#BFDBFE",
    badgeText: "#1E3A8A",
  };
}

function stateColorDark(state: WorkflowState): {
  fill: string;
  stroke: string;
  text: string;
  badge: string;
  badgeText: string;
} {
  if (state.isError)
    return {
      fill: "#450A0A",
      stroke: "#F87171",
      text: "#FCA5A5",
      badge: "#7F1D1D",
      badgeText: "#FECACA",
    };
  if (state.isTerminal)
    return {
      fill: "#052E16",
      stroke: "#4ADE80",
      text: "#BBF7D0",
      badge: "#14532D",
      badgeText: "#DCFCE7",
    };
  return {
    fill: "#172554",
    stroke: "#60A5FA",
    text: "#BFDBFE",
    badge: "#1E3A8A",
    badgeText: "#DBEAFE",
  };
}

// ── Main Component ──────────────────────────────────────────────────────────

interface WorkflowViewProps {
  model: DomainModelFull;
}

export function WorkflowView({ model }: WorkflowViewProps) {
  const workflows = model.workflows ?? [];
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    workflows.length > 0 ? workflows[0].id : null,
  );
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const activeWorkflow = useMemo(
    () => workflows.find((w) => w.id === selectedWorkflowId) ?? null,
    [workflows, selectedWorkflowId],
  );

  // Ensure all states have x/y positions (auto-layout if missing)
  const positionedStates = useMemo<PositionedState[]>(() => {
    if (!activeWorkflow) return [];
    return autoLayoutStates(activeWorkflow.states, activeWorkflow.transitions);
  }, [activeWorkflow]);

  // State lookup
  const stateById = useMemo(() => {
    const map = new Map<string, PositionedState>();
    for (const s of positionedStates) {
      map.set(s.id, s);
    }
    return map;
  }, [positionedStates]);

  // Connected transition IDs for a hovered/selected state
  const connectedTransitions = useMemo(() => {
    const id = hoveredState ?? selectedState;
    if (!id || !activeWorkflow) return new Set<string>();
    const set = new Set<string>();
    for (const tr of activeWorkflow.transitions) {
      if (tr.from === id || tr.to === id) {
        set.add(`${tr.from}->${tr.to}`);
      }
    }
    return set;
  }, [hoveredState, selectedState, activeWorkflow]);

  // Incoming / outgoing for selected state detail panel
  const selectedStateDetail = useMemo(() => {
    if (!selectedState || !activeWorkflow) return null;
    const state = stateById.get(selectedState);
    if (!state) return null;
    const incoming = activeWorkflow.transitions.filter(
      (t) => t.to === selectedState,
    );
    const outgoing = activeWorkflow.transitions.filter(
      (t) => t.from === selectedState,
    );
    return { state, incoming, outgoing };
  }, [selectedState, activeWorkflow, stateById]);

  // Compute viewBox from state positions
  const viewBox = useMemo(() => {
    if (positionedStates.length === 0) return "0 0 600 400";
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const s of positionedStates) {
      if (s.x < minX) minX = s.x;
      if (s.y < minY) minY = s.y;
      if (s.x + NODE_WIDTH > maxX) maxX = s.x + NODE_WIDTH;
      if (s.y + NODE_HEIGHT > maxY) maxY = s.y + NODE_HEIGHT;
    }
    const x = minX - VIEWBOX_PADDING;
    const y = minY - VIEWBOX_PADDING;
    const w = maxX - minX + NODE_WIDTH + VIEWBOX_PADDING * 2;
    const h = maxY - minY + NODE_HEIGHT + VIEWBOX_PADDING * 2;
    return `${x} ${y} ${w} ${h}`;
  }, [positionedStates]);

  const handleStateHover = useCallback(
    (id: string | null) => setHoveredState(id),
    [],
  );

  const handleStateClick = useCallback(
    (id: string) =>
      setSelectedState((prev) => (prev === id ? null : id)),
    [],
  );

  if (workflows.length === 0) {
    return (
      <div className="p-6" data-testid="workflow-view">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-1.5">
          Workflows <DDDTooltip termKey="workflow" position="right" />
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Application lifecycle state machines
        </p>
        <div className="text-center py-16">
          <GitBranch className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No workflows defined yet. Use the chat to discover them or add them
            via the API.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="workflow-view">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Workflows <DDDTooltip termKey="workflow" position="right" />
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {workflows.length} workflow{workflows.length !== 1 ? "s" : ""}{" "}
            defined
          </p>
        </div>

        {/* Workflow selector */}
        {workflows.length > 1 && (
          <select
            value={selectedWorkflowId ?? ""}
            onChange={(e) => {
              setSelectedWorkflowId(e.target.value);
              setSelectedState(null);
              setHoveredState(null);
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {workflows.map((wf) => (
              <option key={wf.id} value={wf.id}>
                {wf.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Active workflow info */}
      {activeWorkflow && (
        <div className="mb-4">
          {workflows.length === 1 && (
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
              {activeWorkflow.title}
            </h3>
          )}
          {activeWorkflow.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeWorkflow.description}
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <CircleDot className="w-3.5 h-3.5 text-blue-500" />
          <span>Active state</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          <span>Terminal state</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-red-500" />
          <span>Error state</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-gray-400 inline-block" />
          <span>Sync transition</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dashed border-purple-400 inline-block" />
          <span>Async transition</span>
        </div>
      </div>

      {/* Diagram + Detail panel */}
      <div className="flex gap-4">
        {/* SVG Diagram */}
        <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {activeWorkflow && activeWorkflow.states.length > 0 ? (
            <svg
              data-testid="workflow-diagram"
              viewBox={viewBox}
              className="w-full h-auto min-h-[300px] max-h-[calc(100vh-22rem)]"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth={ARROW_SIZE}
                  markerHeight={ARROW_SIZE}
                  refX={ARROW_SIZE}
                  refY={ARROW_SIZE / 2}
                  orient="auto"
                >
                  <polygon
                    points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`}
                    className="fill-gray-400 dark:fill-gray-500"
                  />
                </marker>
                <marker
                  id="arrowhead-highlight"
                  markerWidth={ARROW_SIZE}
                  markerHeight={ARROW_SIZE}
                  refX={ARROW_SIZE}
                  refY={ARROW_SIZE / 2}
                  orient="auto"
                >
                  <polygon
                    points={`0 0, ${ARROW_SIZE} ${ARROW_SIZE / 2}, 0 ${ARROW_SIZE}`}
                    className="fill-purple-500"
                  />
                </marker>
              </defs>

              {/* Transitions */}
              {activeWorkflow.transitions.map((tr, i) => (
                <TransitionPath
                  key={`${tr.from}->${tr.to}-${i}`}
                  transition={tr}
                  states={stateById}
                  highlighted={connectedTransitions.has(
                    `${tr.from}->${tr.to}`,
                  )}
                  dimmed={
                    (hoveredState !== null || selectedState !== null) &&
                    !connectedTransitions.has(`${tr.from}->${tr.to}`)
                  }
                />
              ))}

              {/* State nodes */}
              {positionedStates.map((state) => (
                <StateNode
                  key={state.id}
                  state={state}
                  hovered={hoveredState === state.id}
                  selected={selectedState === state.id}
                  dimmed={
                    (hoveredState !== null &&
                      hoveredState !== state.id &&
                      !connectedTransitions.has(
                        `${hoveredState}->${state.id}`,
                      ) &&
                      !connectedTransitions.has(
                        `${state.id}->${hoveredState}`,
                      )) ||
                    false
                  }
                  onHover={handleStateHover}
                  onClick={handleStateClick}
                />
              ))}
            </svg>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400 dark:text-gray-500">
              No states defined in this workflow
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedStateDetail && (
          <div className="w-80 shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 max-h-[calc(100vh-22rem)] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {selectedStateDetail.state.isError ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : selectedStateDetail.state.isTerminal ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <CircleDot className="w-4 h-4 text-blue-500" />
                )}
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {selectedStateDetail.state.name}
                </h3>
              </div>
              {selectedStateDetail.state.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedStateDetail.state.description}
                </p>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedStateDetail.state.isTerminal && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded">
                    TERMINAL
                  </span>
                )}
                {selectedStateDetail.state.isError && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">
                    ERROR
                  </span>
                )}
                {selectedStateDetail.state.timestampField && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-mono">
                    {selectedStateDetail.state.timestampField}
                  </span>
                )}
              </div>
            </div>

            {/* Incoming transitions */}
            {selectedStateDetail.incoming.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Incoming Transitions
                </h4>
                <div className="space-y-1.5">
                  {selectedStateDetail.incoming.map((tr, i) => {
                    const fromState = stateById.get(tr.from);
                    return (
                      <div
                        key={`in-${i}`}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <ArrowLeft className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {fromState?.name ?? tr.from}
                        </span>
                        <span className="text-gray-400">—</span>
                        <span className="text-gray-600 dark:text-gray-400 italic">
                          {tr.label}
                        </span>
                        {tr.isAsync && (
                          <span className="px-1 py-px text-[10px] font-bold bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded">
                            ASYNC
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Outgoing transitions */}
            {selectedStateDetail.outgoing.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Outgoing Transitions
                </h4>
                <div className="space-y-1.5">
                  {selectedStateDetail.outgoing.map((tr, i) => {
                    const toState = stateById.get(tr.to);
                    return (
                      <div
                        key={`out-${i}`}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {toState?.name ?? tr.to}
                        </span>
                        <span className="text-gray-400">—</span>
                        <span className="text-gray-600 dark:text-gray-400 italic">
                          {tr.label}
                        </span>
                        {tr.isAsync && (
                          <span className="px-1 py-px text-[10px] font-bold bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded">
                            ASYNC
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary bar */}
      {activeWorkflow && activeWorkflow.states.length > 0 && (
        <div className="mt-6" data-testid="workflow-summary">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            All States
          </h3>
          <div className="flex flex-wrap gap-2">
            {activeWorkflow.states.map((state) => (
              <button
                key={state.id}
                onClick={() => handleStateClick(state.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                  state.isError
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                    : state.isTerminal
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                      : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                } hover:ring-2 hover:ring-purple-300 dark:hover:ring-purple-600 ${
                  selectedState === state.id
                    ? "ring-2 ring-purple-400 dark:ring-purple-500"
                    : ""
                }`}
              >
                {state.isError ? (
                  <XCircle className="w-3 h-3" />
                ) : state.isTerminal ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <CircleDot className="w-3 h-3" />
                )}
                {state.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── StateNode (SVG) ──────────────────────────────────────────────────────────

interface StateNodeProps {
  state: PositionedState;
  hovered: boolean;
  selected: boolean;
  dimmed: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

function StateNode({
  state,
  hovered,
  selected,
  dimmed,
  onHover,
  onClick,
}: StateNodeProps) {
  const light = stateColor(state);
  const dark = stateColorDark(state);

  // We use CSS classes for dark mode, but SVG fill attributes don't support dark:
  // So we use a technique: two rects layered, one for light, one for dark with display toggled via CSS
  // Simpler approach: use inline styles and rely on the parent's data attribute or CSS variables
  // For this component, we'll use the light theme colors directly in SVG and CSS class overrides

  const badgeLabel = state.isTerminal
    ? "Terminal"
    : state.isError
      ? "Error"
      : null;

  return (
    <g
      data-testid={`state-node-${state.id}`}
      className="cursor-pointer"
      onMouseEnter={() => onHover(state.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(state.id)}
      opacity={dimmed ? 0.35 : 1}
      style={{ transition: "opacity 0.2s" }}
    >
      {/* Node background */}
      <rect
        x={state.x}
        y={state.y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={12}
        ry={12}
        className="transition-all"
        fill={light.fill}
        stroke={hovered || selected ? "#A855F7" : light.stroke}
        strokeWidth={hovered || selected ? 2.5 : 1.5}
      />
      {/* Dark mode overlay — hidden by default, shown via CSS */}
      <rect
        x={state.x}
        y={state.y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={12}
        ry={12}
        className="hidden dark:block transition-all"
        fill={dark.fill}
        stroke={hovered || selected ? "#A855F7" : dark.stroke}
        strokeWidth={hovered || selected ? 2.5 : 1.5}
      />

      {/* Name label */}
      <text
        x={state.x + NODE_WIDTH / 2}
        y={state.y + (badgeLabel ? NODE_HEIGHT / 2 - 4 : NODE_HEIGHT / 2 + 1)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={600}
        className="pointer-events-none"
      >
        <tspan className="dark:hidden" fill={light.text}>
          {state.name}
        </tspan>
        <tspan className="hidden dark:inline" fill={dark.text}>
          {state.name}
        </tspan>
      </text>

      {/* Badge */}
      {badgeLabel && (
        <>
          <rect
            x={state.x + NODE_WIDTH / 2 - 24}
            y={state.y + NODE_HEIGHT / 2 + 6}
            width={48}
            height={16}
            rx={4}
            className="dark:hidden"
            fill={light.badge}
          />
          <rect
            x={state.x + NODE_WIDTH / 2 - 24}
            y={state.y + NODE_HEIGHT / 2 + 6}
            width={48}
            height={16}
            rx={4}
            className="hidden dark:block"
            fill={dark.badge}
          />
          <text
            x={state.x + NODE_WIDTH / 2}
            y={state.y + NODE_HEIGHT / 2 + 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight={700}
            className="pointer-events-none uppercase"
          >
            <tspan className="dark:hidden" fill={light.badgeText}>
              {badgeLabel}
            </tspan>
            <tspan className="hidden dark:inline" fill={dark.badgeText}>
              {badgeLabel}
            </tspan>
          </text>
        </>
      )}
    </g>
  );
}

// ── TransitionPath (SVG) ─────────────────────────────────────────────────────

interface TransitionPathProps {
  transition: WorkflowTransition;
  states: Map<string, PositionedState>;
  highlighted: boolean;
  dimmed: boolean;
}

function TransitionPath({
  transition,
  states,
  highlighted,
  dimmed,
}: TransitionPathProps) {
  const fromState = states.get(transition.from);
  const toState = states.get(transition.to);
  if (!fromState || !toState) return null;

  // Compute edge points (center of nearest edge)
  const fromCx = fromState.x + NODE_WIDTH / 2;
  const fromCy = fromState.y + NODE_HEIGHT / 2;
  const toCx = toState.x + NODE_WIDTH / 2;
  const toCy = toState.y + NODE_HEIGHT / 2;

  // Determine best edge to connect from/to
  const { x: x1, y: y1 } = edgePoint(fromState, toCx, toCy);
  const { x: x2, y: y2 } = edgePoint(toState, fromCx, fromCy);

  // Simple straight line with offset for label
  const midX = (x1 + x2) / 2;
  const midY = (x1 + x2) / 2 === x1 ? (y1 + y2) / 2 - 14 : (y1 + y2) / 2;

  const strokeColor = highlighted ? "#A855F7" : "#9CA3AF";
  const markerEnd = highlighted
    ? "url(#arrowhead-highlight)"
    : "url(#arrowhead)";

  return (
    <g
      opacity={dimmed ? 0.2 : 1}
      style={{ transition: "opacity 0.2s" }}
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={strokeColor}
        strokeWidth={highlighted ? 2 : 1.5}
        strokeDasharray={transition.isAsync ? "6 3" : undefined}
        markerEnd={markerEnd}
      />
      {/* Label */}
      <text
        x={midX}
        y={midY - 6}
        textAnchor="middle"
        fontSize={10}
        fontWeight={500}
        className="pointer-events-none"
      >
        <tspan className="dark:hidden" fill="#6B7280">
          {transition.label}
        </tspan>
        <tspan className="hidden dark:inline" fill="#9CA3AF">
          {transition.label}
        </tspan>
      </text>
    </g>
  );
}

// ── Geometry helpers ─────────────────────────────────────────────────────────

/** Compute the point on the edge of a node rect that faces toward (tx, ty) */
function edgePoint(
  state: PositionedState,
  tx: number,
  ty: number,
): { x: number; y: number } {
  const cx = state.x + NODE_WIDTH / 2;
  const cy = state.y + NODE_HEIGHT / 2;
  const dx = tx - cx;
  const dy = ty - cy;

  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  const halfW = NODE_WIDTH / 2;
  const halfH = NODE_HEIGHT / 2;

  // Scale factor to reach the edge
  const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
  const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
  const scale = Math.min(scaleX, scaleY);

  return {
    x: cx + dx * scale,
    y: cy + dy * scale,
  };
}
