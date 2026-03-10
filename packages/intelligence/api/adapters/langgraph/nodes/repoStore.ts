/**
 * Repository context store — cross-scan learning via InMemoryStore.
 *
 * Persists discovered repo patterns (tech stack, framework versions,
 * CI provider, monorepo structure, etc.) across scans. The `detectContext`
 * node checks the store first before re-analyzing the repository.
 *
 * Store keys are namespaced by repository path (hashed to a safe key).
 * Each entry has a TTL check — if the cached data is older than
 * `CACHE_TTL_MS`, it's treated as stale and re-analyzed.
 *
 * This avoids re-detecting tech stack, monorepo layout, and package
 * structure on every scan of the same repository, saving time on
 * repeated scans during development.
 */
import { InMemoryStore } from "@langchain/langgraph";
import { createHash } from "crypto";

// ── Types ────────────────────────────────────────────────────────────────────

/** Cached repository context stored across scans */
export interface CachedRepoContext {
  /** Detected tech stack (e.g. ["node", "typescript"]) */
  techStack: string[];
  /** Whether the repo is a monorepo */
  monorepo: boolean;
  /** Package names if monorepo */
  packages: string[];
  /** Timestamp when this context was cached */
  cachedAt: string;
  /** Number of times this repo has been scanned */
  scanCount: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

/** Store namespace for repo context */
const NAMESPACE = "repo-context";

/** Cache TTL: 1 hour. Repos don't change structure often. */
const CACHE_TTL_MS = 60 * 60 * 1000;

// ── Store Instance ───────────────────────────────────────────────────────────

/**
 * Shared InMemoryStore instance for cross-scan learning.
 *
 * This is a singleton — all scans share the same store.
 * The store persists in-memory for the lifetime of the process.
 * For production, consider replacing with a persistent store
 * (e.g. SQLite-backed) to survive restarts.
 */
let sharedStore: InMemoryStore | null = null;

export function getRepoStore(): InMemoryStore {
  if (!sharedStore) {
    sharedStore = new InMemoryStore();
  }
  return sharedStore;
}

/**
 * Reset the shared store (for testing purposes).
 */
export function resetRepoStore(): void {
  sharedStore = null;
}

// ── Store Operations ─────────────────────────────────────────────────────────

/**
 * Create a deterministic store key from a repository path.
 * Uses SHA-256 hash to handle paths with special characters.
 */
function repoKey(repoPath: string): string {
  const hash = createHash("sha256").update(repoPath).digest("hex").slice(0, 16);
  return `repo_${hash}`;
}

/**
 * Get cached context for a repository, if available and fresh.
 *
 * @returns Cached context if found and not stale, null otherwise
 */
export async function getCachedContext(
  store: InMemoryStore,
  repoPath: string,
): Promise<CachedRepoContext | null> {
  try {
    const key = repoKey(repoPath);
    const results = await store.search([NAMESPACE], {
      filter: { key },
      limit: 1,
    });

    if (results.length === 0) return null;

    const cached = results[0].value as unknown as CachedRepoContext;

    // Check TTL
    const cachedTime = new Date(cached.cachedAt).getTime();
    const age = Date.now() - cachedTime;
    if (age > CACHE_TTL_MS) {
      return null; // Stale
    }

    return cached;
  } catch {
    // Store operations should never block scanning
    return null;
  }
}

/**
 * Save detected context to the store for future scans.
 */
export async function saveCachedContext(
  store: InMemoryStore,
  repoPath: string,
  context: Omit<CachedRepoContext, "cachedAt" | "scanCount">,
  previousScanCount = 0,
): Promise<void> {
  try {
    const key = repoKey(repoPath);
    const entry: CachedRepoContext = {
      ...context,
      cachedAt: new Date().toISOString(),
      scanCount: previousScanCount + 1,
    };

    await store.put([NAMESPACE], key, entry);
  } catch {
    // Store operations should never block scanning
  }
}
