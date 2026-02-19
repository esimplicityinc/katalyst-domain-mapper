/**
 * ArchitecturePage
 *
 * Tabbed page under /design/architecture/*
 * Tabs: Systems (existing canvas), Capabilities (tree view), Chat (taxonomy AI)
 */

import { useState, useEffect, useRef } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import { Sparkles, Building2, Layers, Loader2, RefreshCw } from "lucide-react";
import { api } from "../api/client";
import { ArchitectureCanvas } from "../components/architecture/ArchitectureCanvas";
import { CapabilityTreeView } from "../components/taxonomy/CapabilityTreeView";
import { TaxonomyChat } from "../components/taxonomy/TaxonomyChat";
import type { LandscapeGraph, TaxonomySystemNode } from "../types/landscape.js";
import type { DomainModel } from "../types/domain";

const STORAGE_KEY = "foe:selectedModelId";
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

// ── Helpers ───────────────────────────────────────────────────────────────────

function countAllNodes(nodes: TaxonomySystemNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countAllNodes(n.children), 0);
}

// ── Snapshot type from API ────────────────────────────────────────────────────

interface TaxonomySnapshot {
  id: string;
  project: string;
  version: string;
  nodeCount: number;
  environmentCount: number;
  createdAt: string;
}

const SUB_NAV = [
  { to: "/design/architecture/systems", label: "Systems", icon: Building2 },
  { to: "/design/architecture/capabilities", label: "Capabilities", icon: Layers },
];

const CHAT_NAV = { to: "/design/architecture/chat", label: "Chat", icon: Sparkles };

// ── SystemsView sub-component ─────────────────────────────────────────────────

function SystemsView() {
  const [models, setModels] = useState<DomainModel[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [activeModelName, setActiveModelName] = useState<string>("");
  const [graph, setGraph] = useState<LandscapeGraph | null>(null);
  const [loadingModels, setLoadingModels] = useState(true);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const load = async () => {
      setLoadingModels(true);
      try {
        const list = await api.listDomainModels();
        setModels(list);
        if (list.length === 0) return;
        const savedId = localStorage.getItem(STORAGE_KEY);
        const saved = savedId ? list.find((m) => m.id === savedId) : null;
        const target = saved ?? list[0];
        setActiveModelId(target.id);
        setActiveModelName(target.name);
        localStorage.setItem(STORAGE_KEY, target.id);
      } catch {
        setError("Failed to load domain models.");
      } finally {
        setLoadingModels(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeModelId) return;
    let cancelled = false;
    const fetchGraph = async () => {
      setLoadingGraph(true);
      setError(null);
      setGraph(null);
      try {
        const res = await fetch(`${API_BASE}/api/v1/landscape/${activeModelId}`);
        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
        const g: LandscapeGraph = await res.json();
        if (!cancelled) setGraph(g);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load landscape data");
      } finally {
        if (!cancelled) setLoadingGraph(false);
      }
    };
    fetchGraph();
    return () => { cancelled = true; };
  }, [activeModelId]);

  if (loadingModels) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading domain models...</p>
        </div>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="max-w-sm text-center space-y-3">
          <Building2 className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Domain Models</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a domain model in{" "}
            <a href="/design/business-domain" className="text-indigo-600 dark:text-indigo-400 underline">
              Business Domain
            </a>{" "}
            first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Model info bar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-3 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Model:</span>
        <span className="font-medium text-gray-800 dark:text-gray-200">{activeModelName}</span>
        {graph && !loadingGraph && (
          <span className="text-gray-400 dark:text-gray-500 text-xs">
            {graph.systems.length} systems · {countAllNodes(graph.systems)} nodes
          </span>
        )}
        <select
          value={activeModelId ?? ""}
          onChange={(e) => {
            const m = models.find((x) => x.id === e.target.value);
            if (m) {
              setActiveModelId(m.id);
              setActiveModelName(m.name);
              localStorage.setItem(STORAGE_KEY, m.id);
            }
          }}
          className="ml-auto text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-h-0 relative">
        {loadingGraph && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 dark:bg-gray-900/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading taxonomy data...</p>
            </div>
          </div>
        )}
        {error && !loadingGraph && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center space-y-3">
              <h2 className="text-base font-semibold text-red-600 dark:text-red-400">
                Failed to load architecture
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
              <button
                onClick={() => {
                  const id = activeModelId;
                  setActiveModelId(null);
                  setTimeout(() => setActiveModelId(id), 50);
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        {graph && !loadingGraph && <ArchitectureCanvas systems={graph.systems} />}
      </div>
    </div>
  );
}

// ── Main ArchitecturePage ─────────────────────────────────────────────────────

export function ArchitecturePage() {
  const [snapshot, setSnapshot] = useState<TaxonomySnapshot | null>(null);
  const [capabilityCount, setCapabilityCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const refresh = async () => {
    try {
      const [snap, caps] = await Promise.allSettled([
        api.getTaxonomyLatest(),
        api.listCapabilities(),
      ]);
      if (snap.status === "fulfilled") setSnapshot(snap.value);
      if (caps.status === "fulfilled") setCapabilityCount(caps.value.length);
    } catch {
      // API may not be available — that's OK
    }
  };

  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const init = async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    };
    init();
  }, []);  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading architecture...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                Architecture
              </h1>
              {snapshot ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {snapshot.project} &mdash; v{snapshot.version}
                </p>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500">No taxonomy snapshot</p>
              )}
            </div>
            {snapshot && (
              <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 ml-2">
                <span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {snapshot.nodeCount}
                  </span>{" "}
                  nodes
                </span>
                <span>&middot;</span>
                <span>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    {capabilityCount}
                  </span>{" "}
                  capabilities
                </span>
              </div>
            )}
          </div>

          <button
            onClick={refresh}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="px-4 sm:px-6 flex gap-1 overflow-x-auto">
          <div className="flex gap-1 flex-1">
            {SUB_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-brand-primary-500 text-brand-primary-600 dark:text-brand-primary-300"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Chat tab on the right */}
          <NavLink
            to={CHAT_NAV.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ml-auto ${
                isActive
                  ? "border-brand-accent-steel text-brand-accent-steel dark:text-brand-accent-steel"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
              }`
            }
          >
            <CHAT_NAV.icon className="w-4 h-4" />
            <span>{CHAT_NAV.label}</span>
            <span className="text-xs text-brand-accent-steel opacity-70">(Powered by Prima)</span>
          </NavLink>
        </div>
      </header>

      {/* Sub-route content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="chat" replace />} />
          <Route
            path="chat"
            element={
              <TaxonomyChat
                snapshotId={snapshot?.id ?? null}
                nodeCount={snapshot?.nodeCount ?? 0}
                capabilityCount={capabilityCount}
                onUpdated={refresh}
              />
            }
          />
          <Route path="systems" element={<SystemsView />} />
          <Route path="capabilities" element={<CapabilityTreeView />} />
        </Routes>
      </div>
    </div>
  );
}
