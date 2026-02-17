import { FindingsTable } from "../../../components/FindingsTable";
import type { FOEReport } from "../../../types/report";

interface StrengthsTabProps {
  report: FOEReport | null;
}

export function StrengthsTab({ report }: StrengthsTabProps) {
  if (!report) {
    return (
      <div
        className="flex items-center justify-center p-12"
        data-testid="strengths-empty"
      >
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No scan data available for this project.
          </p>
        </div>
      </div>
    );
  }

  if (!report.topStrengths || report.topStrengths.length === 0) {
    return (
      <div
        className="flex items-center justify-center p-12"
        data-testid="strengths-none"
      >
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No strengths identified in this scan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="strengths-tab"
    >
      <FindingsTable topStrengths={report.topStrengths} />
    </div>
  );
}
