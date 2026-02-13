import { Info } from "lucide-react";
import { DDD_TERMS } from "./ddd-terms";
import type { DDDTermDefinition } from "./ddd-terms";

// ── Tooltip visibility preference ───────────────────────────────────────────

const STORAGE_KEY = "ddd-tooltips-hidden";

function isHidden(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Toggle whether DDD tooltips are rendered.
 * Returns the new hidden state (`true` = hidden).
 */
export function toggleDDDTooltips(): boolean {
  const next = !isHidden();
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    /* SSR or private browsing — silently ignore */
  }
  return next;
}

// ── Position helpers ────────────────────────────────────────────────────────

const POSITION_CLASSES: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const ARROW_CLASSES: Record<string, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-100 border-x-transparent border-b-transparent",
  bottom:
    "bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-100 border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-100 border-y-transparent border-r-transparent",
  right:
    "right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-100 border-y-transparent border-l-transparent",
};

// ── Component ───────────────────────────────────────────────────────────────

interface DDDTooltipProps {
  /** Key into the DDD_TERMS dictionary (e.g. "bounded-context"). */
  termKey: string;
  /** Optional custom trigger content; defaults to an ℹ️ Info icon. */
  children?: React.ReactNode;
  /** Tooltip placement. @default "top" */
  position?: "top" | "bottom" | "left" | "right";
  /** Extra Tailwind classes on the wrapper span. */
  className?: string;
}

export function DDDTooltip({
  termKey,
  children,
  position = "top",
  className = "",
}: DDDTooltipProps) {
  // Respect user preference
  if (isHidden()) return null;

  const entry: DDDTermDefinition | undefined = DDD_TERMS[termKey];
  if (!entry) return null;

  return (
    <span
      className={`relative inline-flex items-center group ${className}`}
      tabIndex={0}
      role="note"
      aria-label={`${entry.term}: ${entry.definition}`}
    >
      {/* Trigger */}
      {children ?? (
        <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 cursor-help transition-colors" />
      )}

      {/* Tooltip bubble */}
      <span
        className={`absolute z-50 ${POSITION_CLASSES[position]} pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200`}
      >
        <span className="block bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg px-3 py-2 max-w-xs">
          <span className="font-semibold block mb-0.5">{entry.term}</span>
          <span className="text-gray-300 dark:text-gray-600 text-xs leading-relaxed block">
            {entry.definition}
          </span>
          {entry.learnMore && (
            <a
              href={entry.learnMore}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 dark:text-blue-600 hover:underline text-xs mt-1 inline-block"
            >
              Learn more →
            </a>
          )}
        </span>
        {/* Arrow / pointer */}
        <span
          className={`absolute w-0 h-0 border-4 ${ARROW_CLASSES[position]}`}
        />
      </span>
    </span>
  );
}
