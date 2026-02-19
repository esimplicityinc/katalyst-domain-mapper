import { useState, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  AlertCircle,
  GitBranch,
} from "lucide-react";
import { api } from "../../api/client";
import type { ManagedCapability } from "../../types/taxonomy-management";
import {
  CAPABILITY_STATUS_COLORS,
  CATEGORY_COLORS,
} from "../../types/taxonomy-management";

// ── Tree node types ───────────────────────────────────────────────────────────

interface CapabilityTreeNode extends ManagedCapability {
  children: CapabilityTreeNode[];
}

// ── Build tree from flat list ─────────────────────────────────────────────────

function buildTree(capabilities: ManagedCapability[]): CapabilityTreeNode[] {
  const nodeMap = new Map<string, CapabilityTreeNode>();

  // First pass: create all nodes
  for (const cap of capabilities) {
    nodeMap.set(cap.id, { ...cap, children: [] });
  }

  const roots: CapabilityTreeNode[] = [];

  // Second pass: attach children to parents
  for (const cap of capabilities) {
    const node = nodeMap.get(cap.id)!;
    if (cap.parentCapability && nodeMap.has(cap.parentCapability)) {
      nodeMap.get(cap.parentCapability)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

// ── Status dot ────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: ManagedCapability["status"] }) {
  const color =
    status === "stable"
      ? "bg-green-500"
      : status === "deprecated"
        ? "bg-red-500"
        : "bg-gray-400";
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${color}`}
      title={status}
    />
  );
}

// ── Empty form state ──────────────────────────────────────────────────────────

function emptyForm(parentId?: string): Omit<ManagedCapability, "roadCount" | "storyCount"> {
  return {
    id: "",
    title: "",
    status: "planned",
    description: null,
    category: null,
    parentCapability: parentId ?? null,
    dependsOn: [],
    taxonomyNode: null,
  };
}

// ── Tree Node component ───────────────────────────────────────────────────────

function TreeNodeRow({
  node,
  depth,
  expanded,
  selected,
  onToggle,
  onSelect,
}: {
  node: CapabilityTreeNode;
  depth: number;
  expanded: Set<string>;
  selected: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const isExpanded = expanded.has(node.id);
  const isSelected = selected === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <>
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer rounded-md transition-colors ${
          isSelected
            ? "bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100"
            : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-800 dark:text-gray-200"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onSelect(node.id)}
      >
        {/* Expand/collapse */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggle(node.id);
          }}
          className="w-4 h-4 flex-shrink-0 flex items-center justify-center"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )
          ) : (
            <span className="w-3.5 h-3.5" />
          )}
        </button>

        <StatusDot status={node.status} />

        <span className="text-sm font-medium flex-1 min-w-0 truncate">
          {node.title}
        </span>

        {/* ID badge */}
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500 flex-shrink-0">
          {node.id}
        </span>

        {/* Coverage chip */}
        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
          {node.roadCount}r/{node.storyCount}s
        </span>
      </div>

      {/* Children */}
      {isExpanded &&
        node.children.map((child) => (
          <TreeNodeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            selected={selected}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  capability: ManagedCapability;
  onSave: (id: string, updates: Partial<Omit<ManagedCapability, "id" | "roadCount" | "storyCount">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddChild: (parentId: string) => void;
  saving: boolean;
}

function DetailPanel({ capability, onSave, onDelete, onAddChild, saving }: DetailPanelProps) {
  const [form, setForm] = useState({
    title: capability.title,
    description: capability.description ?? "",
    status: capability.status,
    category: capability.category ?? "",
    parentCapability: capability.parentCapability ?? "",
    dependsOnRaw: capability.dependsOn.join(", "),
    taxonomyNode: capability.taxonomyNode ?? "",
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Reset form when capability changes
  useEffect(() => {
    setForm({
      title: capability.title,
      description: capability.description ?? "",
      status: capability.status,
      category: capability.category ?? "",
      parentCapability: capability.parentCapability ?? "",
      dependsOnRaw: capability.dependsOn.join(", "),
      taxonomyNode: capability.taxonomyNode ?? "",
    });
    setDirty(false);
    setConfirmDelete(false);
  }, [capability.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    await onSave(capability.id, {
      title: form.title,
      description: form.description || null,
      status: form.status as ManagedCapability["status"],
      category: (form.category || null) as ManagedCapability["category"],
      parentCapability: form.parentCapability || null,
      dependsOn: form.dependsOnRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      taxonomyNode: form.taxonomyNode || null,
    });
    setDirty(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await onDelete(capability.id);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ID (read-only) */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            ID
          </label>
          <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {capability.id}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 resize-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
          >
            <option value="planned">Planned</option>
            <option value="stable">Stable</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">— None —</option>
            <option value="Security">Security</option>
            <option value="Observability">Observability</option>
            <option value="Communication">Communication</option>
            <option value="Business">Business</option>
            <option value="Technical">Technical</option>
          </select>
        </div>

        {/* Parent Capability */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Parent Capability
          </label>
          <input
            type="text"
            value={form.parentCapability}
            onChange={(e) => update("parentCapability", e.target.value)}
            placeholder="CAP-XXX or leave blank for root"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Depends On */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Depends On (comma-separated)
          </label>
          <input
            type="text"
            value={form.dependsOnRaw}
            onChange={(e) => update("dependsOnRaw", e.target.value)}
            placeholder="CAP-001, CAP-002"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
          {form.dependsOnRaw && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {form.dependsOnRaw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((dep) => (
                  <span
                    key={dep}
                    className="px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                  >
                    {dep}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Taxonomy Node */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Taxonomy Node
          </label>
          <input
            type="text"
            value={form.taxonomyNode}
            onChange={(e) => update("taxonomyNode", e.target.value)}
            placeholder="Optional taxonomy node ID"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Read-only counts */}
        <div className="flex gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Road Items: </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {capability.roadCount}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Stories: </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {capability.storyCount}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-green-900/30 text-white text-sm font-medium rounded-md transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save
          </button>
          <button
            onClick={() => {
              setForm({
                title: capability.title,
                description: capability.description ?? "",
                status: capability.status,
                category: capability.category ?? "",
                parentCapability: capability.parentCapability ?? "",
                dependsOnRaw: capability.dependsOn.join(", "),
                taxonomyNode: capability.taxonomyNode ?? "",
              });
              setDirty(false);
            }}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-600 text-sm rounded-md transition-colors disabled:opacity-40"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            onClick={() => onAddChild(capability.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm rounded-md transition-colors hover:bg-green-100 dark:hover:bg-green-900/30 ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Child
          </button>
        </div>

        {confirmDelete ? (
          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <span className="text-xs text-red-700 dark:text-red-300 flex-1">
              Delete &ldquo;{capability.title}&rdquo;?
            </span>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm rounded-md transition-colors w-full"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Capability
          </button>
        )}
      </div>
    </div>
  );
}

// ── New Capability Form ───────────────────────────────────────────────────────

interface NewCapabilityFormProps {
  initialParentId?: string;
  onSave: (data: Omit<ManagedCapability, "roadCount" | "storyCount">) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function NewCapabilityForm({ initialParentId, onSave, onCancel, saving }: NewCapabilityFormProps) {
  const [form, setForm] = useState(emptyForm(initialParentId));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: keyof typeof form, value: string | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.id.trim()) errs.id = "ID is required (CAP-XXX format)";
    else if (!/^CAP-/i.test(form.id)) errs.id = "Must start with CAP-";
    if (!form.title.trim()) errs.title = "Title is required";
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    await onSave(form);
  };

  return (
    <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 flex items-center gap-1.5">
        <Plus className="w-4 h-4" />
        New Capability
        {initialParentId && (
          <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
            under {initialParentId}
          </span>
        )}
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            ID *
          </label>
          <input
            type="text"
            value={form.id}
            onChange={(e) => update("id", e.target.value)}
            placeholder="CAP-XXX"
            className={`w-full px-3 py-1.5 text-sm border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 ${
              errors.id ? "border-red-400" : "border-gray-200 dark:border-gray-600"
            }`}
          />
          {errors.id && <p className="text-xs text-red-600 mt-0.5">{errors.id}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500"
          >
            <option value="planned">Planned</option>
            <option value="stable">Stable</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Title *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Capability title"
          className={`w-full px-3 py-1.5 text-sm border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 ${
            errors.title ? "border-red-400" : "border-gray-200 dark:border-gray-600"
          }`}
        />
        {errors.title && <p className="text-xs text-red-600 mt-0.5">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Description
        </label>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => update("description", e.target.value || null)}
          rows={2}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-green-500 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-md transition-colors"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Create
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 text-sm rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main CapabilityTreeView ───────────────────────────────────────────────────

export function CapabilityTreeView() {
  const [capabilities, setCapabilities] = useState<ManagedCapability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFormParentId, setNewFormParentId] = useState<string | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listCapabilities();
      setCapabilities(list);

      // Auto-expand root nodes
      const tree = buildTree(list);
      setExpanded(new Set(tree.map((n) => n.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load capabilities");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async (
    id: string,
    updates: Partial<Omit<ManagedCapability, "id" | "roadCount" | "storyCount">>,
  ) => {
    setSaving(true);
    try {
      await api.updateCapability(id, updates);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await api.deleteCapability(id);
      setSelected(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (data: Omit<ManagedCapability, "roadCount" | "storyCount">) => {
    setSaving(true);
    try {
      const created = await api.createCapability(data);
      setShowNewForm(false);
      setNewFormParentId(undefined);
      await load();
      setSelected(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleAddChild = (parentId: string) => {
    setNewFormParentId(parentId);
    setShowNewForm(true);
  };

  const tree = buildTree(capabilities);
  const selectedCapability = capabilities.find((c) => c.id === selected) ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading capabilities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left panel: tree */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-green-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Capabilities
            </h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({capabilities.length})
            </span>
          </div>
          <button
            onClick={() => {
              setNewFormParentId(undefined);
              setShowNewForm(true);
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Root
          </button>
        </div>

        {error && (
          <div className="mx-3 mt-2 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* New capability form */}
        {showNewForm && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <NewCapabilityForm
              initialParentId={newFormParentId}
              onSave={handleCreate}
              onCancel={() => {
                setShowNewForm(false);
                setNewFormParentId(undefined);
              }}
              saving={saving}
            />
          </div>
        )}

        {/* Tree */}
        <div className="flex-1 overflow-y-auto py-2">
          {tree.length === 0 ? (
            <div className="text-center py-8">
              <GitBranch className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No capabilities yet.
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                className="mt-2 text-xs text-green-600 dark:text-green-400 hover:underline"
              >
                Add the first capability
              </button>
            </div>
          ) : (
            tree.map((node) => (
              <TreeNodeRow
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                selected={selected}
                onToggle={toggleExpand}
                onSelect={setSelected}
              />
            ))
          )}
        </div>

        {/* Status legend */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          {(["stable", "planned", "deprecated"] as const).map((s) => (
            <div key={s} className="flex items-center gap-1">
              <StatusDot status={s} />
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${CAPABILITY_STATUS_COLORS[s]}`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: detail */}
      <div className="flex-1 overflow-hidden">
        {selectedCapability ? (
          <DetailPanel
            capability={selectedCapability}
            onSave={handleSave}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            saving={saving}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Edit2 className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a capability to view details
            </p>
            {capabilities.length === 0 && !loading && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Or add a root capability to get started.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export colors for use in parent components
export { CAPABILITY_STATUS_COLORS, CATEGORY_COLORS };
