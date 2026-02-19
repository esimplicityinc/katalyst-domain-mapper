import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Loader2,
  AlertCircle,
  X,
  Check,
  Trash2,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { api } from "../../api/client";
import type { ManagedUserStory, ManagedPersona } from "../../types/taxonomy-management";
import {
  STORY_STATUS_COLUMNS,
  STORY_STATUS_COLORS,
  ARCHETYPE_AVATAR_COLORS,
  ARCHETYPE_COLORS,
} from "../../types/taxonomy-management";

// ── Persona badge ─────────────────────────────────────────────────────────────

function PersonaBadge({
  personaId,
  personas,
}: {
  personaId: string;
  personas: ManagedPersona[];
}) {
  const persona = personas.find((p) => p.id === personaId);
  if (!persona) {
    return (
      <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
        {personaId}
      </span>
    );
  }

  const bg = ARCHETYPE_AVATAR_COLORS[persona.archetype] ?? "bg-gray-400";
  const badge = ARCHETYPE_COLORS[persona.archetype] ?? "";

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full font-medium ${badge}`}>
      <span
        className={`w-4 h-4 ${bg} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
      >
        {persona.name.charAt(0).toUpperCase()}
      </span>
      {persona.name}
    </span>
  );
}

// ── Story Card ────────────────────────────────────────────────────────────────

function StoryCard({
  story,
  personas,
  onClick,
}: {
  story: ManagedUserStory;
  personas: ManagedPersona[];
  onClick: () => void;
}) {
  const statusColor =
    story.status === "complete"
      ? "border-l-green-500"
      : story.status === "implementing"
        ? "border-l-amber-500"
        : story.status === "approved"
          ? "border-l-blue-500"
          : story.status === "deprecated"
            ? "border-l-red-500"
            : "border-l-gray-300";

  const visibleCaps = story.capabilities.slice(0, 2);
  const extraCaps = story.capabilities.length - 2;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-4 ${statusColor} rounded-md p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
    >
      {/* ID */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
          {story.id}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-snug mb-2">
        {story.title}
      </h4>

      {/* Persona */}
      <div className="mb-2">
        <PersonaBadge personaId={story.persona} personas={personas} />
      </div>

      {/* Capability chips */}
      {story.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {visibleCaps.map((cap) => (
            <span
              key={cap}
              className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
            >
              {cap}
            </span>
          ))}
          {extraCaps > 0 && (
            <span className="px-1.5 py-0.5 text-xs text-gray-400 dark:text-gray-500">
              +{extraCaps} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function StoryDetailPanel({
  story,
  personas,
  isNew,
  onSave,
  onDelete,
  onClose,
  saving,
}: {
  story: Partial<ManagedUserStory>;
  personas: ManagedPersona[];
  isNew: boolean;
  onSave: (data: ManagedUserStory) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<ManagedUserStory>({
    id: story.id ?? "",
    title: story.title ?? "",
    persona: story.persona ?? "",
    status: story.status ?? "draft",
    capabilities: story.capabilities ?? [],
    useCases: story.useCases ?? [],
    acceptanceCriteria: story.acceptanceCriteria ?? [],
    taxonomyNode: story.taxonomyNode ?? null,
  });
  const [newCap, setNewCap] = useState("");
  const [newUC, setNewUC] = useState("");
  const [newAC, setNewAC] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [capError, setCapError] = useState("");

  const update = <K extends keyof ManagedUserStory>(field: K, value: ManagedUserStory[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addCap = () => {
    const val = newCap.trim();
    if (!val || form.capabilities.includes(val)) return;
    update("capabilities", [...form.capabilities, val]);
    setNewCap("");
    setCapError("");
  };

  const removeCap = (cap: string) => {
    const updated = form.capabilities.filter((c) => c !== cap);
    update("capabilities", updated);
  };

  const addUC = () => {
    const val = newUC.trim();
    if (!val) return;
    update("useCases", [...form.useCases, val]);
    setNewUC("");
  };

  const removeUC = (idx: number) => {
    update("useCases", form.useCases.filter((_, i) => i !== idx));
  };

  const addAC = () => {
    const val = newAC.trim();
    if (!val) return;
    update("acceptanceCriteria", [...form.acceptanceCriteria, val]);
    setNewAC("");
  };

  const removeAC = (idx: number) => {
    update("acceptanceCriteria", form.acceptanceCriteria.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (form.capabilities.length === 0) {
      setCapError("At least one capability is required");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col shadow-xl z-30">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {isNew ? "New User Story" : (form.id || "Story")}
          </h3>
          {!isNew && (
            <span
              className={`inline-block mt-0.5 px-2 py-0.5 text-xs font-medium rounded-full ${STORY_STATUS_COLORS[form.status]}`}
            >
              {form.status}
            </span>
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
              placeholder="US-XXX"
              className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value as ManagedUserStory["status"])}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500"
            >
              {STORY_STATUS_COLUMNS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Persona</label>
            <select
              value={form.persona}
              onChange={(e) => update("persona", e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500"
            >
              <option value="">— Select —</option>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Capabilities */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Capabilities *
          </label>
          <div className="flex flex-wrap gap-1 mb-2">
            {form.capabilities.map((cap) => (
              <span
                key={cap}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                {cap}
                <button onClick={() => removeCap(cap)} className="text-gray-400 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCap}
              onChange={(e) => { setNewCap(e.target.value); setCapError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCap(); } }}
              placeholder="CAP-XXX"
              className={`flex-1 px-3 py-1.5 text-sm border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500 ${capError ? "border-red-400" : "border-gray-200 dark:border-gray-600"}`}
            />
            <button
              onClick={addCap}
              className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {capError && <p className="text-xs text-red-600 mt-0.5">{capError}</p>}
        </div>

        {/* Acceptance Criteria */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Acceptance Criteria
          </label>
          <div className="space-y-1.5 mb-2">
            {form.acceptanceCriteria.map((ac, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-green-500 mt-1.5 flex-shrink-0 text-sm">✓</span>
                <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-md">
                  {ac}
                </span>
                <button
                  onClick={() => removeAC(i)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAC}
              onChange={(e) => setNewAC(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAC(); } }}
              placeholder="Acceptance criterion..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={addAC}
              className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Use Cases */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            Use Cases
          </label>
          <div className="space-y-1.5 mb-2">
            {form.useCases.map((uc, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-md">
                  {uc}
                </span>
                <button
                  onClick={() => removeUC(i)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUC}
              onChange={(e) => setNewUC(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUC(); } }}
              placeholder="UC-XXX"
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={addUC}
              className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Taxonomy Node */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Taxonomy Node
          </label>
          <input
            type="text"
            value={form.taxonomyNode ?? ""}
            onChange={(e) => update("taxonomyNode", e.target.value || null)}
            placeholder="Optional"
            className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-sm font-medium rounded-md transition-colors"
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
                Delete this story?
              </span>
              <button
                onClick={() => story.id && onDelete(story.id)}
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
              Delete Story
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────

function KanbanColumn({
  status,
  stories,
  personas,
  onStoryClick,
}: {
  status: (typeof STORY_STATUS_COLUMNS)[number];
  stories: ManagedUserStory[];
  personas: ManagedPersona[];
  onStoryClick: (story: ManagedUserStory) => void;
}) {
  const colors = STORY_STATUS_COLORS[status];
  const borderColors: Record<string, string> = {
    draft: "border-gray-300 dark:border-gray-600",
    approved: "border-blue-300 dark:border-blue-700",
    implementing: "border-amber-300 dark:border-amber-700",
    complete: "border-green-300 dark:border-green-700",
    deprecated: "border-red-300 dark:border-red-700",
  };

  return (
    <div
      className={`flex-shrink-0 w-72 lg:w-auto lg:flex-1 min-w-[16rem] rounded-lg border ${borderColors[status]} bg-gray-50 dark:bg-gray-800/50`}
    >
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 border-b ${borderColors[status]}`}>
        <h3 className={`text-sm font-semibold capitalize ${colors}`}>
          {status}
        </h3>
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors}`}>
          {stories.length}
        </span>
      </div>

      {/* Cards */}
      <div className="p-2 space-y-2 max-h-[32rem] overflow-y-auto">
        {stories.length === 0 ? (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-6">
            No stories
          </p>
        ) : (
          stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              personas={personas}
              onClick={() => onStoryClick(story)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Main UserStoryBoardView ───────────────────────────────────────────────────

export function UserStoryBoardView() {
  const [stories, setStories] = useState<ManagedUserStory[]>([]);
  const [personas, setPersonas] = useState<ManagedPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personaFilter, setPersonaFilter] = useState("");
  const [capFilter, setCapFilter] = useState("");
  const [selectedStory, setSelectedStory] = useState<ManagedUserStory | null>(null);
  const [showNewPanel, setShowNewPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storyList, personaList] = await Promise.all([
        api.listUserStories(),
        api.listPersonas(),
      ]);
      setStories(storyList);
      setPersonas(personaList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = stories.filter((s) => {
    if (personaFilter && s.persona !== personaFilter) return false;
    if (capFilter && !s.capabilities.some((c) => c.toLowerCase().includes(capFilter.toLowerCase()))) return false;
    return true;
  });

  const handleSave = async (data: ManagedUserStory) => {
    setSaving(true);
    try {
      if (showNewPanel) {
        await api.createUserStory(data);
        setShowNewPanel(false);
      } else if (selectedStory) {
        await api.updateUserStory(selectedStory.id, data);
        setSelectedStory(null);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save story");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await api.deleteUserStory(id);
      setSelectedStory(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete story");
    } finally {
      setSaving(false);
    }
  };

  const activePersona = personas.find((p) => p.id === personaFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-wrap items-center gap-3">
        {/* Persona filter */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaDropdown((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">Persona:</span>
            <span>{activePersona ? activePersona.name : "All"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showPersonaDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowPersonaDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden">
                <button
                  onClick={() => { setPersonaFilter(""); setShowPersonaDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  All personas
                </button>
                {personas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPersonaFilter(p.id); setShowPersonaDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      personaFilter === p.id
                        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Capability filter */}
        <input
          type="text"
          value={capFilter}
          onChange={(e) => setCapFilter(e.target.value)}
          placeholder="Filter by capability..."
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 w-48"
        />

        {/* Add story */}
        <button
          onClick={() => {
            setSelectedStory(null);
            setShowNewPanel(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-md transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" />
          Add Story
        </button>
      </div>

      {error && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-auto p-4">
        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No user stories yet. Add the first one.
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:snap-none">
            {STORY_STATUS_COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                stories={filtered.filter((s) => s.status === status)}
                personas={personas}
                onStoryClick={(story) => {
                  setSelectedStory(story);
                  setShowNewPanel(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail panel overlay */}
      {(selectedStory || showNewPanel) && (
        <>
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-20"
            onClick={() => {
              setSelectedStory(null);
              setShowNewPanel(false);
            }}
          />
          <StoryDetailPanel
            story={showNewPanel ? {} : selectedStory!}
            personas={personas}
            isNew={showNewPanel}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => {
              setSelectedStory(null);
              setShowNewPanel(false);
            }}
            saving={saving}
          />
        </>
      )}
    </div>
  );
}
