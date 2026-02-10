import { glob } from "glob";
import type { Observation } from "@foe/schemas/field-guide";
import { parseObservationFile } from "../parsers/observation.js";
import { FIELD_GUIDES_ROOT } from "../config.js";

export interface ObservationsIndex {
  version: string;
  generated: string;
  observations: Record<string, Observation>;
  byMethod: Record<string, string[]>;
  bySourceType: Record<string, string[]>;
  byStatus: Record<string, string[]>;
  stats: {
    totalObservations: number;
    bySourceType: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

export async function buildObservationsIndex(): Promise<ObservationsIndex> {
  console.log("Building observations index...");

  const observationFiles = await glob(
    `${FIELD_GUIDES_ROOT}/observations/**/*.md`,
  );
  console.log(`Found ${observationFiles.length} observation files`);

  const observations: Record<string, Observation> = {};
  const errors: Array<{ file: string; error: string }> = [];

  for (const path of observationFiles) {
    try {
      const obs = await parseObservationFile(path);
      observations[obs.observationId] = obs;
    } catch (err) {
      errors.push({
        file: path,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (errors.length > 0) {
    console.warn(`\nWarnings during parsing (${errors.length} files):`);
    errors.forEach(({ file, error }) => {
      console.warn(`  - ${file}: ${error}`);
    });
  }

  console.log(
    `Successfully parsed ${Object.keys(observations).length} observations`,
  );

  // Build reverse indices
  const byMethod: Record<string, string[]> = {};
  const bySourceType: Record<string, string[]> = {};
  const byStatus: Record<string, string[]> = {};

  for (const obs of Object.values(observations)) {
    // Method index
    for (const methodId of obs.methods) {
      if (!byMethod[methodId]) byMethod[methodId] = [];
      byMethod[methodId].push(obs.observationId);
    }

    // Source type index
    if (!bySourceType[obs.sourceType]) bySourceType[obs.sourceType] = [];
    bySourceType[obs.sourceType].push(obs.observationId);

    // Status index
    if (!byStatus[obs.status]) byStatus[obs.status] = [];
    byStatus[obs.status].push(obs.observationId);
  }

  return {
    version: "1.0.0",
    generated: new Date().toISOString(),
    observations,
    byMethod,
    bySourceType,
    byStatus,
    stats: {
      totalObservations: Object.keys(observations).length,
      bySourceType: {
        internal: bySourceType.internal?.length || 0,
        external: bySourceType.external?.length || 0,
      },
      byStatus: {
        "in-progress": byStatus["in-progress"]?.length || 0,
        completed: byStatus.completed?.length || 0,
      },
    },
  };
}
