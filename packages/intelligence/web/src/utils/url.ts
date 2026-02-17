/**
 * URL normalization utilities for repository URLs
 *
 * Ensures consistent URL formats across the application by:
 * - Converting SSH to HTTPS format
 * - Removing .git suffixes
 * - Trimming trailing slashes
 * - Lowercasing for consistency
 */

/**
 * Normalize a repository URL to a canonical format
 *
 * Transformations applied:
 * 1. Converts git@github.com:owner/repo to https://github.com/owner/repo
 * 2. Strips .git suffix
 * 3. Removes trailing slashes
 * 4. Lowercases the URL for consistent comparison
 *
 * @param url - The repository URL to normalize
 * @returns The normalized URL string
 *
 * @example
 * ```typescript
 * normalizeRepoUrl("git@github.com:owner/repo.git")
 * // => "https://github.com/owner/repo"
 *
 * normalizeRepoUrl("https://github.com/Owner/Repo.git/")
 * // => "https://github.com/owner/repo"
 *
 * normalizeRepoUrl("https://gitlab.com/group/project")
 * // => "https://gitlab.com/group/project"
 * ```
 */
export function normalizeRepoUrl(url: string): string {
  if (!url) {
    return "";
  }

  let normalized = url.trim();

  // Convert SSH format to HTTPS: git@github.com:owner/repo => https://github.com/owner/repo
  if (normalized.startsWith("git@")) {
    // Match pattern: git@<host>:<path>
    const sshPattern = /^git@([^:]+):(.+)$/;
    const match = normalized.match(sshPattern);

    if (match) {
      const [, host, path] = match;
      normalized = `https://${host}/${path}`;
    }
  }

  // Strip .git suffix
  if (normalized.endsWith(".git")) {
    normalized = normalized.slice(0, -4);
  }

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, "");

  // Lowercase for consistency
  normalized = normalized.toLowerCase();

  return normalized;
}

/**
 * Extract repository identifier from URL
 *
 * Useful for creating short identifiers from full URLs.
 * Returns the "owner/repo" portion for GitHub-style URLs,
 * or the path portion for other URLs.
 *
 * @param url - The repository URL
 * @returns The repository identifier (e.g., "owner/repo")
 *
 * @example
 * ```typescript
 * extractRepoIdentifier("https://github.com/owner/repo")
 * // => "owner/repo"
 *
 * extractRepoIdentifier("git@github.com:owner/repo.git")
 * // => "owner/repo"
 * ```
 */
export function extractRepoIdentifier(url: string): string {
  const normalized = normalizeRepoUrl(url);

  if (!normalized) {
    return "";
  }

  try {
    const urlObj = new URL(normalized);
    // Remove leading slash from pathname
    return urlObj.pathname.replace(/^\//, "");
  } catch {
    // If URL parsing fails, return the original string
    return normalized;
  }
}

/**
 * Check if two repository URLs refer to the same repository
 *
 * Normalizes both URLs before comparing to handle different formats.
 *
 * @param url1 - First repository URL
 * @param url2 - Second repository URL
 * @returns True if URLs refer to the same repository
 *
 * @example
 * ```typescript
 * isSameRepository(
 *   "git@github.com:owner/repo.git",
 *   "https://github.com/Owner/Repo/"
 * )
 * // => true
 * ```
 */
export function isSameRepository(url1: string, url2: string): boolean {
  if (!url1 || !url2) {
    return false;
  }

  return normalizeRepoUrl(url1) === normalizeRepoUrl(url2);
}
