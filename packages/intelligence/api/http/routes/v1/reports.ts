import Elysia, { t } from "elysia";
import type { IngestReport } from "../../../usecases/report/IngestReport.js";
import type { GetReport } from "../../../usecases/report/GetReport.js";
import type { ListReports } from "../../../usecases/report/ListReports.js";
import type { CompareReports } from "../../../usecases/report/CompareReports.js";
import type { ReportRepository } from "../../../ports/ReportRepository.js";

export function createReportRoutes(deps: {
  ingestReport: IngestReport;
  getReport: GetReport;
  listReports: ListReports;
  compareReports: CompareReports;
  reportRepo: ReportRepository;
}) {
  return (
    new Elysia({ prefix: "/reports" })

      // POST /reports — Ingest a report (accepts both scanner and canonical format)
      .post(
        "/",
        async ({ body }) => {
          const result = await deps.ingestReport.execute(body);
          return {
            id: result.id,
            overallScore: result.overallScore,
            maturityLevel: result.maturityLevel,
            message: "Report ingested successfully",
          };
        },
        {
          detail: { summary: "Ingest a FOE scan report", tags: ["Reports"] },
        },
      )

      // GET /reports — List reports
      .get(
        "/",
        async ({ query }) => {
          const filter = {
            repositoryId: query.repositoryId ?? undefined,
            maturityLevel: query.maturityLevel ?? undefined,
            minScore: query.minScore ? Number(query.minScore) : undefined,
            maxScore: query.maxScore ? Number(query.maxScore) : undefined,
            limit: query.limit ? Number(query.limit) : undefined,
            offset: query.offset ? Number(query.offset) : undefined,
          };
          return deps.listReports.execute(filter);
        },
        {
          query: t.Object({
            repositoryId: t.Optional(t.String()),
            maturityLevel: t.Optional(t.String()),
            minScore: t.Optional(t.String()),
            maxScore: t.Optional(t.String()),
            limit: t.Optional(t.String()),
            offset: t.Optional(t.String()),
          }),
          detail: { summary: "List reports", tags: ["Reports"] },
        },
      )

      // GET /reports/:id — Get full report
      .get(
        "/:id",
        async ({ params }) => {
          return deps.getReport.execute(params.id);
        },
        {
          params: t.Object({ id: t.String() }),
          detail: { summary: "Get a report by ID", tags: ["Reports"] },
        },
      )

      // GET /reports/:id/raw — Get original raw report JSON
      .get(
        "/:id/raw",
        async ({ params }) => {
          return deps.getReport.getRaw(params.id);
        },
        {
          params: t.Object({ id: t.String() }),
          detail: {
            summary: "Get the original raw report JSON",
            tags: ["Reports"],
          },
        },
      )

      // DELETE /reports/:id — Delete a report
      .delete(
        "/:id",
        async ({ params, set }) => {
          const deleted = await deps.reportRepo.delete(params.id);
          if (!deleted) {
            set.status = 404;
            return { error: `Report not found: ${params.id}` };
          }
          return { message: "Report deleted" };
        },
        {
          params: t.Object({ id: t.String() }),
          detail: { summary: "Delete a report", tags: ["Reports"] },
        },
      )

      // GET /reports/:id/compare/:otherId — Compare two reports
      .get(
        "/:id/compare/:otherId",
        async ({ params }) => {
          return deps.compareReports.execute(params.id, params.otherId);
        },
        {
          params: t.Object({ id: t.String(), otherId: t.String() }),
          detail: { summary: "Compare two reports", tags: ["Reports"] },
        },
      )
  );
}
