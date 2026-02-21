import { useState, useMemo, useCallback } from "react";
import {
  Zap,
  ChevronDown,
  ChevronRight,
  FileCode,
  ArrowRight,
  Radio,
  Wifi,
  Plus,
  X,
  Loader2,
  Trash2,
  Check,
  Minus,
  Pencil,
} from "lucide-react";
import { api } from "../../api/client";
import type {
  DomainModelFull,
  DomainEvent,
  BoundedContext,
  EventPayloadField,
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
  onModelUpdated: () => void;
}

export function EventFlowView({ model, onModelUpdated }: EventFlowViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set());

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DomainEvent | null>(null);

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

  const openCreatePanel = useCallback(() => {
    setEditingEvent(null);
    setPanelOpen(true);
  }, []);

  const openEditPanel = useCallback((evt: DomainEvent) => {
    setEditingEvent(evt);
    setPanelOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setEditingEvent(null);
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

        <div className="flex items-center gap-3">
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

          {/* Add Event button */}
          <button
            onClick={openCreatePanel}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
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
            No domain events yet. Use the form above or the Chat to add them.
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
                              onEdit={() => openEditPanel(evt)}
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
                          onEdit={() => openEditPanel(evt)}
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
                    onClick={() => openEditPanel(evt)}
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

      {/* Slide-in panel overlay */}
      {panelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-20"
            onClick={closePanel}
          />
          <EventPanel
            model={model}
            event={editingEvent}
            onClose={closePanel}
            onModelUpdated={onModelUpdated}
          />
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
  onEdit: () => void;
  contextById: Map<string, BoundedContext>;
}

function EventCard({
  event,
  colors,
  isAsync: eventIsAsync,
  dimmed,
  expanded,
  onToggle,
  onEdit,
  contextById,
}: EventCardProps) {
  return (
    <div
      data-testid={`event-card-${event.slug}`}
      data-event-slug={event.slug}
      className={`relative transition-opacity ${dimmed ? "opacity-50" : ""}`}
    >
      {/* Timeline dot */}
      <div
        className={`absolute -left-[1.3rem] top-3 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${colors.dot}`}
      />

      {/* Card */}
      <div
        className={`border rounded-lg overflow-hidden ${colors.border} ${expanded ? colors.bg : "bg-white dark:bg-gray-800"} cursor-pointer hover:ring-1 hover:ring-purple-300 dark:hover:ring-purple-600 transition-all`}
        onClick={onToggle}
      >
        {/* Card header */}
        <div className="w-full flex items-center gap-2 px-3 py-2.5 text-left">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="hover:bg-gray-100 dark:hover:bg-gray-600 rounded p-0.5 transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            )}
          </button>
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
            {/* Edit button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-0.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              title={`Edit ${event.title}`}
              aria-label={`Edit ${event.title}`}
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Expanded detail panel */}
        {expanded && (
          <div
            className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
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

// ── Event Slide-in Panel (Create / Edit) ────────────────────────────────────

interface EventPanelProps {
  model: DomainModelFull;
  event: DomainEvent | null; // null = create mode
  onClose: () => void;
  onModelUpdated: () => void;
}

function EventPanel({ model, event, onClose, onModelUpdated }: EventPanelProps) {
  const isNew = event === null;

  // Form fields
  const [contextId, setContextId] = useState(event?.contextId ?? (model.boundedContexts[0]?.id ?? ""));
  const [aggregateId, setAggregateId] = useState(event?.aggregateId ?? "");
  const [slug, setSlug] = useState(event?.slug ?? "");
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [sourceFile, setSourceFile] = useState(event?.sourceFile ?? "");
  const [payload, setPayload] = useState<EventPayloadField[]>(
    event?.payload?.length ? event.payload.map((p) => ({ name: p.name ?? (p as unknown as { field: string }).field ?? "", type: p.type, description: p.description ?? "" })) : [],
  );
  const [consumedBy, setConsumedBy] = useState<string[]>(event?.consumedBy ?? []);
  const [triggers, setTriggers] = useState<string[]>(event?.triggers ?? []);
  const [sideEffects, setSideEffects] = useState<string[]>(event?.sideEffects ?? []);

  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Aggregates filtered by selected context
  const filteredAggregates = useMemo(
    () => model.aggregates.filter((a) => a.contextId === contextId),
    [model.aggregates, contextId],
  );

  // Auto-generate slug from title when creating
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (isNew) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-"),
      );
    }
  };

  const canSave =
    contextId.trim() !== "" && slug.trim() !== "" && title.trim() !== "";

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    try {
      const cleanPayload = payload
        .filter((p) => p.name.trim() !== "" && p.type.trim() !== "")
        .map((p) => ({
          name: p.name.trim(),
          type: p.type.trim(),
          ...(p.description?.trim() ? { description: p.description.trim() } : {}),
        }));
      const cleanConsumedBy = consumedBy.filter((s) => s.trim() !== "").map((s) => s.trim());
      const cleanTriggers = triggers.filter((s) => s.trim() !== "").map((s) => s.trim());
      const cleanSideEffects = sideEffects.filter((s) => s.trim() !== "").map((s) => s.trim());

      if (isNew) {
        await api.createDomainEvent(model.id, {
          contextId,
          aggregateId: aggregateId || undefined,
          slug: slug.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
          payload: cleanPayload.length > 0 ? cleanPayload : undefined,
          consumedBy: cleanConsumedBy.length > 0 ? cleanConsumedBy : undefined,
          triggers: cleanTriggers.length > 0 ? cleanTriggers : undefined,
          sideEffects: cleanSideEffects.length > 0 ? cleanSideEffects : undefined,
          sourceFile: sourceFile.trim() || undefined,
        });
      } else {
        await api.updateDomainEvent(model.id, event!.id, {
          slug: slug.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
          payload: cleanPayload.length > 0 ? cleanPayload : undefined,
          consumedBy: cleanConsumedBy.length > 0 ? cleanConsumedBy : undefined,
          triggers: cleanTriggers.length > 0 ? cleanTriggers : undefined,
          sideEffects: cleanSideEffects.length > 0 ? cleanSideEffects : undefined,
          sourceFile: sourceFile.trim() || undefined,
        });
      }
      onModelUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to save domain event:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    setDeleting(true);
    try {
      await api.deleteDomainEvent(model.id, event.id);
      onModelUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to delete domain event:", err);
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  // ── Payload helpers ─────────────────────────────────────────────────────────

  const addPayloadField = () => {
    setPayload((prev) => [...prev, { name: "", type: "", description: "" }]);
  };

  const updatePayloadField = (
    index: number,
    key: keyof EventPayloadField,
    value: string,
  ) => {
    setPayload((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [key]: value } : p)),
    );
  };

  const removePayloadField = (index: number) => {
    setPayload((prev) => prev.filter((_, i) => i !== index));
  };

  // Shared input styles
  const inputClass =
    "w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-transparent";

  const labelClass =
    "block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1";

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-xl z-30">
      {/* Panel header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Zap className="w-5 h-5 text-purple-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {isNew ? "New Domain Event" : title || "Edit Event"}
          </h3>
          {!isNew && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
              {event!.id}
            </p>
          )}
        </div>

        {/* Delete button (edit mode only) */}
        {!isNew && (
          <>
            {confirmingDelete ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-red-600 dark:text-red-400 whitespace-nowrap">
                  Delete?
                </span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-1 text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded transition-colors"
                  title="Confirm delete"
                >
                  {deleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Cancel delete"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Delete event"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Context (only editable on create) */}
        <div>
          <label className={labelClass}>Context *</label>
          {isNew ? (
            <select
              value={contextId}
              onChange={(e) => {
                setContextId(e.target.value);
                setAggregateId(""); // reset aggregate when context changes
              }}
              className={inputClass}
              required
            >
              <option value="">Select context…</option>
              {model.boundedContexts.map((ctx) => (
                <option key={ctx.id} value={ctx.id}>
                  {ctx.title}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md">
              {model.boundedContexts.find((c) => c.id === contextId)?.title ?? contextId}
            </p>
          )}
        </div>

        {/* Aggregate (only editable on create) */}
        <div>
          <label className={labelClass}>Aggregate</label>
          {isNew ? (
            <select
              value={aggregateId}
              onChange={(e) => setAggregateId(e.target.value)}
              className={inputClass}
            >
              <option value="">None</option>
              {filteredAggregates.map((agg) => (
                <option key={agg.id} value={agg.id}>
                  {agg.title}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-gray-700 dark:text-gray-300 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md">
              {event?.aggregateId
                ? (model.aggregates.find((a) => a.id === event.aggregateId)?.title ?? event.aggregateId)
                : "None"}
            </p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className={labelClass}>Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g., scan-completed"
            className={inputClass}
            required
          />
        </div>

        {/* Title */}
        <div>
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., ScanCompleted"
            className={inputClass}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this event represent?"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Source File */}
        <div>
          <label className={labelClass}>Source File</label>
          <input
            type="text"
            value={sourceFile}
            onChange={(e) => setSourceFile(e.target.value)}
            placeholder="src/domain/events/OrderPlaced.ts"
            className={inputClass}
          />
        </div>

        {/* Payload Fields */}
        <div>
          <label className={labelClass}>Payload</label>
          {payload.length > 0 && (
            <div className="space-y-2 mb-2">
              {payload.map((field, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updatePayloadField(i, "name", e.target.value)}
                    placeholder="name"
                    className="w-1/3 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                  <input
                    type="text"
                    value={field.type}
                    onChange={(e) => updatePayloadField(i, "type", e.target.value)}
                    placeholder="type"
                    className="w-1/4 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                  <input
                    type="text"
                    value={field.description ?? ""}
                    onChange={(e) => updatePayloadField(i, "description", e.target.value)}
                    placeholder="description"
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => removePayloadField(i)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addPayloadField}
            className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Field
          </button>
        </div>

        {/* Consumed By */}
        <EditableStringList
          label="Consumed By"
          items={consumedBy}
          onChange={setConsumedBy}
          placeholder="Service or handler name"
        />

        {/* Triggers */}
        <EditableStringList
          label="Triggers"
          items={triggers}
          onChange={setTriggers}
          placeholder="Command or event name"
        />

        {/* Side Effects */}
        <EditableStringList
          label="Side Effects"
          items={sideEffects}
          onChange={setSideEffects}
          placeholder="e.g. Send email notification"
        />
      </div>

      {/* Panel footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !canSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-md transition-colors"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Editable String List ────────────────────────────────────────────────────

interface EditableStringListProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

function EditableStringList({
  label,
  items,
  onChange,
  placeholder,
}: EditableStringListProps) {
  const addItem = () => onChange([...items, ""]);

  const updateItem = (index: number, value: string) => {
    onChange(items.map((item, i) => (i === index ? value : item)));
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      {items.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add {label.replace(/s$/, "")}
      </button>
    </div>
  );
}
