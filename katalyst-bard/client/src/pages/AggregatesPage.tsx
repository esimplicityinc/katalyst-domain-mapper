/**
 * AggregatesPage — Table of aggregates grouped by bounded context.
 *
 * Simplified port of AggregateTreeView.tsx.
 */

import { useState } from 'react';
import {
  Box,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
} from '@databricks/appkit-ui/react';
import { api } from '../api/client';
import { useDomainModel } from '../context/DomainModelContext';

export function AggregatesPage() {
  const { model, refresh } = useDomainModel();
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set());
  const [expandedAggregates, setExpandedAggregates] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form
  const [formContextId, setFormContextId] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formRootEntity, setFormRootEntity] = useState('');

  if (!model) return null;

  const grouped = model.boundedContexts.map((ctx) => ({
    context: ctx,
    aggregates: model.aggregates.filter((a) => a.contextId === ctx.id),
  }));

  const orphans = model.aggregates.filter(
    (a) => !model.boundedContexts.some((c) => c.id === a.contextId)
  );

  const toggleContext = (id: string) => {
    setExpandedContexts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAggregate = (id: string) => {
    setExpandedAggregates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContextId || !formSlug.trim() || !formTitle.trim() || !formRootEntity.trim())
      return;
    setCreating(true);
    try {
      await api.createAggregate(model.id, {
        contextId: formContextId,
        slug: formSlug.trim(),
        title: formTitle.trim(),
        rootEntity: formRootEntity.trim(),
      });
      setFormContextId('');
      setFormSlug('');
      setFormTitle('');
      setFormRootEntity('');
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error('Failed to create aggregate:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (aggId: string) => {
    setDeleting(aggId);
    try {
      await api.deleteAggregate(model.id, aggId);
      refresh();
    } catch (err) {
      console.error('Failed to delete aggregate:', err);
    } finally {
      setDeleting(null);
    }
  };

  const totalAggregates = model.aggregates.length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Aggregates</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalAggregates} aggregate{totalAggregates !== 1 ? 's' : ''} across{' '}
            {model.boundedContexts.length} context
            {model.boundedContexts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Aggregate
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              New Aggregate
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={formContextId}
                  onChange={(e) => setFormContextId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select context…</option>
                  {model.boundedContexts.map((ctx) => (
                    <option key={ctx.id} value={ctx.id}>
                      {ctx.title}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Slug (e.g., scan-job)"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  required
                />
                <Input
                  placeholder="Title (e.g., ScanJob Aggregate)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
                <Input
                  placeholder="Root Entity (e.g., ScanJob)"
                  value={formRootEntity}
                  onChange={(e) => setFormRootEntity(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" disabled={creating}>
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  Create
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {totalAggregates === 0 ? (
        <div className="text-center py-16">
          <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            No aggregates yet. Add one above.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-4">
              {grouped
                .filter((g) => g.aggregates.length > 0)
                .map((group) => {
                  const isContextExpanded = expandedContexts.has(group.context.id);
                  return (
                    <div key={group.context.id}>
                      <button
                        onClick={() => toggleContext(group.context.id)}
                        className="w-full flex items-center gap-2 pb-1 mb-2 border-b border-border hover:bg-muted/50 rounded-t transition-colors px-2 py-1 -mx-2"
                      >
                        {isContextExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm font-semibold text-foreground">
                          {group.context.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({group.aggregates.length})
                        </span>
                      </button>

                      {isContextExpanded && (
                        <div className="ml-4 space-y-2">
                          {group.aggregates.map((agg) => {
                            const isExpanded = expandedAggregates.has(agg.id);
                            return (
                              <div
                                key={agg.id}
                                className="border border-border rounded-lg overflow-hidden"
                              >
                                <div className="flex items-center gap-3 px-3 py-2">
                                  <button
                                    onClick={() => toggleAggregate(agg.id)}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </button>
                                  <Box className="w-4 h-4 text-primary flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-foreground">
                                      {agg.title}
                                    </span>
                                    <span className="ml-2 text-xs text-muted-foreground font-mono">
                                      {agg.slug}
                                    </span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    Root: {agg.rootEntity}
                                  </span>
                                  <button
                                    onClick={() => handleDelete(agg.id)}
                                    disabled={deleting === agg.id}
                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    {deleting === agg.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>

                                {isExpanded && (
                                  <div className="border-t border-border px-4 py-3 bg-muted/30 space-y-2">
                                    {agg.entities.length > 0 && (
                                      <div className="text-xs">
                                        <span className="font-medium text-muted-foreground">
                                          Entities:{' '}
                                        </span>
                                        <span className="text-foreground">
                                          {agg.entities.join(', ')}
                                        </span>
                                      </div>
                                    )}
                                    {agg.valueObjects.length > 0 && (
                                      <div className="text-xs">
                                        <span className="font-medium text-muted-foreground">
                                          Value Objects:{' '}
                                        </span>
                                        <span className="text-foreground">
                                          {agg.valueObjects.join(', ')}
                                        </span>
                                      </div>
                                    )}
                                    {agg.commands.length > 0 && (
                                      <div className="text-xs">
                                        <span className="font-medium text-muted-foreground">
                                          Commands:{' '}
                                        </span>
                                        <span className="text-foreground">
                                          {agg.commands.join(', ')}
                                        </span>
                                      </div>
                                    )}
                                    {agg.events.length > 0 && (
                                      <div className="text-xs">
                                        <span className="font-medium text-muted-foreground">
                                          Events:{' '}
                                        </span>
                                        <span className="text-foreground">
                                          {agg.events.join(', ')}
                                        </span>
                                      </div>
                                    )}
                                    {agg.invariants.length > 0 && (
                                      <div className="text-xs">
                                        <span className="font-medium text-muted-foreground">
                                          Invariants:{' '}
                                        </span>
                                        {agg.invariants.map((inv, i) => (
                                          <div key={i} className="ml-2 text-foreground">
                                            • {inv.rule}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {agg.sourceFile && (
                                      <div className="text-xs text-muted-foreground">
                                        Source:{' '}
                                        <code className="bg-muted px-1 py-0.5 rounded">
                                          {agg.sourceFile}
                                        </code>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Orphan aggregates */}
              {orphans.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 pb-1 mb-2 border-b border-border">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="text-sm font-semibold text-muted-foreground">
                      Unassigned ({orphans.length})
                    </span>
                  </div>
                  <div className="ml-4 space-y-2">
                    {orphans.map((agg) => (
                      <div key={agg.id} className="border border-border rounded-lg px-3 py-2 flex items-center gap-3">
                        <Box className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{agg.title}</span>
                        <span className="text-xs text-muted-foreground">Root: {agg.rootEntity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
