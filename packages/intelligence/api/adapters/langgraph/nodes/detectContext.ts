/**
 * detectContext node — auto-detects repository characteristics.
 *
 * This is the first node in the scan graph. It reads repository files
 * to detect tech stack, monorepo structure, and package layout.
 * It performs deterministic analysis (no LLM needed).
 */
import type { ScanState } from "../graphs/scanState.js";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join, basename } from "path";

export async function detectContext(
  state: ScanState,
): Promise<Partial<ScanState>> {
  const repoPath = state.repositoryPath;
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

  return {
    techStack: techStack.length > 0 ? techStack : ["unknown"],
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
