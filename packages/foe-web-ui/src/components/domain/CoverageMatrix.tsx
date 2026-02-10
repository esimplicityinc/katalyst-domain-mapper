import { useState } from "react";
import { ArrowUpDown, Layers } from "lucide-react";
import type { CapabilityCoverage } from "../../types/governance";

interface CoverageMatrixProps {
  capabilities: CapabilityCoverage[];
}

type SortField = "title" | "roadCount" | "storyCount" | "status";
type SortDirection = "asc" | "desc";

const STATUS_BADGE: Record<string, string> = {
  active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  planned: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  deprecated:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

const MAX_DOTS = 5;

export function CoverageMatrix({ capabilities }: CoverageMatrixProps) {
  const [sortField, setSortField] = useState<SortField>("roadCount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sorted = [...capabilities].sort((a, b) => {
    const mult = sortDirection === "asc" ? 1 : -1;
    switch (sortField) {
      case "title":
        return mult * a.title.localeCompare(b.title);
      case "roadCount":
        return mult * (a.roadCount - b.roadCount);
      case "storyCount":
        return mult * (a.storyCount - b.storyCount);
      case "status":
        return mult * a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  // Find the max road count across all capabilities for scaling dots
  const maxRoadCount = capabilities.reduce(
    (max, c) => Math.max(max, c.roadCount),
    0,
  );

  if (capabilities.length === 0) {
    return (
      <div data-testid="coverage-matrix" className="text-center py-12">
        <Layers className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No capability coverage data available.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="coverage-matrix" className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <SortableHeader
              label="Capability"
              field="title"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Status"
              field="status"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Coverage"
              field="roadCount"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
            />
            <SortableHeader
              label="Road Items"
              field="roadCount"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
              align="right"
            />
            <SortableHeader
              label="Stories"
              field="storyCount"
              currentField={sortField}
              direction={sortDirection}
              onSort={handleSort}
              align="right"
            />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {sorted.map((cap) => (
            <tr
              key={cap.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              {/* Capability title + id */}
              <td className="py-2.5 px-3">
                <div className="font-medium text-gray-900 dark:text-white">
                  {cap.title}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                  {cap.id}
                </div>
              </td>

              {/* Status badge */}
              <td className="py-2.5 px-3">
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                    STATUS_BADGE[cap.status] ?? STATUS_BADGE.draft
                  }`}
                >
                  {cap.status}
                </span>
              </td>

              {/* Coverage indicator (dots) */}
              <td className="py-2.5 px-3" data-testid="coverage-indicator">
                <CoverageDots count={cap.roadCount} maxCount={maxRoadCount} />
              </td>

              {/* Road count */}
              <td className="py-2.5 px-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                {cap.roadCount}
              </td>

              {/* Story count */}
              <td className="py-2.5 px-3 text-right tabular-nums text-gray-700 dark:text-gray-300">
                {cap.storyCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── CoverageDots ─────────────────────────────────────────────────────────────

function CoverageDots({
  count,
  maxCount,
}: {
  count: number;
  maxCount: number;
}) {
  // Scale count to 0..MAX_DOTS range
  const filled = maxCount > 0 ? Math.round((count / maxCount) * MAX_DOTS) : 0;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: MAX_DOTS }, (_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i < filled
              ? "bg-blue-500 dark:bg-blue-400"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        />
      ))}
    </div>
  );
}

// ── SortableHeader ───────────────────────────────────────────────────────────

function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  align = "left",
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = currentField === field;

  return (
    <th
      className={`py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 ${
        align === "right" ? "text-right" : "text-left"
      }`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`w-3 h-3 ${
            isActive
              ? "text-blue-500 dark:text-blue-400"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
        {isActive && (
          <span className="text-blue-500 dark:text-blue-400">
            {direction === "asc" ? "\u2191" : "\u2193"}
          </span>
        )}
      </span>
    </th>
  );
}
