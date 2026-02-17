import { Calendar, FileText, Target, TrendingUp } from "lucide-react";
import type { Project } from "../../types/project";

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
  isSelected?: boolean;
}

const maturityColors: Record<string, string> = {
  Hypothesized:
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  Emerging:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  Practicing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  Optimized:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
};

const getScoreColor = (score: number | null): string => {
  if (score === null) return "text-gray-500 dark:text-gray-400";
  if (score >= 76) return "text-green-600 dark:text-green-400";
  if (score >= 51) return "text-blue-600 dark:text-blue-400";
  if (score >= 26) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

export function ProjectCard({ project, onClick, isSelected }: ProjectCardProps) {
  const maturityClass = project.maturityLevel
    ? maturityColors[project.maturityLevel] || maturityColors.Hypothesized
    : maturityColors.Hypothesized;
  const scoreColor = getScoreColor(project.latestScore);

  return (
    <div
      onClick={onClick}
      data-testid={`project-card-${project.id}`}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all
        ${onClick ? "cursor-pointer hover:shadow-lg hover:scale-[1.02]" : ""}
        ${
          isSelected
            ? "ring-2 ring-blue-500 dark:ring-blue-400"
            : "ring-1 ring-gray-200 dark:ring-gray-700"
        }
      `}
    >
      {/* Project Name */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg font-semibold text-gray-900 dark:text-white truncate"
            title={project.name}
          >
            {project.name}
          </h3>
          {project.url && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
              {project.url}
            </p>
          )}
        </div>
        {project.isMonorepo && (
          <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 rounded">
            Monorepo
          </span>
        )}
      </div>

      {/* Tech Stack */}
      {project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 3 && (
            <span className="px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
              +{project.techStack.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* Overall Score */}
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
            <p
              className={`text-lg font-bold ${scoreColor}`}
              data-testid="project-score"
            >
              {project.latestScore !== null ? project.latestScore : "—"}
            </p>
          </div>
        </div>

        {/* Scan Count */}
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">Scans</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {project.scanCount}
            </p>
          </div>
        </div>

        {/* Last Scan Date */}
        <div className="flex items-center gap-2 col-span-2">
          <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Last Scanned
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {project.lastScanDate
                ? new Date(project.lastScanDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Maturity Badge */}
      {project.maturityLevel && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className={`px-2.5 py-1 text-xs font-medium rounded ${maturityClass}`}>
              {project.maturityLevel}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
