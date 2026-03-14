import { useState, useMemo, useCallback } from "react";
import {
  GitBranch,
  ArrowRight,
  ArrowLeft,
  CircleDot,
  XCircle,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Check,
} from "lucide-react";
import type {
  DomainModelFull,
  WorkflowState,
  WorkflowTransition,
  DomainWorkflow,
} from "../../types/domain";
import { api } from "../../api/client";
import { DDDTooltip } from "./DDDTooltip";

// ── Constants ────────────────────────────────────────────────────────────────

const NODE_WIDTH = 160;
const NODE_HEIGHT = 56;
const VIEWBOX_PADDING = 60;
const ARROW_SIZE = 8;

// ── Auto-layout for states without x/y positions ────────────────────────────

/** A WorkflowState with a guaranteed `id` (defaulting to `name`). */
interface NormalizedState extends Omit<WorkflowState, "id"> {
  id: string;
}

/** A NormalizedState guaranteed to have x/y coordinates. */
interface PositionedState extends NormalizedState {
  x: number;
  y: number;
}

/**
 * Normalize raw state data from the API.
 * The API may return states with only { name, type, isError? }
 * but the component needs { id, name, isTerminal, isError, x?, y? }.
 * Transitions reference states by name, so id = name.
 */
function normalizeStates(rawStates: WorkflowState[]): NormalizedState[] {
  return rawStates.map((s) => ({
    ...s,
    id: s.id || s.name,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    isTerminal: s.isTerminal ?? (s as any).type === "terminal",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// ── Form state types ─────────────────────────────────────────────────────────

interface FormState {
  name: string;
  description: string;
  isTerminal: boolean;
  isError: boolean;
}

interface FormTransition {
  from: string;
  to: string;
  label: string;
  isAsync: boolean;
}

// ── Main Component ──────────────────────────────────────────────────────────

interface WorkflowViewProps {
  model: DomainModelFull;
  onModelUpdated: () => void;
}

export function WorkflowView({ model, onModelUpdated }: WorkflowViewProps) {
  const workflows = useMemo(() => model.workflows ?? [], [model.workflows]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    workflows.length > 0 ? workflows[0].id : null,
  );
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("create");
  const [editingWorkflow, setEditingWorkflow] = useState<DomainWorkflow | null>(null);

  // Form fields
  const [formSlug, setFormSlug] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContextIds, setFormContextIds] = useState<string[]>([]);
  const [formStates, setFormStates] = useState<FormState[]>([]);
  const [formTransitions, setFormTransitions] = useState<FormTransition[]>([]);

  // Saving / delete state
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // ── Panel helpers ──────────────────────────────────────────────────────────

  const resetForm = () => {
    setFormSlug("");
    setFormTitle("");
    setFormDescription("");
    setFormContextIds([]);
    setFormStates([]);
    setFormTransitions([]);
    setConfirmingDelete(false);
    setDeleting(false);
    setEditingWorkflow(null);
  };

  const openCreatePanel = () => {
    resetForm();
    setPanelMode("create");
    setPanelOpen(true);
  };

  const openEditPanel = (wf: DomainWorkflow) => {
    resetForm();
    setPanelMode("edit");
    setEditingWorkflow(wf);
    setFormSlug(wf.slug);
    setFormTitle(wf.title);
    setFormDescription(wf.description ?? "");
    setFormContextIds([]);
    setFormStates(
      wf.states.map((s) => ({
        name: s.name,
        description: s.description ?? "",
        isTerminal: s.isTerminal ?? false,
        isError: s.isError ?? false,
      })),
    );
    setFormTransitions(
      wf.transitions.map((t) => ({
        from: t.from,
        to: t.to,
        label: t.label,
        isAsync: t.isAsync,
      })),
    );
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    resetForm();
  };

  // ── State list helpers ─────────────────────────────────────────────────────

  const addFormState = () => {
    setFormStates((prev) => [
      ...prev,
      { name: "", description: "", isTerminal: false, isError: false },
    ]);
  };

  const updateFormState = (index: number, patch: Partial<FormState>) => {
    setFormStates((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  };

  const removeFormState = (index: number) => {
    setFormStates((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Transition list helpers ────────────────────────────────────────────────

  const addFormTransition = () => {
    setFormTransitions((prev) => [
      ...prev,
      { from: "", to: "", label: "", isAsync: false },
    ]);
  };

  const updateFormTransition = (index: number, patch: Partial<FormTransition>) => {
    setFormTransitions((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );
  };

  const removeFormTransition = (index: number) => {
    setFormTransitions((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Context ID toggle ─────────────────────────────────────────────────────

  const toggleContextId = (ctxId: string) => {
    setFormContextIds((prev) =>
      prev.includes(ctxId)
        ? prev.filter((id) => id !== ctxId)
        : [...prev, ctxId],
    );
  };

  // ── Save handler ──────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSlug.trim() || !formTitle.trim()) return;

    const statesPayload: WorkflowState[] = formStates
      .filter((s) => s.name.trim())
      .map((s) => ({
        id: s.name.trim(),
        name: s.name.trim(),
        description: s.description.trim() || undefined,
        isTerminal: s.isTerminal,
        isError: s.isError,
      }));

    const transitionsPayload: WorkflowTransition[] = formTransitions
      .filter((t) => t.from.trim() && t.to.trim() && t.label.trim())
      .map((t) => ({
        from: t.from.trim(),
        to: t.to.trim(),
        label: t.label.trim(),
        isAsync: t.isAsync,
      }));

    setSaving(true);
    try {
      if (panelMode === "create") {
        await api.createWorkflow(model.id, {
          slug: formSlug.trim(),
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          states: statesPayload,
          transitions: transitionsPayload,
        });
      } else if (editingWorkflow) {
        await api.updateWorkflow(model.id, editingWorkflow.id, {
          slug: formSlug.trim(),
          title: formTitle.trim(),
          description: formDescription.trim() || undefined,
          contextIds: formContextIds.length > 0 ? formContextIds : undefined,
          states: statesPayload,
          transitions: transitionsPayload,
        });
      }
      closePanel();
      onModelUpdated();
    } catch (err) {
      console.error("Failed to save workflow:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handler ────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!editingWorkflow) return;
    setDeleting(true);
    try {
      await api.deleteWorkflow(model.id, editingWorkflow.id);
      closePanel();
      setSelectedWorkflowId(
        workflows.find((w) => w.id !== editingWorkflow.id)?.id ?? null,
      );
      onModelUpdated();
    } catch (err) {
      console.error("Failed to delete workflow:", err);
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  // State name options for transition from/to selects
  const formStateNames = formStates
    .map((s) => s.name.trim())
    .filter(Boolean);

  // ── Empty state ───────────────────────────────────────────────────────────

  if (workflows.length === 0) {
    return (
      <div className="p-6" data-testid="workflow-view">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Workflows <DDDTooltip termKey="workflow" position="right" />
          </h2>
          <button
            onClick={openCreatePanel}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Workflow
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Application lifecycle state machines
        </p>
        <div className="text-center py-16">
          <GitBranch className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No workflows yet. Use the form above or the Chat to add them.
          </p>
        </div>

        {/* Slide-in panel (for create from empty state) */}
        {panelOpen && (
          <WorkflowPanel
            panelMode={panelMode}
            formSlug={formSlug}
            setFormSlug={setFormSlug}
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formDescription={formDescription}
            setFormDescription={setFormDescription}
            formContextIds={formContextIds}
            toggleContextId={toggleContextId}
            formStates={formStates}
            addFormState={addFormState}
            updateFormState={updateFormState}
            removeFormState={removeFormState}
            formTransitions={formTransitions}
            formStateNames={formStateNames}
            addFormTransition={addFormTransition}
            updateFormTransition={updateFormTransition}
            removeFormTransition={removeFormTransition}
            boundedContexts={model.boundedContexts}
            saving={saving}
            confirmingDelete={confirmingDelete}
            setConfirmingDelete={setConfirmingDelete}
            deleting={deleting}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={closePanel}
          />
        )}
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

        <div className="flex items-center gap-2">
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

          {/* Edit button */}
          {activeWorkflow && (
            <button
              onClick={() => openEditPanel(activeWorkflow)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}

          {/* Add Workflow button */}
          <button
            onClick={openCreatePanel}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Workflow
          </button>
        </div>
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
                onClick={() => handleStateClick(state.id ?? state.name)}
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

      {/* Slide-in panel */}
      {panelOpen && (
        <WorkflowPanel
          panelMode={panelMode}
          formSlug={formSlug}
          setFormSlug={setFormSlug}
          formTitle={formTitle}
          setFormTitle={setFormTitle}
          formDescription={formDescription}
          setFormDescription={setFormDescription}
          formContextIds={formContextIds}
          toggleContextId={toggleContextId}
          formStates={formStates}
          addFormState={addFormState}
          updateFormState={updateFormState}
          removeFormState={removeFormState}
          formTransitions={formTransitions}
          formStateNames={formStateNames}
          addFormTransition={addFormTransition}
          updateFormTransition={updateFormTransition}
          removeFormTransition={removeFormTransition}
          boundedContexts={model.boundedContexts}
          saving={saving}
          confirmingDelete={confirmingDelete}
          setConfirmingDelete={setConfirmingDelete}
          deleting={deleting}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closePanel}
        />
      )}
    </div>
  );
}

// ── Slide-in Panel ──────────────────────────────────────────────────────────

interface WorkflowPanelProps {
  panelMode: "create" | "edit";
  formSlug: string;
  setFormSlug: (v: string) => void;
  formTitle: string;
  setFormTitle: (v: string) => void;
  formDescription: string;
  setFormDescription: (v: string) => void;
  formContextIds: string[];
  toggleContextId: (id: string) => void;
  formStates: FormState[];
  addFormState: () => void;
  updateFormState: (index: number, patch: Partial<FormState>) => void;
  removeFormState: (index: number) => void;
  formTransitions: FormTransition[];
  formStateNames: string[];
  addFormTransition: () => void;
  updateFormTransition: (index: number, patch: Partial<FormTransition>) => void;
  removeFormTransition: (index: number) => void;
  boundedContexts: DomainModelFull["boundedContexts"];
  saving: boolean;
  confirmingDelete: boolean;
  setConfirmingDelete: (v: boolean) => void;
  deleting: boolean;
  onSave: (e: React.FormEvent) => void;
  onDelete: () => void;
  onClose: () => void;
}

function WorkflowPanel({
  panelMode,
  formSlug,
  setFormSlug,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  formContextIds,
  toggleContextId,
  formStates,
  addFormState,
  updateFormState,
  removeFormState,
  formTransitions,
  formStateNames,
  addFormTransition,
  updateFormTransition,
  removeFormTransition,
  boundedContexts,
  saving,
  confirmingDelete,
  setConfirmingDelete,
  deleting,
  onSave,
  onDelete,
  onClose,
}: WorkflowPanelProps) {
  const inputClass =
    "w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-20"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-[420px] z-30 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {panelMode === "create" ? "New Workflow" : "Edit Workflow"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel body (scrollable) */}
        <form
          onSubmit={onSave}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
        >
          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="e.g., order-lifecycle"
              className={inputClass}
              required
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g., Order Lifecycle"
              className={inputClass}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description of this workflow"
              rows={2}
              className={inputClass}
            />
          </div>

          {/* Context IDs (chip list) */}
          {boundedContexts.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Bounded Contexts
              </label>
              <div className="flex flex-wrap gap-1.5">
                {boundedContexts.map((ctx) => {
                  const selected = formContextIds.includes(ctx.id);
                  return (
                    <button
                      key={ctx.id}
                      type="button"
                      onClick={() => toggleContextId(ctx.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                        selected
                          ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                          : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                      }`}
                    >
                      {ctx.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── States ────────────────────────────────────────────────────── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              States
            </label>
            <div className="space-y-2">
              {formStates.map((st, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-5 shrink-0">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={st.name}
                      onChange={(e) =>
                        updateFormState(idx, { name: e.target.value })
                      }
                      placeholder="State name"
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeFormState(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Remove state"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={st.description}
                    onChange={(e) =>
                      updateFormState(idx, { description: e.target.value })
                    }
                    placeholder="Description (optional)"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={st.isTerminal}
                        onChange={(e) =>
                          updateFormState(idx, { isTerminal: e.target.checked })
                        }
                        className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      Terminal
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={st.isError}
                        onChange={(e) =>
                          updateFormState(idx, { isError: e.target.checked })
                        }
                        className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      Error
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFormState}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-dashed border-purple-300 dark:border-purple-700 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add State
            </button>
          </div>

          {/* ── Transitions ───────────────────────────────────────────────── */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Transitions
            </label>
            <div className="space-y-2">
              {formTransitions.map((tr, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={tr.from}
                      onChange={(e) =>
                        updateFormTransition(idx, { from: e.target.value })
                      }
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">From…</option>
                      {formStateNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                    <select
                      value={tr.to}
                      onChange={(e) =>
                        updateFormTransition(idx, { to: e.target.value })
                      }
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">To…</option>
                      {formStateNames.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeFormTransition(idx)}
                      className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Remove transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tr.label}
                      onChange={(e) =>
                        updateFormTransition(idx, { label: e.target.value })
                      }
                      placeholder="Transition label"
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={tr.isAsync}
                        onChange={(e) =>
                          updateFormTransition(idx, { isAsync: e.target.checked })
                        }
                        className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      Async
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFormTransition}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-dashed border-purple-300 dark:border-purple-700 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Transition
            </button>
          </div>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="pt-2 space-y-3">
            {/* Save / Cancel */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !formSlug.trim() || !formTitle.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-md transition-colors"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Delete (edit mode only) */}
            {panelMode === "edit" && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                {confirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Delete this workflow?
                    </span>
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={deleting}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs font-medium rounded-md transition-colors"
                    >
                      {deleting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      disabled={deleting}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Workflow
                  </button>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </>
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
