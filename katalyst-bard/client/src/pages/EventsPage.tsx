/**
 * EventsPage — Domain events grouped by bounded context.
 *
 * Simplified port of EventFlowView.tsx.
 */

import { useState } from 'react';
import {
  Zap,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  Wifi,
  Radio,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
} from '@databricks/appkit-ui/react';
import { api } from '../api/client';
import { useDomainModel } from '../context/DomainModelContext';
import type { DomainEvent } from '../types/domain';

const CONTEXT_DOT_COLORS = [
  'bg-blue-500',
  'bg-teal-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
];

export function EventsPage() {
  const { model, refresh } = useDomainModel();
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set());
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form
  const [formContextId, setFormContextId] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');

  if (!model) return null;

  const isAsync = (evt: DomainEvent) => evt.consumedBy.length > 0;

  const grouped = model.boundedContexts.map((ctx) => ({
    context: ctx,
    events: model.domainEvents.filter((e) => e.contextId === ctx.id),
  }));

  const toggleContext = (id: string) => {
    setExpandedContexts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleEvent = (id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContextId || !formSlug.trim() || !formTitle.trim()) return;
    setCreating(true);
    try {
      await api.createDomainEvent(model.id, {
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
      console.error('Failed to create event:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (evtId: string) => {
    setDeleting(evtId);
    try {
      await api.deleteDomainEvent(model.id, evtId);
      refresh();
    } catch (err) {
      console.error('Failed to delete event:', err);
    } finally {
      setDeleting(null);
    }
  };

  const totalEvents = model.domainEvents.length;
  const asyncCount = model.domainEvents.filter(isAsync).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Domain Events</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalEvents} event{totalEvents !== 1 ? 's' : ''} ({asyncCount} async)
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Event
        </Button>
      </div>

      {/* Legend */}
      {totalEvents > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-teal-500" />
            <span>Synchronous</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-purple-500" />
            <span>Asynchronous (cross-context)</span>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              New Domain Event
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
                  placeholder="Slug (e.g., order-placed)"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  required
                />
                <Input
                  placeholder="Title (e.g., OrderPlaced)"
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
      {totalEvents === 0 ? (
        <div className="text-center py-16">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            No domain events yet. Add one above.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-5">
              {grouped
                .filter((g) => g.events.length > 0)
                .map((group, gi) => {
                  const dotColor = CONTEXT_DOT_COLORS[gi % CONTEXT_DOT_COLORS.length];
                  const isContextExpanded = expandedContexts.has(group.context.id);
                  return (
                    <div key={group.context.id}>
                      <button
                        onClick={() => toggleContext(group.context.id)}
                        className="w-full flex items-center gap-2 pb-1 mb-3 border-b border-border hover:bg-muted/50 rounded-t transition-colors px-2 py-1 -mx-2"
                      >
                        {isContextExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <div className={`w-3 h-3 rounded-full ${dotColor}`} />
                        <span className="text-sm font-semibold text-foreground">
                          {group.context.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({group.events.length})
                        </span>
                      </button>

                      {isContextExpanded && (
                        <div className="relative ml-4 border-l-2 border-border pl-4 space-y-3">
                          {group.events.map((evt) => {
                            const eventIsAsync = isAsync(evt);
                            const isExpanded = expandedEvents.has(evt.id);
                            return (
                              <div key={evt.id} className="relative">
                                {/* Timeline dot */}
                                <div
                                  className={`absolute -left-[1.3rem] top-3 w-2.5 h-2.5 rounded-full border-2 border-background ${dotColor}`}
                                />
                                <div className="border border-border rounded-lg overflow-hidden">
                                  <div
                                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => toggleEvent(evt.id)}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                    )}
                                    <Zap
                                      className={`w-4 h-4 flex-shrink-0 ${
                                        eventIsAsync ? 'text-purple-500' : 'text-teal-500'
                                      }`}
                                    />
                                    <span className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">
                                      {evt.title}
                                    </span>
                                    {eventIsAsync && (
                                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded">
                                        ASYNC
                                      </span>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(evt.id);
                                      }}
                                      disabled={deleting === evt.id}
                                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                      {deleting === evt.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>

                                  {isExpanded && (
                                    <div className="border-t border-border px-4 py-3 space-y-2 bg-muted/20">
                                      {evt.description && (
                                        <p className="text-sm text-foreground">
                                          {evt.description}
                                        </p>
                                      )}
                                      {evt.payload.length > 0 && (
                                        <div>
                                          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                                            Payload
                                          </h4>
                                          <div className="bg-muted/50 rounded-md p-2 space-y-1">
                                            {evt.payload.map((field) => (
                                              <div
                                                key={field.name}
                                                className="flex items-baseline gap-2 text-xs"
                                              >
                                                <span className="font-mono text-foreground">
                                                  {field.name}
                                                </span>
                                                <span className="text-muted-foreground">:</span>
                                                <span className="font-mono text-teal-600 dark:text-teal-400">
                                                  {field.type}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {evt.triggers.length > 0 && (
                                        <div className="text-xs">
                                          <span className="font-medium text-muted-foreground">Triggers: </span>
                                          <span className="text-foreground">{evt.triggers.join(', ')}</span>
                                        </div>
                                      )}
                                      {evt.consumedBy.length > 0 && (
                                        <div className="text-xs">
                                          <span className="font-medium text-muted-foreground">Consumed by: </span>
                                          <span className="text-foreground">{evt.consumedBy.join(', ')}</span>
                                        </div>
                                      )}
                                      {evt.sideEffects.length > 0 && (
                                        <div className="text-xs">
                                          <span className="font-medium text-muted-foreground">Side effects: </span>
                                          <span className="text-foreground">{evt.sideEffects.join(', ')}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
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
