import { DimensionCard } from "../../../components/DimensionCard";
import type { FOEReport } from "../../../types/report";

interface DimensionsTabProps {
  report: FOEReport | null;
}

const DIMENSION_COLORS = {
  feedback: "#3b82f6",
  understanding: "#9333ea",
  confidence: "#10b981",
};

export function DimensionsTab({ report }: DimensionsTabProps) {
  if (!report) {
    return (
      <div
        className="flex items-center justify-center p-12"
        data-testid="dimensions-empty"
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
      data-testid="dimensions-tab"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DimensionCard
          name="Feedback"
          dimension={report.dimensions.feedback}
          color={DIMENSION_COLORS.feedback}
        />
        <DimensionCard
          name="Understanding"
          dimension={report.dimensions.understanding}
          color={DIMENSION_COLORS.understanding}
        />
        <DimensionCard
          name="Confidence"
          dimension={report.dimensions.confidence}
          color={DIMENSION_COLORS.confidence}
        />
      </div>
    </div>
  );
}
