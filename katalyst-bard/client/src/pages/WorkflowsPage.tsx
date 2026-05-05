/**
 * WorkflowsPage — Lists workflows with state/transition details.
 *
 * Simplified port of WorkflowView.tsx (no SVG diagram for now).
 */

import { useState } from 'react';
import {
  GitBranch,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  CircleDot,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
} from '@databricks/appkit-ui/react';
import { api } from '../api/client';
import { useDomainModel } from '../context/DomainModelContext';

export function WorkflowsPage() {
  const { model, refresh } = useDomainModel();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');

  if (!model) return null;

  const workflows = model.workflows;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSlug.trim() || !formTitle.trim()) return;
    setCreating(true);
    try {
      await api.createWorkflow(model.id, {
        slug: formSlug.trim(),
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
      });
      setFormSlug('');
      setFormTitle('');
      setFormDescription('');
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error('Failed to create workflow:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (wfId: string) => {
    setDeleting(wfId);
    try {
      await api.deleteWorkflow(model.id, wfId);
      refresh();
    } catch (err) {
      console.error('Failed to delete workflow:', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Workflows</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Workflow
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              New Workflow
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Slug (e.g., order-lifecycle)"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  required
                />
                <Input
                  placeholder="Title (e.g., Order Lifecycle)"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
                <Input
                  placeholder="Description (optional)"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="sm:col-span-2"
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
      {workflows.length === 0 ? (
        <div className="text-center py-16">
          <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            No workflows yet. Add one above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf) => {
            const isExpanded = expanded.has(wf.id);
            return (
              <Card key={wf.id}>
                <CardContent className="py-0">
                  <div className="flex items-center gap-3 py-3">
                    <button
                      onClick={() => toggleExpand(wf.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <GitBranch className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {wf.title}
                        </h3>
                        <span className="text-xs text-muted-foreground font-mono">
                          {wf.slug}
                        </span>
                      </div>
                      {wf.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {wf.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {wf.states.length} state{wf.states.length !== 1 ? 's' : ''}
                      {' · '}
                      {wf.transitions.length} transition
                      {wf.transitions.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => handleDelete(wf.id)}
                      disabled={deleting === wf.id}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      {deleting === wf.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border py-3 space-y-4">
                      {/* States */}
                      {wf.states.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            States
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {wf.states.map((state) => (
                              <span
                                key={state.name}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${
                                  state.isTerminal
                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                    : state.isError
                                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                                      : 'bg-muted text-foreground border-border'
                                }`}
                              >
                                <CircleDot className="w-3 h-3" />
                                {state.name}
                                {state.isTerminal && (
                                  <span className="text-[10px] opacity-70">(terminal)</span>
                                )}
                                {state.isError && (
                                  <span className="text-[10px] opacity-70">(error)</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Transitions */}
                      {wf.transitions.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                            Transitions
                          </h4>
                          <div className="space-y-1.5">
                            {wf.transitions.map((t, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                                  {t.from}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded">
                                  {t.to}
                                </span>
                                {t.trigger && (
                                  <span className="text-muted-foreground">
                                    on <span className="font-medium text-primary">{t.trigger}</span>
                                  </span>
                                )}
                                {t.guard && (
                                  <span className="text-muted-foreground italic">
                                    [{t.guard}]
                                  </span>
                                )}
                              </div>
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
