import { useState, useEffect } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import {
  MessageSquare,
  Layers,
  Box,
  Zap,
  BookOpen,
  Loader2,
  Plus,
  GitBranch,
} from "lucide-react";
import { api } from "../api/client";
import { DomainModelList } from "../components/domain/DomainModelList";
import { DDDChat } from "../components/domain/DDDChat";
import { ContextMapView } from "../components/domain/ContextMapView";
import { AggregateTreeView } from "../components/domain/AggregateTreeView";
import { EventFlowView } from "../components/domain/EventFlowView";
import { GlossaryView } from "../components/domain/GlossaryView";
import { WorkflowView } from "../components/domain/WorkflowView";
import type { DomainModel, DomainModelFull } from "../types/domain";

const SUB_NAV = [
  { to: "/mapper/chat", label: "Chat", icon: MessageSquare },
  { to: "/mapper/contexts", label: "Context Map", icon: Layers },
  { to: "/mapper/aggregates", label: "Aggregates", icon: Box },
  { to: "/mapper/events", label: "Events", icon: Zap },
  { to: "/mapper/workflows", label: "Workflows", icon: GitBranch },
  { to: "/mapper/glossary", label: "Glossary", icon: BookOpen },
];

export function DomainMapperPage() {
  const [models, setModels] = useState<DomainModel[]>([]);
  const [activeModel, setActiveModel] = useState<DomainModelFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModelList, setShowModelList] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const list = await api.listDomainModels();
      setModels(list);
      // Auto-select the first model if one exists
      if (list.length > 0 && !activeModel) {
        await selectModel(list[0].id);
      }
    } catch {
      // API might not be reachable — that's fine
    } finally {
      setLoading(false);
    }
  };

  const selectModel = async (id: string) => {
    try {
      const full = await api.getDomainModel(id);
      setActiveModel(full);
      setShowModelList(false);
    } catch (err) {
      console.error("Failed to load domain model:", err);
    }
  };

  const handleModelCreated = async (model: DomainModel) => {
    setModels((prev) => [model, ...prev]);
    await selectModel(model.id);
  };

  const handleModelDeleted = (id: string) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
    if (activeModel?.id === id) {
      setActiveModel(null);
    }
  };

  const refreshModel = async () => {
    if (activeModel) {
      await selectModel(activeModel.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading domain models...
          </p>
        </div>
      </div>
    );
  }

  // Show model list if no model selected or user requested it
  if (!activeModel || showModelList) {
    return (
      <DomainModelList
        models={models}
        onSelect={selectModel}
        onCreated={handleModelCreated}
        onDeleted={handleModelDeleted}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar with model info + sub-navigation */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModelList(true)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Models
            </button>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeModel.name}
            </h2>
            {activeModel.description && (
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                — {activeModel.description}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowModelList(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Switch Model
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {SUB_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-purple-500 text-purple-700 dark:text-purple-300"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </header>

      {/* Sub-route content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="/mapper/chat" replace />} />
          <Route
            path="chat"
            element={
              <DDDChat model={activeModel} onModelUpdated={refreshModel} />
            }
          />
          <Route
            path="contexts"
            element={
              <ContextMapView
                model={activeModel}
                onModelUpdated={refreshModel}
              />
            }
          />
          <Route
            path="aggregates"
            element={<AggregateTreeView model={activeModel} />}
          />
          <Route
            path="events"
            element={<EventFlowView model={activeModel} />}
          />
          <Route
            path="workflows"
            element={<WorkflowView model={activeModel} />}
          />
          <Route
            path="glossary"
            element={
              <GlossaryView model={activeModel} onModelUpdated={refreshModel} />
            }
          />
        </Routes>
      </div>
    </div>
  );
}
