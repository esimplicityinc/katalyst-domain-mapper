/**
 * ContextMapPage — Lists bounded contexts as expandable cards.
 *
 * Simplified port of the source ContextMapView.tsx.
 * Focuses on the list view (no diagram view for now).
 */

import { useState } from 'react';
import {
  Layers,
  Plus,
  Loader2,
  ChevronDown,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
} from '@databricks/appkit-ui/react';
import { api } from '../api/client';
import { useDomainModel } from '../context/DomainModelContext';
import type { BoundedContext } from '../types/domain';

const SUBDOMAIN_COLORS: Record<string, string> = {
  core: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  supporting: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  generic: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export function ContextMapPage() {
  const { model, refresh } = useDomainModel();
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [responsibility, setResponsibility] = useState('');
  const [description, setDescription] = useState('');
  const [subdomainType, setSubdomainType] = useState('');

  if (!model) return null;

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
        subdomainType: subdomainType
          ? (subdomainType as 'core' | 'supporting' | 'generic')
          : undefined,
      });
      resetForm();
      refresh();
    } catch (err) {
      console.error('Failed to create context:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (ctxId: string) => {
    setDeleting(ctxId);
    try {
      await api.deleteBoundedContext(model.id, ctxId);
      refresh();
    } catch (err) {
      console.error('Failed to delete context:', err);
    } finally {
      setDeleting(null);
    }
  };

  const artifactCounts = (ctx: BoundedContext) => ({
    aggregates: model.aggregates.filter((a) => a.contextId === ctx.id).length,
    events: model.domainEvents.filter((e) => e.contextId === ctx.id).length,
    vos: model.valueObjects.filter((v) => v.contextId === ctx.id).length,
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Context Map</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {model.boundedContexts.length} bounded context
            {model.boundedContexts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Context
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              New Bounded Context
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Slug (e.g., order-management)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
                <Input
                  placeholder="Title (e.g., Order Management)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Input
                  placeholder="Responsibility"
                  value={responsibility}
                  onChange={(e) => setResponsibility(e.target.value)}
                  className="sm:col-span-2"
                  required
                />
                <Input
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <select
                  value={subdomainType}
                  onChange={(e) => setSubdomainType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Subdomain type (optional)</option>
                  <option value="core">Core</option>
                  <option value="supporting">Supporting</option>
                  <option value="generic">Generic</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" disabled={creating}>
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  Create
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {model.boundedContexts.length === 0 ? (
        <div className="text-center py-16">
          <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            No bounded contexts defined yet. Add one above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {model.boundedContexts.map((ctx) => {
            const counts = artifactCounts(ctx);
            const isExpanded = expanded.has(ctx.id);

            return (
              <Card key={ctx.id}>
                <CardContent className="py-0">
                  {/* Header row */}
                  <div className="flex items-center gap-3 py-3">
                    <button
                      onClick={() => toggleExpand(ctx.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">
                          {ctx.title}
                        </h3>
                        <span className="text-xs text-muted-foreground font-mono">
                          {ctx.slug}
                        </span>
                        {ctx.subdomainType && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${
                              SUBDOMAIN_COLORS[ctx.subdomainType] ?? ''
                            }`}
                          >
                            {ctx.subdomainType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ctx.responsibility}
                      </p>
                    </div>

                    {/* Artifact counts */}
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {counts.aggregates > 0 && <span>{counts.aggregates} agg</span>}
                      {counts.events > 0 && <span>{counts.events} evt</span>}
                      {counts.vos > 0 && <span>{counts.vos} vo</span>}
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleDelete(ctx.id)}
                      disabled={deleting === ctx.id}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title={`Delete ${ctx.title}`}
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
                    <div className="border-t border-border py-3 space-y-2">
                      {ctx.description && (
                        <p className="text-sm text-foreground">{ctx.description}</p>
                      )}
                      {ctx.sourceDirectory && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Source: </span>
                          <code className="text-foreground bg-muted px-1 py-0.5 rounded">
                            {ctx.sourceDirectory}
                          </code>
                        </div>
                      )}
                      {ctx.relationships && ctx.relationships.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Relationships:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {ctx.relationships.map((rel, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs"
                              >
                                <span className="text-muted-foreground">{rel.type}</span>
                                <span className="text-foreground">→</span>
                                <span className="font-medium text-foreground">
                                  {model.boundedContexts.find((c) => c.id === rel.targetContextId)?.title ??
                                    rel.targetContextId}
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
