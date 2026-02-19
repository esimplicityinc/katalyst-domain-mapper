/**
 * LandscapeView – Tab-embedded Business Landscape
 *
 * Wraps the LandscapeCanvas inside the Business Domain tab system.
 * Fetches landscape data, runs a selectable layout engine, and
 * renders the result with a toolbar for switching engines.
 */

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { DomainModelFull } from "../../types/domain";
import type { LandscapeGraph, LandscapePositions, LandscapeLayoutEngine } from "../../types/landscape";
import { ElkLayoutEngine } from "../../utils/layout/ElkLayoutEngine";
import { DagreLayoutEngine } from "../../utils/layout/DagreLayoutEngine";
import { D3ForceLayoutEngine } from "../../utils/layout/D3ForceLayoutEngine";
import { LandscapeCanvas } from "../landscape/LandscapeCanvas";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const PERSONA_COLORS = ["#ec4899", "#06b6d4", "#84cc16", "#f59e0b", "#8b5cf6", "#ef4444"];

type EngineKey = "elkjs" | "dagre" | "d3-force";

const ENGINE_INFO: Record<EngineKey, { label: string; description: string }> = {
  elkjs: { label: "ELK", description: "Hierarchical layered (Eclipse)" },
  dagre: { label: "Dagre", description: "Directed acyclic graph layout" },
  "d3-force": { label: "Force", description: "Physics-based simulation" },
};

function createEngine(key: EngineKey): LandscapeLayoutEngine {
  switch (key) {
    case "elkjs": return new ElkLayoutEngine();
    case "dagre": return new DagreLayoutEngine();
    case "d3-force": return new D3ForceLayoutEngine();
  }
}

interface Props {
  model: DomainModelFull;
}

export function LandscapeView({ model }: Props) {
  const [graph, setGraph] = useState<LandscapeGraph | null>(null);
  const [positions, setPositions] = useState<LandscapePositions | null>(null);
  const [loading, setLoading] = useState(true);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineKey, setEngineKey] = useState<EngineKey>("elkjs");
  const [layoutMs, setLayoutMs] = useState<number | null>(null);
  const engineRef = useRef<LandscapeLayoutEngine>(createEngine("elkjs"));

  // ── Workflow filter state ──────────────────────────────────────
  const [activeWorkflowIds, setActiveWorkflowIds] = useState<Set<string>>(new Set());
  const [wfDropdownOpen, setWfDropdownOpen] = useState(false);
  const wfDropdownRef = useRef<HTMLDivElement>(null);

  // ── Persona collapse state ───────────────────────────────────
  const [collapsedPersonas, setCollapsedPersonas] = useState<Set<string>>(new Set());
  const allPersonasCollapsed = useMemo(
    () => graph ? collapsedPersonas.size === graph.personas.length : true,
    [collapsedPersonas, graph],
  );

  // ── Persona / story filter state ───────────────────────────────
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);

  // Initialize all personas collapsed by default when graph loads
  useEffect(() => {
    if (graph) {
      setCollapsedPersonas(new Set(graph.personas.map((p) => p.id)));
    }
  }, [graph]);

  const toggleCollapseAll = useCallback(() => {
    if (!graph) return;
    if (allPersonasCollapsed) {
      setCollapsedPersonas(new Set());
    } else {
      setCollapsedPersonas(new Set(graph.personas.map((p) => p.id)));
    }
  }, [graph, allPersonasCollapsed]);

  // ── Persona / story filter handlers ────────────────────────────

  /** When a persona is clicked, filter to workflows that touch that persona's capabilities */
  const handleSelectPersona = useCallback((personaId: string) => {
    if (!graph) return;

    // Toggle off if same persona clicked again
    if (activePersonaId === personaId) {
      setActivePersonaId(null);
      setActiveStoryId(null);
      // Restore all workflows
      setActiveWorkflowIds(new Set(graph.workflows.map((w) => w.id)));
      return;
    }

    setActivePersonaId(personaId);
    setActiveStoryId(null);

    // Find all capabilities for this persona's stories
    const personaCaps = new Set(
      graph.userStories
        .filter((s) => s.persona === personaId)
        .flatMap((s) => s.capabilities),
    );

    // Find workflows whose capabilities overlap
    const matchingWorkflows = graph.workflows.filter((wf) =>
      wf.capabilityIds?.some((capId) => personaCaps.has(capId)),
    );

    setActiveWorkflowIds(new Set(matchingWorkflows.map((w) => w.id)));

    // Also expand this persona's story group
    setCollapsedPersonas((prev) => {
      const next = new Set(prev);
      next.delete(personaId);
      return next;
    });
  }, [graph, activePersonaId]);

  /** When a user story is clicked, filter to just that story's capabilities */
  const handleSelectStory = useCallback((storyId: string) => {
    if (!graph) return;

    // Toggle off if same story clicked again
    if (activeStoryId === storyId) {
      setActiveStoryId(null);
      // If persona filter was active, restore to persona level
      if (activePersonaId) {
        handleSelectPersona(activePersonaId);
      } else {
        setActiveWorkflowIds(new Set(graph.workflows.map((w) => w.id)));
      }
      return;
    }

    const story = graph.userStories.find((s) => s.id === storyId);
    if (!story) return;

    setActiveStoryId(storyId);
    setActivePersonaId(story.persona);

    const storyCaps = new Set(story.capabilities);

    // Find workflows whose capabilities overlap with this story's
    const matchingWorkflows = graph.workflows.filter((wf) =>
      wf.capabilityIds?.some((capId) => storyCaps.has(capId)),
    );

    setActiveWorkflowIds(new Set(matchingWorkflows.map((w) => w.id)));

    // Expand the persona group for this story
    setCollapsedPersonas((prev) => {
      const next = new Set(prev);
      next.delete(story.persona);
      return next;
    });
  }, [graph, activeStoryId, activePersonaId, handleSelectPersona]);

  /** Clear all persona/story filters */
  const clearPersonaFilter = useCallback(() => {
    if (!graph) return;
    setActivePersonaId(null);
    setActiveStoryId(null);
    setActiveWorkflowIds(new Set(graph.workflows.map((w) => w.id)));
  }, [graph]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!wfDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (wfDropdownRef.current && !wfDropdownRef.current.contains(e.target as Node)) {
        setWfDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [wfDropdownOpen]);

  // Initialize active workflows to "all" whenever graph loads
  useEffect(() => {
    if (graph) {
      setActiveWorkflowIds(new Set(graph.workflows.map((w) => w.id)));
    }
  }, [graph]);

  const allWorkflowsActive = useMemo(
    () => graph ? activeWorkflowIds.size === graph.workflows.length : true,
    [activeWorkflowIds, graph],
  );

  const toggleWorkflow = useCallback((id: string) => {
    setActiveWorkflowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllWorkflows = useCallback(() => {
    if (!graph) return;
    if (allWorkflowsActive) {
      setActiveWorkflowIds(new Set());
    } else {
      setActiveWorkflowIds(new Set(graph.workflows.map((w) => w.id)));
    }
  }, [graph, allWorkflowsActive]);

  // Fetch graph data
  useEffect(() => {
    if (!model?.id) return;

    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/v1/landscape/${model.id}`);
        if (!res.ok) throw new Error(`Failed to fetch landscape: ${res.statusText}`);

        const data: LandscapeGraph = await res.json();
        if (cancelled) return;
        setGraph(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load landscape");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [model?.id]);

  // Run layout when graph or engine changes
  const runLayout = useCallback(async (data: LandscapeGraph, engine: LandscapeLayoutEngine) => {
    setLayoutLoading(true);
    setLayoutMs(null);
    try {
      const t0 = performance.now();
      const pos = await engine.layout(data);
      const elapsed = performance.now() - t0;
      setPositions(pos);
      setLayoutMs(Math.round(elapsed));
    } catch (err: any) {
      console.error("[LandscapeView] Layout failed:", err);
      setError(`Layout failed: ${err.message}`);
    } finally {
      setLayoutLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!graph) return;
    runLayout(graph, engineRef.current);
  }, [graph, runLayout]);

  // Switch engine
  const handleEngineChange = useCallback(
    (key: EngineKey) => {
      setEngineKey(key);
      engineRef.current = createEngine(key);
      if (graph) runLayout(graph, engineRef.current);
    },
    [graph, runLayout],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading business landscape...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="max-w-sm p-5 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Error Loading Landscape</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{error}</p>
          <button
            onClick={() => { setLoading(true); setError(null); }}
            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!graph || !positions) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No landscape data available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* ── Layout Engine Toolbar ──────────────────────────────────── */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1">Layout:</span>
        {(Object.keys(ENGINE_INFO) as EngineKey[]).map((key) => (
          <button
            key={key}
            onClick={() => handleEngineChange(key)}
            disabled={layoutLoading}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              engineKey === key
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            } ${layoutLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
            title={ENGINE_INFO[key].description}
          >
            {ENGINE_INFO[key].label}
          </button>
        ))}
        {layoutMs !== null && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1 tabular-nums">
            {layoutMs}ms
          </span>
        )}
        {layoutLoading && (
          <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-purple-500 ml-1"></div>
        )}

        {/* ── Workflow filter dropdown ─────────────────────────────── */}
        {graph && graph.workflows.length > 0 && (
          <>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <div className="relative" ref={wfDropdownRef}>
              <button
                onClick={() => setWfDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="inline-block w-2.5 h-0.5 rounded" style={{ background: "#14b8a6" }} />
                Workflows
                <span className="text-[10px] tabular-nums text-gray-400">
                  ({activeWorkflowIds.size}/{graph.workflows.length})
                </span>
                <svg className={`w-3 h-3 transition-transform ${wfDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {wfDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-30">
                  {/* All / None toggle */}
                  <button
                    onClick={toggleAllWorkflows}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border text-[9px] font-bold ${
                      allWorkflowsActive
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "border-gray-300 dark:border-gray-600 text-transparent"
                    }`}>
                      {allWorkflowsActive ? "✓" : ""}
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {allWorkflowsActive ? "Deselect All" : "Select All"}
                    </span>
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                  {graph.workflows.map((wf) => {
                    const isActive = activeWorkflowIds.has(wf.id);
                    return (
                      <button
                        key={wf.id}
                        onClick={() => toggleWorkflow(wf.id)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded border text-[9px] font-bold ${
                          isActive
                            ? "bg-teal-500 border-teal-500 text-white"
                            : "border-gray-300 dark:border-gray-600 text-transparent"
                        }`}>
                          {isActive ? "✓" : ""}
                        </span>
                        <span className={`truncate ${isActive ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"}`}>
                          {wf.title}
                        </span>
                        <span className="ml-auto text-[10px] text-gray-400 tabular-nums">
                          {wf.contextIds.length} ctx
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Persona collapse toggle ─────────────────────────────── */}
        {graph && graph.personas.length > 0 && (
          <>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              onClick={toggleCollapseAll}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              title={allPersonasCollapsed ? "Expand all persona story groups" : "Collapse all persona story groups"}
            >
              <svg className={`w-3.5 h-3.5 transition-transform ${allPersonasCollapsed ? "" : "rotate-90"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span>{allPersonasCollapsed ? "Expand" : "Collapse"}</span>
              <span className="text-[10px] tabular-nums text-gray-400">
                ({graph.personas.length - collapsedPersonas.size}/{graph.personas.length})
              </span>
            </button>
          </>
        )}

        {/* ── Active persona/story filter indicator ────────────────── */}
        {(activePersonaId || activeStoryId) && (() => {
          const persona = graph.personas.find((p) => p.id === activePersonaId);
          const story = activeStoryId ? graph.userStories.find((s) => s.id === activeStoryId) : null;
          const pi = persona ? graph.personas.indexOf(persona) : 0;
          const color = PERSONA_COLORS[pi % PERSONA_COLORS.length];
          const label = story
            ? `${story.title.length > 25 ? story.title.slice(0, 25) + "..." : story.title}`
            : persona?.name ?? "";

          return (
            <>
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium" style={{ background: `${color}18`, color }}>
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="max-w-[140px] truncate">{label}</span>
                <button
                  onClick={clearPersonaFilter}
                  className="ml-0.5 hover:opacity-70 transition-opacity"
                  title="Clear filter"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </>
          );
        })()}
      </div>

      <LandscapeCanvas
        graph={graph}
        positions={positions}
        activeWorkflowIds={allWorkflowsActive && !activePersonaId && !activeStoryId ? undefined : activeWorkflowIds}
        collapsedPersonas={collapsedPersonas}
        onTogglePersona={(personaId) => {
          setCollapsedPersonas((prev) => {
            const next = new Set(prev);
            next.has(personaId) ? next.delete(personaId) : next.add(personaId);
            return next;
          });
        }}
        onSelectPersona={handleSelectPersona}
        onSelectStory={handleSelectStory}
        activePersonaId={activePersonaId}
        activeStoryId={activeStoryId}
      />
    </div>
  );
}
