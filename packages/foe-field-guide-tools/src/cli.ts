#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { writeFile, mkdir } from 'fs/promises';
import { glob } from 'glob';
import { buildMethodsIndex } from './builders/methods-index.js';
import { buildObservationsIndex } from './builders/observations-index.js';
import { parseMethodFile } from './parsers/method.js';
import { parseObservationFile } from './parsers/observation.js';
import { OUTPUT_DIR, METHODS_INDEX_PATH, OBSERVATIONS_INDEX_PATH, FIELD_GUIDES_ROOT, EXTERNAL_FRAMEWORKS_ROOT } from './config.js';

const program = new Command();

program
  .name('foe-field-guide')
  .description('FOE Field Guide tools - build indices, sync to Neo4j, validate')
  .version('0.1.0');

program
  .command('build')
  .description('Build both methods and observations indices')
  .action(async () => {
    try {
      console.log(chalk.blue('Building Field Guide indices...\n'));
      
      // Ensure output directory exists
      await mkdir(OUTPUT_DIR, { recursive: true });
      
      // Build methods index
      const methodsIndex = await buildMethodsIndex();
      const methodsJson = JSON.stringify(methodsIndex, null, 2);
      await writeFile(METHODS_INDEX_PATH, methodsJson);
      const methodsKB = (methodsJson.length / 1024).toFixed(1);
      console.log(chalk.green('✓ Built methods index'));
      console.log(`  - ${methodsIndex.stats.totalMethods} methods indexed`);
      console.log(`  - ${Object.keys(methodsIndex.byKeyword).length} unique keywords`);
      console.log(`  - ${Object.keys(methodsIndex.byFieldGuide).length} field guides`);
      console.log(`  - ${Object.keys(methodsIndex.byFramework).length} frameworks`);
      console.log(`  - Wrote: ${METHODS_INDEX_PATH} (${methodsKB} KB)`);
      
      // Build observations index
      console.log();
      const observationsIndex = await buildObservationsIndex();
      const obsJson = JSON.stringify(observationsIndex, null, 2);
      await writeFile(OBSERVATIONS_INDEX_PATH, obsJson);
      const obsKB = (obsJson.length / 1024).toFixed(1);
      console.log(chalk.green('✓ Built observations index'));
      console.log(`  - ${observationsIndex.stats.totalObservations} observations indexed`);
      console.log(`  - ${observationsIndex.stats.byStatus.completed} completed, ${observationsIndex.stats.byStatus['in-progress']} in progress`);
      console.log(`  - Wrote: ${OBSERVATIONS_INDEX_PATH} (${obsKB} KB)`);
      
      console.log(chalk.blue('\n✓ Build complete!'));
    } catch (err) {
      console.error(chalk.red('Build failed:'), err);
      process.exit(1);
    }
  });

program
  .command('build:methods')
  .description('Build methods index only')
  .action(async () => {
    try {
      console.log(chalk.blue('Building methods index...\n'));
      await mkdir(OUTPUT_DIR, { recursive: true });
      const index = await buildMethodsIndex();
      const json = JSON.stringify(index, null, 2);
      await writeFile(METHODS_INDEX_PATH, json);
      const kb = (json.length / 1024).toFixed(1);
      console.log(chalk.green('✓ Built methods index'));
      console.log(`  - ${index.stats.totalMethods} methods indexed`);
      console.log(`  - ${Object.keys(index.byKeyword).length} unique keywords`);
      console.log(`  - Wrote: ${METHODS_INDEX_PATH} (${kb} KB)`);
    } catch (err) {
      console.error(chalk.red('Build failed:'), err);
      process.exit(1);
    }
  });

program
  .command('build:observations')
  .description('Build observations index only')
  .action(async () => {
    try {
      console.log(chalk.blue('Building observations index...\n'));
      await mkdir(OUTPUT_DIR, { recursive: true });
      const index = await buildObservationsIndex();
      const json = JSON.stringify(index, null, 2);
      await writeFile(OBSERVATIONS_INDEX_PATH, json);
      const kb = (json.length / 1024).toFixed(1);
      console.log(chalk.green('✓ Built observations index'));
      console.log(`  - ${index.stats.totalObservations} observations indexed`);
      console.log(`  - ${index.stats.byStatus.completed} completed, ${index.stats.byStatus['in-progress']} in progress`);
      console.log(`  - Wrote: ${OBSERVATIONS_INDEX_PATH} (${kb} KB)`);
    } catch (err) {
      console.error(chalk.red('Build failed:'), err);
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('Print index statistics')
  .action(async () => {
    try {
      const methodsIndex = await buildMethodsIndex();
      const obsIndex = await buildObservationsIndex();
      
      console.log(chalk.blue('\n=== Field Guide Statistics ===\n'));
      
      console.log(chalk.bold('Methods:'));
      console.log(`  Total: ${methodsIndex.stats.totalMethods}`);
      console.log(`  By maturity:`);
      for (const [maturity, count] of Object.entries(methodsIndex.stats.byMaturity)) {
        console.log(`    ${maturity}: ${count}`);
      }
      console.log(`  By field guide:`);
      for (const [guide, count] of Object.entries(methodsIndex.stats.byFieldGuide)) {
        console.log(`    ${guide}: ${count}`);
      }
      console.log(`  By framework:`);
      for (const [framework, count] of Object.entries(methodsIndex.stats.byFramework)) {
        console.log(`    ${framework}: ${count}`);
      }
      
      console.log(chalk.bold('\nObservations:'));
      console.log(`  Total: ${obsIndex.stats.totalObservations}`);
      console.log(`  Internal: ${obsIndex.stats.bySourceType.internal}`);
      console.log(`  External: ${obsIndex.stats.bySourceType.external}`);
      console.log(`  Completed: ${obsIndex.stats.byStatus.completed}`);
      console.log(`  In progress: ${obsIndex.stats.byStatus['in-progress']}`);
      
    } catch (err) {
      console.error(chalk.red('Stats failed:'), err);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate Field Guide frontmatter without building indices')
  .argument('[path]', 'Optional specific file to validate')
  .action(async (specificPath?: string) => {
    try {
      console.log(chalk.blue('Validating Field Guide files...\n'));
      
      const errors: Array<{ file: string; error: string }> = [];
      let validCount = 0;
      
      if (specificPath) {
        // Validate single file
        try {
          if (specificPath.includes('/methods/')) {
            await parseMethodFile(specificPath);
          } else if (specificPath.includes('/observations/')) {
            await parseObservationFile(specificPath);
          } else {
            throw new Error('Unable to determine file type (method or observation)');
          }
          validCount = 1;
          console.log(chalk.green(`✓ ${specificPath} is valid`));
        } catch (err: any) {
          errors.push({ file: specificPath, error: err.message });
        }
      } else {
        // Validate all files
        
        // Method files from field guides
        const fieldGuideMethodFiles = await glob('**/methods/**/*.md', { 
          cwd: FIELD_GUIDES_ROOT, 
          absolute: true,
          ignore: ['**/node_modules/**']
        });
        
        // Method files from external frameworks
        const frameworkMethodFiles = await glob('**/methods/**/*.md', { 
          cwd: EXTERNAL_FRAMEWORKS_ROOT, 
          absolute: true,
          ignore: ['**/node_modules/**']
        });
        
        const allMethodFiles = [...fieldGuideMethodFiles, ...frameworkMethodFiles];
        
        for (const file of allMethodFiles) {
          try {
            await parseMethodFile(file);
            validCount++;
          } catch (err: any) {
            errors.push({ file, error: err.message });
          }
        }
        
        // Observation files
        const obsFiles = await glob('observations/**/*.md', { 
          cwd: FIELD_GUIDES_ROOT, 
          absolute: true,
          ignore: ['**/node_modules/**']
        });
        
        for (const file of obsFiles) {
          try {
            await parseObservationFile(file);
            validCount++;
          } catch (err: any) {
            errors.push({ file, error: err.message });
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
        
        console.log(chalk.bold('Errors:'));
        for (const { file, error } of errors) {
          const relPath = file.replace(process.cwd() + '/', '');
          console.log(chalk.red(`\n  ${relPath}:`));
          console.log(`    ${error}`);
        }
        
        process.exit(1);
      }
    } catch (err) {
      console.error(chalk.red('Validation failed:'), err);
      process.exit(1);
    }
  });

program.parse();
