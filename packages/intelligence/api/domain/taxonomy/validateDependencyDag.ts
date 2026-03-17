/**
 * Validates competency dependency graphs form a directed acyclic graph (DAG).
 * Uses Kahn's algorithm for topological sorting and cycle detection.
 *
 * Rules:
 * 1. No cycles -- if A depends on B depends on C depends on A, reject
 * 2. No self-references -- a competency cannot depend on itself at any level
 * 3. Referenced competency must exist
 * 4. Level ordering is implicit (basic < intermediate < advanced), not stored
 * 5. Cross-practice-area dependencies are allowed (this is the whole point)
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface CompetencyDependencyEntry {
  competencyId: string;
  requiredLevel: "basic" | "intermediate" | "advanced";
  dependencyType: "practice" | "system";
  notes?: string | null;
}

export interface DagValidationResult {
  valid: boolean;
  cycle?: string[];           // competency IDs forming the cycle
  topologicalOrder: string[]; // valid ordering if no cycle
}

export interface PrerequisiteChainEntry {
  competencyId: string;
  requiredLevel: "basic" | "intermediate" | "advanced";
  dependencyType: "practice" | "system";
  depth: number;              // 0 = direct dependency, 1+ = transitive
}

// ── Kahn's Algorithm (Topological Sort + Cycle Detection) ──────────────────

/**
 * Validates that the competency dependency graph is a DAG.
 *
 * @param competencies - Map of competency ID to its dependency list
 * @returns Validation result with topological order or cycle info
 */
export function validateDependencyDag(
  competencies: Map<string, CompetencyDependencyEntry[]>,
): DagValidationResult {
  // Build adjacency list and in-degree counts
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, Set<string>>();

  // Initialize all known competencies
  for (const id of competencies.keys()) {
    if (!inDegree.has(id)) inDegree.set(id, 0);
    if (!adjacency.has(id)) adjacency.set(id, new Set());
  }

  // Build edges: competencyId -> depends on -> dependency.competencyId
  // Edge direction: dependency -> competency (dependency must come first)
  for (const [compId, deps] of competencies.entries()) {
    for (const dep of deps) {
      // Self-reference check
      if (dep.competencyId === compId) {
        return {
          valid: false,
          cycle: [compId],
          topologicalOrder: [],
        };
      }

      // Ensure dependency node exists in the graph
      if (!inDegree.has(dep.competencyId)) {
        inDegree.set(dep.competencyId, 0);
      }
      if (!adjacency.has(dep.competencyId)) {
        adjacency.set(dep.competencyId, new Set());
      }

      // Edge: dep.competencyId -> compId (dep must come before comp)
      adjacency.get(dep.competencyId)!.add(compId);
      inDegree.set(compId, (inDegree.get(compId) ?? 0) + 1);
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  const topologicalOrder: string[] = [];

  // Start with nodes that have no incoming edges
  for (const [id, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(id);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    topologicalOrder.push(current);

    const neighbors = adjacency.get(current) ?? new Set();
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  const totalNodes = inDegree.size;
  if (topologicalOrder.length !== totalNodes) {
    // Cycle detected -- find the nodes involved
    const cycleNodes = [...inDegree.entries()]
      .filter(([_, degree]) => degree > 0)
      .map(([id]) => id);

    return {
      valid: false,
      cycle: cycleNodes,
      topologicalOrder: [],
    };
  }

  return {
    valid: true,
    topologicalOrder,
  };
}

// ── Prerequisite Chain Resolution ──────────────────────────────────────────

/**
 * Returns the full transitive prerequisite chain for a competency at a given level.
 * Useful for displaying "what must I learn first?" views.
 *
 * @param competencyId - The target competency
 * @param level - The target level
 * @param competencies - Map of all competencies to their dependencies
 * @returns Flattened prerequisite chain sorted by depth (deepest first)
 */
export function getPrerequisiteChain(
  competencyId: string,
  level: "basic" | "intermediate" | "advanced",
  competencies: Map<string, CompetencyDependencyEntry[]>,
): PrerequisiteChainEntry[] {
  const chain: PrerequisiteChainEntry[] = [];
  const visited = new Set<string>();

  function walk(id: string, currentLevel: string, depth: number): void {
    const key = `${id}@${currentLevel}`;
    if (visited.has(key)) return;
    visited.add(key);

    const deps = competencies.get(id) ?? [];
    for (const dep of deps) {
      chain.push({
        competencyId: dep.competencyId,
        requiredLevel: dep.requiredLevel,
        dependencyType: dep.dependencyType,
        depth,
      });
      walk(dep.competencyId, dep.requiredLevel, depth + 1);
    }
  }

  walk(competencyId, level, 0);

  // Sort by depth descending (deepest prerequisites first)
  return chain.sort((a, b) => b.depth - a.depth);
}

/**
 * Validates that all referenced competency IDs exist in the provided map.
 *
 * @param competencies - Map of competency ID to dependencies
 * @returns List of missing competency IDs, or empty array if all refs are valid
 */
export function validateDependencyRefs(
  competencies: Map<string, CompetencyDependencyEntry[]>,
): string[] {
  const knownIds = new Set(competencies.keys());
  const missing: string[] = [];

  for (const deps of competencies.values()) {
    for (const dep of deps) {
      if (!knownIds.has(dep.competencyId)) {
        if (!missing.includes(dep.competencyId)) {
          missing.push(dep.competencyId);
        }
      }
    }
  }

  return missing;
}
