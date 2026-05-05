import type { Application } from 'express';

interface AppKit {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

export async function setupGovernanceRoutes(appkit: AppKit) {
  const q = appkit.lakebase.query.bind(appkit.lakebase);

  appkit.server.extend((app) => {
    // ── GET /latest — Latest governance snapshot ──────────────────────────

    app.get('/api/v1/taxonomy/governance/latest', async (_req, res) => {
      try {
        const { rows } = await q(
          `SELECT * FROM katalyst.governance_snapshots ORDER BY created_at DESC LIMIT 1`
        );
        if (rows.length === 0) {
          res.status(404).json({ error: 'No governance snapshots found' });
          return;
        }

        const snapshot = rows[0];
        const snapshotId = snapshot.id as string;

        const [caps, roads, contexts, userTypes, userStories] = await Promise.all([
          q(`SELECT * FROM katalyst.governance_capabilities WHERE snapshot_id = $1 ORDER BY title`, [snapshotId]),
          q(`SELECT * FROM katalyst.governance_road_items WHERE snapshot_id = $1 ORDER BY phase, priority`, [snapshotId]),
          q(`SELECT * FROM katalyst.governance_contexts WHERE snapshot_id = $1 ORDER BY title`, [snapshotId]),
          q(`SELECT * FROM katalyst.governance_user_types WHERE snapshot_id = $1 ORDER BY name`, [snapshotId]),
          q(`SELECT * FROM katalyst.governance_user_stories WHERE snapshot_id = $1 ORDER BY title`, [snapshotId]),
        ]);

        res.json({
          ...snapshot,
          capabilities: caps.rows,
          roadItems: roads.rows,
          contexts: contexts.rows,
          userTypes: userTypes.rows,
          userStories: userStories.rows,
        });
      } catch (err) {
        console.error('Failed to get latest governance snapshot:', err);
        res.status(500).json({ error: 'Failed to get latest governance snapshot' });
      }
    });

    // ── GET /snapshots — List all governance snapshots ────────────────────

    app.get('/api/v1/taxonomy/governance/snapshots', async (_req, res) => {
      try {
        const { rows } = await q(
          `SELECT id, project, version, generated, created_at FROM katalyst.governance_snapshots ORDER BY created_at DESC`
        );
        res.json(rows);
      } catch (err) {
        console.error('Failed to list governance snapshots:', err);
        res.status(500).json({ error: 'Failed to list governance snapshots' });
      }
    });

    // ── GET /roads — List road items with optional status filter ──────────

    app.get('/api/v1/taxonomy/governance/roads', async (req, res) => {
      try {
        const { status } = req.query;
        let sql = `SELECT ri.*, gs.project, gs.version
                    FROM katalyst.governance_road_items ri
                    JOIN katalyst.governance_snapshots gs ON gs.id = ri.snapshot_id`;
        const params: unknown[] = [];
        let idx = 1;

        // Scope to the latest snapshot
        sql += ` WHERE ri.snapshot_id = (SELECT id FROM katalyst.governance_snapshots ORDER BY created_at DESC LIMIT 1)`;

        if (status && typeof status === 'string') {
          sql += ` AND ri.status = $${idx++}`;
          params.push(status);
        }

        sql += ` ORDER BY ri.phase, ri.priority`;

        const { rows } = await q(sql, params);
        res.json(rows);
      } catch (err) {
        console.error('Failed to list road items:', err);
        res.status(500).json({ error: 'Failed to list road items' });
      }
    });

    // ── GET /coverage/capabilities — Capability coverage ─────────────────

    app.get('/api/v1/taxonomy/governance/coverage/capabilities', async (_req, res) => {
      try {
        // Get capabilities from the latest governance snapshot
        const { rows: snapRows } = await q(
          `SELECT id FROM katalyst.governance_snapshots ORDER BY created_at DESC LIMIT 1`
        );
        if (snapRows.length === 0) {
          res.json({ total: 0, withRoadItems: 0, withStories: 0, capabilities: [] });
          return;
        }

        const snapshotId = snapRows[0].id as string;
        const { rows: caps } = await q(
          `SELECT * FROM katalyst.governance_capabilities WHERE snapshot_id = $1 ORDER BY title`,
          [snapshotId]
        );

        const total = caps.length;
        const withRoadItems = caps.filter((c) => Number(c.road_count) > 0).length;
        const withStories = caps.filter((c) => Number(c.story_count) > 0).length;

        res.json({
          total,
          withRoadItems,
          withStories,
          coveragePercent: total > 0 ? Math.round((withRoadItems / total) * 100) : 0,
          capabilities: caps,
        });
      } catch (err) {
        console.error('Failed to get capability coverage:', err);
        res.status(500).json({ error: 'Failed to get capability coverage' });
      }
    });

    // ── GET /coverage/user-types — User type coverage ────────────────────

    app.get('/api/v1/taxonomy/governance/coverage/user-types', async (_req, res) => {
      try {
        const { rows: snapRows } = await q(
          `SELECT id FROM katalyst.governance_snapshots ORDER BY created_at DESC LIMIT 1`
        );
        if (snapRows.length === 0) {
          res.json({ total: 0, withStories: 0, withCapabilities: 0, userTypes: [] });
          return;
        }

        const snapshotId = snapRows[0].id as string;
        const { rows: userTypes } = await q(
          `SELECT * FROM katalyst.governance_user_types WHERE snapshot_id = $1 ORDER BY name`,
          [snapshotId]
        );

        const total = userTypes.length;
        const withStories = userTypes.filter((ut) => Number(ut.story_count) > 0).length;
        const withCapabilities = userTypes.filter((ut) => Number(ut.capability_count) > 0).length;

        res.json({
          total,
          withStories,
          withCapabilities,
          coveragePercent: total > 0 ? Math.round((withStories / total) * 100) : 0,
          userTypes,
        });
      } catch (err) {
        console.error('Failed to get user type coverage:', err);
        res.status(500).json({ error: 'Failed to get user type coverage' });
      }
    });

    // ── DELETE / — Delete all governance snapshots ────────────────────────

    app.delete('/api/v1/taxonomy/governance', async (_req, res) => {
      try {
        // CASCADE will remove all child rows
        const { rows } = await q(
          `DELETE FROM katalyst.governance_snapshots RETURNING id`
        );
        res.json({
          message: `Deleted ${rows.length} governance snapshots`,
          count: rows.length,
        });
      } catch (err) {
        console.error('Failed to delete governance snapshots:', err);
        res.status(500).json({ error: 'Failed to delete governance snapshots' });
      }
    });
  });
}
