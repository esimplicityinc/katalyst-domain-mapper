import { z } from 'zod';
import type { Application } from 'express';
import { randomUUID } from 'crypto';
import { toCamelCase } from '../utils/case-transform';

interface AppKit {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

const CreateModel = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const CreateContext = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  responsibility: z.string().default('TBD'),
  subdomainType: z.string().optional(),
  contextType: z.string().default('internal'),
  relationships: z.array(z.unknown()).optional(),
});

export async function setupDomainModelRoutes(appkit: AppKit) {
  const q = appkit.lakebase.query.bind(appkit.lakebase);

  appkit.server.extend((app) => {
    // ── Domain Models CRUD ──────────────────────────────────────────────

    app.get('/api/v1/taxonomy/domain-models', async (_req, res) => {
      try {
        const { rows } = await q(
          `SELECT dm.*, 
            (SELECT COUNT(*) FROM katalyst.bounded_contexts bc WHERE bc.domain_model_id = dm.id) as context_count,
            (SELECT COUNT(*) FROM katalyst.aggregates a WHERE a.domain_model_id = dm.id) as aggregate_count,
            (SELECT COUNT(*) FROM katalyst.domain_events de WHERE de.domain_model_id = dm.id) as event_count,
            (SELECT COUNT(*) FROM katalyst.glossary_terms gt WHERE gt.domain_model_id = dm.id) as glossary_count,
            (SELECT COUNT(*) FROM katalyst.value_objects vo WHERE vo.domain_model_id = dm.id) as value_object_count,
            (SELECT COUNT(*) FROM katalyst.domain_workflows dw WHERE dw.domain_model_id = dm.id) as workflow_count
           FROM katalyst.domain_models dm ORDER BY dm.created_at DESC`
        );
        res.json(toCamelCase(rows));
      } catch (err) {
        console.error('Failed to list domain models:', err);
        res.status(500).json({ error: 'Failed to list domain models' });
      }
    });

    app.get('/api/v1/taxonomy/domain-models/:id', async (req, res) => {
      try {
        const { rows } = await q(
          `SELECT * FROM katalyst.domain_models WHERE id = $1`,
          [req.params.id]
        );
        if (rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }

        const model = rows[0];
        const [contexts, aggs, events, terms, vos, workflows] = await Promise.all([
          q(`SELECT * FROM katalyst.bounded_contexts WHERE domain_model_id = $1 ORDER BY title`, [req.params.id]),
          q(`SELECT * FROM katalyst.aggregates WHERE domain_model_id = $1 ORDER BY title`, [req.params.id]),
          q(`SELECT * FROM katalyst.domain_events WHERE domain_model_id = $1 ORDER BY title`, [req.params.id]),
          q(`SELECT * FROM katalyst.glossary_terms WHERE domain_model_id = $1 ORDER BY term`, [req.params.id]),
          q(`SELECT * FROM katalyst.value_objects WHERE domain_model_id = $1 ORDER BY title`, [req.params.id]),
          q(`SELECT * FROM katalyst.domain_workflows WHERE domain_model_id = $1 ORDER BY title`, [req.params.id]),
        ]);

        res.json(toCamelCase({
          ...model,
          boundedContexts: contexts.rows,
          aggregates: aggs.rows,
          domainEvents: events.rows,
          glossaryTerms: terms.rows,
          valueObjects: vos.rows,
          workflows: workflows.rows,
        }));
      } catch (err) {
        console.error('Failed to get domain model:', err);
        res.status(500).json({ error: 'Failed to get domain model' });
      }
    });

    app.post('/api/v1/taxonomy/domain-models', async (req, res) => {
      try {
        const parsed = CreateModel.safeParse(req.body);
        if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

        const id = randomUUID();
        const now = new Date().toISOString();
        await q(
          `INSERT INTO katalyst.domain_models (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`,
          [id, parsed.data.name, parsed.data.description ?? null, now, now]
        );
        const { rows } = await q(`SELECT * FROM katalyst.domain_models WHERE id = $1`, [id]);
        res.status(201).json(toCamelCase(rows[0]));
      } catch (err) {
        console.error('Failed to create domain model:', err);
        res.status(500).json({ error: 'Failed to create domain model' });
      }
    });

    app.put('/api/v1/taxonomy/domain-models/:id', async (req, res) => {
      try {
        const { rows: existing } = await q(
          `SELECT id FROM katalyst.domain_models WHERE id = $1`,
          [req.params.id]
        );
        if (existing.length === 0) { res.status(404).json({ error: 'Not found' }); return; }

        const sets: string[] = [];
        const vals: unknown[] = [];
        let idx = 1;

        const { name, description } = req.body;
        if (name !== undefined) { sets.push(`name = $${idx++}`); vals.push(name); }
        if (description !== undefined) { sets.push(`description = $${idx++}`); vals.push(description); }

        if (sets.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

        sets.push(`updated_at = $${idx++}`);
        vals.push(new Date().toISOString());
        vals.push(req.params.id);

        const { rows } = await q(
          `UPDATE katalyst.domain_models SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
          vals
        );
        res.json(toCamelCase(rows[0]));
      } catch (err) {
        console.error('Failed to update domain model:', err);
        res.status(500).json({ error: 'Failed to update domain model' });
      }
    });

    app.delete('/api/v1/taxonomy/domain-models/:id', async (req, res) => {
      try {
        const { rows } = await q(
          `DELETE FROM katalyst.domain_models WHERE id = $1 RETURNING id`,
          [req.params.id]
        );
        if (rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
        res.status(204).send();
      } catch (err) {
        console.error('Failed to delete domain model:', err);
        res.status(500).json({ error: 'Failed to delete domain model' });
      }
    });

    // ── Bounded Contexts ────────────────────────────────────────────────

    app.get('/api/v1/taxonomy/domain-models/:modelId/contexts', async (req, res) => {
      try {
        const { rows } = await q(
          `SELECT * FROM katalyst.bounded_contexts WHERE domain_model_id = $1 ORDER BY title`,
          [req.params.modelId]
        );
        res.json(toCamelCase(rows));
      } catch (err) {
        res.status(500).json({ error: 'Failed to list contexts' });
      }
    });

    app.post('/api/v1/taxonomy/domain-models/:modelId/contexts', async (req, res) => {
      try {
        const parsed = CreateContext.safeParse(req.body);
        if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

        const id = randomUUID();
        const now = new Date().toISOString();
        const d = parsed.data;
        await q(
          `INSERT INTO katalyst.bounded_contexts 
            (id, domain_model_id, slug, title, description, responsibility, subdomain_type, context_type, relationships, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [id, req.params.modelId, d.slug, d.title, d.description ?? null, d.responsibility,
            d.subdomainType ?? null, d.contextType, JSON.stringify(d.relationships ?? []), now, now]
        );
        const { rows } = await q(`SELECT * FROM katalyst.bounded_contexts WHERE id = $1`, [id]);
        res.status(201).json(toCamelCase(rows[0]));
      } catch (err) {
        console.error('Failed to create context:', err);
        res.status(500).json({ error: 'Failed to create context' });
      }
    });

    app.put('/api/v1/taxonomy/domain-models/:modelId/contexts/:contextId', async (req, res) => {
      try {
        const { rows: existing } = await q(
          `SELECT id FROM katalyst.bounded_contexts WHERE id = $1 AND domain_model_id = $2`,
          [req.params.contextId, req.params.modelId]
        );
        if (existing.length === 0) { res.status(404).json({ error: 'Not found' }); return; }

        const sets: string[] = [];
        const vals: unknown[] = [];
        let idx = 1;

        const allowed: Record<string, string> = {
          title: 'title', description: 'description', responsibility: 'responsibility',
          subdomainType: 'subdomain_type', contextType: 'context_type',
          sourceDirectory: 'source_directory', teamOwnership: 'team_ownership',
          status: 'status', relationships: 'relationships',
        };

        for (const [key, col] of Object.entries(allowed)) {
          if (req.body[key] !== undefined) {
            const val = col === 'relationships' ? JSON.stringify(req.body[key]) : req.body[key];
            sets.push(`${col} = $${idx++}`);
            vals.push(val);
          }
        }

        if (sets.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

        sets.push(`updated_at = $${idx++}`);
        vals.push(new Date().toISOString());
        vals.push(req.params.contextId);

        const { rows } = await q(
          `UPDATE katalyst.bounded_contexts SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
          vals
        );
        res.json(toCamelCase(rows[0]));
      } catch (err) {
        console.error('Failed to update context:', err);
        res.status(500).json({ error: 'Failed to update context' });
      }
    });

    app.delete('/api/v1/taxonomy/domain-models/:modelId/contexts/:contextId', async (req, res) => {
      try {
        const { rows } = await q(
          `DELETE FROM katalyst.bounded_contexts WHERE id = $1 AND domain_model_id = $2 RETURNING id`,
          [req.params.contextId, req.params.modelId]
        );
        if (rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
        res.status(204).send();
      } catch (err) {
        console.error('Failed to delete context:', err);
        res.status(500).json({ error: 'Failed to delete context' });
      }
    });

    // ── Aggregates ──────────────────────────────────────────────────────

    app.get('/api/v1/taxonomy/domain-models/:modelId/aggregates', async (req, res) => {
      try {
        const { rows } = await q(
          `SELECT * FROM katalyst.aggregates WHERE domain_model_id = $1 ORDER BY title`,
          [req.params.modelId]
        );
        res.json(toCamelCase(rows));
      } catch (err) {
        res.status(500).json({ error: 'Failed to list aggregates' });
      }
    });

    app.put('/api/v1/taxonomy/domain-models/:modelId/aggregates/:aggId', async (req, res) => {
      try {
        const { rows: existing } = await q(
          `SELECT id FROM katalyst.aggregates WHERE id = $1 AND domain_model_id = $2`,
          [req.params.aggId, req.params.modelId]
        );
        if (existing.length === 0) { res.status(404).json({ error: 'Not found' }); return; }

        const sets: string[] = [];
        const vals: unknown[] = [];
        let idx = 1;

        const allowed: Record<string, string> = {
          title: 'title', slug: 'slug', rootEntity: 'root_entity',
          entities: 'entities', valueObjects: 'value_objects', events: 'events',
          commands: 'commands', invariants: 'invariants', sourceFile: 'source_file',
          status: 'status', contextId: 'context_id',
        };

        const jsonCols = new Set(['entities', 'value_objects', 'events', 'commands', 'invariants']);

        for (const [key, col] of Object.entries(allowed)) {
          if (req.body[key] !== undefined) {
            sets.push(`${col} = $${idx++}`);
            vals.push(jsonCols.has(col) ? JSON.stringify(req.body[key]) : req.body[key]);
          }
        }

        if (sets.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

        sets.push(`updated_at = $${idx++}`);
        vals.push(new Date().toISOString());
        vals.push(req.params.aggId);

        const { rows } = await q(
          `UPDATE katalyst.aggregates SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
          vals
        );
        res.json(toCamelCase(rows[0]));
      } catch (err) {
        console.error('Failed to update aggregate:', err);
        res.status(500).json({ error: 'Failed to update aggregate' });
      }
    });

    app.delete('/api/v1/taxonomy/domain-models/:modelId/aggregates/:aggId', async (req, res) => {
      try {
        const { rows } = await q(
          `DELETE FROM katalyst.aggregates WHERE id = $1 AND domain_model_id = $2 RETURNING id`,
          [req.params.aggId, req.params.modelId]
        );
        if (rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
        res.status(204).send();
      } catch (err) {
        console.error('Failed to delete aggregate:', err);
        res.status(500).json({ error: 'Failed to delete aggregate' });
      }
    });

    // ── Domain Events ───────────────────────────────────────────────────

    app.get('/api/v1/taxonomy/domain-models/:modelId/events', async (req, res) => {
      try {
        const { rows } = await q(
          `SELECT * FROM katalyst.domain_events WHERE domain_model_id = $1 ORDER BY title`,
          [req.params.modelId]
        );
        res.json(toCamelCase(rows));
      } catch (err) {
        res.status(500).json({ error: 'Failed to list events' });
      }
    });

    app.put('/api/v1/taxonomy/domain-models/:modelId/events/:eventId', async (req, res) => {
      try {
        const { rows: existing } = await q(
          `SELECT id FROM katalyst.domain_events WHERE id = $1 AND domain_model_id = $2`,
          [req.params.eventId, req.params.modelId]
        );
        if (existing.length === 0) { res.status(404).json({ error: 'Not found' }); return; }

        const sets: string[] = [];
        const vals: unknown[] = [];
        let idx = 1;

        const allowed: Record<string, string> = {
          title: 'title', slug: 'slug', description: 'description',
          payload: 'payload', consumedBy: 'consumed_by', triggers: 'triggers',
          sideEffects: 'side_effects', sourceFile: 'source_file',
          contextId: 'context_id', aggregateId: 'aggregate_id',
        };

        const jsonCols = new Set(['payload', 'consumed_by', 'triggers', 'side_effects']);

        for (const [key, col] of Object.entries(allowed)) {
          if (req.body[key] !== undefined) {
            sets.push(`${col} = $${idx++}`);
            vals.push(jsonCols.has(col) ? JSON.stringify(req.body[key]) : req.body[key]);
          }
        }

        if (sets.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

        sets.push(`updated_at = $${idx++}`);
        vals.push(new Date().toISOString());
        vals.push(req.params.eventId);

        const { rows } = await q(
          `UPDATE katalyst.domain_events SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
          vals
        );
        res.json(toCamelCase(rows[0]));
      } catch (err) {
        console.error('Failed to update event:', err);
        res.status(500).json({ error: 'Failed to update event' });
      }
    });

    app.delete('/api/v1/taxonomy/domain-models/:modelId/events/:eventId', async (req, res) => {
      try {
        const { rows } = await q(
          `DELETE FROM katalyst.domain_events WHERE id = $1 AND domain_model_id = $2 RETURNING id`,
          [req.params.eventId, req.params.modelId]
        );
        if (rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
        res.status(204).send();
      } catch (err) {
        console.error('Failed to delete event:', err);
        res.status(500).json({ error: 'Failed to delete event' });
      }
    });

    // ── Value Objects ───────────────────────────────────────────────────

    app.get('/api/v1/taxonomy/domain-models/:modelId/value-objects', async (req, res) => {
      try {
        const { rows } = await q(
          `SELECT * FROM katalyst.value_objects WHERE domain_model_id = $1 ORDER BY title`,
          [req.params.modelId]
        );
        res.json(toCamelCase(rows));
      } catch (err) {
        res.status(500).json({ error: 'Failed to list value objects' });
      }
    });

    app.put('/api/v1/taxonomy/domain-models/:modelId/value-objects/:voId', async (req, res) => {
      try {
        const { rows: existing } = await q(
          `SELECT id FROM katalyst.value_objects WHERE id = $1 AND domain_model_id = $2`,
          [req.params.voId, req.params.modelId]
        );
        if (existing.length === 0) { res.status(404).json({ error: 'Not found' }); return; }

        const sets: string[] = [];
        const vals: unknown[] = [];
        let idx = 1;

        const allowed: Record<string, string> = {
          title: 'title', slug: 'slug', description: 'description',
          properties: 'properties', validationRules: 'validation_rules',
          immutable: 'immutable', sourceFile: 'source_file', contextId: 'context_id',
        };

        const jsonCols = new Set(['properties', 'validation_rules']);

        for (const [key, col] of Object.entries(allowed)) {
          if (req.body[key] !== undefined) {
            sets.push(`${col} = $${idx++}`);
            vals.push(jsonCols.has(col) ? JSON.stringify(req.body[key]) : req.body[key]);
          }
        }

        if (sets.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

        sets.push(`updated_at = $${idx++}`);
        vals.push(new Date().toISOString());
        vals.push(req.params.voId);

        const { rows } = await q(
          `UPDATE katalyst.value_objects SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
          vals
        );
        res.json(toCamelCase(rows[0]));
      } catch (err) {
        console.error('Failed to update value object:', err);
        res.status(500).json({ error: 'Failed to update value object' });
      }
    });

    app.delete('/api/v1/taxonomy/domain-models/:modelId/value-objects/:voId', async (req, res) => {
      try {
        const { rows } = await q(
          `DELETE FROM katalyst.value_objects WHERE id = $1 AND domain_model_id = $2 RETURNING id`,
          [req.params.voId, req.params.modelId]
        );
        if (rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
        res.status(204).send();
      } catch (err) {
        console.error('Failed to delete value object:', err);
        res.status(500).json({ error: 'Failed to delete value object' });
      }
    });

    // ── Glossary ────────────────────────────────────────────────────────

    app.get('/api/v1/taxonomy/domain-models/:modelId/glossary', async (req, res) => {
      try {
        const { rows } = await q(
          `SELECT * FROM katalyst.glossary_terms WHERE domain_model_id = $1 ORDER BY term`,
          [req.params.modelId]
        );
        res.json(toCamelCase(rows));
      } catch (err) {
        res.status(500).json({ error: 'Failed to list glossary terms' });
      }
    });

    app.put('/api/v1/taxonomy/domain-models/:modelId/glossary/:termId', async (req, res) => {
      try {
        const { rows: existing } = await q(
          `SELECT id FROM katalyst.glossary_terms WHERE id = $1 AND domain_model_id = $2`,
          [req.params.termId, req.params.modelId]
        );
        if (existing.length === 0) { res.status(404).json({ error: 'Not found' }); return; }

        const sets: string[] = [];
        const vals: unknown[] = [];
        let idx = 1;

        const allowed: Record<string, string> = {
          term: 'term', definition: 'definition', contextId: 'context_id',
          aliases: 'aliases', examples: 'examples', relatedTerms: 'related_terms',
          source: 'source',
        };

        const jsonCols = new Set(['aliases', 'examples', 'related_terms']);

        for (const [key, col] of Object.entries(allowed)) {
          if (req.body[key] !== undefined) {
            sets.push(`${col} = $${idx++}`);
            vals.push(jsonCols.has(col) ? JSON.stringify(req.body[key]) : req.body[key]);
          }
        }

        if (sets.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

        sets.push(`updated_at = $${idx++}`);
        vals.push(new Date().toISOString());
        vals.push(req.params.termId);

        const { rows } = await q(
          `UPDATE katalyst.glossary_terms SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
          vals
        );
        res.json(toCamelCase(rows[0]));
      } catch (err) {
        console.error('Failed to update glossary term:', err);
        res.status(500).json({ error: 'Failed to update glossary term' });
      }
    });

    app.delete('/api/v1/taxonomy/domain-models/:modelId/glossary/:termId', async (req, res) => {
      try {
        const { rows } = await q(
          `DELETE FROM katalyst.glossary_terms WHERE id = $1 AND domain_model_id = $2 RETURNING id`,
          [req.params.termId, req.params.modelId]
        );
        if (rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
        res.status(204).send();
      } catch (err) {
        console.error('Failed to delete glossary term:', err);
        res.status(500).json({ error: 'Failed to delete glossary term' });
      }
    });

    // ── Workflows ───────────────────────────────────────────────────────

    app.get('/api/v1/taxonomy/domain-models/:modelId/workflows', async (req, res) => {
      try {
        const { rows } = await q(
          `SELECT * FROM katalyst.domain_workflows WHERE domain_model_id = $1 ORDER BY title`,
          [req.params.modelId]
        );
        res.json(toCamelCase(rows));
      } catch (err) {
        res.status(500).json({ error: 'Failed to list workflows' });
      }
    });

    app.put('/api/v1/taxonomy/domain-models/:modelId/workflows/:wfId', async (req, res) => {
      try {
        const { rows: existing } = await q(
          `SELECT id FROM katalyst.domain_workflows WHERE id = $1 AND domain_model_id = $2`,
          [req.params.wfId, req.params.modelId]
        );
        if (existing.length === 0) { res.status(404).json({ error: 'Not found' }); return; }

        const sets: string[] = [];
        const vals: unknown[] = [];
        let idx = 1;

        const allowed: Record<string, string> = {
          title: 'title', slug: 'slug', description: 'description',
          states: 'states', transitions: 'transitions',
        };

        const jsonCols = new Set(['states', 'transitions']);

        for (const [key, col] of Object.entries(allowed)) {
          if (req.body[key] !== undefined) {
            sets.push(`${col} = $${idx++}`);
            vals.push(jsonCols.has(col) ? JSON.stringify(req.body[key]) : req.body[key]);
          }
        }

        if (sets.length === 0) { res.status(400).json({ error: 'No fields to update' }); return; }

        sets.push(`updated_at = $${idx++}`);
        vals.push(new Date().toISOString());
        vals.push(req.params.wfId);

        const { rows } = await q(
          `UPDATE katalyst.domain_workflows SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
          vals
        );
        res.json(toCamelCase(rows[0]));
      } catch (err) {
        console.error('Failed to update workflow:', err);
        res.status(500).json({ error: 'Failed to update workflow' });
      }
    });

    app.delete('/api/v1/taxonomy/domain-models/:modelId/workflows/:wfId', async (req, res) => {
      try {
        const { rows } = await q(
          `DELETE FROM katalyst.domain_workflows WHERE id = $1 AND domain_model_id = $2 RETURNING id`,
          [req.params.wfId, req.params.modelId]
        );
        if (rows.length === 0) { res.status(404).json({ error: 'Not found' }); return; }
        res.status(204).send();
      } catch (err) {
        console.error('Failed to delete workflow:', err);
        res.status(500).json({ error: 'Failed to delete workflow' });
      }
    });
  });
}
