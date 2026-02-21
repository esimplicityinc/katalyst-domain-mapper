import { useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Hexagon,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { api } from "../../api/client";
import type { DomainModel } from "../../types/domain";

interface DomainModelListProps {
  models: DomainModel[];
  onSelect: (id: string) => void;
  onCreated: (model: DomainModel) => void;
  onDeleted: (id: string) => void;
  onUpdated: (id: string, data: { name: string; description: string | null }) => void;
}

export function DomainModelList({
  models,
  onSelect,
  onCreated,
  onDeleted,
  onUpdated,
}: DomainModelListProps) {
  // Create form state
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const model = await api.createDomainModel({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onCreated(model);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create model");
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (model: DomainModel) => {
    setEditingId(model.id);
    setEditName(model.name);
    setEditDescription(model.description ?? "");
    setConfirmingDeleteId(null);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await api.updateDomainModel(editingId, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      onUpdated(editingId, {
        name: editName.trim(),
        description: editDescription.trim() || null,
      });
      setEditingId(null);
      setEditName("");
      setEditDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update model");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setError(null);
    try {
      await api.deleteDomainModel(id);
      onDeleted(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(null);
      setConfirmingDeleteId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-10">
        <Hexagon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Domain Models
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create or select a domain model to begin mapping
        </p>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-8"
      >
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          New Domain Model
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Model name (e.g., E-Commerce Platform)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!name.trim() || creating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-md transition-colors"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create Model
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </form>

      {/* Model list */}
      {models.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            No domain models yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map((model) => (
            <div
              key={model.id}
              className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              {editingId === model.id ? (
                /* ── Inline edit form ──────────────────────────── */
                <form onSubmit={handleUpdate} className="p-4">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                    Edit Domain Model
                  </h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Model name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!editName.trim() || saving}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Pencil className="w-4 h-4" />
                        )}
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* ── Normal card display ──────────────────────── */
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => onSelect(model.id)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <Hexagon className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {model.name}
                      </h3>
                      {model.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {model.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Created{" "}
                        {new Date(model.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
                  </button>

                  <div className="ml-3 flex items-center gap-1 flex-shrink-0">
                    {/* Edit button */}
                    <button
                      type="button"
                      data-testid={`edit-model-${model.id}`}
                      aria-label={`Edit ${model.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(model);
                      }}
                      className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      title="Edit model"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    {/* Delete button / inline confirmation */}
                    {confirmingDeleteId === model.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(model.id);
                          }}
                          disabled={deleting === model.id}
                          className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded transition-colors"
                        >
                          {deleting === model.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Confirm"
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmingDeleteId(null);
                          }}
                          disabled={deleting === model.id}
                          className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmingDeleteId(model.id);
                          setEditingId(null);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Delete model"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
