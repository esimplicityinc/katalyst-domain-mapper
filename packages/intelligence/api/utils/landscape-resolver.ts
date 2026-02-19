/**
 * Landscape Resolver
 * 
 * Utility for resolving domain event consumedBy references to bounded contexts
 * and inferring unknown systems from unresolved references.
 */

import type {
  ResolvedContext,
  ResolvedConsumer,
  InferredSystem,
  ContextType,
} from "../types/landscape.js";

export interface ContextLookup {
  bySlug: Map<string, ResolvedContext>;
  byId: Map<string, ResolvedContext>;
}

/**
 * Resolve consumedBy references to actual contexts
 */
export function resolveEventConsumers(
  consumedBy: string[],
  contextLookup: ContextLookup
): {
  resolved: ResolvedConsumer[];
  unresolved: string[];
} {
  const resolved: ResolvedConsumer[] = [];
  const unresolved: string[] = [];

  for (const ref of consumedBy) {
    const context = contextLookup.bySlug.get(ref);
    
    if (context) {
      resolved.push({
        slug: ref,
        contextId: context.id,
        contextType: context.contextType,
        title: context.title,
      });
    } else {
      unresolved.push(ref);
    }
  }

  return { resolved, unresolved };
}

/**
 * Infer unknown systems from all unresolved event references
 */
export function inferUnknownSystems(
  events: Array<{ id: string; consumedBy: string[] }>,
  contextLookup: ContextLookup
): InferredSystem[] {
  const unknownMap = new Map<string, string[]>();

  for (const event of events) {
    for (const ref of event.consumedBy) {
      if (!contextLookup.bySlug.has(ref)) {
        const existing = unknownMap.get(ref) || [];
        existing.push(event.id);
        unknownMap.set(ref, existing);
      }
    }
  }

  return Array.from(unknownMap.entries()).map(([slug, inferredFrom]) => ({
    slug,
    inferredFrom,
    contextType: "unknown" as const,
  }));
}

/**
 * Build context lookup maps from bounded contexts
 */
export function buildContextLookup(contexts: ResolvedContext[]): ContextLookup {
  const bySlug = new Map<string, ResolvedContext>();
  const byId = new Map<string, ResolvedContext>();

  for (const context of contexts) {
    bySlug.set(context.slug, context);
    byId.set(context.id, context);
  }

  return { bySlug, byId };
}

/**
 * Map bounded context to system node via taxonomy
 */
export function mapContextToSystem(
  context: ResolvedContext,
  taxonomyNodeMap: Map<string, string> // node name -> system FQTN
): string | undefined {
  if (!context.taxonomyNode) {
    return undefined;
  }

  return taxonomyNodeMap.get(context.taxonomyNode);
}

/**
 * Build taxonomy node to system FQTN map (for grouping contexts by system)
 */
export function buildTaxonomySystemMap(
  nodes: Array<{ name: string; fqtn: string; nodeType: string }>
): Map<string, string> {
  const map = new Map<string, string>();

  for (const node of nodes) {
    // Extract system from FQTN (first component)
    // e.g., "scanner.intelligence.katalyst" -> "katalyst"
    const parts = node.fqtn.split(".");
    const systemFqtn = parts[parts.length - 1]; // Last part is the root system
    
    map.set(node.name, systemFqtn);
  }

  return map;
}
