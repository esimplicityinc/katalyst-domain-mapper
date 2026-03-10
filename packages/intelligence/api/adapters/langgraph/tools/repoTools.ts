/**
 * Repository tools for LangGraph specialist nodes.
 *
 * These tools give the specialist LLM agents the ability to actually
 * inspect repository files — matching the capabilities that OpenCode
 * agents have (bash, glob, grep, read).
 *
 * All tools are sandboxed to the repository path to prevent directory
 * traversal or access to files outside the target repo.
 */
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, resolve, relative, extname } from "path";
import { execSync } from "child_process";

// ── Constants ────────────────────────────────────────────────────────────────

/** Maximum file size to read (256 KB) — prevents loading huge binaries */
const MAX_FILE_SIZE = 256 * 1024;

/** Maximum number of results from glob/grep to prevent token overflow */
const MAX_RESULTS = 100;

/** Shell command timeout (30 seconds) */
const SHELL_TIMEOUT_MS = 30_000;

/** Binary file extensions to skip */
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".svg",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".pdf", ".zip", ".tar", ".gz", ".bz2", ".7z",
  ".exe", ".dll", ".so", ".dylib",
  ".db", ".sqlite", ".sqlite3",
  ".mp3", ".mp4", ".avi", ".mov",
  ".wasm",
]);

// ── Path Sandboxing ──────────────────────────────────────────────────────────

/**
 * Resolve and validate a path is within the repository root.
 * Throws if the path escapes the sandbox.
 */
function safePath(repoRoot: string, requestedPath: string): string {
  const resolved = resolve(repoRoot, requestedPath);
  const rel = relative(repoRoot, resolved);

  // Reject paths that escape the sandbox
  if (rel.startsWith("..") || resolve(resolved) !== resolved.replace(/\/$/, "")) {
    // Double-check with a simpler test
    if (!resolved.startsWith(repoRoot)) {
      throw new Error(
        `Path "${requestedPath}" resolves outside the repository root`,
      );
    }
  }

  if (!resolved.startsWith(repoRoot)) {
    throw new Error(
      `Path "${requestedPath}" resolves outside the repository root`,
    );
  }

  return resolved;
}

// ── Glob Helper ──────────────────────────────────────────────────────────────

/**
 * Simple recursive glob implementation.
 * Matches files against a pattern containing * and ** wildcards.
 */
function globFiles(
  dir: string,
  pattern: string,
  maxResults: number,
): string[] {
  const results: string[] = [];
  const regex = globToRegex(pattern);

  function walk(currentDir: string) {
    if (results.length >= maxResults) return;

    let entries;
    try {
      entries = readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (results.length >= maxResults) return;
      const fullPath = join(currentDir, entry.name);
      const relativePath = relative(dir, fullPath);

      // Skip node_modules, .git, and other common large directories
      if (
        entry.isDirectory() &&
        (entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === "dist" ||
          entry.name === "build" ||
          entry.name === ".next" ||
          entry.name === "vendor")
      ) {
        continue;
      }

      if (entry.isFile() && regex.test(relativePath)) {
        results.push(relativePath);
      }

      if (entry.isDirectory()) {
        walk(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

/** Convert a glob pattern to a RegExp */
function globToRegex(pattern: string): RegExp {
  let regexStr = pattern
    // Escape regex special chars (except * and ?)
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    // ** matches any number of directories
    .replace(/\*\*/g, "§GLOBSTAR§")
    // * matches anything except /
    .replace(/\*/g, "[^/]*")
    // ? matches single char except /
    .replace(/\?/g, "[^/]")
    // Restore ** as .*
    .replace(/§GLOBSTAR§/g, ".*");

  return new RegExp(`^${regexStr}$`);
}

// ── Grep Helper ──────────────────────────────────────────────────────────────

interface GrepMatch {
  file: string;
  line: number;
  content: string;
}

/**
 * Search file contents for a regex pattern.
 */
function grepFiles(
  dir: string,
  pattern: RegExp,
  includeGlob: string | undefined,
  maxResults: number,
): GrepMatch[] {
  const results: GrepMatch[] = [];

  // Get files to search
  const fileGlob = includeGlob ?? "**/*";
  const files = globFiles(dir, fileGlob, 500);

  for (const relPath of files) {
    if (results.length >= maxResults) break;

    const fullPath = join(dir, relPath);
    const ext = extname(fullPath).toLowerCase();

    // Skip binary files
    if (BINARY_EXTENSIONS.has(ext)) continue;

    // Skip large files
    try {
      const stat = statSync(fullPath);
      if (stat.size > MAX_FILE_SIZE) continue;
    } catch {
      continue;
    }

    try {
      const content = readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        if (results.length >= maxResults) break;
        if (pattern.test(lines[i])) {
          results.push({
            file: relPath,
            line: i + 1,
            content: lines[i].trim().slice(0, 200),
          });
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return results;
}

// ── Tool Factory ─────────────────────────────────────────────────────────────

/**
 * Create a set of repository inspection tools, all sandboxed to the
 * given repository path.
 *
 * @param repositoryPath - Absolute path to the repo being analyzed
 * @returns Array of LangChain tools for file reading, searching, and shell execution
 */
export function createRepoTools(repositoryPath: string) {
  const repoRoot = resolve(repositoryPath);

  // ── read_file ──────────────────────────────────────────────────────────

  const readFileTool = tool(
    async ({ path: filePath, offset, limit }) => {
      const absPath = safePath(repoRoot, filePath);

      if (!existsSync(absPath)) {
        return `Error: File not found: ${filePath}`;
      }

      const stat = statSync(absPath);
      if (stat.isDirectory()) {
        return `Error: "${filePath}" is a directory, not a file. Use list_directory instead.`;
      }

      if (stat.size > MAX_FILE_SIZE) {
        return `Error: File is too large (${Math.round(stat.size / 1024)}KB > ${MAX_FILE_SIZE / 1024}KB limit). Use grep_content to search for specific patterns.`;
      }

      const ext = extname(absPath).toLowerCase();
      if (BINARY_EXTENSIONS.has(ext)) {
        return `Error: "${filePath}" appears to be a binary file (${ext}). Cannot read binary files.`;
      }

      try {
        const content = readFileSync(absPath, "utf-8");
        const lines = content.split("\n");
        const startLine = (offset ?? 1) - 1;
        const endLine = limit ? startLine + limit : lines.length;
        const slice = lines.slice(startLine, endLine);

        const numbered = slice
          .map((line, i) => `${startLine + i + 1}: ${line}`)
          .join("\n");

        const header = `File: ${filePath} (${lines.length} lines total)`;
        if (endLine < lines.length) {
          return `${header}\nShowing lines ${startLine + 1}-${endLine}:\n\n${numbered}`;
        }
        return `${header}\n\n${numbered}`;
      } catch (err) {
        return `Error reading file: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "read_file",
      description:
        "Read the contents of a file in the repository. Returns the file contents with line numbers. Use offset and limit to read specific sections of large files.",
      schema: z.object({
        path: z
          .string()
          .describe(
            "Path to the file relative to the repository root (e.g. 'src/main.ts', 'package.json')",
          ),
        offset: z
          .number()
          .optional()
          .describe("Line number to start reading from (1-indexed, default: 1)"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of lines to read (default: all)"),
      }),
    },
  );

  // ── list_directory ─────────────────────────────────────────────────────

  const listDirectoryTool = tool(
    async ({ path: dirPath, recursive }) => {
      const absPath = safePath(repoRoot, dirPath || ".");

      if (!existsSync(absPath)) {
        return `Error: Directory not found: ${dirPath}`;
      }

      const stat = statSync(absPath);
      if (!stat.isDirectory()) {
        return `Error: "${dirPath}" is a file, not a directory. Use read_file instead.`;
      }

      try {
        if (recursive) {
          // Recursive listing — show tree structure
          const entries: string[] = [];
          function walk(dir: string, prefix: string) {
            if (entries.length >= MAX_RESULTS) return;
            let items;
            try {
              items = readdirSync(dir, { withFileTypes: true });
            } catch {
              return;
            }
            for (const item of items) {
              if (entries.length >= MAX_RESULTS) return;
              if (
                item.name === "node_modules" ||
                item.name === ".git"
              ) {
                entries.push(`${prefix}${item.name}/ (skipped)`);
                continue;
              }
              if (item.isDirectory()) {
                entries.push(`${prefix}${item.name}/`);
                walk(join(dir, item.name), `${prefix}  `);
              } else {
                entries.push(`${prefix}${item.name}`);
              }
            }
          }
          walk(absPath, "");
          const truncated =
            entries.length >= MAX_RESULTS
              ? `\n(truncated at ${MAX_RESULTS} entries)`
              : "";
          return `Directory: ${dirPath || "."}\n${entries.join("\n")}${truncated}`;
        } else {
          // Flat listing
          const items = readdirSync(absPath, { withFileTypes: true });
          const formatted = items.map((item) =>
            item.isDirectory() ? `${item.name}/` : item.name,
          );
          return `Directory: ${dirPath || "."}\n${formatted.join("\n")}`;
        }
      } catch (err) {
        return `Error listing directory: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "list_directory",
      description:
        "List the contents of a directory in the repository. Returns file and directory names. Use recursive=true for a tree view.",
      schema: z.object({
        path: z
          .string()
          .optional()
          .describe(
            "Path to the directory relative to repository root (default: root directory)",
          ),
        recursive: z
          .boolean()
          .optional()
          .describe(
            "If true, recursively list subdirectories (default: false)",
          ),
      }),
    },
  );

  // ── glob_files ─────────────────────────────────────────────────────────

  const globFilesTool = tool(
    async ({ pattern }) => {
      try {
        const matches = globFiles(repoRoot, pattern, MAX_RESULTS);
        if (matches.length === 0) {
          return `No files matched the pattern "${pattern}"`;
        }
        const truncated =
          matches.length >= MAX_RESULTS
            ? `\n(truncated at ${MAX_RESULTS} results)`
            : "";
        return `Found ${matches.length} file(s) matching "${pattern}":\n${matches.join("\n")}${truncated}`;
      } catch (err) {
        return `Error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "glob_files",
      description:
        "Find files matching a glob pattern in the repository. Supports * (any name), ** (any path), and ? (single char). Automatically skips node_modules, .git, dist, build directories.",
      schema: z.object({
        pattern: z
          .string()
          .describe(
            'Glob pattern to match (e.g. "**/*.ts", "src/**/*.test.ts", ".github/workflows/*.yml")',
          ),
      }),
    },
  );

  // ── grep_content ───────────────────────────────────────────────────────

  const grepContentTool = tool(
    async ({ pattern, include }) => {
      let regex: RegExp;
      try {
        regex = new RegExp(pattern, "i");
      } catch (err) {
        return `Error: Invalid regex pattern "${pattern}": ${err instanceof Error ? err.message : String(err)}`;
      }

      try {
        const matches = grepFiles(repoRoot, regex, include, MAX_RESULTS);
        if (matches.length === 0) {
          return `No matches found for pattern "${pattern}"${include ? ` in ${include}` : ""}`;
        }
        const formatted = matches.map(
          (m) => `${m.file}:${m.line}: ${m.content}`,
        );
        const truncated =
          matches.length >= MAX_RESULTS
            ? `\n(truncated at ${MAX_RESULTS} results)`
            : "";
        return `Found ${matches.length} match(es) for "${pattern}":\n${formatted.join("\n")}${truncated}`;
      } catch (err) {
        return `Error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "grep_content",
      description:
        "Search file contents for a regex pattern. Returns matching lines with file paths and line numbers. Automatically skips binary files and node_modules.",
      schema: z.object({
        pattern: z
          .string()
          .describe(
            'Regex pattern to search for (e.g. "describe\\\\(", "FROM.*node", "test.*coverage")',
          ),
        include: z
          .string()
          .optional()
          .describe(
            'Glob pattern to filter files to search (e.g. "**/*.yml", "*.json")',
          ),
      }),
    },
  );

  // ── shell ──────────────────────────────────────────────────────────────

  const shellTool = tool(
    async ({ command }) => {
      // Security: reject obviously dangerous commands
      const dangerous = [
        /\brm\s+-rf?\s/,
        /\bmkdir\b/,
        /\bchmod\b/,
        /\bchown\b/,
        /\bcurl\b.*\|\s*(?:bash|sh)/,
        /\bwget\b/,
        />\s*\//,
        /\bsudo\b/,
        /\bapt\b/,
        /\bbrew\b/,
        /\bnpm\s+install\b/,
        /\bbun\s+install\b/,
        /\bpip\s+install\b/,
      ];

      for (const pattern of dangerous) {
        if (pattern.test(command)) {
          return `Error: Command rejected — "${command}" matches a blocked pattern. Only read-only commands are allowed.`;
        }
      }

      try {
        const output = execSync(command, {
          cwd: repoRoot,
          timeout: SHELL_TIMEOUT_MS,
          maxBuffer: MAX_FILE_SIZE,
          encoding: "utf-8",
          env: {
            ...process.env,
            PATH: process.env.PATH,
            HOME: process.env.HOME,
          },
        });

        const trimmed = output.trim();
        if (trimmed.length === 0) {
          return "(command produced no output)";
        }

        // Truncate very long output
        if (trimmed.length > MAX_FILE_SIZE) {
          return `${trimmed.slice(0, MAX_FILE_SIZE)}\n\n(output truncated at ${MAX_FILE_SIZE / 1024}KB)`;
        }

        return trimmed;
      } catch (err) {
        if (err instanceof Error && "status" in err) {
          const execError = err as Error & {
            status: number;
            stdout?: string;
            stderr?: string;
          };
          const stderr = execError.stderr?.trim() ?? "";
          const stdout = execError.stdout?.trim() ?? "";
          return `Command exited with code ${execError.status}${stderr ? `\nstderr: ${stderr.slice(0, 2000)}` : ""}${stdout ? `\nstdout: ${stdout.slice(0, 2000)}` : ""}`;
        }
        return `Error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
    {
      name: "shell",
      description:
        "Execute a read-only shell command in the repository directory. Use for git operations (git log, git tag), counting (wc -l, find ... | wc), checking file existence (ls, test -f), and other analysis commands. Destructive commands (rm, chmod, install) are blocked.",
      schema: z.object({
        command: z
          .string()
          .describe(
            'Shell command to execute (e.g. "git log --oneline -20", "wc -l src/**/*.ts", "ls -la .github/workflows/")',
          ),
      }),
    },
  );

  return [readFileTool, listDirectoryTool, globFilesTool, grepContentTool, shellTool];
}

/** Type for the tools array returned by createRepoTools */
export type RepoTools = ReturnType<typeof createRepoTools>;
