/**
 * ValueObjectsPage — Value objects grouped by bounded context.
 *
 * Simplified port of ValueObjectView.tsx.
 */

import { useState } from 'react';
import {
  Diamond,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  Lock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
} from '@databricks/appkit-ui/react';
import { api } from '../api/client';
import { useDomainModel } from '../context/DomainModelContext';

export function ValueObjectsPage() {
  const { model, refresh } = useDomainModel();
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set());
  const [expandedVOs, setExpandedVOs] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form
  const [formContextId, setFormContextId] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');

  if (!model) return null;

  const grouped = model.boundedContexts.map((ctx) => ({
    context: ctx,
    valueObjects: model.valueObjects.filter((v) => v.contextId === ctx.id),
  }));

  const toggleContext = (id: string) => {
    setExpandedContexts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleVO = (id: string) => {
    setExpandedVOs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContextId || !formSlug.trim() || !formTitle.trim()) return;
    setCreating(true);
    try {
      await api.createValueObject(model.id, {
        contextId: formContextId,
        slug: formSlug.trim(),
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
      });
      setFormContextId('');
      setFormSlug('');
      setFormTitle('');
      setFormDescription('');
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error('Failed to create value object:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (voId: string) => {
    setDeleting(voId);
    try {
      await api.deleteValueObject(model.id, voId);
      refresh();
    } catch (err) {
      console.error('Failed to delete value object:', err);
    } finally {
      setDeleting(null);
    }
  };

  const totalVOs = model.valueObjects.length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Value Objects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalVOs} value object{totalVOs !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Value Object
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              New Value Object
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
                  placeholder="Slug (e.g., money)"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  required
                />
                <Input
                  placeholder="Title (e.g., Money)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
                <Input
                  placeholder="Description (optional)"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
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
      {totalVOs === 0 ? (
        <div className="text-center py-16">
          <Diamond className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            No value objects yet. Add one above.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-4">
              {grouped
                .filter((g) => g.valueObjects.length > 0)
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
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-sm font-semibold text-foreground">
                          {group.context.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({group.valueObjects.length})
                        </span>
                      </button>

                      {isContextExpanded && (
                        <div className="ml-4 space-y-2">
                          {group.valueObjects.map((vo) => {
                            const isExpanded = expandedVOs.has(vo.id);
                            return (
                              <div
                                key={vo.id}
                                className="border border-border rounded-lg overflow-hidden"
                              >
                                <div className="flex items-center gap-3 px-3 py-2">
                                  <button
                                    onClick={() => toggleVO(vo.id)}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </button>
                                  <Diamond className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-foreground">
                                      {vo.title}
                                    </span>
                                    <span className="ml-2 text-xs text-muted-foreground font-mono">
                                      {vo.slug}
                                    </span>
                                  </div>
                                  {vo.immutable && (
                                    <Lock className="w-3.5 h-3.5 text-muted-foreground" aria-label="Immutable" />
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {vo.properties.length} prop{vo.properties.length !== 1 ? 's' : ''}
                                  </span>
                                  <button
                                    onClick={() => handleDelete(vo.id)}
                                    disabled={deleting === vo.id}
                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    {deleting === vo.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>

                                {isExpanded && (
                                  <div className="border-t border-border px-4 py-3 bg-muted/20 space-y-2">
                                    {vo.description && (
                                      <p className="text-sm text-foreground">{vo.description}</p>
                                    )}
                                    {vo.properties.length > 0 && (
                                      <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                                          Properties
                                        </h4>
                                        <div className="bg-muted/50 rounded-md p-2 space-y-1">
                                          {vo.properties.map((prop) => (
                                            <div
                                              key={prop.name}
                                              className="flex items-baseline gap-2 text-xs"
                                            >
                                              <span className="font-mono text-foreground">
                                                {prop.name}
                                              </span>
                                              <span className="text-muted-foreground">:</span>
                                              <span className="font-mono text-amber-600 dark:text-amber-400">
                                                {prop.type}
                                              </span>
                                              {prop.description && (
                                                <span className="text-muted-foreground italic">
                                                  — {prop.description}
                                                </span>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {vo.validationRules.length > 0 && (
                                      <div className="text-xs">
                                        <span className="font-medium text-muted-foreground">
                                          Validation Rules:
                                        </span>
                                        {vo.validationRules.map((rule, i) => (
                                          <div key={i} className="ml-2 text-foreground">
                                            • {rule}
                                          </div>
                                        ))}
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
