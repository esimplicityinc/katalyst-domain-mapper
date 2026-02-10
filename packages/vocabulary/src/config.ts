import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Determine project root (3 levels up from this file: src -> foe-field-guide-tools -> packages -> root)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PROJECT_ROOT = join(__dirname, "..", "..", "..");

// Documentation paths
export const DOCS_ROOT = join(PROJECT_ROOT, "docs", "docs");
export const FIELD_GUIDES_ROOT = join(DOCS_ROOT, "field-guides");
export const EXTERNAL_FRAMEWORKS_ROOT = join(DOCS_ROOT, "external-frameworks");

// Output paths
export const OUTPUT_DIR = join(
  PROJECT_ROOT,
  "packages",
  "foe-field-guide-tools",
  "dist",
);
export const METHODS_INDEX_PATH = join(OUTPUT_DIR, "methods-index.json");
export const OBSERVATIONS_INDEX_PATH = join(
  OUTPUT_DIR,
  "observations-index.json",
);

// Keyword extraction config
export const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "will",
  "with",
  "the",
  "this",
  "but",
  "they",
  "have",
  "had",
  "what",
  "when",
  "where",
  "who",
  "which",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "than",
  "too",
  "very",
  "can",
  "may",
  "also",
  "only",
]);

// Governance documentation paths
export const GOVERNANCE_ROOT =
  process.env.FOE_GOVERNANCE_ROOT ||
  join(PROJECT_ROOT, "packages", "delivery-framework");

// Governance output
export const GOVERNANCE_INDEX_PATH = join(OUTPUT_DIR, "governance-index.json");

// Neo4j configuration (optional)
export const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687";
export const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
export const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "password";
