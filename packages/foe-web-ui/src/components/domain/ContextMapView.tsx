import { useState } from 'react';
import {
  Plus,
  Loader2,
  Layers,
  ArrowRight,
  Trash2,
  ChevronDown,
  ChevronRight,
  Eye,
  List,
} from 'lucide-react';
import { api } from '../../api/client';
import type { DomainModelFull, BoundedContext } from '../../types/domain';
import { SubdomainBadge } from './SubdomainBadge';
import { SubdomainOverview } from './SubdomainOverview';
import { ContextMapDiagram } from './ContextMapDiagram';

interface ContextMapViewProps {
  model: DomainModelFull;
  onModelUpdated: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  deprecated: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  upstream: 'Upstream',
  downstream: 'Downstream',
  conformist: 'Conformist',
  'anticorruption-layer': 'ACL',
  'shared-kernel': 'Shared Kernel',
  'customer-supplier': 'Customer-Supplier',
  partnership: 'Partnership',
  'published-language': 'Published Language',
};

export function ContextMapView({ model, onModelUpdated }: ContextMapViewProps) {
  const [viewMode, setViewMode] = useState<'diagram' | 'list'>('diagram');
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [description, setDescription] = useState('');
  const [sourceDir, setSourceDir] = useState('');
  const [teamOwner, setTeamOwner] = useState('');
  const [subdomainType, setSubdomainType] = useState('');

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetForm = () => {
    setSlug('');
    setTitle('');
    setResponsibility('');
    setDescription('');
    setSourceDir('');
    setTeamOwner('');
    setSubdomainType('');
    setShowForm(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim() || !title.trim() || !responsibility.trim()) return;

    setCreating(true);
    try {
      await api.createBoundedContext(model.id, {
        slug: slug.trim(),
        title: title.trim(),
        responsibility: responsibility.trim(),
        description: description.trim() || undefined,
        sourceDirectory: sourceDir.trim() || undefined,
        teamOwnership: teamOwner.trim() || undefined,
        subdomainType: subdomainType ? (subdomainType as 'core' | 'supporting' | 'generic') : undefined,
      });
      resetForm();
      onModelUpdated();
    } catch (err) {
      console.error('Failed to create context:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (ctxId: string) => {
    if (!confirm('Delete this bounded context?')) return;
    setDeleting(ctxId);
    try {
      await api.deleteBoundedContext(model.id, ctxId);
      onModelUpdated();
    } catch (err) {
      console.error('Failed to delete context:', err);
    } finally {
      setDeleting(null);
    }
  };

  const getRelatedContextName = (targetId: string): string => {
    const ctx = model.boundedContexts.find((c) => c.id === targetId);
    return ctx?.title ?? targetId;
  };

  // Count artifacts per context
  const artifactCounts = (ctx: BoundedContext) => {
    const aggregates = model.aggregates.filter((a) => a.contextId === ctx.id).length;
    const events = model.domainEvents.filter((e) => e.contextId === ctx.id).length;
    const vos = model.valueObjects.filter((v) => v.contextId === ctx.id).length;
    const terms = model.glossaryTerms.filter((t) => t.contextId === ctx.id).length;
    return { aggregates, events, vos, terms };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Context Map
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {model.boundedContexts.length} bounded context{model.boundedContexts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'diagram'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              aria-label="Diagram view"
            >
              <Eye className="w-3.5 h-3.5" />
              Diagram
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
              List
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Context
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            New Bounded Context
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Slug (e.g., order-management)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Title (e.g., Order Management)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Responsibility"
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:col-span-2"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Source directory (optional)"
              value={sourceDir}
              onChange={(e) => setSourceDir(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Team owner (optional)"
              value={teamOwner}
              onChange={(e) => setTeamOwner(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <select
              value={subdomainType}
              onChange={(e) => setSubdomainType(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Subdomain type (optional)</option>
              <option value="core">Core</option>
              <option value="supporting">Supporting</option>
              <option value="generic">Generic</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm font-medium rounded-md transition-colors"
            >
              {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create
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

      {/* Diagram view */}
      {viewMode === 'diagram' && (
        <ContextMapDiagram model={model} />
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <>
          {/* Subdomain classification overview */}
          {model.boundedContexts.length > 0 && (
            <SubdomainOverview contexts={model.boundedContexts} />
          )}

          {/* Context list */}
          {model.boundedContexts.length === 0 ? (
            <div className="text-center py-16">
              <Layers className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No bounded contexts defined yet. Add one or use the chat to discover them.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {model.boundedContexts.map((ctx) => {
                const counts = artifactCounts(ctx);
                const isExpanded = expanded.has(ctx.id);

                return (
                  <div
                    key={ctx.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <button
                        onClick={() => toggleExpand(ctx.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {ctx.title}
                          </h3>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {ctx.slug}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded ${STATUS_COLORS[ctx.status ?? 'draft']}`}
                          >
                            {ctx.status ?? 'draft'}
                          </span>
                          <SubdomainBadge subdomainType={ctx.subdomainType} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {ctx.responsibility}
                        </p>
                      </div>

                      {/* Artifact counts */}
                      <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {counts.aggregates > 0 && (
                          <span>{counts.aggregates} agg</span>
                        )}
                        {counts.events > 0 && <span>{counts.events} evt</span>}
                        {counts.vos > 0 && <span>{counts.vos} vo</span>}
                      </div>

                      <button
                        onClick={() => handleDelete(ctx.id)}
                        disabled={deleting === ctx.id}
                        className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        {deleting === ctx.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-2">
                        {ctx.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {ctx.description}
                          </p>
                        )}
                        {ctx.sourceDirectory && (
                          <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Source: </span>
                            <code className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                              {ctx.sourceDirectory}
                            </code>
                          </div>
                        )}
                        {ctx.teamOwnership && (
                          <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Team: </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {ctx.teamOwnership}
                            </span>
                          </div>
                        )}

                        {/* Relationships */}
                        {ctx.relationships && ctx.relationships.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Relationships:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {ctx.relationships.map((rel, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs"
                                >
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {RELATIONSHIP_LABELS[rel.type] ?? rel.type}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-gray-400" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {getRelatedContextName(rel.targetContextId)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
