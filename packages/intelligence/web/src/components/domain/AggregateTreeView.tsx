import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Shield,
  Zap,
  FileCode,
  ChevronsUpDown,
  ChevronsDownUp,
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { TreeNode } from "./TreeNode";
import { TreeLegend } from "./TreeLegend";
import { DDDTooltip } from "./DDDTooltip";
import { api } from "../../api/client";
import type {
  DomainModelFull,
  Aggregate,
  AggregateInvariant,
  ValueObject,
} from "../../types/domain";

// ── Editable List (string arrays: entities, commands, events, value objects) ──

function EditableList({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    const val = newItem.trim();
    if (!val) return;
    onChange([...items, val]);
    setNewItem("");
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-md">
              {item}
            </span>
            <button
              onClick={() => removeItem(i)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem();
              }
            }}
            placeholder={placeholder ?? `Add ${label.toLowerCase()}...`}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={addItem}
            className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Invariant Editor (list of {rule, description} pairs) ─────────────────────

function InvariantEditor({
  invariants,
  onChange,
}: {
  invariants: AggregateInvariant[];
  onChange: (invariants: AggregateInvariant[]) => void;
}) {
  const [newRule, setNewRule] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const addInvariant = () => {
    const rule = newRule.trim();
    if (!rule) return;
    const desc = newDesc.trim();
    onChange([...invariants, { rule, description: desc || undefined }]);
    setNewRule("");
    setNewDesc("");
  };

  const removeInvariant = (idx: number) => {
    onChange(invariants.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        Invariants
      </label>
      <div className="space-y-2">
        {invariants.map((inv, i) => (
          <div key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-md p-2">
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{inv.rule}</p>
              {inv.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{inv.description}</p>
              )}
            </div>
            <button
              onClick={() => removeInvariant(i)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <div className="space-y-1.5 border border-dashed border-gray-200 dark:border-gray-600 rounded-md p-2">
          <input
            type="text"
            value={newRule}
            onChange={(e) => setNewRule(e.target.value)}
            placeholder="Rule *"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInvariant();
              }
            }}
            placeholder="Description (optional)"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={addInvariant}
            disabled={!newRule.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Invariant
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Aggregate Detail Panel (Create / Edit slide-in) ──────────────────────────

interface AggregateDetailPanelProps {
  aggregate: Aggregate | null; // null = create mode
  model: DomainModelFull;
  onSave: (data: AggregateFormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}

interface AggregateFormData {
  contextId: string;
  slug: string;
  title: string;
  rootEntity: string;
  entities: string[];
  valueObjects: string[];
  events: string[];
  commands: string[];
  invariants: AggregateInvariant[];
  sourceFile: string;
  status: string;
}

function AggregateDetailPanel({
  aggregate,
  model,
  onSave,
  onDelete,
  onClose,
  saving,
}: AggregateDetailPanelProps) {
  const isNew = !aggregate;

  const [contextId, setContextId] = useState(aggregate?.contextId ?? (model.boundedContexts[0]?.id ?? ""));
  const [slug, setSlug] = useState(aggregate?.slug ?? "");
  const [title, setTitle] = useState(aggregate?.title ?? "");
  const [rootEntity, setRootEntity] = useState(aggregate?.rootEntity ?? "");
  const [status, setStatus] = useState(aggregate?.status ?? "draft");
  const [sourceFile, setSourceFile] = useState(aggregate?.sourceFile ?? "");
  const [entities, setEntities] = useState<string[]>(aggregate?.entities ?? []);
  const [valueObjects, setValueObjects] = useState<string[]>(aggregate?.valueObjects ?? []);
  const [events, setEvents] = useState<string[]>(aggregate?.events ?? []);
  const [commands, setCommands] = useState<string[]>(aggregate?.commands ?? []);
  const [invariants, setInvariants] = useState<AggregateInvariant[]>(aggregate?.invariants ?? []);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canSave = contextId && slug.trim() && title.trim() && rootEntity.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      contextId,
      slug: slug.trim(),
      title: title.trim(),
      rootEntity: rootEntity.trim(),
      entities,
      valueObjects,
      events,
      commands,
      invariants,
      sourceFile: sourceFile.trim(),
      status: status || "draft",
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-xl z-30">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
          {isNew ? (
            <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          ) : (
            <Pencil className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {isNew ? "New Aggregate" : title || aggregate?.title}
          </h3>
          {!isNew && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
              {aggregate?.id}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Context */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Bounded Context *
          </label>
          <select
            value={contextId}
            onChange={(e) => setContextId(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">— Select context —</option>
            {model.boundedContexts.map((ctx) => (
              <option key={ctx.id} value={ctx.id}>
                {ctx.title}
              </option>
            ))}
          </select>
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Slug *
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g., scan-job"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., ScanJob Aggregate"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Root Entity */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Root Entity *
          </label>
          <input
            type="text"
            value={rootEntity}
            onChange={(e) => setRootEntity(e.target.value)}
            placeholder="e.g., ScanJob"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Status + Source File row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Status
            </label>
            <select
              value={status || "draft"}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="draft">Draft</option>
              <option value="stable">Stable</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Source File
            </label>
            <input
              type="text"
              value={sourceFile}
              onChange={(e) => setSourceFile(e.target.value)}
              placeholder="src/domain/Order.ts"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        {/* Entities */}
        <EditableList
          label="Entities"
          items={entities}
          onChange={setEntities}
          placeholder="Add entity name..."
        />

        {/* Value Objects */}
        <EditableList
          label="Value Objects"
          items={valueObjects}
          onChange={setValueObjects}
          placeholder="Add value object slug..."
        />

        {/* Events */}
        <EditableList
          label="Events"
          items={events}
          onChange={setEvents}
          placeholder="Add event slug..."
        />

        {/* Commands */}
        <EditableList
          label="Commands"
          items={commands}
          onChange={setCommands}
          placeholder="Add command name..."
        />

        {/* Invariants */}
        <InvariantEditor invariants={invariants} onChange={setInvariants} />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-md transition-colors"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Save
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 text-sm rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>

        {!isNew &&
          (confirmDelete ? (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <span className="text-xs text-red-700 dark:text-red-300 flex-1">
                Delete &ldquo;{aggregate?.title}&rdquo;?
              </span>
              <button
                onClick={() => aggregate && onDelete(aggregate.id)}
                disabled={saving}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm rounded-md transition-colors w-full"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Aggregate
            </button>
          ))}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface AggregateTreeViewProps {
  model: DomainModelFull;
  onModelUpdated: () => void;
}

export function AggregateTreeView({ model, onModelUpdated }: AggregateTreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set());
  const [selectedAggregate, setSelectedAggregate] = useState<Aggregate | null>(null);
  const [showNewPanel, setShowNewPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build a slug→ValueObject lookup for cross-referencing
  const voBySlug = useMemo(() => {
    const map = new Map<string, ValueObject>();
    for (const vo of model.valueObjects) {
      map.set(vo.slug, vo);
    }
    return map;
  }, [model.valueObjects]);

  // Collect all expandable node IDs for Expand/Collapse All
  const allExpandableIds = useMemo(() => {
    const ids: string[] = [];
    for (const agg of model.aggregates) {
      // Aggregate root is expandable
      ids.push(agg.id);
      // Value objects within each aggregate are expandable
      for (const voSlug of agg.valueObjects) {
        ids.push(`${agg.id}:vo:${voSlug}`);
      }
    }
    return ids;
  }, [model.aggregates]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleContext = useCallback((contextId: string) => {
    setExpandedContexts((prev) => {
      const next = new Set(prev);
      if (next.has(contextId)) next.delete(contextId);
      else next.add(contextId);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(new Set(allExpandableIds));
  }, [allExpandableIds]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  // Group aggregates by bounded context
  const grouped = useMemo(
    () =>
      model.boundedContexts.map((ctx) => ({
        context: ctx,
        aggregates: model.aggregates.filter((a) => a.contextId === ctx.id),
      })),
    [model.boundedContexts, model.aggregates],
  );

  // Orphan aggregates (no matching context)
  const orphanAggregates = useMemo(
    () =>
      model.aggregates.filter(
        (a) => !model.boundedContexts.some((c) => c.id === a.contextId),
      ),
    [model.aggregates, model.boundedContexts],
  );

  const totalAggregates = model.aggregates.length;

  // ── CRUD handlers ─────────────────────────────────────────────────────────

  const handleSave = async (data: AggregateFormData) => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        slug: data.slug,
        title: data.title,
        rootEntity: data.rootEntity,
        entities: data.entities,
        valueObjects: data.valueObjects,
        events: data.events,
        commands: data.commands,
        invariants: data.invariants,
        sourceFile: data.sourceFile || undefined,
        status: data.status || undefined,
      };

      if (selectedAggregate) {
        await api.updateAggregate(model.id, selectedAggregate.id, payload);
      } else {
        await api.createAggregate(model.id, { contextId: data.contextId, ...payload });
      }

      setSelectedAggregate(null);
      setShowNewPanel(false);
      onModelUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save aggregate");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await api.deleteAggregate(model.id, id);
      setSelectedAggregate(null);
      onModelUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete aggregate");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = useCallback((agg: Aggregate) => {
    setShowNewPanel(false);
    setSelectedAggregate(agg);
  }, []);

  const openCreate = useCallback(() => {
    setSelectedAggregate(null);
    setShowNewPanel(true);
  }, []);

  const closePanel = useCallback(() => {
    setSelectedAggregate(null);
    setShowNewPanel(false);
  }, []);

  return (
    <div className="p-6" data-testid="aggregate-tree">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Aggregates <DDDTooltip termKey="aggregate" />
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalAggregates} aggregate{totalAggregates !== 1 ? "s" : ""} across{" "}
            {model.boundedContexts.length} context
            {model.boundedContexts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {totalAggregates > 0 && (
            <>
              <button
                data-testid="expand-all-btn"
                onClick={expandAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
                Expand All
              </button>
              <button
                data-testid="collapse-all-btn"
                onClick={collapseAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                <ChevronsDownUp className="w-3.5 h-3.5" />
                Collapse All
              </button>
            </>
          )}
          <button
            data-testid="add-aggregate-btn"
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Aggregate
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto p-0.5 text-red-400 hover:text-red-600 dark:hover:text-red-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Legend */}
      {totalAggregates > 0 && (
        <div className="mb-4">
          <TreeLegend />
        </div>
      )}

      {/* Empty state */}
      {totalAggregates === 0 ? (
        <div className="text-center py-16">
          <Box className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No aggregates yet. Use the form above or the Chat to add them.
          </p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="space-y-4">
            {grouped
              .filter((g) => g.aggregates.length > 0)
              .map((group) => {
                const isContextExpanded = expandedContexts.has(group.context.id);
                return (
                  <div key={group.context.id}>
                    {/* Context header - now clickable */}
                    <button
                      onClick={() => toggleContext(group.context.id)}
                      className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100 dark:border-gray-700 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors px-2 -mx-2"
                    >
                      {isContextExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {group.context.title}
                      </h3>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ({group.aggregates.length})
                      </span>
                    </button>

                    {/* Aggregate tree nodes - only show when expanded */}
                    {isContextExpanded && (
                      <div className="space-y-1 ml-2">
                        {group.aggregates.map((agg) => (
                          <AggregateNode
                            key={agg.id}
                            aggregate={agg}
                            expanded={expanded}
                            onToggle={toggleExpand}
                            voBySlug={voBySlug}
                            onEdit={openEdit}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Orphan aggregates */}
            {orphanAggregates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Unassigned
                  </h3>
                </div>
                <div className="space-y-1 ml-2">
                  {orphanAggregates.map((agg) => (
                    <AggregateNode
                      key={agg.id}
                      aggregate={agg}
                      expanded={expanded}
                      onToggle={toggleExpand}
                      voBySlug={voBySlug}
                      onEdit={openEdit}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-in panel overlay */}
      {(selectedAggregate || showNewPanel) && (
        <>
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-20"
            onClick={closePanel}
          />
          <AggregateDetailPanel
            aggregate={showNewPanel ? null : selectedAggregate}
            model={model}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={closePanel}
            saving={saving}
          />
        </>
      )}
    </div>
  );
}

// ── Aggregate Node (top-level tree node for each aggregate) ─────────────────

interface AggregateNodeProps {
  aggregate: Aggregate;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  voBySlug: Map<string, ValueObject>;
  onEdit: (agg: Aggregate) => void;
}

function AggregateNode({
  aggregate: agg,
  expanded,
  onToggle,
  voBySlug,
  onEdit,
}: AggregateNodeProps) {
  const isExpanded = expanded.has(agg.id);

  return (
    <div className="group/agg relative">
      <TreeNode
        label={agg.title}
        type="aggregate"
        depth={0}
        expandable
        expanded={isExpanded}
        onToggle={() => onToggle(agg.id)}
        dataTestId={`tree-node-${agg.slug}`}
        icon={<Box className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
      >
      {/* Root Entity */}
      <TreeNode
        label={`Root Entity: ${agg.rootEntity}`}
        type="entity"
        depth={1}
        icon={
          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
        }
      />

      {/* Entities */}
      {agg.entities.length > 0 && (
        <TreeNode
          label="Entities"
          type="category"
          depth={1}
          icon={
            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          }
        >
          {agg.entities.map((entity) => (
            <TreeNode
              key={entity}
              label={entity}
              type="entity"
              depth={2}
              dataTestId={`tree-node-${entity.toLowerCase().replace(/\s+/g, "")}`}
            />
          ))}
        </TreeNode>
      )}

      {/* Value Objects */}
      {agg.valueObjects.length > 0 && (
        <TreeNode
          label="Value Objects"
          type="category"
          depth={1}
          icon={
            <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          }
        >
          {agg.valueObjects.map((voSlug) => {
            const vo = voBySlug.get(voSlug);
            const voNodeId = `${agg.id}:vo:${voSlug}`;
            const voExpanded = expanded.has(voNodeId);
            const hasProperties = vo && vo.properties.length > 0;

            return (
              <TreeNode
                key={voSlug}
                label={vo?.title ?? voSlug}
                type="value-object"
                depth={2}
                expandable={!!hasProperties}
                expanded={voExpanded}
                onToggle={() => onToggle(voNodeId)}
                description={vo?.description ?? undefined}
                dataTestId={`tree-node-${voSlug}`}
              >
                {hasProperties &&
                  vo.properties.map((prop) => (
                    <TreeNode
                      key={prop.name}
                      label={prop.name}
                      type="property"
                      depth={3}
                      annotation={`: ${prop.type}`}
                      description={prop.description}
                    />
                  ))}
              </TreeNode>
            );
          })}
        </TreeNode>
      )}

      {/* Commands */}
      {agg.commands.length > 0 && (
        <TreeNode
          label="Commands"
          type="category"
          depth={1}
          icon={<Zap className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
        >
          {agg.commands.map((cmd) => (
            <TreeNode
              key={cmd}
              label={cmd}
              type="command"
              depth={2}
              dataTestId={`tree-node-${cmd.toLowerCase().replace(/\s+/g, "")}`}
            />
          ))}
        </TreeNode>
      )}

      {/* Events */}
      {agg.events.length > 0 && (
        <TreeNode
          label="Events"
          type="category"
          depth={1}
          icon={
            <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
          }
        >
          {agg.events.map((evt) => (
            <TreeNode
              key={evt}
              label={evt}
              type="event"
              depth={2}
              dataTestId={`tree-node-${evt.toLowerCase().replace(/\s+/g, "")}`}
            />
          ))}
        </TreeNode>
      )}

      {/* Invariants */}
      {agg.invariants.length > 0 && (
        <TreeNode
          label="Invariants"
          type="category"
          depth={1}
          icon={<Shield className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
        >
          {agg.invariants.map((inv, i) => (
            <TreeNode
              key={i}
              label={inv.rule}
              type="invariant"
              depth={2}
              description={inv.description}
            />
          ))}
        </TreeNode>
      )}

      {/* Source file */}
      {agg.sourceFile && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 py-1 pl-6">
          <FileCode className="w-3.5 h-3.5" />
          <code>{agg.sourceFile}</code>
        </div>
      )}
    </TreeNode>
      {/* Hover edit button — positioned over the aggregate row */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(agg);
        }}
        className="absolute top-1 right-1 opacity-0 group-hover/agg:opacity-100 p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white/80 dark:bg-gray-800/80 rounded transition-all"
        title={`Edit ${agg.title}`}
        aria-label={`Edit ${agg.title}`}
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
