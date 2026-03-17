import { Grid3X3, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function AdoptionPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Grid3X3 className="w-6 h-6 text-brand-primary-500 dark:text-brand-primary-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Adoption Heatmap
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Teams vs. practice areas with color-coded adoption levels
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Grid3X3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Adoption Heatmap Coming Soon
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              This view will display a teams-by-practice-areas grid with color-coded adoption levels.
              Hover for individual skill gauges, click for competency drill-down.
            </p>
            {/* Legend preview */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-600" />
                <span className="text-xs text-gray-500 dark:text-gray-400">None</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-yellow-300 dark:bg-yellow-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Aware</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-blue-400 dark:bg-blue-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Learning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Practicing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-purple-400 dark:bg-purple-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Mastered</span>
              </div>
            </div>
            <Link
              to="/organization"
              className="inline-flex items-center gap-2 text-sm text-brand-primary-600 dark:text-brand-primary-400 hover:underline"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Organization
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
