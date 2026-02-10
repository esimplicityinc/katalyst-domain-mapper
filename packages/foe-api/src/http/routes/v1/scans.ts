import Elysia, { t } from "elysia";
import type { TriggerScan } from "../../../usecases/scan/TriggerScan.js";
import type { GetScanStatus } from "../../../usecases/scan/GetScanStatus.js";
import type { ScanJobStatus } from "../../../domain/scan/Scan.js";

export function createScanRoutes(deps: {
  triggerScan: TriggerScan;
  getScanStatus: GetScanStatus;
}) {
  return (
    new Elysia({ prefix: "/scans" })

      // POST /scans — Trigger a new scan
      .post(
        "/",
        async ({ body, set }) => {
          const job = await deps.triggerScan.execute(body.repositoryPath);
          set.status = 202;
          return {
            jobId: job.id,
            status: job.status,
            repositoryPath: job.repositoryPath,
            message: "Scan queued. Poll GET /api/v1/scans/:id for status.",
          };
        },
        {
          body: t.Object({
            repositoryPath: t.String({
              description: "Absolute path to the repository to scan",
            }),
          }),
          detail: { summary: "Trigger a new FOE scan", tags: ["Scans"] },
        },
      )

      // GET /scans — List scan jobs
      .get(
        "/",
        async ({ query }) => {
          const status = query.status as ScanJobStatus | undefined;
          return deps.getScanStatus.list(status);
        },
        {
          query: t.Object({
            status: t.Optional(
              t.String({
                description:
                  "Filter by status: queued, running, completed, failed",
              }),
            ),
          }),
          detail: { summary: "List scan jobs", tags: ["Scans"] },
        },
      )

      // GET /scans/:id — Get scan job status
      .get(
        "/:id",
        async ({ params }) => {
          return deps.getScanStatus.execute(params.id);
        },
        {
          params: t.Object({ id: t.String() }),
          detail: { summary: "Get scan job status", tags: ["Scans"] },
        },
      )
  );
}
