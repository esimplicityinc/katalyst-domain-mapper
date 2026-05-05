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

const CreateContribution = z.object({
  itemType: z.string().min(1),
  parentId: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
  submittedBy: z.string().optional(),
  contributionNote: z.string().optional(),
});

const TransitionContribution = z.object({
  action: z.enum(['submit', 'accept', 'reject', 'deprecate', 'supersede']),
  actor: z.string().optional(),
  feedback: z.string().optional(),
});

// Status machine transitions
const TRANSITIONS: Record<string, Record<string, string>> = {
  draft: { submit: 'proposed' },
  proposed: { accept: 'accepted', reject: 'rejected' },
  rejected: { submit: 'proposed' },
  accepted: { deprecate: 'deprecated', supersede: 'superseded' },
};

export async function setupContributionRoutes(appkit: AppKit) {
  const q = appkit.lakebase.query.bind(appkit.lakebase);

  appkit.server.extend((app) => {
    // ── List contributions ───────────────────────────────────────────────

    app.get('/api/v1/contributions', async (req, res) => {
      try {
        const { status, itemType, limit: limitStr } = req.query;
        let sql = `SELECT * FROM katalyst.contribution_items WHERE 1=1`;
        const params: unknown[] = [];
        let idx = 1;

        if (status && typeof status === 'string') {
          sql += ` AND status = $${idx++}`;
          params.push(status);
        }
        if (itemType && typeof itemType === 'string') {
          sql += ` AND item_type = $${idx++}`;
          params.push(itemType);
        }
        sql += ` ORDER BY created_at DESC`;
        const limit = Math.min(parseInt(String(limitStr) || '100', 10), 500);
        sql += ` LIMIT $${idx++}`;
        params.push(limit);

        const { rows } = await q(sql, params);

        // Transform to match existing API shape
        const items = rows.map((r) => ({
          _id: r.id,
          itemType: r.item_type,
          itemId: r.item_id,
          title: (r.item_data as Record<string, unknown> | null)?.title
            ?? (r.item_data as Record<string, unknown> | null)?.term
            ?? r.item_id,
          contribution: {
            status: r.status,
            version: r.version,
            supersedes: r.supersedes,
            supersededBy: r.superseded_by,
            submittedBy: r.submitted_by,
            submittedAt: r.submitted_at,
            reviewedBy: r.reviewed_by,
            reviewedAt: r.reviewed_at,
            reviewFeedback: r.review_feedback,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          },
          metadata: r.item_data ?? {},
        }));

        res.json(items);
      } catch (err) {
        console.error('Failed to list contributions:', err);
        res.status(500).json({ error: 'Failed to list contributions' });
      }
    });

    // ── Create contribution ──────────────────────────────────────────────

    app.post('/api/v1/contributions/create', async (req, res) => {
      try {
        const parsed = CreateContribution.safeParse(req.body);
        if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

        const { itemType, data, submittedBy } = parsed.data;
        const id = randomUUID();
        const itemId = data.slug ? String(data.slug) : id;
        const title = (data.title as string) ?? itemId;
        const now = new Date().toISOString();

        // Determine initial status
        const initialStatus = submittedBy ? 'proposed' : 'draft';

        await q(
          `INSERT INTO katalyst.contribution_items 
            (id, item_type, item_id, version, status, submitted_by, submitted_at, item_data, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [id, itemType, itemId, 1, initialStatus, submittedBy ?? null, submittedBy ? now : null,
            JSON.stringify(data), now, now]
        );

        // Write audit log entry
        await q(
          `INSERT INTO katalyst.contribution_audit_log 
            (id, contrib_id, action, from_status, to_status, actor, "timestamp")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [randomUUID(), id, 'create', 'none', initialStatus, submittedBy ?? 'system', now]
        );

        // Also create the actual domain item if status is proposed and we have enough data
        if (data.contextId || data.domainModelId) {
          await createDomainItem(q, itemType, id, data, parsed.data.parentId);
        }

        res.status(201).json(toCamelCase({
          item: {
            itemType,
            itemId,
            title,
            contribution: {
              status: initialStatus,
              version: 1,
              supersedes: null,
              supersededBy: null,
              submittedBy: submittedBy ?? null,
              submittedAt: submittedBy ? now : null,
              reviewedBy: null,
              reviewedAt: null,
              reviewFeedback: null,
              createdAt: now,
              updatedAt: now,
            },
            metadata: {},
          },
          created: true,
        }));
      } catch (err) {
        console.error('Failed to create contribution:', err);
        res.status(500).json({ error: 'Failed to create contribution' });
      }
    });

    // ── Transition contribution ──────────────────────────────────────────

    app.post('/api/v1/contributions/:id/transition', async (req, res) => {
      try {
        const parsed = TransitionContribution.safeParse(req.body);
        if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

        const { rows: existing } = await q(
          `SELECT * FROM katalyst.contribution_items WHERE id = $1`,
          [req.params.id]
        );
        if (existing.length === 0) { res.status(404).json({ error: 'Not found' }); return; }

        const item = existing[0];
        const currentStatus = item.status as string;
        const allowedTransitions = TRANSITIONS[currentStatus] ?? {};
        const newStatus = allowedTransitions[parsed.data.action];

        if (!newStatus) {
          res.status(400).json({
            error: `Cannot ${parsed.data.action} from status ${currentStatus}`,
            allowedActions: Object.keys(allowedTransitions),
          });
          return;
        }

        const now = new Date().toISOString();
        await q(
          `UPDATE katalyst.contribution_items SET status = $1, reviewed_by = $2, reviewed_at = $3, review_feedback = $4, updated_at = $5 WHERE id = $6`,
          [newStatus, parsed.data.actor ?? null, now, parsed.data.feedback ?? null, now, req.params.id]
        );

        await q(
          `INSERT INTO katalyst.contribution_audit_log 
            (id, contrib_id, action, from_status, to_status, actor, feedback, "timestamp")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [randomUUID(), req.params.id, parsed.data.action, currentStatus, newStatus,
            parsed.data.actor ?? 'system', parsed.data.feedback ?? null, now]
        );

        res.json(toCamelCase({ status: newStatus, previousStatus: currentStatus }));
      } catch (err) {
        console.error('Failed to transition contribution:', err);
        res.status(500).json({ error: 'Failed to transition' });
      }
    });

    // ── Get contribution counts ──────────────────────────────────────────

    app.get('/api/v1/contributions/counts', async (_req, res) => {
      try {
        const { rows } = await q(
          `SELECT status, COUNT(*) as count FROM katalyst.contribution_items GROUP BY status`
        );
        const counts: Record<string, number> = {};
        for (const row of rows) {
          counts[row.status as string] = Number(row.count);
        }
        res.json(toCamelCase(counts));
      } catch (err) {
        res.status(500).json({ error: 'Failed to get counts' });
      }
    });
  });
}

// Helper: create the actual domain item in the relevant table
async function createDomainItem(
  q: (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>,
  itemType: string,
  _contribId: string,
  data: Record<string, unknown>,
  parentId?: string,
) {
  const id = (data.id as string) ?? randomUUID();
  const modelId = (data.domainModelId as string) ?? parentId ?? '';
  const contextId = data.contextId as string;
  const now = new Date().toISOString();

  switch (itemType) {
    case 'aggregate':
      await q(
        `INSERT INTO katalyst.aggregates 
          (id, domain_model_id, context_id, slug, title, root_entity, entities, value_objects, events, commands, invariants, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO NOTHING`,
        [id, modelId, contextId, data.slug ?? id, data.title ?? 'Untitled',
          data.rootEntity ?? 'Entity', JSON.stringify(data.entities ?? []),
          JSON.stringify(data.valueObjects ?? []), JSON.stringify(data.events ?? []),
          JSON.stringify(data.commands ?? []), JSON.stringify(data.invariants ?? []),
          'draft', now, now]
      );
      break;
    case 'domain-event':
      await q(
        `INSERT INTO katalyst.domain_events 
          (id, domain_model_id, context_id, aggregate_id, slug, title, description, payload, consumed_by, triggers, side_effects, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [id, modelId, contextId, (data.aggregateId as string) ?? null,
          data.slug ?? id, data.title ?? 'Untitled', data.description ?? null,
          JSON.stringify(data.payload ?? []), JSON.stringify(data.consumedBy ?? []),
          JSON.stringify(data.triggers ?? []), JSON.stringify(data.sideEffects ?? []),
          now, now]
      );
      break;
    case 'value-object':
      await q(
        `INSERT INTO katalyst.value_objects 
          (id, domain_model_id, context_id, slug, title, description, properties, validation_rules, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [id, modelId, contextId, data.slug ?? id, data.title ?? 'Untitled',
          data.description ?? null, JSON.stringify(data.properties ?? []),
          JSON.stringify(data.validationRules ?? []), now, now]
      );
      break;
    case 'glossary-term':
      await q(
        `INSERT INTO katalyst.glossary_terms 
          (id, domain_model_id, context_id, term, definition, aliases, examples, related_terms, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [id, modelId, contextId ?? null, data.term ?? data.title ?? 'Untitled',
          data.definition ?? '', JSON.stringify(data.aliases ?? []),
          JSON.stringify(data.examples ?? []), JSON.stringify(data.relatedTerms ?? []),
          now, now]
      );
      break;
    case 'workflow':
      await q(
        `INSERT INTO katalyst.domain_workflows 
          (id, domain_model_id, slug, title, description, context_ids, states, transitions, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [id, modelId, data.slug ?? id, data.title ?? 'Untitled',
          data.description ?? null, JSON.stringify(data.contextIds ?? []),
          JSON.stringify(data.states ?? []), JSON.stringify(data.transitions ?? []),
          now, now]
      );
      break;
  }
}
