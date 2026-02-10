import { governance } from "@foe/schemas";
import { readFile } from "node:fs/promises";
import { parseFrontmatter } from "../frontmatter.js";
import { makeGovernancePath } from "../governance-helpers.js";

/**
 * Parse a capability markdown file (CAP-xxx.md).
 *
 * Frontmatter fields map 1:1 to schema (no snake_case conversion needed).
 */
export async function parseCapabilityFile(
  filePath: string,
): Promise<governance.Capability> {
  const fileContent = await readFile(filePath, "utf-8");
  const { data } = parseFrontmatter(fileContent);

  const mapped = {
    id: data.id,
    title: data.title,
    tag: data.tag,
    category: data.category,
    status: data.status,
    description: data.description,
    path: makeGovernancePath(filePath),
  };

  try {
    return governance.CapabilitySchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Capability ${data.id} validation failed in ${filePath}: ${message}`,
    );
  }
}
