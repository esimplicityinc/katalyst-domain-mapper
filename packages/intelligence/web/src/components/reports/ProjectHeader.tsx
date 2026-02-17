import { ArrowLeft, RefreshCw, Calendar, TrendingUp, Package } from "lucide-react";
import type { Project, ProjectDetail } from "../../types/project";

interface ProjectHeaderProps {
  project: Project | ProjectDetail;
  onSwitchProject: () => void;
  onRefresh?: () => void;
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

export function ProjectHeader({
  project,
  onSwitchProject,
  onRefresh,
}: ProjectHeaderProps) {
  const maturityClass = project.maturityLevel
    ? maturityColors[project.maturityLevel.toLowerCase()] ||
      maturityColors.hypothesized
    : maturityColors.hypothesized;

  const scoreColor =
    project.latestScore !== null
      ? getScoreColor(project.latestScore)
      : "text-gray-400";

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
        <button
          onClick={onSwitchProject}
          className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          FOE Projects
        </button>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">
          {project.name}
        </span>
      </div>

      {/* Main header content */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Project info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {project.name}
          </h1>

          {/* Key metrics */}
          <div className="flex flex-wrap gap-4 text-sm">
            {project.latestScore !== null && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Score:</span>
                <span className={`font-bold text-lg ${scoreColor}`}>
                  {project.latestScore}
                </span>
              </div>
            )}

            {project.maturityLevel && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Maturity:
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${maturityClass}`}
                >
                  {project.maturityLevel}
                </span>
              </div>
            )}

            {project.lastScanDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Last scan:{" "}
                  {new Date(project.lastScanDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Score trend (only for ProjectDetail) */}
            {"scoreTrend" in project && project.scoreTrend !== null && (
              <div className="flex items-center gap-2">
                <TrendingUp
                  className={`w-4 h-4 ${
                    project.scoreTrend >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    project.scoreTrend >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {project.scoreTrend > 0 ? "+" : ""}
                  {project.scoreTrend.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Tech stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex items-start gap-2 mt-3">
              <Package className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchProject}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Switch Project
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
