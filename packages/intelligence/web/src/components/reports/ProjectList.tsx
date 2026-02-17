import { useState, useMemo } from "react";
import { Upload, RefreshCw, SortAsc, SortDesc } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { ProjectSearchBar } from "./ProjectSearchBar";
import { EmptyProjectState } from "./EmptyProjectState";
import type { Project, ProjectSortField, ProjectSortOrder } from "../../types/project";

interface ProjectListProps {
  projects: Project[];
  onSelect: (projectId: string) => void;
  onRefresh: () => void;
}

export function ProjectList({ projects, onSelect, onRefresh }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<ProjectSortField>("lastScanDate");
  const [sortOrder, setSortOrder] = useState<ProjectSortOrder>("desc");

  // Filter projects by search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }

    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.url?.toLowerCase().includes(query) ||
        project.techStack.some((tech) => tech.toLowerCase().includes(query))
    );
  }, [projects, searchQuery]);

  // Sort projects
  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects];

    sorted.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "name":
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case "lastScanDate":
          aVal = a.lastScanDate ? new Date(a.lastScanDate).getTime() : 0;
          bVal = b.lastScanDate ? new Date(b.lastScanDate).getTime() : 0;
          break;
        case "latestScore":
          aVal = a.latestScore ?? -1;
          bVal = b.latestScore ?? -1;
          break;
        case "scanCount":
          aVal = a.scanCount;
          bVal = b.scanCount;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredProjects, sortField, sortOrder]);

  // Handle sort change
  const handleSortChange = (field: ProjectSortField) => {
    if (sortField === field) {
      // Toggle order if clicking the same field
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Set new field with default order
      setSortField(field);
      setSortOrder(field === "lastScanDate" ? "desc" : "asc");
    }
  };

  const handleUpload = () => {
    // TODO: Implement upload functionality
    console.log("Upload functionality not yet implemented");
  };

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header onUpload={handleUpload} onRefresh={onRefresh} />
        <div className="flex-1 flex items-center justify-center p-8">
          <EmptyProjectState onUpload={handleUpload} />
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header onUpload={handleUpload} onRefresh={onRefresh} />

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <ProjectSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortField}
                onChange={(e) =>
                  handleSortChange(e.target.value as ProjectSortField)
                }
                className="
                  px-3 py-2 text-sm
                  bg-white dark:bg-gray-800
                  border border-gray-300 dark:border-gray-600
                  rounded-lg
                  text-gray-900 dark:text-white
                  focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400
                  focus:border-transparent
                  transition-colors
                "
              >
                <option value="lastScanDate">Last Scan</option>
                <option value="latestScore">Score</option>
                <option value="name">Name</option>
                <option value="scanCount">Scan Count</option>
              </select>

              {/* Sort Order Toggle */}
              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                aria-label={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
                className="
                  p-2 text-gray-600 dark:text-gray-400
                  hover:text-gray-900 dark:hover:text-white
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  rounded-lg transition-colors
                  focus:outline-none focus:ring-2 focus:ring-teal-500
                "
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="w-5 h-5" />
                ) : (
                  <SortDesc className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Results Count */}
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Found {sortedProjects.length} of {projects.length} projects
            </p>
          )}

          {/* Project Grid */}
          {sortedProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 dark:text-gray-400">
                No projects match your search.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-teal-600 dark:text-teal-400 hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => onSelect(project.id)}
                  isSelected={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Header component
function Header({
  onUpload,
  onRefresh,
}: {
  onUpload: () => void;
  onRefresh: () => void;
}) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              FOE Projects
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select a project to view Flow Optimized Engineering assessments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-gray-700 dark:text-gray-300
                bg-gray-100 dark:bg-gray-700
                hover:bg-gray-200 dark:hover:bg-gray-600
                rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-teal-500
              "
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <button
              onClick={onUpload}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-white bg-teal-600 hover:bg-teal-700
                dark:bg-teal-500 dark:hover:bg-teal-600
                rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                dark:focus:ring-offset-gray-800
              "
            >
              <Upload className="w-4 h-4" />
              Upload Report
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
