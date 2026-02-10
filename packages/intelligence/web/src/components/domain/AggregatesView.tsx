import { useState } from "react";
import {
  Box,
  ChevronDown,
  ChevronRight,
  Shield,
  Zap,
  FileCode,
} from "lucide-react";
import type { DomainModelFull, Aggregate } from "../../types/domain";

interface AggregatesViewProps {
  model: DomainModelFull;
}

export function AggregatesView({ model }: AggregatesViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getContextName = (contextId: string): string => {
    const ctx = model.boundedContexts.find((c) => c.id === contextId);
    return ctx?.title ?? "Unknown Context";
  };

  // Group aggregates by bounded context
  const grouped = model.boundedContexts.map((ctx) => ({
    context: ctx,
    aggregates: model.aggregates.filter((a) => a.contextId === ctx.id),
  }));

  // Also include aggregates with no matching context
  const orphanAggregates = model.aggregates.filter(
    (a) => !model.boundedContexts.some((c) => c.id === a.contextId),
  );

  const totalAggregates = model.aggregates.length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Aggregates
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {totalAggregates} aggregate{totalAggregates !== 1 ? "s" : ""} across{" "}
          {model.boundedContexts.length} context
          {model.boundedContexts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {totalAggregates === 0 ? (
        <div className="text-center py-16">
          <Box className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No aggregates defined yet. Use the chat to discover them or add them
            via the API.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped
            .filter((g) => g.aggregates.length > 0)
            .map((group) => (
              <div key={group.context.id}>
                {/* Context header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {group.context.title}
                  </h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ({group.aggregates.length})
                  </span>
                </div>

                {/* Aggregate cards */}
                <div className="space-y-2 ml-5">
                  {group.aggregates.map((agg) => (
                    <AggregateCard
                      key={agg.id}
                      aggregate={agg}
                      contextName={group.context.title}
                      expanded={expanded.has(agg.id)}
                      onToggle={() => toggleExpand(agg.id)}
                    />
                  ))}
                </div>
              </div>
            ))}

          {orphanAggregates.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Unassigned
                </h3>
              </div>
              <div className="space-y-2 ml-5">
                {orphanAggregates.map((agg) => (
                  <AggregateCard
                    key={agg.id}
                    aggregate={agg}
                    contextName={getContextName(agg.contextId)}
                    expanded={expanded.has(agg.id)}
                    onToggle={() => toggleExpand(agg.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Aggregate Card ────────────────────────────────────────────────────────────

interface AggregateCardProps {
  aggregate: Aggregate;
  contextName: string;
  expanded: boolean;
  onToggle: () => void;
}

function AggregateCard({ aggregate, expanded, onToggle }: AggregateCardProps) {
  const agg = aggregate;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
        <Box className="w-4 h-4 text-green-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {agg.title}
          </span>
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 font-mono">
            {agg.slug}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Root: {agg.rootEntity}
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-3">
          {/* Entities */}
          {agg.entities.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Entities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {agg.entities.map((e, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Value Objects */}
          {agg.valueObjects.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Value Objects
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {agg.valueObjects.map((vo, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs rounded"
                  >
                    {vo}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Commands */}
          {agg.commands.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Commands
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {agg.commands.map((cmd, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded"
                  >
                    {cmd}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {agg.events.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Events Emitted
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {agg.events.map((evt, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded"
                  >
                    <Zap className="w-3 h-3" />
                    {evt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Invariants */}
          {agg.invariants.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Invariants
              </h4>
              <ul className="space-y-1">
                {agg.invariants.map((inv, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300"
                  >
                    <Shield className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">{inv.rule}</span>
                      {inv.description && (
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                          — {inv.description}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Source file */}
          {agg.sourceFile && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <FileCode className="w-3.5 h-3.5" />
              <code>{agg.sourceFile}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
