import { TreePine, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function OutcomeTraceabilityPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <TreePine className="w-6 h-6 text-brand-primary-500 dark:text-brand-primary-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Outcome Traceability
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Trace contributions from people through road items to user outcomes
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <TreePine className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Outcome Traceability Coming Soon
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              This view will display a tree/cascade tracing from persons through contributions
              to road items to capabilities to user stories to user types. Color-coded status
              indicators at each node reveal where work is blocked or delivered.
            </p>
            {/* Chain preview */}
            <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
              {["People", "Contributions", "Road Items", "Capabilities", "Stories", "Users"].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {label}
                  </div>
                  {i < 5 && (
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
            <Link
              to="/strategy"
              className="inline-flex items-center gap-2 text-sm text-brand-primary-600 dark:text-brand-primary-400 hover:underline"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Strategy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
