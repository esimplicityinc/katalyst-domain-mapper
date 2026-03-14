import { taxonomy } from "@foe/schemas";
import { readFile } from "node:fs/promises";
import { parseFrontmatter } from "../frontmatter.js";
import { makeGovernancePath } from "../governance-helpers.js";

/**
 * Parse a user type markdown file (UT-xxx.md).
 *
 * Maps snake_case frontmatter fields to camelCase schema fields:
 *   pain_points → painPoints
 *   typical_capabilities → typicalCapabilities
 *   technical_profile → technicalProfile (with nested mapping)
 *   related_stories → relatedStories
 *   related_user_types → relatedUserTypes
 *   validated_by → validatedBy
 */
export async function parseUserTypeFile(
  filePath: string,
): Promise<taxonomy.UserTypeExt> {
  const fileContent = await readFile(filePath, "utf-8");
  const { data } = parseFrontmatter(fileContent);

  const mapped = {
    id: data.id,
    title: data.title,
    tag: data.tag,
    type: data.type,
    status: data.status,
    archetype: data.archetype,
    description: data.description,
    goals: data.goals,
    painPoints: data.pain_points,
    behaviors: data.behaviors,
    typicalCapabilities: data.typical_capabilities,
    technicalProfile: data.technical_profile
      ? {
          skillLevel: data.technical_profile.skill_level,
          integrationType: data.technical_profile.integration_type,
          frequency: data.technical_profile.frequency,
        }
      : undefined,
    relatedStories: data.related_stories,
    relatedUserTypes: data.related_user_types,
    created: data.created,
    updated: data.updated,
    validatedBy: data.validated_by,
    path: makeGovernancePath(filePath),
  };

  try {
    return taxonomy.UserTypeExtSchema.parse(mapped);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `User type ${data.id} validation failed in ${filePath}: ${message}`,
    );
  }
}
