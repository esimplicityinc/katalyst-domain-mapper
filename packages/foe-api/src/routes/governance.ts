import { Elysia, t } from "elysia";
import { IngestGovernanceSnapshot } from "../domain/governance/use-cases/IngestGovernanceSnapshot";
import { QueryGovernanceState } from "../domain/governance/use-cases/QueryGovernanceState";
import { SqliteGovernanceRepository } from "../adapters/sqlite/SqliteGovernanceRepository";

const repo = new SqliteGovernanceRepository();
const ingestUseCase = new IngestGovernanceSnapshot(repo);
const queryUseCase = new QueryGovernanceState(repo);

export const governanceRoutes = new Elysia({ prefix: "/api/v1/governance" })
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation failed" };
    }
  })
  .post(
    "",
    async ({ body }) => {
      const id = await ingestUseCase.execute(body as any);
      return { success: true, id };
    },
    {
      body: t.Object({
        version: t.String(),
        generated: t.String(),
        project: t.String(),
        roadItems: t.Record(t.String(), t.Any()),
        capabilities: t.Record(t.String(), t.Any()),
        personas: t.Optional(t.Record(t.String(), t.Any())),
        stats: t.Optional(t.Any()),
        contexts: t.Optional(t.Record(t.String(), t.Any())),
      }),
    },
  )
  .get("/latest", async () => {
    const snapshot = await queryUseCase.getLatestSnapshot();
    if (!snapshot) return { error: "Not found" }; // Or 404?
    return snapshot;
  })
  .get("/trends", async () => {
    return repo.getSnapshots();
  })
  .get("/snapshots", async () => {
    return repo.getSnapshots();
  })
  .get("/integrity", async () => {
    return { integrityStatus: "pass", integrityErrors: 0 }; // Stub
  })
  .get("/roads", async () => {
    return queryUseCase.getRoadItems();
  })
  .get("/coverage/capabilities", async () => {
    return queryUseCase.getCapabilityCoverage();
  })
  .get("/coverage/personas", async () => {
    return []; // Stub
  })
  .delete("/:id", async ({ params: { id } }) => {
    await repo.deleteSnapshot(id);
    return { success: true };
  });
