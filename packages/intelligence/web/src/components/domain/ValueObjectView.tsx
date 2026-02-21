import { useState, useMemo, useCallback } from "react";
import {
  Diamond,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileCode,
  Lock,
  Check,
  Minus,
} from "lucide-react";
import { api } from "../../api/client";
import type {
  DomainModelFull,
  ValueObject,
  ValueObjectProperty,
} from "../../types/domain";
import { DDDTooltip } from "./DDDTooltip";

// ── Context color palette (matches EventFlowView) ──────────────────────────

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

// ── Main Component ──────────────────────────────────────────────────────────

interface ValueObjectViewProps {
  model: DomainModelFull;
  onModelUpdated: () => void;
}

export function ValueObjectView({ model, onModelUpdated }: ValueObjectViewProps) {
  // Panel state: null = closed, "create" = new VO, string = editing VO id
  const [panelMode, setPanelMode] = useState<null | "create" | string>(null);
  const [saving, setSaving] = useState(false);
  // Start with all contexts expanded
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(
    () => new Set(model.boundedContexts.map((c) => c.id).concat(["orphan"]))
  );
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Delete confirmation
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Form fields (individual useState per field) ─────────────────────────
  const [formContextId, setFormContextId] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImmutable, setFormImmutable] = useState(true);
  const [formSourceFile, setFormSourceFile] = useState("");
  const [formProperties, setFormProperties] = useState<ValueObjectProperty[]>([]);
  const [formValidationRules, setFormValidationRules] = useState<string[]>([]);

  // ── Lookups ─────────────────────────────────────────────────────────────

  const contextColorMap = useMemo(() => {
    const map = new Map<string, (typeof CONTEXT_COLORS)[0]>();
    model.boundedContexts.forEach((ctx, i) => {
      map.set(ctx.id, CONTEXT_COLORS[i % CONTEXT_COLORS.length]);
    });
    return map;
  }, [model.boundedContexts]);

  // Group value objects by bounded context
  const grouped = useMemo(
    () =>
      model.boundedContexts.map((ctx) => ({
        context: ctx,
        valueObjects: model.valueObjects.filter((vo) => vo.contextId === ctx.id),
      })),
    [model.boundedContexts, model.valueObjects],
  );

  // Orphan value objects (no matching context)
  const orphanVOs = useMemo(
    () =>
      model.valueObjects.filter(
        (vo) => !model.boundedContexts.some((c) => c.id === vo.contextId),
      ),
    [model.valueObjects, model.boundedContexts],
  );

  const totalVOs = model.valueObjects.length;

  // ── Toggle helpers ──────────────────────────────────────────────────────

  const toggleContext = useCallback((id: string) => {
    setExpandedContexts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleCard = useCallback((id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // ── Form helpers ────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setFormContextId("");
    setFormSlug("");
    setFormTitle("");
    setFormDescription("");
    setFormImmutable(true);
    setFormSourceFile("");
    setFormProperties([]);
    setFormValidationRules([]);
    setConfirmingDelete(false);
    setDeleting(false);
  }, []);

  const openCreatePanel = useCallback(() => {
    resetForm();
    setPanelMode("create");
  }, [resetForm]);

  const openEditPanel = useCallback(
    (vo: ValueObject) => {
      setFormContextId(vo.contextId);
      setFormSlug(vo.slug);
      setFormTitle(vo.title);
      setFormDescription(vo.description ?? "");
      setFormImmutable(vo.immutable);
      setFormSourceFile(vo.sourceFile ?? "");
      setFormProperties(vo.properties.map((p) => ({ ...p })));
      setFormValidationRules([...vo.validationRules]);
      setConfirmingDelete(false);
      setDeleting(false);
      setPanelMode(vo.id);
    },
    [],
  );

  const closePanel = useCallback(() => {
    setPanelMode(null);
    resetForm();
  }, [resetForm]);

  // ── Property list management ────────────────────────────────────────────

  const addProperty = useCallback(() => {
    setFormProperties((prev) => [...prev, { name: "", type: "", description: "" }]);
  }, []);

  const updateProperty = useCallback(
    (index: number, field: keyof ValueObjectProperty, value: string) => {
      setFormProperties((prev) =>
        prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
      );
    },
    [],
  );

  const removeProperty = useCallback((index: number) => {
    setFormProperties((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Validation rules list management ────────────────────────────────────

  const addValidationRule = useCallback(() => {
    setFormValidationRules((prev) => [...prev, ""]);
  }, []);

  const updateValidationRule = useCallback((index: number, value: string) => {
    setFormValidationRules((prev) =>
      prev.map((r, i) => (i === index ? value : r)),
    );
  }, []);

  const removeValidationRule = useCallback((index: number) => {
    setFormValidationRules((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── API handlers ────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContextId || !formSlug.trim() || !formTitle.trim()) return;

    const payload = {
      contextId: formContextId,
      slug: formSlug.trim(),
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      immutable: formImmutable,
      sourceFile: formSourceFile.trim() || undefined,
      properties: formProperties
        .filter((p) => p.name.trim() && p.type.trim())
        .map((p) => ({
          name: p.name.trim(),
          type: p.type.trim(),
          description: p.description?.trim() || undefined,
        })),
      validationRules: formValidationRules.filter((r) => r.trim()).map((r) => r.trim()),
    };

    setSaving(true);
    try {
      if (panelMode === "create") {
        await api.createValueObject(model.id, payload);
      } else if (panelMode) {
        await api.updateValueObject(model.id, panelMode, payload);
      }
      closePanel();
      onModelUpdated();
    } catch (err) {
      console.error("Failed to save value object:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!panelMode || panelMode === "create") return;
    setDeleting(true);
    try {
      await api.deleteValueObject(model.id, panelMode);
      closePanel();
      onModelUpdated();
    } catch (err) {
      console.error("Failed to delete value object:", err);
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="p-6" data-testid="value-object-view">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Value Objects <DDDTooltip termKey="value-object" />
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalVOs} value object{totalVOs !== 1 ? "s" : ""} across{" "}
            {model.boundedContexts.length} context
            {model.boundedContexts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreatePanel}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Value Object
        </button>
      </div>

      {/* Empty state */}
      {totalVOs === 0 ? (
        <div className="text-center py-16">
          <Diamond className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No value objects yet. Use the form above or the Chat to add them.
          </p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="space-y-5">
            {grouped
              .filter((g) => g.valueObjects.length > 0)
              .map((group) => {
                const colors =
                  contextColorMap.get(group.context.id) ?? CONTEXT_COLORS[0];
                const isContextExpanded = expandedContexts.has(group.context.id);
                return (
                  <div key={group.context.id}>
                    {/* Context header */}
                    <button
                      onClick={() => toggleContext(group.context.id)}
                      className="w-full flex items-center gap-2 mb-3 pb-1 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors px-2 py-1 -mx-2 rounded-t"
                    >
                      {isContextExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {group.context.title}
                      </h3>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ({group.valueObjects.length})
                      </span>
                    </button>

                    {/* Value object cards */}
                    {isContextExpanded && (
                      <div className="space-y-2 ml-2">
                        {group.valueObjects.map((vo) => (
                          <VOCard
                            key={vo.id}
                            vo={vo}
                            colors={colors}
                            contextName={group.context.title}
                            expanded={expandedCards.has(vo.id)}
                            onToggle={() => toggleCard(vo.id)}
                            onEdit={() => openEditPanel(vo)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Orphan value objects */}
            {orphanVOs.length > 0 && (
              <div>
                <button
                  onClick={() => toggleContext("orphan")}
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
                    ({orphanVOs.length})
                  </span>
                </button>
                {expandedContexts.has("orphan") && (
                  <div className="space-y-2 ml-2">
                    {orphanVOs.map((vo) => (
                      <VOCard
                        key={vo.id}
                        vo={vo}
                        colors={CONTEXT_COLORS[0]}
                        contextName="Unassigned"
                        expanded={expandedCards.has(vo.id)}
                        onToggle={() => toggleCard(vo.id)}
                        onEdit={() => openEditPanel(vo)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Slide-in panel (Create / Edit) ─────────────────────────────────── */}
      {panelMode !== null && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-20"
            onClick={closePanel}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-[420px] z-30 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col overflow-hidden">
            <style>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>
            <div
              className="flex flex-col h-full"
              style={{ animation: "slideInRight 0.2s ease-out" }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {panelMode === "create" ? "New Value Object" : "Edit Value Object"}
                </h3>
                <button
                  onClick={closePanel}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  aria-label="Close panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panel body (scrollable form) */}
              <form
                onSubmit={handleSave}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
              >
                {/* Context */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Context <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formContextId}
                    onChange={(e) => setFormContextId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a bounded context...</option>
                    {model.boundedContexts.map((ctx) => (
                      <option key={ctx.id} value={ctx.id}>
                        {ctx.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., dimension-score"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., DimensionScore"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description of this value object"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Immutable checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vo-immutable"
                    checked={formImmutable}
                    onChange={(e) => setFormImmutable(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500"
                  />
                  <label
                    htmlFor="vo-immutable"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Immutable
                  </label>
                </div>

                {/* Source File */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Source File
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., src/domain/value-objects/EmailAddress.ts"
                    value={formSourceFile}
                    onChange={(e) => setFormSourceFile(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Properties */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Properties
                    </label>
                    <button
                      type="button"
                      onClick={addProperty}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  {formProperties.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                      No properties. Click "Add" to define one.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formProperties.map((prop, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <input
                            type="text"
                            placeholder="name"
                            value={prop.name}
                            onChange={(e) =>
                              updateProperty(i, "name", e.target.value)
                            }
                            className="flex-1 min-w-0 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            placeholder="type"
                            value={prop.type}
                            onChange={(e) =>
                              updateProperty(i, "type", e.target.value)
                            }
                            className="flex-1 min-w-0 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            placeholder="description"
                            value={prop.description ?? ""}
                            onChange={(e) =>
                              updateProperty(i, "description", e.target.value)
                            }
                            className="flex-1 min-w-0 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeProperty(i)}
                            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                            title="Remove property"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Validation Rules */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Validation Rules
                    </label>
                    <button
                      type="button"
                      onClick={addValidationRule}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  {formValidationRules.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                      No validation rules. Click "Add" to define one.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formValidationRules.map((rule, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="e.g., Must be a valid email format"
                            value={rule}
                            onChange={(e) =>
                              updateValidationRule(i, e.target.value)
                            }
                            className="flex-1 min-w-0 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeValidationRule(i)}
                            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                            title="Remove rule"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Spacer so the bottom buttons don't cover content */}
                <div className="h-2" />
              </form>

              {/* Panel footer (sticky) */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !formContextId || !formSlug.trim() || !formTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-md transition-colors"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save
                </button>
                <button
                  type="button"
                  onClick={closePanel}
                  disabled={saving}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>

                {/* Delete button (only in edit mode) */}
                {panelMode !== "create" && (
                  <div className="ml-auto">
                    {confirmingDelete ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-red-600 dark:text-red-400 whitespace-nowrap">
                          Are you sure?
                        </span>
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="p-1.5 text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded transition-colors"
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
                          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Cancel delete"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Value Object Card ───────────────────────────────────────────────────────

interface VOCardProps {
  vo: ValueObject;
  colors: (typeof CONTEXT_COLORS)[0];
  contextName: string;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

function VOCard({ vo, colors, contextName, expanded, onToggle, onEdit }: VOCardProps) {
  return (
    <div
      data-testid={`vo-card-${vo.slug}`}
      className={`border rounded-lg overflow-hidden ${colors.border} ${expanded ? colors.bg : "bg-white dark:bg-gray-800"}`}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 min-w-0 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors rounded -mx-1 px-1"
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          )}
          <Diamond className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {vo.title}
          </span>
        </button>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {vo.immutable && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-800/40 text-purple-700 dark:text-purple-300 rounded">
              <Lock className="w-2.5 h-2.5" />
              IMMUTABLE
            </span>
          )}
          {vo.properties.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              {vo.properties.length} prop{vo.properties.length !== 1 ? "s" : ""}
            </span>
          )}
          <span
            className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${colors.bg} ${colors.text}`}
          >
            {contextName}
          </span>
        </div>

        {/* Edit button */}
        <button
          onClick={onEdit}
          className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors flex-shrink-0"
          title={`Edit ${vo.title}`}
          aria-label={`Edit ${vo.title}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 space-y-3">
          {/* Description */}
          {vo.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {vo.description}
            </p>
          )}

          {/* Properties */}
          {vo.properties.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Properties
              </h4>
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-md p-2.5 space-y-1">
                {vo.properties.map((prop) => (
                  <div key={prop.name} className="flex items-baseline gap-2">
                    <span className="text-xs font-mono text-gray-900 dark:text-gray-200">
                      {prop.name}
                    </span>
                    <span className="text-xs text-gray-400">:</span>
                    <span className="text-xs font-mono text-purple-600 dark:text-purple-400">
                      {prop.type}
                    </span>
                    {prop.description && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                        — {prop.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Validation Rules */}
          {vo.validationRules.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Validation Rules
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {vo.validationRules.map((rule, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded border border-purple-200 dark:border-purple-800"
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source file */}
          {vo.sourceFile && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-1">
              <FileCode className="w-3.5 h-3.5" />
              <code>{vo.sourceFile}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
