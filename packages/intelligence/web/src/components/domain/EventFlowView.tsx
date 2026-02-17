import { useState, useMemo, useCallback } from "react";
import {
  Zap,
  ChevronDown,
  ChevronRight,
  FileCode,
  ArrowRight,
  Radio,
  Wifi,
} from "lucide-react";
import type {
  DomainModelFull,
  DomainEvent,
  BoundedContext,
} from "../../types/domain";
import { DDDTooltip } from "./DDDTooltip";

// ── Context color palette ───────────────────────────────────────────────────

const CONTEXT_COLORS = [
  {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  {
    bg: "bg-teal-50 dark:bg-teal-900/20",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
    dot: "bg-teal-500",
  },
  {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-200 dark:border-purple-800",
    dot: "bg-purple-500",
  },
  {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
  },
  {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
  },
];

type FilterType = "all" | "sync" | "async";

// ── Main Component ──────────────────────────────────────────────────────────

interface EventFlowViewProps {
  model: DomainModelFull;
}

export function EventFlowView({ model }: EventFlowViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set());

  // Build a context-index → color lookup
  const contextColorMap = useMemo(() => {
    const map = new Map<string, (typeof CONTEXT_COLORS)[0]>();
    model.boundedContexts.forEach((ctx, i) => {
      map.set(ctx.id, CONTEXT_COLORS[i % CONTEXT_COLORS.length]);
    });
    return map;
  }, [model.boundedContexts]);

  // Build a context-id → BoundedContext lookup
  const contextById = useMemo(() => {
    const map = new Map<string, BoundedContext>();
    for (const ctx of model.boundedContexts) {
      map.set(ctx.id, ctx);
    }
    return map;
  }, [model.boundedContexts]);

  // Determine if an event is async (cross-context heuristic)
  const isAsync = useCallback(
    (evt: DomainEvent): boolean => evt.consumedBy.length > 0,
    [],
  );

  // Group events by bounded context
  const grouped = useMemo(
    () =>
      model.boundedContexts.map((ctx) => ({
        context: ctx,
        events: model.domainEvents.filter((e) => e.contextId === ctx.id),
      })),
    [model.boundedContexts, model.domainEvents],
  );

  // Orphan events (no matching context)
  const orphanEvents = useMemo(
    () =>
      model.domainEvents.filter(
        (e) => !model.boundedContexts.some((c) => c.id === e.contextId),
      ),
    [model.domainEvents, model.boundedContexts],
  );

  // Check if an event matches the active filter (for dimming)
  const matchesFilter = useCallback(
    (evt: DomainEvent): boolean => {
      if (activeFilter === "all") return true;
      if (activeFilter === "async") return isAsync(evt);
      return !isAsync(evt); // sync
    },
    [activeFilter, isAsync],
  );

  const toggleEventExpand = useCallback((id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleContextExpand = useCallback((id: string) => {
    setExpandedContexts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const totalEvents = model.domainEvents.length;
  const asyncCount = useMemo(
    () => model.domainEvents.filter(isAsync).length,
    [model.domainEvents, isAsync],
  );
  const syncCount = totalEvents - asyncCount;

  return (
    <div className="p-6" data-testid="event-flow-view">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Domain Events <DDDTooltip termKey="domain-event" />
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalEvents} domain event{totalEvents !== 1 ? "s" : ""} across{" "}
            {model.boundedContexts.length} context
            {model.boundedContexts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filter buttons */}
        {totalEvents > 0 && (
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <FilterButton
              label="All"
              count={totalEvents}
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            />
            <FilterButton
              label="Synchronous"
              count={syncCount}
              active={activeFilter === "sync"}
              onClick={() => setActiveFilter("sync")}
            />
            <FilterButton
              label="Asynchronous"
              count={asyncCount}
              active={activeFilter === "async"}
              onClick={() => setActiveFilter("async")}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      {totalEvents > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-teal-500" />
            <span>Synchronous (within context)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-purple-500" />
            <span>Asynchronous (cross-context consumers)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Domain Event</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            <span>Triggers / Side Effects</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalEvents === 0 ? (
        <div className="text-center py-16">
          <Zap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No domain events defined yet. Use the chat to discover them or add
            them via the API.
          </p>
        </div>
      ) : (
        <>
          {/* Event flow timeline */}
          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="space-y-5">
              {grouped
                .filter((g) => g.events.length > 0)
                .map((group) => {
                  const colors =
                    contextColorMap.get(group.context.id) ?? CONTEXT_COLORS[0];
                  const isContextExpanded = expandedContexts.has(group.context.id);
                  return (
                    <div key={group.context.id}>
                      {/* Context header */}
                      <button
                        onClick={() => toggleContextExpand(group.context.id)}
                        className="w-full flex items-center gap-2 mb-3 pb-1 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors px-2 py-1 -mx-2 rounded-t"
                      >
                        {isContextExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                        <div
                          className={`w-3 h-3 rounded-full ${colors.dot}`}
                        />
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {group.context.title}
                        </h3>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ({group.events.length})
                        </span>
                      </button>

                      {/* Event cards in a timeline */}
                      {isContextExpanded && (
                        <div className="relative ml-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4 space-y-3">
                          {group.events.map((evt) => (
                            <EventCard
                              key={evt.id}
                              event={evt}
                              colors={colors}
                              isAsync={isAsync(evt)}
                              dimmed={!matchesFilter(evt)}
                              expanded={expandedEvents.has(evt.id)}
                              onToggle={() => toggleEventExpand(evt.id)}
                              contextById={contextById}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Orphan events */}
              {orphanEvents.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleContextExpand("orphan")}
                    className="w-full flex items-center gap-2 mb-3 pb-1 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors px-2 py-1 -mx-2 rounded-t"
                  >
                    {expandedContexts.has("orphan") ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Unassigned
                    </h3>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ({orphanEvents.length})
                    </span>
                  </button>
                  {expandedContexts.has("orphan") && (
                    <div className="relative ml-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4 space-y-3">
                      {orphanEvents.map((evt) => (
                        <EventCard
                          key={evt.id}
                          event={evt}
                          colors={CONTEXT_COLORS[0]}
                          isAsync={isAsync(evt)}
                          dimmed={!matchesFilter(evt)}
                          expanded={expandedEvents.has(evt.id)}
                          onToggle={() => toggleEventExpand(evt.id)}
                          contextById={contextById}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary grid */}
          <div className="mt-6" data-testid="event-summary-grid">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              All Events
            </h3>
            <div className="flex flex-wrap gap-2">
              {model.domainEvents.map((evt) => {
                const colors = contextColorMap.get(evt.contextId);
                const eventIsAsync = isAsync(evt);
                return (
                  <button
                    key={evt.id}
                    onClick={() => toggleEventExpand(evt.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                      colors
                        ? `${colors.bg} ${colors.text} ${colors.border}`
                        : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                    } hover:ring-2 hover:ring-purple-300 dark:hover:ring-purple-600 ${
                      !matchesFilter(evt) ? "opacity-50" : ""
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    {evt.title}
                    {eventIsAsync && (
                      <span className="ml-0.5 px-1 py-px text-[10px] font-bold bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded">
                        ASYNC
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Filter Button ───────────────────────────────────────────────────────────

interface FilterButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function FilterButton({ label, count, active, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
        active
          ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      }`}
    >
      {label}
      <span
        className={`text-[10px] ${active ? "text-gray-500 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}
      >
        ({count})
      </span>
    </button>
  );
}

// ── Event Card ──────────────────────────────────────────────────────────────

interface EventCardProps {
  event: DomainEvent;
  colors: (typeof CONTEXT_COLORS)[0];
  isAsync: boolean;
  dimmed: boolean;
  expanded: boolean;
  onToggle: () => void;
  contextById: Map<string, BoundedContext>;
}

function EventCard({
  event,
  colors,
  isAsync: eventIsAsync,
  dimmed,
  expanded,
  onToggle,
  contextById,
}: EventCardProps) {
  return (
    <div
      data-testid={`event-card-${event.slug}`}
      className={`relative transition-opacity ${dimmed ? "opacity-50" : ""}`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute -left-[1.3rem] top-3 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${colors.dot}`}
      />

      {/* Card */}
      <div
        className={`border rounded-lg overflow-hidden ${colors.border} ${expanded ? colors.bg : "bg-white dark:bg-gray-800"}`}
      >
        {/* Card header */}
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          )}
          <Zap
            className={`w-4 h-4 flex-shrink-0 ${eventIsAsync ? "text-purple-500" : "text-teal-500"}`}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 min-w-0 truncate">
            {event.title}
          </span>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {eventIsAsync && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded">
                ASYNC
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${colors.bg} ${colors.text}`}
            >
              {contextById.get(event.contextId)?.title ?? "Unknown"}
            </span>
          </div>
        </button>

        {/* Expanded detail panel */}
        {expanded && (
          <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 space-y-3">
            {/* Description */}
            {event.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {event.description}
              </p>
            )}

            {/* Payload fields */}
            {event.payload.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Payload
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900/30 rounded-md p-2.5 space-y-1">
                  {event.payload.map((field) => {
                    // Handle both "name" and "field" keys (API stores as "field")
                    const fieldName =
                      field.name ??
                      (field as unknown as { field: string }).field ??
                      "unknown";
                    return (
                      <div
                        key={fieldName}
                        className="flex items-baseline gap-2"
                      >
                        <span className="text-xs font-mono text-gray-900 dark:text-gray-200">
                          {fieldName}
                        </span>
                        <span className="text-xs text-gray-400">:</span>
                        <span className="text-xs font-mono text-teal-600 dark:text-teal-400">
                          {field.type}
                        </span>
                        {field.description && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                            — {field.description}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Triggers */}
            {event.triggers.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Triggers
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {event.triggers.map((trigger, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded border border-green-200 dark:border-green-800"
                    >
                      <Zap className="w-3 h-3" />
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Side Effects */}
            {event.sideEffects.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Side Effects
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {event.sideEffects.map((effect, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs rounded border border-amber-200 dark:border-amber-800"
                    >
                      <ArrowRight className="w-3 h-3" />
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Consumed By */}
            {event.consumedBy.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Consumed By
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {event.consumedBy.map((consumer, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded border border-purple-200 dark:border-purple-800"
                    >
                      <Wifi className="w-3 h-3" />
                      {consumer}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Source file */}
            {event.sourceFile && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-1">
                <FileCode className="w-3.5 h-3.5" />
                <code>{event.sourceFile}</code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
