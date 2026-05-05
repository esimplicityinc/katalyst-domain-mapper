/**
 * GlossaryPage — Searchable glossary of ubiquitous language terms.
 *
 * Simplified port of GlossaryView.tsx.
 */

import { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
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

export function GlossaryPage() {
  const { model, refresh } = useDomainModel();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form
  const [formTerm, setFormTerm] = useState('');
  const [formDefinition, setFormDefinition] = useState('');
  const [formContextId, setFormContextId] = useState('');
  const [formAliases, setFormAliases] = useState('');

  if (!model) return null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return model.glossaryTerms
      .filter(
        (t) =>
          !q ||
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          t.aliases.some((a) => a.toLowerCase().includes(q))
      )
      .sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));
  }, [model.glossaryTerms, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTerm.trim() || !formDefinition.trim()) return;
    setCreating(true);
    try {
      await api.createGlossaryTerm(model.id, {
        term: formTerm.trim(),
        definition: formDefinition.trim(),
        contextId: formContextId || undefined,
        aliases: formAliases
          ? formAliases
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean)
          : undefined,
      });
      setFormTerm('');
      setFormDefinition('');
      setFormContextId('');
      setFormAliases('');
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error('Failed to create glossary term:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (termId: string) => {
    setDeleting(termId);
    try {
      await api.deleteGlossaryTerm(model.id, termId);
      refresh();
    } catch (err) {
      console.error('Failed to delete glossary term:', err);
    } finally {
      setDeleting(null);
    }
  };

  const getContextName = (ctxId: string | null | undefined) => {
    if (!ctxId) return null;
    return model.boundedContexts.find((c) => c.id === ctxId)?.title ?? null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Ubiquitous Language
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {model.glossaryTerms.length} term
            {model.glossaryTerms.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Term
        </Button>
      </div>

      {/* Search bar */}
      {model.glossaryTerms.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search terms, definitions, or aliases…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              New Glossary Term
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Term (e.g., Aggregate Root)"
                  value={formTerm}
                  onChange={(e) => setFormTerm(e.target.value)}
                  required
                />
                <select
                  value={formContextId}
                  onChange={(e) => setFormContextId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Context (optional)</option>
                  {model.boundedContexts.map((ctx) => (
                    <option key={ctx.id} value={ctx.id}>
                      {ctx.title}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Definition"
                  value={formDefinition}
                  onChange={(e) => setFormDefinition(e.target.value)}
                  className="sm:col-span-2"
                  required
                />
                <Input
                  placeholder="Aliases (comma-separated, optional)"
                  value={formAliases}
                  onChange={(e) => setFormAliases(e.target.value)}
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
      {model.glossaryTerms.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            No glossary terms yet. Add one above.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No terms match &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((term) => {
            const contextName = getContextName(term.contextId);
            return (
              <Card key={term.id}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground">
                          {term.term}
                        </h3>
                        {contextName && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
                            {contextName}
                          </span>
                        )}
                        {term.aliases.length > 0 && (
                          <span className="text-xs text-muted-foreground italic">
                            aka {term.aliases.join(', ')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {term.definition}
                      </p>
                      {term.examples.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Examples: </span>
                          {term.examples.join('; ')}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(term.id)}
                      disabled={deleting === term.id}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      {deleting === term.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
