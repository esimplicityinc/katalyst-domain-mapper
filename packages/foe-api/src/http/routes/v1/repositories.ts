import Elysia, { t } from "elysia";
import type { ReportRepository } from "../../../ports/ReportRepository.js";
import { RepositoryNotFoundError } from "../../../domain/report/ReportErrors.js";

export function createRepositoryRoutes(deps: { reportRepo: ReportRepository }) {
  return new Elysia({ prefix: "/repositories" })

    // GET /repositories — List all tracked repositories
    .get(
      "/",
      async () => {
        return deps.reportRepo.listRepositories();
      },
      {
        detail: { summary: "List tracked repositories", tags: ["Repositories"] },
      }
    )

    // GET /repositories/:id — Get repository details with scan count
    .get(
      "/:id",
      async ({ params }) => {
        const repo = await deps.reportRepo.getRepository(params.id);
        if (!repo) {
          throw new RepositoryNotFoundError(params.id);
        }
        return repo;
      },
      {
        params: t.Object({ id: t.String() }),
        detail: { summary: "Get repository details", tags: ["Repositories"] },
      }
    )

    // GET /repositories/:id/trend — Score trend over time
    .get(
      "/:id/trend",
      async ({ params }) => {
        const repo = await deps.reportRepo.getRepository(params.id);
        if (!repo) {
          throw new RepositoryNotFoundError(params.id);
        }
        const trend = await deps.reportRepo.getScoreTrend(params.id);
        return {
          repository: { id: repo.id, name: repo.name },
          trend,
        };
      },
      {
        params: t.Object({ id: t.String() }),
        detail: { summary: "Get repository score trend", tags: ["Repositories"] },
      }
    );
}
