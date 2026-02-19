import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, AlertCircle, RefreshCw, SortAsc, SortDesc } from "lucide-react";
import { ProjectCard } from "../../components/reports/ProjectCard";
import { ProjectSearchBar } from "../../components/reports/ProjectSearchBar";
import { EmptyProjectState } from "../../components/reports/EmptyProjectState";
import { api } from "../../api/client";
import type { Project, ProjectSortField, ProjectSortOrder } from "../../types/project";
import {
  getSelectedProjectId,
  setSelectedProjectId,
  onSelectedProjectChange,
} from "../../utils/storage";

export function FOEProjectListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<ProjectSortField>("lastScanDate");
  const [sortOrder, setSortOrder] = useState<ProjectSortOrder>("desc");
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(
    getSelectedProjectId()
  );

  // Load projects from API
  useEffect(() => {
    loadProjects();
  }, []);

  // Implement fallback chain: localStorage → most recent → null
  // Auto-navigate to last selected project or most recent if this is the first visit
  useEffect(() => {
    if (loading || projects.length === 0) {
      return; // Wait for projects to load
    }

    const storedProjectId = getSelectedProjectId();

    // Validate stored project ID - if it doesn't exist, clean up localStorage
    if (storedProjectId && !projects.some(p => p.id === storedProjectId)) {
      console.warn(`Stored project ID "${storedProjectId}" not found in project list. Clearing localStorage.`);
      setSelectedProjectId(projects[0].id); // Update to most recent
      // Don't auto-navigate here - user is already on list page
    }
  }, [projects, loading]);

  // Multi-tab synchronization - update selection highlight when another tab changes selection
  useEffect(() => {
    const unsubscribe = onSelectedProjectChange((newProjectId) => {
      setSelectedProjectIdState(newProjectId);
    });

    return unsubscribe;
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listProjects();
      setProjects(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load projects"
      );
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let aVal: any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Handle project selection
  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedProjectIdState(projectId);
    // Navigate to project detail page
    navigate(`/strategy/foe-projects/${projectId}/overview`);
  };

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

  // Handle upload (navigate to upload page)
  const handleUpload = () => {
    // TODO: Implement navigation to upload page or open upload modal
    console.log("Navigate to upload");
  };

  // Loading state with skeleton
  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <Header onUpload={handleUpload} onRefresh={loadProjects} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <Header onUpload={handleUpload} onRefresh={loadProjects} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error Loading Projects
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  {error}
                </p>
                <button
                  onClick={loadProjects}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="min-h-full bg-gray-50 dark:bg-gray-900">
        <Header onUpload={handleUpload} onRefresh={loadProjects} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyProjectState onUpload={handleUpload} />
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900">
      <Header onUpload={handleUpload} onRefresh={loadProjects} />

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
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
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
                focus:outline-none focus:ring-2 focus:ring-blue-500
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
              className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
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
                onClick={() => handleProjectClick(project.id)}
                isSelected={selectedProjectId === project.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Header component extracted for reuse
function Header({
  onUpload,
  onRefresh,
}: {
  onUpload: () => void;
  onRefresh: () => void;
}) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              FOE Projects
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage and browse your Flow Optimized Engineering assessments
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
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            <button
              onClick={onUpload}
              className="
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                text-white bg-blue-600 hover:bg-blue-700
                dark:bg-blue-500 dark:hover:bg-blue-600
                rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
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
