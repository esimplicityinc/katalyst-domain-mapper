import { governance } from "@foe/schemas";
import { readFile } from "node:fs/promises";
import { parseFrontmatter } from "../frontmatter.js";
import { makeGovernancePath } from "../governance-helpers.js";

/**
 * Parse an aggregate markdown file (ddd/aggregates/<slug>.md).
 *
 * Maps snake_case frontmatter fields to camelCase schema fields:
 *   root_entity → rootEntity
 *   value_objects → valueObjects
 *   source_file → sourceFile
 *
 * Invariants may already be objects from YAML parsing (description + enforced + enforcementLocation).
 */
export async function parseAggregateFile(
  filePath: string,
): Promise<governance.Aggregate> {
  const fileContent = await readFile(filePath, "utf-8");
  const { data } = parseFrontmatter(fileContent);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const mapped = {
    slug: data.slug,
    title: data.title,
    context: data.context,
    rootEntity: data.root_entity,
    entities: data.entities,
    valueObjects: data.value_objects,
    events: data.events,
    invariants: (data.invariants || []).map((inv: any) => ({
      description:
        inv.description || (typeof inv === "string" ? inv : String(inv)),
      enforced: inv.enforced ?? false,
      enforcementLocation: inv.enforcement_location || inv.enforcementLocation,
    })),
    commands: data.commands,
    sourceFile: data.source_file,
    status: data.status,
    path: makeGovernancePath(filePath),
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  try {
    return governance.AggregateSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Aggregate ${data.slug} validation failed in ${filePath}: ${message}`,
    );
  }
}
