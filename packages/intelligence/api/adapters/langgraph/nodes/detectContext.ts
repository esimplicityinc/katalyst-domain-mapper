/**
 * detectContext node — auto-detects repository characteristics.
 *
 * This is the first node in the scan graph. It reads repository files
 * to detect tech stack, monorepo structure, and package layout.
 * It performs deterministic analysis (no LLM needed).
 *
 * InMemoryStore: When a store is available, the node checks for cached
 * repo characteristics before re-analyzing. If found and fresh (< 1 hour),
 * it skips detection and uses the cached values. After detection, it
 * saves results to the store for future scans.
 */
import type { ScanState } from "../graphs/scanState.js";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, basename } from "path";
import {
  getRepoStore,
  getCachedContext,
  saveCachedContext,
} from "./repoStore.js";

export async function detectContext(
  state: ScanState,
): Promise<Partial<ScanState>> {
  const repoPath = state.repositoryPath;

  // ── Check store for cached context ──────────────────────────────────────
  try {
    const store = getRepoStore();
    const cached = await getCachedContext(store, repoPath);
    if (cached) {
      // Use cached values — skip expensive filesystem analysis.
      // Save again to bump the scan count.
      await saveCachedContext(store, repoPath, {
        techStack: cached.techStack,
        monorepo: cached.monorepo,
        packages: cached.packages,
      }, cached.scanCount);

      return {
        techStack: cached.techStack,
        monorepo: cached.monorepo,
        packages: cached.packages,
      };
    }
  } catch {
    // Store failure is non-fatal — fall through to fresh detection
  }

  // ── Fresh detection ─────────────────────────────────────────────────────
  const techStack: string[] = [];
  let monorepo = false;
  const packages: string[] = [];

  try {
    // Detect tech stack by checking for language-specific files
    const fileChecks: [string, string][] = [
      ["package.json", "node"],
      ["pyproject.toml", "python"],
      ["requirements.txt", "python"],
      ["go.mod", "go"],
      ["Cargo.toml", "rust"],
      ["pom.xml", "java"],
      ["build.gradle", "java"],
      ["Gemfile", "ruby"],
    ];

    for (const [file, lang] of fileChecks) {
      if (existsSync(join(repoPath, file)) && !techStack.includes(lang)) {
        techStack.push(lang);
      }
    }

    // Check for TypeScript specifically
    if (techStack.includes("node")) {
      try {
        const pkgJson = readFileSync(
          join(repoPath, "package.json"),
          "utf-8",
        );
        if (
          pkgJson.includes("typescript") ||
          pkgJson.includes("@types/")
        ) {
          techStack.push("typescript");
        }
      } catch {
        // ignore
      }
    }

    // Detect monorepo patterns
    const monorepoIndicators = [
      "pnpm-workspace.yaml",
      "lerna.json",
      "nx.json",
      "turbo.json",
    ];
    for (const indicator of monorepoIndicators) {
      if (existsSync(join(repoPath, indicator))) {
        monorepo = true;
        break;
      }
    }

    // Also check package.json for workspaces
    if (!monorepo) {
      try {
        const pkgJson = readFileSync(
          join(repoPath, "package.json"),
          "utf-8",
        );
        if (pkgJson.includes('"workspaces"')) {
          monorepo = true;
        }
      } catch {
        // ignore
      }
    }

    // Detect packages in monorepo
    if (monorepo) {
      const packagesDir = join(repoPath, "packages");
      if (existsSync(packagesDir)) {
        try {
          const entries = readdirSync(packagesDir, { withFileTypes: true });
          for (const entry of entries) {
            if (
              entry.isDirectory() &&
              existsSync(join(packagesDir, entry.name, "package.json"))
            ) {
              packages.push(entry.name);
            }
          }
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // Fall back to empty detection — specialists will still attempt analysis
  }

  const detectedTechStack = techStack.length > 0 ? techStack : ["unknown"];

  // ── Save to store for future scans ──────────────────────────────────────
  try {
    const store = getRepoStore();
    await saveCachedContext(store, repoPath, {
      techStack: detectedTechStack,
      monorepo,
      packages,
    });
  } catch {
    // Store failure is non-fatal
  }

  return {
    techStack: detectedTechStack,
    monorepo,
    packages,
  };
}

/**
 * Repository name extraction helper.
 */
export function extractRepoName(repoPath: string): string {
  // Try reading git config for remote origin
  try {
    const gitConfigPath = join(repoPath, ".git", "config");
    if (existsSync(gitConfigPath)) {
      const config = readFileSync(gitConfigPath, "utf-8");
      const urlMatch = config.match(/url\s*=\s*.*\/([\w.-]+?)(?:\.git)?$/m);
      if (urlMatch) return urlMatch[1];
    }
  } catch {
    // ignore
  }

  return basename(repoPath);
}
