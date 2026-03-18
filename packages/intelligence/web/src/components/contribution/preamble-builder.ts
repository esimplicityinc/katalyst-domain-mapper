// ── Preamble Builder ───────────────────────────────────────────────────────
// Builds the 3-section [CONTEXT] block that is prepended to every user message
// sent to the contribution-assistant agent. Extracted for testability.
//
// Section A: Universal   — contribution queue counts, API base URL (always)
// Section B: Domain      — page-specific data (when on a relevant page)
// Section C: Item-scoped — focused item data (when an item is selected)

import type { PageContext } from "./PageContextProvider";
import type {
  ContributionCounts,
  ContributionItem,
  ContributionVersion,
} from "../../types/contribution";

// ── Types ──────────────────────────────────────────────────────────────────

export interface UniversalContext {
  contributionCounts: ContributionCounts;
  apiBase: string;
}

export interface ItemContext {
  item: ContributionItem;
  versionHistory?: ContributionVersion[];
  rejectionFeedback?: string;
}

// ── Section A: Universal ───────────────────────────────────────────────────

function buildUniversalSection(ctx: UniversalContext): string {
  return `== CONTRIBUTION STATE ==
Pending review: ${ctx.contributionCounts.pendingReview} items
My drafts: ${ctx.contributionCounts.myDrafts} items
Rejected: ${ctx.contributionCounts.rejected} items
API_BASE: ${ctx.apiBase}
IMPORTANT: ALL create/update operations MUST use /api/v1/contributions/* endpoints.
IMPORTANT: ALWAYS use the question tool to confirm with the user before creating or modifying items.`;
}

// ── Section B: Domain-scoped ───────────────────────────────────────────────

function buildDomainSection(ctx: PageContext): string | null {
  switch (ctx.currentPage) {
    case "business-domain":
      return buildBusinessDomainSection(ctx);
    case "architecture":
      return buildArchitectureSection(ctx);
    case "user-types":
      return buildUserTypesSection(ctx);
    case "governance":
      return buildGovernanceSection(ctx);
    default:
      return null;
  }
}

function buildBusinessDomainSection(ctx: PageContext): string | null {
  if (!ctx.domainModelId) return null;

  const contextList = ctx.boundedContexts?.length
    ? ctx.boundedContexts
        .map((c) => `${c.title} [${c.id}] (${c.subdomainType ?? "unclassified"})`)
        .join(", ")
    : "none yet";

  let section = `== ACTIVE DOMAIN MODEL ==
DOMAIN_MODEL_ID: ${ctx.domainModelId}
Name: ${ctx.domainModelName ?? "unknown"}`;

  if (ctx.domainModelDescription) {
    section += `\nDescription: ${ctx.domainModelDescription}`;
  }

  section += `
Bounded Contexts (${ctx.boundedContextCount ?? 0}): ${contextList}
Aggregates: ${ctx.aggregateCount ?? 0}
Domain Events: ${ctx.domainEventCount ?? 0}
Glossary Terms: ${ctx.glossaryTermCount ?? 0}
Workflows: ${ctx.workflowCount ?? 0}
When creating domain artifacts, use DOMAIN_MODEL_ID above as the parent.`;

  // Focused bounded context (when chat was opened from a specific context card)
  if (ctx.focusedBoundedContext) {
    const fc = ctx.focusedBoundedContext;
    section += `\n\n== FOCUSED BOUNDED CONTEXT ==
ID: ${fc.id}
Title: ${fc.title}
Subdomain Type: ${fc.subdomainType ?? "unclassified"}
Responsibility: ${fc.responsibility}`;
    if (fc.description) {
      section += `\nDescription: ${fc.description}`;
    }
    section += `\nThe user opened the chat from this specific bounded context card.
Help them explore, refine, or discuss this context.`;
  }

  return section;
}

function buildArchitectureSection(ctx: PageContext): string | null {
  const nodeList = ctx.topLevelNodes?.length
    ? ctx.topLevelNodes.map((n) => `${n.name} (${n.nodeType})`).join(", ")
    : "none";

  return `== ACTIVE TAXONOMY ==
SNAPSHOT_ID: ${ctx.snapshotId ?? "none"}
Taxonomy nodes: ${ctx.nodeCount ?? 0}
Capabilities: ${ctx.capabilityCount ?? 0}
Top-level nodes: ${nodeList}`;
}

function buildUserTypesSection(ctx: PageContext): string | null {
  const typeList = ctx.userTypes?.length
    ? ctx.userTypes
        .map((ut) => `${ut.name} [${ut.id}] (${ut.archetype}, ${ut.status})`)
        .join(", ")
    : "none";

  return `== USER TYPES & STORIES ==
User types (${ctx.userTypeCount ?? 0}): ${typeList}
User stories: ${ctx.userStoryCount ?? 0}
Capabilities available: ${ctx.capabilityCount ?? 0}`;
}

function buildGovernanceSection(ctx: PageContext): string | null {
  if (ctx.roadItemCount === undefined) return null;

  const statusBreakdown = ctx.roadsByStatus
    ? Object.entries(ctx.roadsByStatus)
        .map(([s, c]) => `${s}: ${c}`)
        .join(", ")
    : "unknown";

  return `== GOVERNANCE STATE ==
Road items: ${ctx.roadItemCount}
Status breakdown: ${statusBreakdown}`;
}

// ── Section C: Item-scoped ─────────────────────────────────────────────────

function buildItemSection(ctx: ItemContext): string {
  const { item } = ctx;
  let section = `== FOCUSED ITEM ==
Type: ${item.itemType}
ID: ${item.itemId}
Title: ${item.title}
Contribution Status: ${item.contribution.status}
Version: ${item.contribution.version}
`;

  if (item.contribution.submittedBy) {
    section += `Submitted by: ${item.contribution.submittedBy} at ${item.contribution.submittedAt}\n`;
  }
  if (item.contribution.reviewedBy) {
    section += `Reviewed by: ${item.contribution.reviewedBy} at ${item.contribution.reviewedAt}\n`;
  }
  if (item.contribution.reviewFeedback) {
    section += `Review feedback: ${item.contribution.reviewFeedback}\n`;
  }
  if (item.contribution.supersedes) {
    section += `Supersedes: ${item.contribution.supersedes}\n`;
  }

  // Full item data (type-specific fields)
  section += `\nItem Data:\n${JSON.stringify(item.metadata, null, 2)}\n`;

  // Version history
  if (ctx.versionHistory?.length) {
    section += `\nVersion History:\n`;
    for (const v of ctx.versionHistory) {
      section += `- v${v.version}: ${v.status} (${v.createdAt})`;
      if (v.reviewedBy) section += ` reviewed by ${v.reviewedBy}`;
      if (v.reviewFeedback) section += ` — "${v.reviewFeedback}"`;
      section += `\n`;
    }
  }

  return section;
}

// ── Main Builder ───────────────────────────────────────────────────────────

/**
 * Build the full 3-section context preamble wrapped in [CONTEXT]...[/CONTEXT].
 * Returns an empty string if no context is available.
 */
export function buildContributionPreamble(
  universal: UniversalContext,
  pageContext: PageContext,
  focusedItem: ItemContext | null,
): string {
  const sections: string[] = [];

  // Section A: Universal (always present)
  sections.push(buildUniversalSection(universal));

  // Section B: Domain-scoped (present when on a relevant page)
  const domainSection = buildDomainSection(pageContext);
  if (domainSection) {
    sections.push(domainSection);
  }

  // Section C: Item-scoped (present when an item is selected/active)
  if (focusedItem) {
    sections.push(buildItemSection(focusedItem));
  }

  return `[CONTEXT]\n${sections.join("\n\n")}\n[/CONTEXT]\n\n`;
}
