import { Plus, Minus, RefreshCw, Equal } from "lucide-react";
import type { FieldDiff } from "../../types/contribution";

interface VersionDiffProps {
  fromVersion: number;
  toVersion: number;
  diffs: FieldDiff[];
}

const CHANGE_TYPE_CONFIG: Record<
  FieldDiff["changeType"],
  { icon: typeof Plus; label: string; color: string; bgColor: string }
> = {
  added: {
    icon: Plus,
    label: "Added",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  },
  removed: {
    icon: Minus,
    label: "Removed",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  },
  modified: {
    icon: RefreshCw,
    label: "Modified",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  },
  unchanged: {
    icon: Equal,
    label: "Unchanged",
    color: "text-gray-500 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
  },
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "(none)";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ") || "(empty)";
  return JSON.stringify(value);
}

export function VersionDiff({ fromVersion, toVersion, diffs }: VersionDiffProps) {
  const changedDiffs = diffs.filter((d) => d.changeType !== "unchanged");

  if (changedDiffs.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 py-3 text-center">
        No differences between v{fromVersion} and v{toVersion}.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Changes from v{fromVersion} to v{toVersion}
      </h4>
      <div className="space-y-1.5">
        {changedDiffs.map((diff) => {
          const config = CHANGE_TYPE_CONFIG[diff.changeType];
          const Icon = config.icon;

          return (
            <div
              key={diff.field}
              className={`p-2 rounded-md border text-sm ${config.bgColor}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                <span className={`font-medium ${config.color}`}>
                  {diff.field}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${config.color} opacity-70`}
                >
                  {config.label}
                </span>
              </div>
              <div className="ml-5.5 space-y-0.5 text-xs">
                {diff.changeType === "modified" && (
                  <>
                    <div className="text-red-600 dark:text-red-400">
                      <span className="font-mono">-</span>{" "}
                      {formatValue(diff.oldValue)}
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                      <span className="font-mono">+</span>{" "}
                      {formatValue(diff.newValue)}
                    </div>
                  </>
                )}
                {diff.changeType === "added" && (
                  <div className="text-green-600 dark:text-green-400">
                    <span className="font-mono">+</span>{" "}
                    {formatValue(diff.newValue)}
                  </div>
                )}
                {diff.changeType === "removed" && (
                  <div className="text-red-600 dark:text-red-400">
                    <span className="font-mono">-</span>{" "}
                    {formatValue(diff.oldValue)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
