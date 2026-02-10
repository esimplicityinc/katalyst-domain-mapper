import { AlertCircle, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { useState } from "react";

import type { TopItem } from "../types/report";

interface GapsTableProps {
  topGaps: TopItem[];
}

const impactColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
};

export function GapsTable({ topGaps }: GapsTableProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (topGaps.length === 0) {
    return null;
  }

  // Sort by score (lower is more critical)
  const sortedGaps = [...topGaps].sort((a, b) => a.score - b.score);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Top Opportunities for Improvement
        </h3>
      </div>

      <div className="space-y-2">
        {sortedGaps.map((gap, idx) => {
          // Determine impact based on score
          const impact =
            gap.score < 30 ? "high" : gap.score < 50 ? "medium" : "low";

          return (
            <div
              key={idx}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {gap.area}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded uppercase font-medium ${impactColors[impact]}`}
                      >
                        {impact} priority
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Current score: {gap.score}
                    </div>
                  </div>
                </div>
                {expandedIdx === idx ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {expandedIdx === idx && (
                <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-3 mt-3 text-sm">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        Recommendation:
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {gap.reason}
                      </p>
                    </div>

                    <div>
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        Expected Impact:
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 capitalize">
                        {impact} - Improving this area will significantly
                        enhance the {gap.area.toLowerCase()} dimension.
                      </p>
                    </div>

                    {/* Note: FOE method would be included here if available in TopItem interface */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        💡 Review related Field Guide methods for implementation
                        guidance
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div
              className={`inline-flex px-3 py-1 rounded text-sm font-medium ${impactColors.high}`}
            >
              High Priority
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {sortedGaps.filter((g) => g.score < 30).length}
            </div>
          </div>
          <div>
            <div
              className={`inline-flex px-3 py-1 rounded text-sm font-medium ${impactColors.medium}`}
            >
              Medium Priority
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {sortedGaps.filter((g) => g.score >= 30 && g.score < 50).length}
            </div>
          </div>
          <div>
            <div
              className={`inline-flex px-3 py-1 rounded text-sm font-medium ${impactColors.low}`}
            >
              Low Priority
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {sortedGaps.filter((g) => g.score >= 50).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
