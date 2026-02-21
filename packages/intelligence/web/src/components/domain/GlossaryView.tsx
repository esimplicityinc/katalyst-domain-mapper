import { useState } from "react";
import { Plus, Loader2, BookOpen, Search, Pencil, Trash2, Check, X } from "lucide-react";
import { api } from "../../api/client";
import type { DomainModelFull, GlossaryTerm } from "../../types/domain";
import { DDDTooltip } from "./DDDTooltip";

interface GlossaryViewProps {
  model: DomainModelFull;
  onModelUpdated: () => void;
}

export function GlossaryView({ model, onModelUpdated }: GlossaryViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  // Form state
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [contextId, setContextId] = useState("");
  const [aliases, setAliases] = useState("");
  const [examples, setExamples] = useState("");

  const resetForm = () => {
    setTerm("");
    setDefinition("");
    setContextId("");
    setAliases("");
    setExamples("");
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) return;

    setCreating(true);
    try {
      await api.createGlossaryTerm(model.id, {
        term: term.trim(),
        definition: definition.trim(),
        contextId: contextId || undefined,
        aliases: aliases
          ? aliases
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : undefined,
        examples: examples
          ? examples
              .split("\n")
              .map((e) => e.trim())
              .filter(Boolean)
          : undefined,
      });
      resetForm();
      onModelUpdated();
    } catch (err) {
      console.error("Failed to create glossary term:", err);
    } finally {
      setCreating(false);
    }
  };

  const getContextName = (ctxId: string | null): string | null => {
    if (!ctxId) return null;
    const ctx = model.boundedContexts.find((c) => c.id === ctxId);
    return ctx?.title ?? null;
  };

  // Filter terms by search
  const filtered = model.glossaryTerms.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.term.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q) ||
      t.aliases.some((a) => a.toLowerCase().includes(q))
    );
  });

  // Sort alphabetically
  const sorted = [...filtered].sort((a, b) =>
    a.term.toLowerCase().localeCompare(b.term.toLowerCase()),
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Ubiquitous Language <DDDTooltip termKey="ubiquitous-language" />
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {model.glossaryTerms.length} term
            {model.glossaryTerms.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Term
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            New Glossary Term
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <select
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Global (no context)</option>
              {model.boundedContexts.map((ctx) => (
                <option key={ctx.id} value={ctx.id}>
                  {ctx.title}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Definition"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              rows={2}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:col-span-2"
              required
            />
            <input
              type="text"
              placeholder="Aliases (comma-separated)"
              value={aliases}
              onChange={(e) => setAliases(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Examples (one per line)"
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-md transition-colors"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Add Term
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      {model.glossaryTerms.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search terms, definitions, aliases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Glossary table */}
      {model.glossaryTerms.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No glossary terms yet. Add terms manually or use the chat to build a
            ubiquitous language.
          </p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No terms match "{search}"
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Term
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Definition
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">
                  Context
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">
                  Aliases
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-right w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sorted.map((t) => (
                <GlossaryRow
                  key={t.id}
                  term={t}
                  contextName={getContextName(t.contextId)}
                  model={model}
                  onModelUpdated={onModelUpdated}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Glossary Row ──────────────────────────────────────────────────────────────

interface GlossaryRowProps {
  term: GlossaryTerm;
  contextName: string | null;
  model: DomainModelFull;
  onModelUpdated: () => void;
}

function GlossaryRow({ term, contextName, model, onModelUpdated }: GlossaryRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [editTerm, setEditTerm] = useState(term.term);
  const [editDefinition, setEditDefinition] = useState(term.definition);
  const [editContextId, setEditContextId] = useState(term.contextId ?? "");
  const [editAliases, setEditAliases] = useState(term.aliases.join(", "));
  const [editExamples, setEditExamples] = useState(term.examples.join("\n"));

  const startEditing = () => {
    setEditTerm(term.term);
    setEditDefinition(term.definition);
    setEditContextId(term.contextId ?? "");
    setEditAliases(term.aliases.join(", "));
    setEditExamples(term.examples.join("\n"));
    setIsEditing(true);
    setConfirmingDelete(false);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editTerm.trim() || !editDefinition.trim()) return;

    setSaving(true);
    try {
      await api.updateGlossaryTerm(model.id, term.id, {
        term: editTerm.trim(),
        definition: editDefinition.trim(),
        contextId: editContextId || undefined,
        aliases: editAliases
          ? editAliases
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean)
          : undefined,
        examples: editExamples
          ? editExamples
              .split("\n")
              .map((e) => e.trim())
              .filter(Boolean)
          : undefined,
      });
      setIsEditing(false);
      onModelUpdated();
    } catch (err) {
      console.error("Failed to update glossary term:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteGlossaryTerm(model.id, term.id);
      onModelUpdated();
    } catch (err) {
      console.error("Failed to delete glossary term:", err);
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  // ── Inline edit mode ────────────────────────────────────────────────────────

  if (isEditing) {
    return (
      <tr className="bg-purple-50/50 dark:bg-purple-900/10">
        <td colSpan={5} className="px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Term"
              value={editTerm}
              onChange={(e) => setEditTerm(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <select
              value={editContextId}
              onChange={(e) => setEditContextId(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Global (no context)</option>
              {model.boundedContexts.map((ctx) => (
                <option key={ctx.id} value={ctx.id}>
                  {ctx.title}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Definition"
              value={editDefinition}
              onChange={(e) => setEditDefinition(e.target.value)}
              rows={2}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:col-span-2"
              required
            />
            <input
              type="text"
              placeholder="Aliases (comma-separated)"
              value={editAliases}
              onChange={(e) => setEditAliases(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Examples (one per line)"
              value={editExamples}
              onChange={(e) => setEditExamples(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !editTerm.trim() || !editDefinition.trim()}
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
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // ── Display mode ────────────────────────────────────────────────────────────

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900 dark:text-white">
          {term.term}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-md">
        <span className="line-clamp-2">{term.definition}</span>
        {term.examples.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {term.examples.slice(0, 2).map((ex, i) => (
              <span
                key={i}
                className="text-xs text-gray-500 dark:text-gray-400 italic"
              >
                e.g., {ex}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        {contextName ? (
          <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded">
            {contextName}
          </span>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Global
          </span>
        )}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        {term.aliases.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {term.aliases.map((a, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
              >
                {a}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {confirmingDelete ? (
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-xs text-red-600 dark:text-red-400 mr-1 whitespace-nowrap">
              Are you sure?
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
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={startEditing}
              className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
              title={`Edit ${term.term}`}
              aria-label={`Edit ${term.term}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmingDelete(true);
                setIsEditing(false);
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title={`Delete ${term.term}`}
              aria-label={`Delete ${term.term}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
