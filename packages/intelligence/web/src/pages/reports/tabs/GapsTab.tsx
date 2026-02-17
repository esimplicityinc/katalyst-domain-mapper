import { GapsTable } from "../../../components/GapsTable";
import type { FOEReport } from "../../../types/report";

interface GapsTabProps {
  report: FOEReport | null;
}

export function GapsTab({ report }: GapsTabProps) {
  if (!report) {
    return (
      <div
        className="flex items-center justify-center p-12"
        data-testid="gaps-empty"
      >
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No scan data available for this project.
          </p>
        </div>
      </div>
    );
  }

  if (!report.topGaps || report.topGaps.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-12"
        data-testid="gaps-none"
      >
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No gaps identified in this scan. Great job!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="gaps-tab"
    >
      <GapsTable topGaps={report.topGaps} />
    </div>
  );
}
