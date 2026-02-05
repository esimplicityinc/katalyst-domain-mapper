import type { Observation } from '@foe/schemas/field-guide';
import { ObservationSchema } from '@foe/schemas/field-guide';
import { readFile } from 'node:fs/promises';
import { 
  parseFrontmatter,
  makeRelativePath,
} from './frontmatter.js';

/**
 * Observation frontmatter shape (before validation)
 */
interface ObservationFrontmatter {
  observationId: string;
  title: string;
  status: 'in-progress' | 'completed';
  source_type: 'internal' | 'external';
  source?: {
    authors?: string[];
    organization?: string;
    year?: number;
    url: string;
    publicationTitle?: string;
  };
  methods?: string[];
  sidebar_position?: number;
  dateDocumented?: string;
  observers?: string[];
}

/**
 * Parse an observation markdown file
 */
export async function parseObservationFile(filePath: string): Promise<Observation> {
  const fileContent = await readFile(filePath, 'utf-8');
  const { data } = parseFrontmatter(fileContent);
  
  // Build observation object
  const observation: Partial<Observation> = {
    observationId: data.observationId,
    title: data.title,
    status: data.status,
    sourceType: data.source_type,
    source: data.source,
    methods: data.methods as string[] | undefined,
    path: makeRelativePath(filePath),
    sidebarPosition: data.sidebar_position,
    dateDocumented: data.dateDocumented,
    observers: data.observers,
  };
  
  // Validate against schema
  try {
    return ObservationSchema.parse(observation);
  } catch (err: any) {
    throw new Error(`Observation ${data.observationId} validation failed in ${filePath}: ${err.message}`);
  }
}
