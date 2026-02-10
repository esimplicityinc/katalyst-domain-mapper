import { Kanban, Hash, Flag } from "lucide-react";
import type { RoadItemSummary } from "../../types/governance";
import {
  GOVERNANCE_STATES,
  STATE_COLORS,
  STATE_LABELS,
  PRIORITY_COLORS,
} from "../../types/governance";
import type { GovernanceState } from "../../types/governance";

interface KanbanBoardProps {
  items: RoadItemSummary[];
  filterState: string | null;
  onFilterChange: (state: string | null) => void;
}

export function KanbanBoard({
  items,
  filterState,
  onFilterChange,
}: KanbanBoardProps) {
  // Group items by status
  const grouped = GOVERNANCE_STATES.reduce<
    Record<GovernanceState, RoadItemSummary[]>
  >(
    (acc, state) => {
      acc[state] = items.filter((item) => item.status === state);
      return acc;
    },
    {} as Record<GovernanceState, RoadItemSummary[]>,
  );

  // Columns to display: either the filtered state only, or all states with items (+ always show pipeline core)
  const coreStates: GovernanceState[] = [
    "proposed",
    "adr_validated",
    "bdd_pending",
    "bdd_complete",
    "implementing",
    "nfr_validating",
    "complete",
  ];
  const visibleColumns: GovernanceState[] = filterState
    ? [filterState as GovernanceState]
    : GOVERNANCE_STATES.filter(
        (state) => coreStates.includes(state) || grouped[state].length > 0,
      );

  return (
    <div data-testid="kanban-board">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => onFilterChange(null)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            filterState === null
              ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          All ({items.length})
        </button>
        {GOVERNANCE_STATES.map((state) => {
          const count = grouped[state].length;
          if (count === 0 && !coreStates.includes(state)) return null;
          const colors = STATE_COLORS[state];
          return (
            <button
              key={state}
              onClick={() =>
                onFilterChange(filterState === state ? null : state)
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filterState === state
                  ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current`
                  : `bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600`
              }`}
            >
              {STATE_LABELS[state]} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:snap-none">
        {visibleColumns.map((state) => {
          const colors = STATE_COLORS[state];
          const columnItems = grouped[state];

          return (
            <div
              key={state}
              data-testid={`kanban-column-${state}`}
              className={`flex-shrink-0 w-72 lg:w-auto lg:flex-1 min-w-[16rem] snap-center rounded-lg border ${colors.border} bg-gray-50 dark:bg-gray-800/50`}
            >
              {/* Column header */}
              <div
                className={`flex items-center justify-between px-3 py-2.5 border-b ${colors.border}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${colors.bg} ${colors.text}`}
                  >
                    <span className="sr-only">{state}</span>
                  </span>
                  <h3 className={`text-sm font-semibold ${colors.text}`}>
                    {STATE_LABELS[state]}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}
                >
                  {columnItems.length}
                </span>
              </div>

              {/* Column cards */}
              <div className="p-2 space-y-2 max-h-[28rem] overflow-y-auto">
                {columnItems.length === 0 ? (
                  <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-6">
                    No items
                  </p>
                ) : (
                  columnItems.map((item) => (
                    <KanbanCard key={item.id} item={item} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state - no items at all */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <Kanban className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No road items found.
          </p>
        </div>
      )}
    </div>
  );
}

// ── KanbanCard ───────────────────────────────────────────────────────────────

function KanbanCard({ item }: { item: RoadItemSummary }) {
  const priorityColor = PRIORITY_COLORS[item.priority] ?? PRIORITY_COLORS.low;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Road ID */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
          {item.id}
        </span>
        <span
          className={`flex items-center gap-1 text-xs font-medium ${priorityColor}`}
        >
          <Flag className="w-3 h-3" />
          {item.priority}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-snug mb-2">
        {item.title}
      </h4>

      {/* Phase */}
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <Hash className="w-3 h-3" />
        Phase {item.phase}
      </div>
    </div>
  );
}
