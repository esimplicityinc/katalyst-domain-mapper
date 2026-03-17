import { Users, ArrowRight, Network } from "lucide-react";
import { Link } from "react-router-dom";

export function TeamsPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-brand-primary-500 dark:text-brand-primary-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Teams
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Team profiles, members, systems, and practice area adoption
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Network className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Teams List Coming Soon
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
              This view will display team cards with Team Topologies classification, member count,
              owned systems, and adoption progress. Click any team to see its full profile.
            </p>
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
