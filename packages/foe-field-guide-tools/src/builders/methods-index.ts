import { glob } from 'glob';
import type { Method, MethodMaturity } from '@foe/schemas/field-guide';
import type { MethodsIndex } from '@foe/schemas/field-guide';
import { parseMethodFile } from '../parsers/method.js';
import { FIELD_GUIDES_ROOT, EXTERNAL_FRAMEWORKS_ROOT } from '../config.js';

/**
 * Build the complete methods index
 */
export async function buildMethodsIndex(): Promise<MethodsIndex> {
  const startTime = Date.now();
  
  console.log('Building methods index...');
  
  // Find all method files
  const fieldGuideMethods = await glob(`${FIELD_GUIDES_ROOT}/*/methods/**/*.md`);
  const frameworkMethods = await glob(`${EXTERNAL_FRAMEWORKS_ROOT}/*/methods/*.md`);
  
  const allMethodFiles = [
    ...fieldGuideMethods.map(p => ({ path: p, source: 'field-guide' as const })),
    ...frameworkMethods.map(p => ({ path: p, source: 'framework' as const })),
  ];
  
  console.log(`Found ${allMethodFiles.length} method files (${fieldGuideMethods.length} field guide + ${frameworkMethods.length} framework)`);
  
  // Parse all method files
  const methods: Record<string, Method> = {};
  const errors: Array<{ file: string; error: string }> = [];
  
  for (const { path, source } of allMethodFiles) {
    try {
      const method = await parseMethodFile(path);
      methods[method.methodId] = method;
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
  
  console.log(`Successfully parsed ${Object.keys(methods).length} methods`);
  
  // Build reverse indices
  const byKeyword: Record<string, string[]> = {};
  const byFieldGuide: Record<string, string[]> = {};
  const byFramework: Record<string, string[]> = {};
  const byObservation: Record<string, string[]> = {};
  
  for (const method of Object.values(methods)) {
    // Keyword index
    if (method.keywords) {
      for (const keyword of method.keywords) {
        if (!byKeyword[keyword]) byKeyword[keyword] = [];
        byKeyword[keyword].push(method.methodId);
      }
    }
    
    // Field guide index
    if (method.fieldGuide) {
      if (!byFieldGuide[method.fieldGuide]) byFieldGuide[method.fieldGuide] = [];
      byFieldGuide[method.fieldGuide].push(method.methodId);
    }
    
    // Framework index
    if (method.external) {
      const fw = method.external.framework;
      if (!byFramework[fw]) byFramework[fw] = [];
      byFramework[fw].push(method.methodId);
    }
    
    // Observation index
    if (method.observations) {
      for (const obsId of method.observations) {
        if (!byObservation[obsId]) byObservation[obsId] = [];
        byObservation[obsId].push(method.methodId);
      }
    }
  }
  
  // Calculate stats
  const maturityCounts: Record<MethodMaturity, number> = {
    hypothesized: 0,
    observing: 0,
    validated: 0,
    proven: 0,
  };
  
  for (const method of Object.values(methods)) {
    const maturity = method.foeMaturity || method.maturity;
    maturityCounts[maturity]++;
  }
  
  const fieldGuideCounts: Record<string, number> = {};
  for (const [guide, methodIds] of Object.entries(byFieldGuide)) {
    fieldGuideCounts[guide] = methodIds.length;
  }
  
  const frameworkCounts: Record<string, number> = {};
  for (const [framework, methodIds] of Object.entries(byFramework)) {
    frameworkCounts[framework] = methodIds.length;
  }
  
  const index: MethodsIndex = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    methods,
    byKeyword,
    byFieldGuide,
    byFramework,
    byObservation,
    stats: {
      totalMethods: Object.keys(methods).length,
      byMaturity: maturityCounts,
      byFieldGuide: fieldGuideCounts,
      byFramework: frameworkCounts,
    },
  };
  
  const duration = Date.now() - startTime;
  console.log(`\nIndex built in ${duration}ms`);
  console.log(`Total methods: ${index.stats.totalMethods}`);
  console.log(`Unique keywords: ${Object.keys(byKeyword).length}`);
  console.log(`Field guides: ${Object.keys(byFieldGuide).length}`);
  console.log(`Frameworks: ${Object.keys(byFramework).length}`);
  
  return index;
}
