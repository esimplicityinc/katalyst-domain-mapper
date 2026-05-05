import type { Application } from 'express';
import { randomUUID } from 'crypto';

interface AppKit {
  lakebase: {
    query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  };
  server: {
    extend(fn: (app: Application) => void): void;
  };
}

export async function setupReportRoutes(appkit: AppKit) {
  const q = appkit.lakebase.query.bind(appkit.lakebase);

  appkit.server.extend((app) => {
    // ── GET /reports — List reports ───────────────────────────────────────

    app.get('/api/v1/reports', async (req, res) => {
      try {
        const { repositoryId, maturityLevel, minScore, maxScore, limit: limitStr, offset: offsetStr } = req.query;

        let sql = `SELECT s.id, s.overall_score, s.maturity_level, s.assessment_mode,
                          s.executive_summary, s.scan_date, s.scan_duration, s.scanner_version, s.created_at,
                          r.name as repository_name, r.url as repository_url
                   FROM katalyst.scans s
                   JOIN katalyst.repositories r ON r.id = s.repository_id
                   WHERE 1=1`;
        const params: unknown[] = [];
        let idx = 1;

        if (repositoryId && typeof repositoryId === 'string') {
          sql += ` AND s.repository_id = $${idx++}`;
          params.push(repositoryId);
        }
        if (maturityLevel && typeof maturityLevel === 'string') {
          sql += ` AND s.maturity_level = $${idx++}`;
          params.push(maturityLevel);
        }
        if (minScore && typeof minScore === 'string') {
          sql += ` AND s.overall_score >= $${idx++}`;
          params.push(Number(minScore));
        }
        if (maxScore && typeof maxScore === 'string') {
          sql += ` AND s.overall_score <= $${idx++}`;
          params.push(Number(maxScore));
        }

        sql += ` ORDER BY s.scan_date DESC`;

        const limit = Math.min(parseInt(String(limitStr) || '50', 10), 200);
        sql += ` LIMIT $${idx++}`;
        params.push(limit);

        const offset = parseInt(String(offsetStr) || '0', 10);
        if (offset > 0) {
          sql += ` OFFSET $${idx++}`;
          params.push(offset);
        }

        const { rows } = await q(sql, params);
        res.json(rows);
      } catch (err) {
        console.error('Failed to list reports:', err);
        res.status(500).json({ error: 'Failed to list reports' });
      }
    });

    // ── GET /reports/:id — Get full report with all dimensions ───────────

    app.get('/api/v1/reports/:id', async (req, res) => {
      try {
        const { rows: scanRows } = await q(
          `SELECT s.*, r.name as repository_name, r.url as repository_url, r.tech_stack, r.is_monorepo
           FROM katalyst.scans s
           JOIN katalyst.repositories r ON r.id = s.repository_id
           WHERE s.id = $1`,
          [req.params.id]
        );
        if (scanRows.length === 0) {
          res.status(404).json({ error: 'Report not found' });
          return;
        }

        const scan = scanRows[0];
        const scanId = scan.id as string;

        // Fetch all related data in parallel
        const [dims, findingsRes, strengthsRes, recsRes, triangleRes, methRes] = await Promise.all([
          q(`SELECT * FROM katalyst.dimensions WHERE scan_id = $1 ORDER BY name`, [scanId]),
          q(`SELECT * FROM katalyst.findings WHERE scan_id = $1 ORDER BY severity, area`, [scanId]),
          q(`SELECT * FROM katalyst.strengths WHERE scan_id = $1`, [scanId]),
          q(`SELECT * FROM katalyst.recommendations WHERE scan_id = $1 ORDER BY priority`, [scanId]),
          q(`SELECT * FROM katalyst.triangle_diagnoses WHERE scan_id = $1`, [scanId]),
          q(`SELECT * FROM katalyst.methodologies WHERE scan_id = $1`, [scanId]),
        ]);

        // Fetch subscores for each dimension
        const dimensionIds = dims.rows.map((d) => d.id as string);
        const subscoresByDim = new Map<string, Record<string, unknown>[]>();

        if (dimensionIds.length > 0) {
          // Build parameterized IN clause
          const placeholders = dimensionIds.map((_, i) => `$${i + 1}`).join(', ');
          const { rows: allSubscores } = await q(
            `SELECT * FROM katalyst.subscores WHERE dimension_id IN (${placeholders}) ORDER BY name`,
            dimensionIds
          );
          for (const ss of allSubscores) {
            const dimId = ss.dimension_id as string;
            if (!subscoresByDim.has(dimId)) subscoresByDim.set(dimId, []);
            subscoresByDim.get(dimId)!.push(ss);
          }
        }

        // Assemble dimensions with their subscores
        const dimensions = dims.rows.map((dim) => ({
          ...dim,
          subscores: subscoresByDim.get(dim.id as string) ?? [],
        }));

        res.json({
          id: scan.id,
          repository: {
            id: scan.repository_id,
            name: scan.repository_name,
            url: scan.repository_url,
            techStack: scan.tech_stack,
            isMonorepo: scan.is_monorepo,
          },
          overallScore: scan.overall_score,
          maturityLevel: scan.maturity_level,
          assessmentMode: scan.assessment_mode,
          executiveSummary: scan.executive_summary,
          scanDate: scan.scan_date,
          scanDuration: scan.scan_duration,
          scannerVersion: scan.scanner_version,
          dimensions,
          findings: findingsRes.rows,
          strengths: strengthsRes.rows,
          recommendations: recsRes.rows,
          triangleDiagnosis: triangleRes.rows[0] ?? null,
          methodology: methRes.rows[0] ?? null,
          createdAt: scan.created_at,
        });
      } catch (err) {
        console.error('Failed to get report:', err);
        res.status(500).json({ error: 'Failed to get report' });
      }
    });

    // ── POST /reports — Ingest a report ──────────────────────────────────

    app.post('/api/v1/reports', async (req, res) => {
      try {
        const body = req.body;
        if (!body || typeof body !== 'object') {
          res.status(400).json({ error: 'Request body must be a JSON object' });
          return;
        }

        const rawReport = body as Record<string, unknown>;
        const now = new Date().toISOString();

        // Extract or generate IDs
        const scanId = (rawReport.id as string) ?? randomUUID();

        // Extract repository info
        const repoData = rawReport.repository as Record<string, unknown> | undefined;
        const repoName = (repoData?.name as string) ?? (rawReport.repositoryName as string) ?? 'unknown';
        const repoUrl = (repoData?.url as string) ?? (rawReport.repositoryUrl as string) ?? null;
        const techStack = (repoData?.techStack as string[]) ?? [];
        const isMonorepo = (repoData?.isMonorepo as boolean) ?? false;

        // Upsert repository
        const repoId = (repoData?.id as string) ?? randomUUID();
        await q(
          `INSERT INTO katalyst.repositories (id, name, url, tech_stack, is_monorepo, created_at, last_scanned_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET last_scanned_at = $7, tech_stack = $4`,
          [repoId, repoName, repoUrl, JSON.stringify(techStack), isMonorepo, now, now]
        );

        // Extract scan metadata
        const overallScore = Number(rawReport.overallScore ?? 0);
        const maturityLevel = (rawReport.maturityLevel as string) ?? 'Hypothesized';
        const assessmentMode = (rawReport.assessmentMode as string) ?? 'automated';
        const executiveSummary = (rawReport.executiveSummary as string) ?? '';
        const scanDate = (rawReport.scanDate as string) ?? now;
        const scanDuration = Number(rawReport.scanDuration ?? 0);
        const scannerVersion = (rawReport.scannerVersion as string) ?? 'unknown';

        // Insert scan
        await q(
          `INSERT INTO katalyst.scans 
            (id, repository_id, overall_score, maturity_level, assessment_mode, executive_summary, 
             scan_date, scan_duration, scanner_version, raw_report, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [scanId, repoId, overallScore, maturityLevel, assessmentMode, executiveSummary,
            scanDate, scanDuration, scannerVersion, JSON.stringify(rawReport), now]
        );

        // Insert dimensions and subscores
        const dimensions = (rawReport.dimensions as Record<string, unknown>[]) ?? [];
        for (const dim of dimensions) {
          const dimId = (dim.id as string) ?? randomUUID();
          await q(
            `INSERT INTO katalyst.dimensions (id, scan_id, name, score, max, confidence, color)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [dimId, scanId, dim.name ?? '', Number(dim.score ?? 0), Number(dim.max ?? 100),
              (dim.confidence as string) ?? 'low', (dim.color as string) ?? '#888']
          );

          const subscores = (dim.subscores as Record<string, unknown>[]) ?? [];
          for (const ss of subscores) {
            await q(
              `INSERT INTO katalyst.subscores (id, dimension_id, name, score, max, confidence, evidence, gaps)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [randomUUID(), dimId, ss.name ?? '', Number(ss.score ?? 0), Number(ss.max ?? 25),
                (ss.confidence as string) ?? 'low', JSON.stringify(ss.evidence ?? []),
                JSON.stringify(ss.gaps ?? [])]
            );
          }
        }

        // Insert findings
        const findings = (rawReport.findings as Record<string, unknown>[]) ?? [];
        for (const f of findings) {
          await q(
            `INSERT INTO katalyst.findings 
              (id, scan_id, kind, area, severity, title, evidence, impact, recommendation, location, methods)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [randomUUID(), scanId, f.kind ?? 'gap', f.area ?? '', f.severity ?? 'medium',
              f.title ?? '', f.evidence ?? '', f.impact ?? '', f.recommendation ?? '',
              (f.location as string) ?? null, JSON.stringify(f.methods ?? [])]
          );
        }

        // Insert strengths
        const strengths = (rawReport.strengths as Record<string, unknown>[]) ?? [];
        for (const s of strengths) {
          await q(
            `INSERT INTO katalyst.strengths (id, scan_id, area, evidence, caveat)
             VALUES ($1, $2, $3, $4, $5)`,
            [randomUUID(), scanId, s.area ?? '', s.evidence ?? '', (s.caveat as string) ?? null]
          );
        }

        // Insert recommendations
        const recommendations = (rawReport.recommendations as Record<string, unknown>[]) ?? [];
        for (const r of recommendations) {
          await q(
            `INSERT INTO katalyst.recommendations 
              (id, scan_id, priority, title, description, impact, methods, learning_path)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [randomUUID(), scanId, r.priority ?? 'medium', r.title ?? '', r.description ?? '',
              r.impact ?? '', JSON.stringify(r.methods ?? []), (r.learningPath as string) ?? null]
          );
        }

        // Insert triangle diagnosis
        const triangle = rawReport.triangleDiagnosis as Record<string, unknown> | undefined;
        if (triangle) {
          await q(
            `INSERT INTO katalyst.triangle_diagnoses 
              (id, scan_id, cycle_health, pattern, weakest_principle, intervention, thresholds)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [randomUUID(), scanId, triangle.cycleHealth ?? '', triangle.pattern ?? '',
              triangle.weakestPrinciple ?? '', triangle.intervention ?? '',
              JSON.stringify(triangle.thresholds ?? null)]
          );
        }

        // Insert methodology
        const methodology = rawReport.methodology as Record<string, unknown> | undefined;
        if (methodology) {
          await q(
            `INSERT INTO katalyst.methodologies 
              (id, scan_id, files_analyzed, test_files_analyzed, adrs_analyzed, coverage_report_found, confidence_notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [randomUUID(), scanId, Number(methodology.filesAnalyzed ?? 0),
              Number(methodology.testFilesAnalyzed ?? 0), Number(methodology.adrsAnalyzed ?? 0),
              (methodology.coverageReportFound as boolean) ?? false,
              JSON.stringify(methodology.confidenceNotes ?? [])]
          );
        }

        res.status(201).json({
          id: scanId,
          overallScore,
          maturityLevel,
          message: 'Report ingested successfully',
        });
      } catch (err) {
        console.error('Failed to ingest report:', err);
        res.status(500).json({ error: 'Failed to ingest report' });
      }
    });

    // ── DELETE /reports/:id — Delete a report ────────────────────────────

    app.delete('/api/v1/reports/:id', async (req, res) => {
      try {
        // CASCADE on scan deletion will remove dimensions, subscores, findings, etc.
        const { rows } = await q(
          `DELETE FROM katalyst.scans WHERE id = $1 RETURNING id`,
          [req.params.id]
        );
        if (rows.length === 0) {
          res.status(404).json({ error: 'Report not found' });
          return;
        }
        res.json({ message: 'Report deleted' });
      } catch (err) {
        console.error('Failed to delete report:', err);
        res.status(500).json({ error: 'Failed to delete report' });
      }
    });
  });
}
