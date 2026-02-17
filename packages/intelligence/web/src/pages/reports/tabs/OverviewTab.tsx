import { Calendar, Clock, Package, GitBranch } from "lucide-react";
import { OverviewCard } from "../../../components/OverviewCard";
import type { FOEReport } from "../../../types/report";

interface OverviewTabProps {
  report: FOEReport | null;
}

export function OverviewTab({ report }: OverviewTabProps) {
  if (!report) {
    return (
      <div
        className="flex items-center justify-center p-12"
        data-testid="overview-empty"
      >
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No scan data available for this project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="overview-tab"
    >
      <div className="space-y-6">
        {/* Reuse existing OverviewCard */}
        <OverviewCard report={report} />

        {/* Additional project metadata section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Repository Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <GitBranch className="w-4 h-4" />
                <span className="font-medium">Repository Type</span>
              </div>
              <p className="text-gray-900 dark:text-white">
                {report.repository.monorepo ? "Monorepo" : "Single Repository"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Package className="w-4 h-4" />
                <span className="font-medium">Tech Stack</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {report.repository.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Scan Date</span>
              </div>
              <p className="text-gray-900 dark:text-white">
                {new Date(report.generated).toLocaleString()}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Scan Duration</span>
              </div>
              <p className="text-gray-900 dark:text-white">
                {report.methodology.scanDuration}
              </p>
            </div>
          </div>

          {/* Scanner version and confidence */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Scanner Version:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {report.version}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Agents Used:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {report.methodology.agentsUsed.length}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Confidence:
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                  {report.methodology.confidenceLevel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
