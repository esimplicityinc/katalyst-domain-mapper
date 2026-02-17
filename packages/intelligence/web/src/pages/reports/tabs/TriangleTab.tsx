import { TriangleDiagram } from "../../../components/TriangleDiagram";
import type { FOEReport } from "../../../types/report";

interface TriangleTabProps {
  report: FOEReport | null;
}

export function TriangleTab({ report }: TriangleTabProps) {
  if (!report) {
    return (
      <div
        className="flex items-center justify-center p-12"
        data-testid="triangle-empty"
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
      data-testid="triangle-tab"
    >
      <TriangleDiagram report={report} />
    </div>
  );
}
