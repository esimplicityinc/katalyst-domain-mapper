import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  X,
  Check,
  Loader2,
  AlertCircle,
  Users,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { api } from "../../api/client";
import type { ManagedPersona } from "../../types/taxonomy-management";
import {
  ARCHETYPE_COLORS,
  ARCHETYPE_AVATAR_COLORS,
} from "../../types/taxonomy-management";

// ── Avatar ────────────────────────────────────────────────────────────────────

function PersonaAvatar({
  name,
  archetype,
  size = "md",
}: {
  name: string;
  archetype: ManagedPersona["archetype"];
  size?: "sm" | "md" | "lg";
}) {
  const bg = ARCHETYPE_AVATAR_COLORS[archetype] ?? "bg-gray-400";
  const initials = name.charAt(0).toUpperCase();
  const sz =
    size === "sm" ? "w-8 h-8 text-sm" : size === "lg" ? "w-12 h-12 text-lg" : "w-10 h-10 text-base";
  return (
    <div
      className={`${sz} ${bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ManagedPersona["status"] }) {
  const colors =
    status === "approved"
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      : status === "deprecated"
        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${colors} ${
        status === "deprecated" ? "line-through" : ""
      }`}
    >
      {status}
    </span>
  );
}

// ── Editable list section ─────────────────────────────────────────────────────

function EditableList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
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
            placeholder={`Add ${label.toLowerCase()}...`}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
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

// ── Chip list (for capabilities) ──────────────────────────────────────────────

function ChipList({
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
    if (!val || items.includes(val)) return;
    onChange([...items, val]);
    setNewItem("");
  };

  const removeItem = (item: string) => {
    onChange(items.filter((i) => i !== item));
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1 mb-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
          >
            {item}
            <button
              onClick={() => removeItem(item)}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
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
          placeholder={placeholder ?? "Add..."}
          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
        />
        <button
          onClick={addItem}
          className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function PersonaDetailPanel({
  persona,
  isNew,
  onSave,
  onDelete,
  onClose,
  saving,
}: {
  persona: Partial<ManagedPersona> & { name: string };
  isNew: boolean;
  onSave: (data: Omit<ManagedPersona, "storyCount" | "capabilityCount">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Omit<ManagedPersona, "storyCount" | "capabilityCount">>({
    id: persona.id ?? "",
    name: persona.name,
    type: persona.type ?? "human",
    status: persona.status ?? "draft",
    archetype: persona.archetype ?? "consumer",
    description: persona.description ?? null,
    goals: persona.goals ?? [],
    painPoints: persona.painPoints ?? [],
    behaviors: persona.behaviors ?? [],
    typicalCapabilities: persona.typicalCapabilities ?? [],
    technicalProfile: persona.technicalProfile ?? null,
    relatedStories: persona.relatedStories ?? [],
    relatedPersonas: persona.relatedPersonas ?? [],
  });
  const [showTechnicalProfile, setShowTechnicalProfile] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = <K extends keyof typeof form>(field: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => onSave(form);

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-xl z-30">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <PersonaAvatar name={form.name || "?"} archetype={form.archetype} size="sm" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {isNew ? "New Persona" : form.name}
          </h3>
          {!isNew && (
            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{persona.id}</p>
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
        {isNew && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">ID *</label>
            <input
              type="text"
              value={form.id}
              onChange={(e) => update("id", e.target.value)}
              placeholder="PER-XXX"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
          <textarea
            value={form.description ?? ""}
            onChange={(e) => update("description", e.target.value || null)}
            rows={3}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value as ManagedPersona["type"])}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500"
            >
              <option value="human">Human</option>
              <option value="bot">Bot</option>
              <option value="system">System</option>
              <option value="external_api">External API</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Archetype</label>
            <select
              value={form.archetype}
              onChange={(e) => update("archetype", e.target.value as ManagedPersona["archetype"])}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500"
            >
              <option value="creator">Creator</option>
              <option value="operator">Operator</option>
              <option value="administrator">Administrator</option>
              <option value="consumer">Consumer</option>
              <option value="integrator">Integrator</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value as ManagedPersona["status"])}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500"
          >
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>

        <EditableList label="Goals" items={form.goals} onChange={(v) => update("goals", v)} />
        <EditableList label="Pain Points" items={form.painPoints} onChange={(v) => update("painPoints", v)} />
        <EditableList label="Behaviors" items={form.behaviors} onChange={(v) => update("behaviors", v)} />

        <ChipList
          label="Typical Capabilities"
          items={form.typicalCapabilities}
          onChange={(v) => update("typicalCapabilities", v)}
          placeholder="CAP-XXX"
        />

        {/* Technical Profile */}
        <div>
          <button
            onClick={() => setShowTechnicalProfile((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showTechnicalProfile ? "rotate-180" : ""}`}
            />
            Technical Profile
          </button>
          {showTechnicalProfile && (
            <div className="mt-2 grid grid-cols-1 gap-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Skill Level</label>
                <select
                  value={form.technicalProfile?.skillLevel ?? ""}
                  onChange={(e) =>
                    update("technicalProfile", {
                      ...(form.technicalProfile ?? {}),
                      skillLevel: (e.target.value as ManagedPersona["technicalProfile"] & object extends { skillLevel?: infer S } ? S : never) || undefined,
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">— None —</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Integration Type</label>
                <select
                  value={form.technicalProfile?.integrationType ?? ""}
                  onChange={(e) =>
                    update("technicalProfile", {
                      ...(form.technicalProfile ?? {}),
                      integrationType: (e.target.value as NonNullable<ManagedPersona["technicalProfile"]>["integrationType"]) || undefined,
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">— None —</option>
                  <option value="web_ui">Web UI</option>
                  <option value="api">API</option>
                  <option value="sdk">SDK</option>
                  <option value="webhook">Webhook</option>
                  <option value="cli">CLI</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
                <select
                  value={form.technicalProfile?.frequency ?? ""}
                  onChange={(e) =>
                    update("technicalProfile", {
                      ...(form.technicalProfile ?? {}),
                      frequency: (e.target.value as NonNullable<ManagedPersona["technicalProfile"]>["frequency"]) || undefined,
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-rose-500"
                >
                  <option value="">— None —</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="occasional">Occasional</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Related Stories (read-only) */}
        {form.relatedStories.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Related Stories
            </label>
            <div className="flex flex-wrap gap-1">
              {form.relatedStories.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 text-xs font-mono bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Personas (read-only) */}
        {form.relatedPersonas.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              Related Personas
            </label>
            <div className="flex flex-wrap gap-1">
              {form.relatedPersonas.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 text-xs font-mono bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-sm font-medium rounded-md transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            {isNew ? "Create" : "Save"}
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 text-sm rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        </div>

        {!isNew && (
          confirmDelete ? (
            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <span className="text-xs text-red-700 dark:text-red-300 flex-1">
                Delete &ldquo;{form.name}&rdquo;?
              </span>
              <button
                onClick={() => persona.id && onDelete(persona.id)}
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
              Delete Persona
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ── Persona Card ──────────────────────────────────────────────────────────────

function PersonaCard({
  persona,
  onClick,
}: {
  persona: ManagedPersona;
  onClick: () => void;
}) {
  const archetypeColor = ARCHETYPE_COLORS[persona.archetype] ?? "";
  const borderColor =
    persona.archetype === "creator"
      ? "border-emerald-200 dark:border-emerald-800"
      : persona.archetype === "operator"
        ? "border-blue-200 dark:border-blue-800"
        : persona.archetype === "administrator"
          ? "border-purple-200 dark:border-purple-800"
          : persona.archetype === "consumer"
            ? "border-amber-200 dark:border-amber-800"
            : "border-cyan-200 dark:border-cyan-800";

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg border ${borderColor} shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <PersonaAvatar name={persona.name} archetype={persona.archetype} />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {persona.name}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
                {persona.type}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${archetypeColor}`}>
                {persona.archetype}
              </span>
              <StatusBadge status={persona.status} />
            </div>
          </div>
        </div>

        {persona.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {persona.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-2">
          <span>{persona.storyCount} stories</span>
          <span>·</span>
          <span>{persona.capabilityCount} capabilities</span>
        </div>
      </div>
    </div>
  );
}

// ── Main PersonaListView ──────────────────────────────────────────────────────

export function PersonaListView() {
  const [personas, setPersonas] = useState<ManagedPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [archetypeFilter, setArchetypeFilter] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<ManagedPersona | null>(null);
  const [showNewPanel, setShowNewPanel] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.listPersonas();
      setPersonas(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load personas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = personas.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && p.type !== typeFilter) return false;
    if (archetypeFilter && p.archetype !== archetypeFilter) return false;
    return true;
  });

  const handleSave = async (data: Omit<ManagedPersona, "storyCount" | "capabilityCount">) => {
    setSaving(true);
    try {
      if (showNewPanel) {
        await api.createPersona(data);
        setShowNewPanel(false);
      } else if (selectedPersona) {
        await api.updatePersona(selectedPersona.id, data);
        setSelectedPersona(null);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save persona");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await api.deletePersona(id);
      setSelectedPersona(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete persona");
    } finally {
      setSaving(false);
    }
  };

  const typeOptions: ManagedPersona["type"][] = ["human", "bot", "system", "external_api"];
  const archetypeOptions: ManagedPersona["archetype"][] = [
    "creator",
    "operator",
    "administrator",
    "consumer",
    "integrator",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading personas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search personas..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        {/* Type filter chips */}
        <div className="flex gap-1 flex-wrap">
          {typeOptions.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                typeFilter === t
                  ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Archetype filter chips */}
        <div className="flex gap-1 flex-wrap">
          {archetypeOptions.map((a) => (
            <button
              key={a}
              onClick={() => setArchetypeFilter(archetypeFilter === a ? null : a)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                archetypeFilter === a
                  ? `${ARCHETYPE_COLORS[a]}`
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={() => {
            setSelectedPersona(null);
            setShowNewPanel(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-md transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" />
          Add Persona
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {personas.length === 0
                ? "No personas yet. Add the first one."
                : "No personas match your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <PersonaCard
                key={p.id}
                persona={p}
                onClick={() => {
                  setSelectedPersona(p);
                  setShowNewPanel(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail panel overlay */}
      {(selectedPersona || showNewPanel) && (
        <>
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-20"
            onClick={() => {
              setSelectedPersona(null);
              setShowNewPanel(false);
            }}
          />
          <PersonaDetailPanel
            persona={
              showNewPanel
                ? { name: "" }
                : selectedPersona!
            }
            isNew={showNewPanel}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => {
              setSelectedPersona(null);
              setShowNewPanel(false);
            }}
            saving={saving}
          />
        </>
      )}
    </div>
  );
}
