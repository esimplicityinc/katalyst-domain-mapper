import { X, ArrowRight, FolderOpen, Users, Info, Layers } from "lucide-react";
import type { BoundedContext, DomainModelFull } from "../../types/domain";
import { SubdomainBadge } from "./SubdomainBadge";
import { RELATIONSHIP_LABELS, STATUS_STYLES } from "./constants";
import { DDDTooltip } from "./DDDTooltip";

interface ContextDetailPanelProps {
  context: BoundedContext;
  model: DomainModelFull;
  onClose: () => void;
}

export function ContextDetailPanel({
  context,
  model,
  onClose,
}: ContextDetailPanelProps) {
  const aggregates = model.aggregates.filter((a) => a.contextId === context.id);
  const events = model.domainEvents.filter((e) => e.contextId === context.id);
  const vos = model.valueObjects.filter((v) => v.contextId === context.id);
  const terms = model.glossaryTerms.filter((t) => t.contextId === context.id);

  const getRelatedContextName = (targetId: string): string => {
    const ctx = model.boundedContexts.find((c) => c.id === targetId);
    return ctx?.title ?? targetId;
  };

  return (
    <div
      className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-20 overflow-y-auto animate-slide-in"
      style={{
        animation: "slideInRight 0.2s ease-out",
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {context.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <SubdomainBadge subdomainType={context.subdomainType} />
            {context.status && (
              <span
                className={`px-1.5 py-0.5 text-xs font-medium rounded ${STATUS_STYLES[context.status] ?? STATUS_STYLES.draft}`}
              >
                {context.status}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close detail panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-4">
        {/* Description */}
        {context.description && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              <Info className="w-3 h-3" />
              Description
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {context.description}
            </p>
          </div>
        )}

        {/* Responsibility */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            <Layers className="w-3 h-3" />
            Responsibility
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {context.responsibility}
          </p>
        </div>

        {/* Team ownership */}
        {context.teamOwnership && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              <Users className="w-3 h-3" />
              Team
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {context.teamOwnership}
            </p>
          </div>
        )}

        {/* Source directory */}
        {context.sourceDirectory && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              <FolderOpen className="w-3 h-3" />
              Source
            </div>
            <code className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded block">
              {context.sourceDirectory}
            </code>
          </div>
        )}

        {/* Relationships */}
        {context.relationships.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
              Relationships <DDDTooltip termKey="context-map" position="right" />
            </h4>
            <div className="space-y-1.5">
              {context.relationships.map((rel, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded text-xs"
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {RELATIONSHIP_LABELS[rel.type] ?? rel.type}
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {getRelatedContextName(rel.targetContextId)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artifact counts */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            Artifacts
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {aggregates.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                Aggregates <DDDTooltip termKey="aggregate" position="bottom" />
              </div>
            </div>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {events.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                Events <DDDTooltip termKey="domain-event" position="bottom" />
              </div>
            </div>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {vos.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                Value Objects <DDDTooltip termKey="value-object" position="bottom" />
              </div>
            </div>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {terms.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                Glossary Terms <DDDTooltip termKey="ubiquitous-language" position="bottom" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
