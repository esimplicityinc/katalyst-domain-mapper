import { Calendar, Clock, GitBranch, Package } from "lucide-react";
import type { FOEReport } from "../types/report";

interface OverviewCardProps {
  report: FOEReport;
}

const maturityColors: Record<string, string> = {
  hypothesized: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  emerging:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  practicing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  optimized:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-blue-600 dark:text-blue-400";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Attention";
};

export function OverviewCard({ report }: OverviewCardProps) {
  const { repository, overallScore, maturityLevel, methodology } = report;
  const maturityClass =
    maturityColors[maturityLevel.toLowerCase()] || maturityColors.hypothesized;
  const scoreColor = getScoreColor(overallScore);
  const scoreLabel = getScoreLabel(overallScore);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left side - Repository info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {repository.name}
          </h2>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span>
                {repository.monorepo ? "Monorepo" : "Single Repository"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(report.generated).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{methodology.scanDuration}</span>
            </div>
          </div>

          {/* Tech stack */}
          <div className="flex items-start gap-2 mb-2">
            <Package className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              {repository.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Score and maturity */}
        <div className="flex flex-col items-center lg:items-end gap-4">
          <div className="text-center lg:text-right">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Overall Score
            </div>
            <div className={`text-6xl font-bold ${scoreColor}`}>
              {overallScore}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
              {scoreLabel}
            </div>
          </div>

          <div className="text-center lg:text-right">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Maturity Level
            </div>
            <span
              className={`inline-flex px-4 py-2 text-sm font-bold rounded-lg uppercase ${maturityClass}`}
            >
              {maturityLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Methodology info */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Agents Used:
            </span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {methodology.agentsUsed.length}
            </span>
          </div>
          {methodology.filesAnalyzed && (
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Files Analyzed:
              </span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {methodology.filesAnalyzed}
              </span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Confidence:
            </span>
            <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
              {methodology.confidenceLevel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
