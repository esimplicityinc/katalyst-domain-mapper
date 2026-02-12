import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { TopItem } from "../types/report";

interface FindingsTableProps {
  topStrengths: TopItem[];
}

export function FindingsTable({ topStrengths }: FindingsTableProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (topStrengths.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Top Strengths
        </h3>
      </div>

      <div className="space-y-2">
        {topStrengths.map((strength, idx) => (
          <div
            key={idx}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              aria-expanded={expandedIdx === idx}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <div className="flex items-center gap-4 flex-1 text-left">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-700 dark:text-green-300">
                    {strength.score}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {strength.area}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {strength.reason}
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
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-3">
                  <div className="font-medium mb-1">Impact:</div>
                  <p>{strength.reason}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
