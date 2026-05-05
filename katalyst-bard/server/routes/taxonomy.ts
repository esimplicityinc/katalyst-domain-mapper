import type { Application } from 'express';

interface AppKit {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

// Helper: build a tree from flat nodes with parent_node references
function buildTree(nodes: Record<string, unknown>[]): unknown[] {
  const byName = new Map<string, Record<string, unknown> & { children: unknown[] }>();
  for (const node of nodes) {
    byName.set(node.name as string, { ...node, children: [] });
  }

  const roots: unknown[] = [];
  for (const node of byName.values()) {
    const parentName = node.parent_node as string | null;
    if (parentName && byName.has(parentName)) {
      byName.get(parentName)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function setupTaxonomyRoutes(appkit: AppKit) {
  const q = appkit.lakebase.query.bind(appkit.lakebase);

  /** Resolve the latest taxonomy snapshot ID, or null. */
  async function getLatestSnapshotId(): Promise<string | null> {
    const { rows } = await q(
      `SELECT id FROM katalyst.taxonomy_snapshots ORDER BY created_at DESC LIMIT 1`
    );
    return rows.length > 0 ? (rows[0].id as string) : null;
  }

  appkit.server.extend((app) => {
    // ── GET /snapshots/latest — Latest taxonomy snapshot ──────────────────

    app.get('/api/v1/taxonomy/snapshots/latest', async (_req, res) => {
      try {
        const { rows } = await q(
          `SELECT * FROM katalyst.taxonomy_snapshots ORDER BY created_at DESC LIMIT 1`
        );
        if (rows.length === 0) {
          res.status(404).json({ error: 'No taxonomy snapshots found' });
          return;
        }

        const snapshot = rows[0];
        const snapshotId = snapshot.id as string;

        const [nodes, envs, layerTypes, caps, capRels, actions, stages, tools, teams, persons, memberships] =
          await Promise.all([
            q(`SELECT * FROM katalyst.taxonomy_nodes WHERE snapshot_id = $1 ORDER BY name`, [snapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_environments WHERE snapshot_id = $1 ORDER BY name`, [snapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_layer_types WHERE snapshot_id = $1 ORDER BY name`, [snapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_capabilities WHERE snapshot_id = $1 ORDER BY name`, [snapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_capability_rels WHERE snapshot_id = $1`, [snapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_actions WHERE snapshot_id = $1 ORDER BY name`, [snapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_stages WHERE snapshot_id = $1 ORDER BY name`, [snapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_tools WHERE snapshot_id = $1 ORDER BY name`, [snapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_teams WHERE snapshot_id = $1 ORDER BY name`, [snapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_persons WHERE snapshot_id = $1 ORDER BY name`, [snapshotId]),
            q(`SELECT * FROM katalyst.taxonomy_team_memberships WHERE snapshot_id = $1`, [snapshotId]),
          ]);

        res.json({
          ...snapshot,
          nodes: nodes.rows,
          environments: envs.rows,
          layerTypes: layerTypes.rows,
          capabilities: caps.rows,
          capabilityRels: capRels.rows,
          actions: actions.rows,
          stages: stages.rows,
          tools: tools.rows,
          teams: teams.rows,
          persons: persons.rows,
          teamMemberships: memberships.rows,
        });
      } catch (err) {
        console.error('Failed to get latest taxonomy snapshot:', err);
        res.status(500).json({ error: 'Failed to get latest taxonomy snapshot' });
      }
    });

    // ── GET /snapshots/ — List all taxonomy snapshots ─────────────────────

    app.get('/api/v1/taxonomy/snapshots', async (req, res) => {
      try {
        const limit = Math.min(parseInt(String(req.query.limit) || '50', 10), 200);
        const { rows } = await q(
          `SELECT id, project, version, generated, node_count, environment_count, created_at
           FROM katalyst.taxonomy_snapshots ORDER BY created_at DESC LIMIT $1`,
          [limit]
        );
        res.json(rows);
      } catch (err) {
        console.error('Failed to list taxonomy snapshots:', err);
        res.status(500).json({ error: 'Failed to list taxonomy snapshots' });
      }
    });

    // ── GET /nodes — List taxonomy nodes with optional type filter ────────

    app.get('/api/v1/taxonomy/nodes', async (req, res) => {
      try {
        const snapshotId = await getLatestSnapshotId();
        if (!snapshotId) {
          res.json([]);
          return;
        }

        const { type } = req.query;
        let sql = `SELECT * FROM katalyst.taxonomy_nodes WHERE snapshot_id = $1`;
        const params: unknown[] = [snapshotId];
        let idx = 2;

        if (type && typeof type === 'string') {
          sql += ` AND node_type = $${idx++}`;
          params.push(type);
        }

        sql += ` ORDER BY name`;

        const { rows } = await q(sql, params);
        res.json(rows);
      } catch (err) {
        console.error('Failed to list taxonomy nodes:', err);
        res.status(500).json({ error: 'Failed to list taxonomy nodes' });
      }
    });

    // ── GET /hierarchy — Tree-structured response ────────────────────────

    app.get('/api/v1/taxonomy/hierarchy', async (_req, res) => {
      try {
        const snapshotId = await getLatestSnapshotId();
        if (!snapshotId) {
          res.json({ systems: [], roots: [] });
          return;
        }

        const { rows: nodes } = await q(
          `SELECT * FROM katalyst.taxonomy_nodes WHERE snapshot_id = $1 ORDER BY name`,
          [snapshotId]
        );

        const tree = buildTree(nodes);

        // Extract top-level "system" nodes
        const systems = nodes
          .filter((n) => n.node_type === 'system')
          .map((s) => ({
            name: s.name,
            description: s.description,
            fqtn: s.fqtn,
          }));

        res.json({ systems, roots: tree });
      } catch (err) {
        console.error('Failed to get taxonomy hierarchy:', err);
        res.status(500).json({ error: 'Failed to get taxonomy hierarchy' });
      }
    });

    // ── GET /teams — List all teams from latest snapshot ─────────────────

    app.get('/api/v1/taxonomy/teams', async (_req, res) => {
      try {
        const snapshotId = await getLatestSnapshotId();
        if (!snapshotId) {
          res.json([]);
          return;
        }

        const { rows } = await q(
          `SELECT * FROM katalyst.taxonomy_teams WHERE snapshot_id = $1 ORDER BY name`,
          [snapshotId]
        );
        res.json(rows);
      } catch (err) {
        console.error('Failed to list teams:', err);
        res.status(500).json({ error: 'Failed to list teams' });
      }
    });

    // ── GET /teams/:name — Get team by name with members ────────────────

    app.get('/api/v1/taxonomy/teams/:name', async (req, res) => {
      try {
        const snapshotId = await getLatestSnapshotId();
        if (!snapshotId) {
          res.status(404).json({ error: 'No taxonomy snapshots found' });
          return;
        }

        const { rows: teamRows } = await q(
          `SELECT * FROM katalyst.taxonomy_teams WHERE snapshot_id = $1 AND name = $2`,
          [snapshotId, req.params.name]
        );
        if (teamRows.length === 0) {
          res.status(404).json({ error: `Team not found: ${req.params.name}` });
          return;
        }

        const team = teamRows[0];

        // Get memberships for this team
        const { rows: memberships } = await q(
          `SELECT tm.*, tp.display_name, tp.email, tp.role as person_role, tp.avatar_url
           FROM katalyst.taxonomy_team_memberships tm
           LEFT JOIN katalyst.taxonomy_persons tp ON tp.snapshot_id = tm.snapshot_id AND tp.name = tm.person_name
           WHERE tm.snapshot_id = $1 AND tm.team_name = $2`,
          [snapshotId, req.params.name]
        );

        res.json({
          ...team,
          members: memberships,
        });
      } catch (err) {
        console.error('Failed to get team:', err);
        res.status(500).json({ error: 'Failed to get team' });
      }
    });

    // ── GET /persons — List all persons from latest snapshot ─────────────

    app.get('/api/v1/taxonomy/persons', async (_req, res) => {
      try {
        const snapshotId = await getLatestSnapshotId();
        if (!snapshotId) {
          res.json([]);
          return;
        }

        const { rows: persons } = await q(
          `SELECT * FROM katalyst.taxonomy_persons WHERE snapshot_id = $1 ORDER BY name`,
          [snapshotId]
        );

        // Attach team memberships to each person
        const { rows: memberships } = await q(
          `SELECT * FROM katalyst.taxonomy_team_memberships WHERE snapshot_id = $1`,
          [snapshotId]
        );

        const membershipsByPerson = new Map<string, Record<string, unknown>[]>();
        for (const m of memberships) {
          const personName = m.person_name as string;
          if (!membershipsByPerson.has(personName)) {
            membershipsByPerson.set(personName, []);
          }
          membershipsByPerson.get(personName)!.push(m);
        }

        const result = persons.map((p) => ({
          ...p,
          teams: membershipsByPerson.get(p.name as string) ?? [],
        }));

        res.json(result);
      } catch (err) {
        console.error('Failed to list persons:', err);
        res.status(500).json({ error: 'Failed to list persons' });
      }
    });

    // ── GET /capabilities/tree — Capability hierarchy ────────────────────

    app.get('/api/v1/taxonomy/capabilities/tree', async (_req, res) => {
      try {
        const snapshotId = await getLatestSnapshotId();
        if (!snapshotId) {
          res.status(404).json({ error: 'No taxonomy capabilities found' });
          return;
        }

        const { rows: caps } = await q(
          `SELECT * FROM katalyst.taxonomy_capabilities WHERE snapshot_id = $1 ORDER BY name`,
          [snapshotId]
        );

        if (caps.length === 0) {
          res.status(404).json({ error: 'No taxonomy capabilities found' });
          return;
        }

        // Also load capability-node relationships
        const { rows: capRels } = await q(
          `SELECT * FROM katalyst.taxonomy_capability_rels WHERE snapshot_id = $1`,
          [snapshotId]
        );

        // Build a map of capabilities by name, then create parent-child tree
        const byName = new Map<string, Record<string, unknown> & { children: unknown[] }>();
        for (const cap of caps) {
          byName.set(cap.name as string, { ...cap, children: [] });
        }

        // Resolve taxonomy node relationships
        const capTaxonomyNodes = new Map<string, string[]>();
        for (const rel of capRels) {
          const capNames = rel.capabilities as string[];
          for (const capName of capNames ?? []) {
            if (!capTaxonomyNodes.has(capName)) {
              capTaxonomyNodes.set(capName, []);
            }
            capTaxonomyNodes.get(capName)!.push(rel.node as string);
          }
        }

        const roots: unknown[] = [];
        for (const [name, cap] of byName) {
          const parentName = cap.parent_capability as string | null;
          if (parentName && byName.has(parentName)) {
            byName.get(parentName)!.children.push(cap);
          } else {
            roots.push(cap);
          }
          // Attach taxonomy nodes
          (cap as Record<string, unknown>).taxonomyNodes = capTaxonomyNodes.get(name) ?? [];
        }

        res.json({
          roots,
          byName: Object.fromEntries(byName),
        });
      } catch (err) {
        console.error('Failed to get capability tree:', err);
        res.status(500).json({ error: 'Failed to get capability tree' });
      }
    });
  });
}
