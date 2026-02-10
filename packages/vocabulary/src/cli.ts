#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { writeFile, mkdir } from "fs/promises";
import { glob } from "glob";
import { buildMethodsIndex } from "./builders/methods-index.js";
import { buildObservationsIndex } from "./builders/observations-index.js";
import { buildGovernanceIndex } from "./builders/governance-index.js";
import { parseMethodFile } from "./parsers/method.js";
import { parseObservationFile } from "./parsers/observation.js";
import {
  parseCapabilityFile,
  parsePersonaFile,
  parseUserStoryFile,
  parseUseCaseFile,
  parseRoadItemFile,
  parseAdrFile,
  parseNfrFile,
  parseChangeEntryFile,
  parseBoundedContextFile,
  parseAggregateFile,
  parseValueObjectFile,
  parseDomainEventFile,
} from "./parsers/governance/index.js";
import {
  OUTPUT_DIR,
  METHODS_INDEX_PATH,
  OBSERVATIONS_INDEX_PATH,
  GOVERNANCE_INDEX_PATH,
  GOVERNANCE_ROOT,
  FIELD_GUIDES_ROOT,
  EXTERNAL_FRAMEWORKS_ROOT,
} from "./config.js";
import { governance } from "@foe/schemas";

const program = new Command();

program
  .name("katalyst-vocab")
  .description("Katalyst Vocabulary - manage methods, observations, and ubiquitous language")
  .version("0.1.0");

program
  .command("build")
  .description("Build both methods and observations indices")
  .action(async () => {
    try {
      console.log(chalk.blue("Building Field Guide indices...\n"));

      // Ensure output directory exists
      await mkdir(OUTPUT_DIR, { recursive: true });

      // Build methods index
      const methodsIndex = await buildMethodsIndex();
      const methodsJson = JSON.stringify(methodsIndex, null, 2);
      await writeFile(METHODS_INDEX_PATH, methodsJson);
      const methodsKB = (methodsJson.length / 1024).toFixed(1);
      console.log(chalk.green("✓ Built methods index"));
      console.log(`  - ${methodsIndex.stats.totalMethods} methods indexed`);
      console.log(
        `  - ${Object.keys(methodsIndex.byKeyword).length} unique keywords`,
      );
      console.log(
        `  - ${Object.keys(methodsIndex.byFieldGuide).length} field guides`,
      );
      console.log(
        `  - ${Object.keys(methodsIndex.byFramework).length} frameworks`,
      );
      console.log(`  - Wrote: ${METHODS_INDEX_PATH} (${methodsKB} KB)`);

      // Build observations index
      console.log();
      const observationsIndex = await buildObservationsIndex();
      const obsJson = JSON.stringify(observationsIndex, null, 2);
      await writeFile(OBSERVATIONS_INDEX_PATH, obsJson);
      const obsKB = (obsJson.length / 1024).toFixed(1);
      console.log(chalk.green("✓ Built observations index"));
      console.log(
        `  - ${observationsIndex.stats.totalObservations} observations indexed`,
      );
      console.log(
        `  - ${observationsIndex.stats.byStatus.completed} completed, ${observationsIndex.stats.byStatus["in-progress"]} in progress`,
      );
      console.log(`  - Wrote: ${OBSERVATIONS_INDEX_PATH} (${obsKB} KB)`);

      console.log(chalk.blue("\n✓ Build complete!"));
    } catch (err) {
      console.error(chalk.red("Build failed:"), err);
      process.exit(1);
    }
  });

program
  .command("build:methods")
  .description("Build methods index only")
  .action(async () => {
    try {
      console.log(chalk.blue("Building methods index...\n"));
      await mkdir(OUTPUT_DIR, { recursive: true });
      const index = await buildMethodsIndex();
      const json = JSON.stringify(index, null, 2);
      await writeFile(METHODS_INDEX_PATH, json);
      const kb = (json.length / 1024).toFixed(1);
      console.log(chalk.green("✓ Built methods index"));
      console.log(`  - ${index.stats.totalMethods} methods indexed`);
      console.log(`  - ${Object.keys(index.byKeyword).length} unique keywords`);
      console.log(`  - Wrote: ${METHODS_INDEX_PATH} (${kb} KB)`);
    } catch (err) {
      console.error(chalk.red("Build failed:"), err);
      process.exit(1);
    }
  });

program
  .command("build:observations")
  .description("Build observations index only")
  .action(async () => {
    try {
      console.log(chalk.blue("Building observations index...\n"));
      await mkdir(OUTPUT_DIR, { recursive: true });
      const index = await buildObservationsIndex();
      const json = JSON.stringify(index, null, 2);
      await writeFile(OBSERVATIONS_INDEX_PATH, json);
      const kb = (json.length / 1024).toFixed(1);
      console.log(chalk.green("✓ Built observations index"));
      console.log(`  - ${index.stats.totalObservations} observations indexed`);
      console.log(
        `  - ${index.stats.byStatus.completed} completed, ${index.stats.byStatus["in-progress"]} in progress`,
      );
      console.log(`  - Wrote: ${OBSERVATIONS_INDEX_PATH} (${kb} KB)`);
    } catch (err) {
      console.error(chalk.red("Build failed:"), err);
      process.exit(1);
    }
  });

program
  .command("build:governance")
  .description("Build governance index from delivery-framework artifacts")
  .action(async () => {
    try {
      console.log(chalk.blue("Building governance index...\n"));
      await mkdir(OUTPUT_DIR, { recursive: true });
      const index = await buildGovernanceIndex();
      const json = JSON.stringify(index, null, 2);
      await writeFile(GOVERNANCE_INDEX_PATH, json);
      const kb = (json.length / 1024).toFixed(1);
      console.log(chalk.green("\n✓ Built governance index"));
      console.log(`  - ${index.stats.totalCapabilities} capabilities`);
      console.log(`  - ${index.stats.totalPersonas} personas`);
      console.log(`  - ${index.stats.totalStories} user stories`);
      console.log(`  - ${index.stats.totalUseCases} use cases`);
      console.log(`  - ${index.stats.totalRoadItems} road items`);
      console.log(`  - ${index.stats.totalAdrs} ADRs`);
      console.log(`  - ${index.stats.totalNfrs} NFRs`);
      console.log(`  - ${index.stats.totalChanges} change entries`);
      if (index.stats.totalContexts > 0) {
        console.log(`  - ${index.stats.totalContexts} bounded contexts`);
        console.log(`  - ${index.stats.totalAggregates} aggregates`);
        console.log(`  - ${index.stats.totalValueObjects} value objects`);
        console.log(`  - ${index.stats.totalDomainEvents} domain events`);
      }
      if (!index.stats.referentialIntegrity.valid) {
        console.log(
          chalk.yellow(
            `  - ${index.stats.referentialIntegrity.errors.length} referential integrity warnings`,
          ),
        );
      }
      console.log(`  - Wrote: ${GOVERNANCE_INDEX_PATH} (${kb} KB)`);
    } catch (err) {
      console.error(chalk.red("Governance build failed:"), err);
      process.exit(1);
    }
  });

program
  .command("build:all")
  .description("Build all indices (methods, observations, and governance)")
  .action(async () => {
    try {
      console.log(chalk.blue("Building all indices...\n"));
      await mkdir(OUTPUT_DIR, { recursive: true });

      // Methods
      const methodsIndex = await buildMethodsIndex();
      const methodsJson = JSON.stringify(methodsIndex, null, 2);
      await writeFile(METHODS_INDEX_PATH, methodsJson);
      console.log(
        chalk.green(
          `✓ Methods: ${methodsIndex.stats.totalMethods} indexed (${(methodsJson.length / 1024).toFixed(1)} KB)`,
        ),
      );

      // Observations
      const obsIndex = await buildObservationsIndex();
      const obsJson = JSON.stringify(obsIndex, null, 2);
      await writeFile(OBSERVATIONS_INDEX_PATH, obsJson);
      console.log(
        chalk.green(
          `✓ Observations: ${obsIndex.stats.totalObservations} indexed (${(obsJson.length / 1024).toFixed(1)} KB)`,
        ),
      );

      // Governance
      const govIndex = await buildGovernanceIndex();
      const govJson = JSON.stringify(govIndex, null, 2);
      await writeFile(GOVERNANCE_INDEX_PATH, govJson);
      console.log(
        chalk.green(
          `✓ Governance: ${govIndex.stats.totalRoadItems} roads, ${govIndex.stats.totalCapabilities} capabilities (${(govJson.length / 1024).toFixed(1)} KB)`,
        ),
      );

      console.log(chalk.blue("\n✓ All indices built!"));
    } catch (err) {
      console.error(chalk.red("Build failed:"), err);
      process.exit(1);
    }
  });

program
  .command("stats")
  .description("Print index statistics")
  .action(async () => {
    try {
      const methodsIndex = await buildMethodsIndex();
      const obsIndex = await buildObservationsIndex();

      console.log(chalk.blue("\n=== Field Guide Statistics ===\n"));

      console.log(chalk.bold("Methods:"));
      console.log(`  Total: ${methodsIndex.stats.totalMethods}`);
      console.log(`  By maturity:`);
      for (const [maturity, count] of Object.entries(
        methodsIndex.stats.byMaturity,
      )) {
        console.log(`    ${maturity}: ${count}`);
      }
      console.log(`  By field guide:`);
      for (const [guide, count] of Object.entries(
        methodsIndex.stats.byFieldGuide,
      )) {
        console.log(`    ${guide}: ${count}`);
      }
      console.log(`  By framework:`);
      for (const [framework, count] of Object.entries(
        methodsIndex.stats.byFramework,
      )) {
        console.log(`    ${framework}: ${count}`);
      }

      console.log(chalk.bold("\nObservations:"));
      console.log(`  Total: ${obsIndex.stats.totalObservations}`);
      console.log(`  Internal: ${obsIndex.stats.bySourceType.internal}`);
      console.log(`  External: ${obsIndex.stats.bySourceType.external}`);
      console.log(`  Completed: ${obsIndex.stats.byStatus.completed}`);
      console.log(`  In progress: ${obsIndex.stats.byStatus["in-progress"]}`);
    } catch (err) {
      console.error(chalk.red("Stats failed:"), err);
      process.exit(1);
    }
  });

program
  .command("validate")
  .description("Validate Field Guide frontmatter without building indices")
  .argument("[path]", "Optional specific file to validate")
  .action(async (specificPath?: string) => {
    try {
      console.log(chalk.blue("Validating Field Guide files...\n"));

      const errors: Array<{ file: string; error: string }> = [];
      let validCount = 0;

      if (specificPath) {
        // Validate single file
        try {
          if (specificPath.includes("/methods/")) {
            await parseMethodFile(specificPath);
          } else if (specificPath.includes("/observations/")) {
            await parseObservationFile(specificPath);
          } else {
            throw new Error(
              "Unable to determine file type (method or observation)",
            );
          }
          validCount = 1;
          console.log(chalk.green(`✓ ${specificPath} is valid`));
        } catch (err: unknown) {
          const message =
            err instanceof Error ? (err as Error).message : String(err);
          errors.push({ file: specificPath, error: message });
        }
      } else {
        // Validate all files

        // Method files from field guides
        const fieldGuideMethodFiles = await glob("**/methods/**/*.md", {
          cwd: FIELD_GUIDES_ROOT,
          absolute: true,
          ignore: ["**/node_modules/**"],
        });

        // Method files from external frameworks
        const frameworkMethodFiles = await glob("**/methods/**/*.md", {
          cwd: EXTERNAL_FRAMEWORKS_ROOT,
          absolute: true,
          ignore: ["**/node_modules/**"],
        });

        const allMethodFiles = [
          ...fieldGuideMethodFiles,
          ...frameworkMethodFiles,
        ];

        for (const file of allMethodFiles) {
          try {
            await parseMethodFile(file);
            validCount++;
          } catch (err: unknown) {
            const message =
              err instanceof Error ? (err as Error).message : String(err);
            errors.push({ file, error: message });
          }
        }

        // Observation files
        const obsFiles = await glob("observations/**/*.md", {
          cwd: FIELD_GUIDES_ROOT,
          absolute: true,
          ignore: ["**/node_modules/**"],
        });

        for (const file of obsFiles) {
          try {
            await parseObservationFile(file);
            validCount++;
          } catch (err: unknown) {
            const message =
              err instanceof Error ? (err as Error).message : String(err);
            errors.push({ file, error: message });
          }
        }

        console.log(`Validated ${validCount + errors.length} files\n`);
      }

      // Report results
      if (errors.length === 0) {
        console.log(chalk.green(`✓ All ${validCount} files valid`));
        process.exit(0);
      } else {
        console.log(chalk.green(`✓ ${validCount} valid`));
        console.log(chalk.red(`✗ ${errors.length} invalid\n`));

        console.log(chalk.bold("Errors:"));
        for (const { file, error } of errors) {
          const relPath = file.replace(process.cwd() + "/", "");
          console.log(chalk.red(`\n  ${relPath}:`));
          console.log(`    ${error}`);
        }

        process.exit(1);
      }
    } catch (err) {
      console.error(chalk.red("Validation failed:"), err);
      process.exit(1);
    }
  });

program
  .command("validate:governance")
  .description(
    "Validate governance artifact frontmatter without building index",
  )
  .action(async () => {
    try {
      console.log(chalk.blue("Validating governance artifacts...\n"));

      const errors: Array<{ file: string; error: string }> = [];
      let validCount = 0;

      // Define all artifact types with their glob patterns and parsers
      const artifactTypes: Array<{
        name: string;
        pattern: string;
        parser: (path: string) => Promise<unknown>;
      }> = [
        {
          name: "Capabilities",
          pattern: "capabilities/CAP-*.md",
          parser: parseCapabilityFile,
        },
        {
          name: "Personas",
          pattern: "personas/PER-*.md",
          parser: parsePersonaFile,
        },
        {
          name: "User Stories",
          pattern: "user-stories/US-*.md",
          parser: parseUserStoryFile,
        },
        {
          name: "Use Cases",
          pattern: "use-cases/UC-*.md",
          parser: parseUseCaseFile,
        },
        {
          name: "Road Items",
          pattern: "roads/ROAD-*.md",
          parser: parseRoadItemFile,
        },
        { name: "ADRs", pattern: "adr/ADR-*.md", parser: parseAdrFile },
        { name: "NFRs", pattern: "nfr/NFR-*.md", parser: parseNfrFile },
        {
          name: "Change Entries",
          pattern: "changes/CHANGE-*.md",
          parser: parseChangeEntryFile,
        },
        {
          name: "Bounded Contexts",
          pattern: "ddd/contexts/*.md",
          parser: parseBoundedContextFile,
        },
        {
          name: "Aggregates",
          pattern: "ddd/aggregates/*.md",
          parser: parseAggregateFile,
        },
        {
          name: "Value Objects",
          pattern: "ddd/value-objects/*.md",
          parser: parseValueObjectFile,
        },
        {
          name: "Domain Events",
          pattern: "ddd/events/*.md",
          parser: parseDomainEventFile,
        },
      ];

      for (const { name, pattern, parser } of artifactTypes) {
        const files = await glob(pattern, {
          cwd: GOVERNANCE_ROOT,
          absolute: true,
          ignore: ["**/node_modules/**", "**/index.md", "**/*TEMPLATE*"],
        });

        let typeValid = 0;
        for (const file of files) {
          try {
            await parser(file);
            typeValid++;
            validCount++;
          } catch (err: unknown) {
            const message =
              err instanceof Error ? (err as Error).message : String(err);
            errors.push({ file, error: message });
          }
        }

        if (files.length > 0) {
          const color = typeValid === files.length ? chalk.green : chalk.yellow;
          console.log(color(`  ${name}: ${typeValid}/${files.length} valid`));
        }
      }

      console.log(`\nValidated ${validCount + errors.length} total files\n`);

      if (errors.length === 0) {
        console.log(chalk.green(`✓ All ${validCount} governance files valid`));
        process.exit(0);
      } else {
        console.log(chalk.green(`✓ ${validCount} valid`));
        console.log(chalk.red(`✗ ${errors.length} invalid\n`));

        console.log(chalk.bold("Errors:"));
        for (const { file, error } of errors) {
          const relPath = file.replace(process.cwd() + "/", "");
          console.log(chalk.red(`\n  ${relPath}:`));
          console.log(`    ${error}`);
        }

        process.exit(1);
      }
    } catch (err) {
      console.error(chalk.red("Governance validation failed:"), err);
      process.exit(1);
    }
  });

program
  .command("validate:transitions")
  .description("Validate ROAD item state machine transitions")
  .action(async () => {
    try {
      console.log(chalk.blue("Validating road item state transitions...\n"));

      const files = await glob("roads/ROAD-*.md", {
        cwd: GOVERNANCE_ROOT,
        absolute: true,
        ignore: ["**/node_modules/**", "**/index.md", "**/*TEMPLATE*"],
      });

      const warnings: string[] = [];
      let validCount = 0;

      for (const file of files) {
        try {
          const road = await parseRoadItemFile(file);
          const status = road.status;

          // Check governance completeness against state
          const hasValidatedAdrs = road.governance.adrs.validated;
          const hasBddScenarios = road.governance.bdd.scenarios > 0;
          const bddStatus = road.governance.bdd.status;

          // Validate state consistency with governance data
          if (status === "adr_validated" && !hasValidatedAdrs) {
            warnings.push(
              `${road.id}: status is 'adr_validated' but adrs.validated is false`,
            );
          }
          if (status === "bdd_complete" && !hasBddScenarios) {
            warnings.push(
              `${road.id}: status is 'bdd_complete' but no BDD scenarios defined`,
            );
          }
          const acceptableBddStates: string[] = ["approved", "active"];
          if (
            status === "bdd_complete" &&
            !acceptableBddStates.includes(bddStatus)
          ) {
            warnings.push(
              `${road.id}: status is 'bdd_complete' but BDD status is '${bddStatus}'`,
            );
          }
          if (
            status === "complete" &&
            road.governance.nfrs.applicable.length > 0 &&
            road.governance.nfrs.status === "pending"
          ) {
            warnings.push(
              `${road.id}: status is 'complete' but NFR validation is still pending`,
            );
          }

          // Check that valid next states exist (complete has none)
          const nextStates = governance.getNextStates(status);
          console.log(
            `  ${chalk.bold(road.id)}: ${status} → [${nextStates.join(", ") || "terminal"}]`,
          );
          validCount++;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? (err as Error).message : String(err);
          warnings.push(`Failed to parse: ${message}`);
        }
      }

      console.log(`\nChecked ${validCount} road items\n`);

      if (warnings.length === 0) {
        console.log(chalk.green("✓ All state transitions are consistent"));
      } else {
        console.log(
          chalk.yellow(`⚠ ${warnings.length} transition warnings:\n`),
        );
        for (const warning of warnings) {
          console.log(chalk.yellow(`  - ${warning}`));
        }
      }
    } catch (err) {
      console.error(chalk.red("Transition validation failed:"), err);
      process.exit(1);
    }
  });

program
  .command("coverage:capabilities")
  .description("Report capability coverage across personas, stories, and roads")
  .action(async () => {
    try {
      console.log(chalk.blue("Building capability coverage report...\n"));

      const index = await buildGovernanceIndex();

      console.log(chalk.bold("\n=== Capability Coverage Matrix ===\n"));
      console.log(
        chalk.dim("ID".padEnd(10)) +
          chalk.dim("Title".padEnd(40)) +
          chalk.dim("Personas".padEnd(10)) +
          chalk.dim("Stories".padEnd(10)) +
          chalk.dim("Roads".padEnd(10)) +
          chalk.dim("Coverage"),
      );
      console.log("-".repeat(90));

      let fullyCovered = 0;
      let partiallyCovered = 0;
      let uncovered = 0;

      for (const [capId, cap] of Object.entries(index.capabilities)) {
        const refs = index.byCapability[capId];
        const personaCount = refs?.personas.length ?? 0;
        const storyCount = refs?.stories.length ?? 0;
        const roadCount = refs?.roads.length ?? 0;

        // A capability is "fully covered" if it has at least 1 persona, 1 story, and 1 road
        const hasPersona = personaCount > 0;
        const hasStory = storyCount > 0;
        const hasRoad = roadCount > 0;

        let coverageLabel: string;
        if (hasPersona && hasStory && hasRoad) {
          coverageLabel = chalk.green("Full");
          fullyCovered++;
        } else if (hasPersona || hasStory || hasRoad) {
          coverageLabel = chalk.yellow("Partial");
          partiallyCovered++;
        } else {
          coverageLabel = chalk.red("None");
          uncovered++;
        }

        console.log(
          capId.padEnd(10) +
            cap.title.substring(0, 38).padEnd(40) +
            String(personaCount).padEnd(10) +
            String(storyCount).padEnd(10) +
            String(roadCount).padEnd(10) +
            coverageLabel,
        );
      }

      const total = Object.keys(index.capabilities).length;
      console.log("\n" + "-".repeat(90));
      console.log(chalk.bold(`\nSummary: ${total} capabilities`));
      console.log(
        chalk.green(
          `  Full coverage:    ${fullyCovered} (${total > 0 ? Math.round((fullyCovered / total) * 100) : 0}%)`,
        ),
      );
      console.log(
        chalk.yellow(
          `  Partial coverage: ${partiallyCovered} (${total > 0 ? Math.round((partiallyCovered / total) * 100) : 0}%)`,
        ),
      );
      console.log(
        chalk.red(
          `  No coverage:      ${uncovered} (${total > 0 ? Math.round((uncovered / total) * 100) : 0}%)`,
        ),
      );
    } catch (err) {
      console.error(chalk.red("Coverage report failed:"), err);
      process.exit(1);
    }
  });

program
  .command("coverage:personas")
  .description("Report persona coverage across stories and capabilities")
  .action(async () => {
    try {
      console.log(chalk.blue("Building persona coverage report...\n"));

      const index = await buildGovernanceIndex();

      console.log(chalk.bold("\n=== Persona Coverage Matrix ===\n"));
      console.log(
        chalk.dim("ID".padEnd(10)) +
          chalk.dim("Name".padEnd(30)) +
          chalk.dim("Type".padEnd(12)) +
          chalk.dim("Capabilities".padEnd(14)) +
          chalk.dim("Stories".padEnd(10)) +
          chalk.dim("Status"),
      );
      console.log("-".repeat(86));

      for (const [perId, persona] of Object.entries(index.personas)) {
        const refs = index.byPersona[perId];
        const capCount = refs?.capabilities.length ?? 0;
        const storyCount = refs?.stories.length ?? 0;

        const statusColor =
          persona.status === "approved"
            ? chalk.green
            : persona.status === "draft"
              ? chalk.yellow
              : chalk.red;

        console.log(
          perId.padEnd(10) +
            persona.name.substring(0, 28).padEnd(30) +
            persona.type.padEnd(12) +
            String(capCount).padEnd(14) +
            String(storyCount).padEnd(10) +
            statusColor(persona.status),
        );
      }

      const total = Object.keys(index.personas).length;
      const approved = Object.values(index.personas).filter(
        (p) => p.status === "approved",
      ).length;
      const totalStories = Object.keys(index.userStories).length;
      const storiesWithPersona = new Set(
        Object.values(index.userStories).map((s) => s.persona),
      );

      console.log("\n" + "-".repeat(86));
      console.log(chalk.bold(`\nSummary: ${total} personas`));
      console.log(`  Approved: ${approved}/${total}`);
      console.log(
        `  Active personas (referenced by stories): ${storiesWithPersona.size}`,
      );
      console.log(`  Total stories: ${totalStories}`);
    } catch (err) {
      console.error(chalk.red("Coverage report failed:"), err);
      process.exit(1);
    }
  });

program
  .command("export:cml")
  .description("Export domain model to ContextMapper CML format")
  .requiredOption("-i, --input <path>", "Input domain model JSON file")
  .requiredOption("-o, --output <path>", "Output CML file path")
  .action(async (options) => {
    try {
      console.log(chalk.blue("Exporting domain model to CML format...\n"));

      const { CMLWriter } = await import("./adapters/cml/index.js");
      const { readFile } = await import("fs/promises");

      // Read and parse input
      const inputData = await readFile(options.input, "utf-8");
      const domainModel = JSON.parse(inputData);

      // Generate CML
      const writer = new CMLWriter();
      const cml = writer.write(domainModel);

      // Write output
      await writeFile(options.output, cml, "utf-8");

      console.log(chalk.green(`✓ Exported to ${options.output}`));
      console.log(`  - ${domainModel.boundedContexts?.length ?? 0} bounded contexts`);
      console.log(`  - Output size: ${(cml.length / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error(chalk.red("Export failed:"), err);
      process.exit(1);
    }
  });

program.parse();
