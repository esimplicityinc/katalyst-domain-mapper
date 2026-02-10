import { STOP_WORDS } from "../config.js";

/**
 * Extract keywords from method title and body content
 *
 * Algorithm:
 * 1. Tokenize title and body text
 * 2. Filter out stop words
 * 3. Normalize to lowercase
 * 4. Remove duplicates
 * 5. Sort alphabetically
 */
export function extractKeywords(title: string, bodyContent: string): string[] {
  // Combine title (weighted higher via duplication) and body
  const text = `${title} ${title} ${bodyContent}`;

  // Extract words (alphanumeric sequences)
  const words = text.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];

  // Filter out stop words and short words
  const filtered = words.filter(
    (word) => word.length > 2 && !STOP_WORDS.has(word),
  );

  // Count frequencies
  const frequencies = new Map<string, number>();
  for (const word of filtered) {
    frequencies.set(word, (frequencies.get(word) || 0) + 1);
  }

  // Sort by frequency (descending) then alphabetically
  const sorted = Array.from(frequencies.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]; // Frequency descending
    return a[0].localeCompare(b[0]); // Alphabetical
  });

  // Return top 20 keywords
  return sorted.slice(0, 20).map(([word]) => word);
}
