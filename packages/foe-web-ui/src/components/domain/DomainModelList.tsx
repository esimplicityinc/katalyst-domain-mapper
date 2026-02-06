import { useState } from 'react';
import { Plus, Trash2, Loader2, Hexagon, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import type { DomainModel } from '../../types/domain';

interface DomainModelListProps {
  models: DomainModel[];
  onSelect: (id: string) => void;
  onCreated: (model: DomainModel) => void;
  onDeleted: (id: string) => void;
}

export function DomainModelList({
  models,
  onSelect,
  onCreated,
  onDeleted,
}: DomainModelListProps) {
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create model');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this domain model and all its artifacts?')) return;

    setDeleting(id);
    try {
      await api.deleteDomainModel(id);
      onDeleted(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(null);
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
          <p className="text-sm">No domain models yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {models.map((model) => (
            <div
              key={model.id}
              className="group flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
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
                    Created {new Date(model.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(model.id);
                }}
                disabled={deleting === model.id}
                className="ml-3 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                title="Delete model"
              >
                {deleting === model.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
