// ── Contribution API Routes ──────────────────────────────────────────────────
// 13 endpoints for the universal contribution lifecycle management.
// Prefix: /contributions

import Elysia, { t } from "elysia";
import type { ContributionUseCase } from "../../../usecases/contribution/ContributionUseCase.js";
import {
  ContributionNotFoundError,
  InvalidTransitionError,
} from "../../../usecases/contribution/ContributionUseCase.js";
import {
  UnsupportedItemTypeError,
  MissingParentIdError,
} from "../../../usecases/contribution/TypeRouter.js";
import type { ContributionStatus } from "@foe/schemas/taxonomy";
import type { StoredContributionItem } from "../../../ports/ContributionRepository.js";

// ── Response Mapper ─────────────────────────────────────────────────────────
// Transforms the flat StoredContributionItem into the nested shape the UI
// expects: { itemType, itemId, title, contribution: {...}, metadata: {...} }

function toContributionResponse(stored: StoredContributionItem) {
  const itemData = (stored.itemData ?? {}) as Record<string, unknown>;
  return {
    itemType: stored.itemType,
    itemId: stored.itemId,
    title: (itemData.title as string) ?? (itemData.name as string) ?? stored.itemId,
    contribution: {
      status: stored.status,
      version: stored.version,
      supersedes: stored.supersedes,
      supersededBy: stored.supersededBy,
      submittedBy: stored.submittedBy,
      submittedAt: stored.submittedAt,
      reviewedBy: stored.reviewedBy,
      reviewedAt: stored.reviewedAt,
      reviewFeedback: stored.reviewFeedback,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
    },
    metadata: {
      ...(itemData.subdomainType ? { category: itemData.subdomainType } : {}),
      ...(itemData.description ? { description: itemData.description } : {}),
    },
  };
}

export function createContributionRoutes(deps: {
  contributionUseCase: ContributionUseCase;
}) {
  return new Elysia({ prefix: "/contributions" })

    // ── GET / — List contributions with filters ──────────────────────────
    .get(
      "/",
      async ({ query }) => {
        const filters = {
          status: (query.status || undefined) as ContributionStatus | undefined,
          itemType: query.type || undefined,
          submittedBy: query.submittedBy || undefined,
          search: query.search || undefined,
          limit: query.limit ? Number(query.limit) : 20,
          offset: query.offset ? Number(query.offset) : 0,
        };
        const result = await deps.contributionUseCase.list(filters);
        return {
          items: result.items.map(toContributionResponse),
          total: result.total,
          counts: result.counts,
        };
      },
      {
        query: t.Object({
          status: t.Optional(t.String()),
          type: t.Optional(t.String()),
          submittedBy: t.Optional(t.String()),
          search: t.Optional(t.String()),
          limit: t.Optional(t.String()),
          offset: t.Optional(t.String()),
        }),
        detail: {
          summary: "List contribution items with filters",
          tags: ["Contributions"],
        },
      },
    )

    // ── GET /counts — Badge counts ───────────────────────────────────────
    .get(
      "/counts",
      async () => {
        return deps.contributionUseCase.getCounts();
      },
      {
        detail: {
          summary: "Get contribution counts by status",
          tags: ["Contributions"],
        },
      },
    )

    // ── POST /create — Contribution-aware unified create ─────────────────
    .post(
      "/create",
      async ({ body, set }) => {
        try {
          const result = await deps.contributionUseCase.createContributedItem({
            itemType: body.itemType,
            parentId: body.parentId,
            data: body.data,
            submittedBy: body.submittedBy,
            contributionNote: body.contributionNote,
          });
          set.status = 201;
          return { item: toContributionResponse(result.item), created: true };
        } catch (err) {
          if (err instanceof UnsupportedItemTypeError) {
            set.status = 400;
            return { error: err.message };
          }
          if (err instanceof MissingParentIdError) {
            set.status = 400;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        body: t.Object({
          itemType: t.String(),
          parentId: t.Optional(t.String()),
          data: t.Record(t.String(), t.Any()),
          submittedBy: t.String(),
          contributionNote: t.Optional(t.String()),
        }),
        detail: {
          summary: "Create an item through the contribution lifecycle",
          tags: ["Contributions"],
        },
      },
    )

    // ── GET /:type/:id — Contribution detail ─────────────────────────────
    .get(
      "/:type/:id",
      async ({ params, set }) => {
        try {
          const detail = await deps.contributionUseCase.getDetail(params.type, params.id);
          return {
            ...toContributionResponse(detail.item),
            versions: detail.versions,
            auditLog: detail.auditLog,
          };
        } catch (err) {
          if (err instanceof ContributionNotFoundError) {
            set.status = 404;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        params: t.Object({ type: t.String(), id: t.String() }),
        detail: {
          summary: "Get contribution detail for a specific item",
          tags: ["Contributions"],
        },
      },
    )

    // ── POST /:type/:id/submit — draft → proposed ───────────────────────
    .post(
      "/:type/:id/submit",
      async ({ params, body, set }) => {
        try {
          return await deps.contributionUseCase.performTransition(
            params.type,
            params.id,
            "submit",
            (body as { actor?: string })?.actor,
          );
        } catch (err) {
          if (err instanceof ContributionNotFoundError) {
            set.status = 404;
            return { error: err.message };
          }
          if (err instanceof InvalidTransitionError) {
            set.status = 400;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        params: t.Object({ type: t.String(), id: t.String() }),
        detail: {
          summary: "Submit item for review (draft → proposed)",
          tags: ["Contributions"],
        },
      },
    )

    // ── POST /:type/:id/accept — proposed → accepted ────────────────────
    .post(
      "/:type/:id/accept",
      async ({ params, body, set }) => {
        try {
          return await deps.contributionUseCase.performTransition(
            params.type,
            params.id,
            "accept",
            (body as { actor?: string })?.actor,
          );
        } catch (err) {
          if (err instanceof ContributionNotFoundError) {
            set.status = 404;
            return { error: err.message };
          }
          if (err instanceof InvalidTransitionError) {
            set.status = 400;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        params: t.Object({ type: t.String(), id: t.String() }),
        detail: {
          summary: "Accept item (proposed → accepted)",
          tags: ["Contributions"],
        },
      },
    )

    // ── POST /:type/:id/reject — proposed → rejected ────────────────────
    .post(
      "/:type/:id/reject",
      async ({ params, body, set }) => {
        const { actor, feedback } = body as {
          actor?: string;
          feedback?: string;
        };
        try {
          return await deps.contributionUseCase.performTransition(
            params.type,
            params.id,
            "reject",
            actor,
            feedback,
          );
        } catch (err) {
          if (err instanceof ContributionNotFoundError) {
            set.status = 404;
            return { error: err.message };
          }
          if (err instanceof InvalidTransitionError) {
            set.status = 400;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        params: t.Object({ type: t.String(), id: t.String() }),
        detail: {
          summary: "Reject item with feedback (proposed → rejected)",
          tags: ["Contributions"],
        },
      },
    )

    // ── POST /:type/:id/withdraw — proposed → draft ─────────────────────
    .post(
      "/:type/:id/withdraw",
      async ({ params, body, set }) => {
        try {
          return await deps.contributionUseCase.performTransition(
            params.type,
            params.id,
            "withdraw",
            (body as { actor?: string })?.actor,
          );
        } catch (err) {
          if (err instanceof ContributionNotFoundError) {
            set.status = 404;
            return { error: err.message };
          }
          if (err instanceof InvalidTransitionError) {
            set.status = 400;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        params: t.Object({ type: t.String(), id: t.String() }),
        detail: {
          summary: "Withdraw submission (proposed → draft)",
          tags: ["Contributions"],
        },
      },
    )

    // ── POST /:type/:id/revise — rejected → draft ───────────────────────
    .post(
      "/:type/:id/revise",
      async ({ params, body, set }) => {
        try {
          return await deps.contributionUseCase.performTransition(
            params.type,
            params.id,
            "revise",
            (body as { actor?: string })?.actor,
          );
        } catch (err) {
          if (err instanceof ContributionNotFoundError) {
            set.status = 404;
            return { error: err.message };
          }
          if (err instanceof InvalidTransitionError) {
            set.status = 400;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        params: t.Object({ type: t.String(), id: t.String() }),
        detail: {
          summary: "Revise rejected item (rejected → draft)",
          tags: ["Contributions"],
        },
      },
    )

    // ── POST /:type/:id/deprecate — accepted → deprecated ───────────────
    .post(
      "/:type/:id/deprecate",
      async ({ params, body, set }) => {
        try {
          return await deps.contributionUseCase.performTransition(
            params.type,
            params.id,
            "deprecate",
            (body as { actor?: string })?.actor,
          );
        } catch (err) {
          if (err instanceof ContributionNotFoundError) {
            set.status = 404;
            return { error: err.message };
          }
          if (err instanceof InvalidTransitionError) {
            set.status = 400;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        params: t.Object({ type: t.String(), id: t.String() }),
        detail: {
          summary: "Deprecate item (accepted → deprecated)",
          tags: ["Contributions"],
        },
      },
    )

    // ── POST /:type/:id/reactivate — deprecated → draft ─────────────────
    .post(
      "/:type/:id/reactivate",
      async ({ params, body, set }) => {
        try {
          return await deps.contributionUseCase.performTransition(
            params.type,
            params.id,
            "reactivate",
            (body as { actor?: string })?.actor,
          );
        } catch (err) {
          if (err instanceof ContributionNotFoundError) {
            set.status = 404;
            return { error: err.message };
          }
          if (err instanceof InvalidTransitionError) {
            set.status = 400;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        params: t.Object({ type: t.String(), id: t.String() }),
        detail: {
          summary: "Reactivate deprecated item (deprecated → draft)",
          tags: ["Contributions"],
        },
      },
    )

    // ── POST /:type/:id/new-version — Create new version of accepted ────
    .post(
      "/:type/:id/new-version",
      async ({ params, body, set }) => {
        try {
          return await deps.contributionUseCase.createNewVersion(
            params.type,
            params.id,
            (body as { actor?: string })?.actor,
          );
        } catch (err) {
          if (err instanceof ContributionNotFoundError) {
            set.status = 404;
            return { error: err.message };
          }
          if (err instanceof InvalidTransitionError) {
            set.status = 400;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        params: t.Object({ type: t.String(), id: t.String() }),
        detail: {
          summary: "Create new version of accepted item",
          tags: ["Contributions"],
        },
      },
    )

    // ── GET /:type/:id/versions — List all versions ─────────────────────
    .get(
      "/:type/:id/versions",
      async ({ params }) => {
        return deps.contributionUseCase.getVersions(params.type, params.id);
      },
      {
        params: t.Object({ type: t.String(), id: t.String() }),
        detail: {
          summary: "List all versions of an item",
          tags: ["Contributions"],
        },
      },
    )

    // ── GET /:type/:id/diff/:v1/:v2 — Field-level diff ──────────────────
    .get(
      "/:type/:id/diff/:v1/:v2",
      async ({ params, set }) => {
        try {
          return await deps.contributionUseCase.getDiff(
            params.type,
            params.id,
            Number(params.v1),
            Number(params.v2),
          );
        } catch (err) {
          if (err instanceof ContributionNotFoundError) {
            set.status = 404;
            return { error: err.message };
          }
          throw err;
        }
      },
      {
        params: t.Object({
          type: t.String(),
          id: t.String(),
          v1: t.String(),
          v2: t.String(),
        }),
        detail: {
          summary: "Get field-level diff between two versions",
          tags: ["Contributions"],
        },
      },
    );
}
