/**
 * Agent prompt loader — reads scanner .md files as the single source of truth.
 *
 * The OpenCode agent definitions in packages/assessment/.opencode/agents/
 * contain rich, detailed prompts with scoring rubrics, bash command templates,
 * edge cases, and FOE method references. This loader parses those files so
 * the LangGraph adapter uses the exact same prompts as the OpenCode runtime.
 *
 * Falls back to hardcoded prompts in prompts.ts if the .md files aren't found
 * (e.g. in containers where the assessment package isn't mounted).
 */
import { existsSync, readFileSync, readdirSync } from "fs";
import { join, basename } from "path";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AgentSpec {
  /** Short name derived from filename, e.g. "ci", "tests", "arch" */
  name: string;
  /** Full markdown body (everything after the YAML frontmatter) */
  systemPrompt: string;
  /** LLM temperature from frontmatter (default 0.2) */
  temperature: number;
  /** Agent description from frontmatter */
  description: string;
  /** Tool permissions from frontmatter */
  toolPermissions: {
    bash: boolean;
    glob: boolean;
    grep: boolean;
    read: boolean;
    write: boolean;
    edit: boolean;
  };
}

/** Map of specialist name → AgentSpec */
export type AgentSpecs = Map<string, AgentSpec>;

// ── Frontmatter Parser ───────────────────────────────────────────────────────

interface RawFrontmatter {
  description?: string;
  mode?: string;
  temperature?: number;
  tools?: Record<string, boolean>;
}

/**
 * Parse YAML-like frontmatter from an agent .md file.
 * We use a simple parser to avoid adding a YAML dependency.
 */
function parseFrontmatter(content: string): {
  frontmatter: RawFrontmatter;
  body: string;
} {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const yamlBlock = match[1];
  const body = match[2].trim();

  // Simple YAML parser for the flat structure we know these files have
  const frontmatter: RawFrontmatter = {};

  // Extract description (multiline with | pipe)
  const descMatch = yamlBlock.match(
    /description:\s*\|\s*\n((?:\s{2,}.*\n?)*)/,
  );
  if (descMatch) {
    frontmatter.description = descMatch[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" ");
  }

  // Extract temperature
  const tempMatch = yamlBlock.match(/temperature:\s*([\d.]+)/);
  if (tempMatch) {
    frontmatter.temperature = parseFloat(tempMatch[1]);
  }

  // Extract tools block
  const toolsMatch = yamlBlock.match(
    /tools:\s*\n((?:\s+\w+:\s*(?:true|false)\s*\n?)*)/,
  );
  if (toolsMatch) {
    const tools: Record<string, boolean> = {};
    const toolLines = toolsMatch[1].matchAll(/(\w+):\s*(true|false)/g);
    for (const m of toolLines) {
      tools[m[1]] = m[2] === "true";
    }
    frontmatter.tools = tools;
  }

  return { frontmatter, body };
}

// ── Agent Name Mapping ───────────────────────────────────────────────────────

/** Map filename → specialist dimension key used in the scan graph */
const FILENAME_TO_DIMENSION: Record<string, string> = {
  "foe-scanner-ci.md": "ci",
  "foe-scanner-tests.md": "tests",
  "foe-scanner-arch.md": "arch",
  "foe-scanner-domain.md": "domain",
  "foe-scanner-docs.md": "docs",
  "foe-scanner-container.md": "container",
};

// ── Default Search Paths ─────────────────────────────────────────────────────

/** Directories to search for agent .md files, in order of preference */
function getSearchPaths(): string[] {
  const paths: string[] = [];

  // 1. Explicit env var (set in Dockerfile)
  if (process.env.SCANNER_AGENTS_DIR) {
    paths.push(process.env.SCANNER_AGENTS_DIR);
  }

  // 2. Container paths
  paths.push("/app/agents/scanner");

  // 3. Relative to workspace root (dev mode)
  // From: packages/intelligence/api/adapters/langgraph/nodes/promptLoader.ts
  // To:   packages/assessment/.opencode/agents/
  const devPath = join(
    import.meta.dirname ?? __dirname,
    "../../../../../assessment/.opencode/agents",
  );
  paths.push(devPath);

  // 4. Alternative dev path (from project root)
  paths.push(
    join(process.cwd(), "packages/assessment/.opencode/agents"),
  );

  return paths;
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Load scanner agent specifications from .md files.
 *
 * Searches multiple directories for foe-scanner-*.md files and parses
 * them into AgentSpec objects. Returns a Map keyed by specialist name.
 *
 * @param agentsDir - Explicit directory to load from (overrides search paths)
 * @returns Map of specialist name → AgentSpec, or empty Map if no files found
 */
export function loadAgentSpecs(agentsDir?: string): AgentSpecs {
  const specs: AgentSpecs = new Map();

  const dirsToSearch = agentsDir ? [agentsDir] : getSearchPaths();

  for (const dir of dirsToSearch) {
    if (!existsSync(dir)) continue;

    let files: string[];
    try {
      files = readdirSync(dir).filter(
        (f) => f.startsWith("foe-scanner-") && f.endsWith(".md"),
      );
    } catch {
      continue;
    }

    if (files.length === 0) continue;

    for (const file of files) {
      const dimension = FILENAME_TO_DIMENSION[file];
      if (!dimension) continue;

      try {
        const content = readFileSync(join(dir, file), "utf-8");
        const { frontmatter, body } = parseFrontmatter(content);

        specs.set(dimension, {
          name: dimension,
          systemPrompt: body,
          temperature: frontmatter.temperature ?? 0.2,
          description: frontmatter.description ?? "",
          toolPermissions: {
            bash: frontmatter.tools?.bash ?? false,
            glob: frontmatter.tools?.glob ?? false,
            grep: frontmatter.tools?.grep ?? false,
            read: frontmatter.tools?.read ?? false,
            write: frontmatter.tools?.write ?? false,
            edit: frontmatter.tools?.edit ?? false,
          },
        });
      } catch {
        // Skip files that can't be read/parsed
      }
    }

    // Found files in this directory, stop searching
    if (specs.size > 0) {
      return specs;
    }
  }

  return specs;
}

/**
 * Get the prompt for a specific specialist dimension.
 *
 * Tries loaded specs first, falls back to the provided default prompt.
 *
 * @param specs - Loaded agent specs (may be empty)
 * @param dimension - Specialist dimension key (e.g. "ci", "tests")
 * @param fallbackPrompt - Hardcoded fallback prompt from prompts.ts
 * @returns The system prompt string to use
 */
export function getSpecialistPrompt(
  specs: AgentSpecs,
  dimension: string,
  fallbackPrompt: string,
): string {
  const spec = specs.get(dimension);
  return spec?.systemPrompt ?? fallbackPrompt;
}

/**
 * Get the temperature for a specific specialist dimension.
 *
 * @param specs - Loaded agent specs (may be empty)
 * @param dimension - Specialist dimension key
 * @param fallback - Default temperature (default 0.2)
 */
export function getSpecialistTemperature(
  specs: AgentSpecs,
  dimension: string,
  fallback = 0.2,
): number {
  const spec = specs.get(dimension);
  return spec?.temperature ?? fallback;
}
