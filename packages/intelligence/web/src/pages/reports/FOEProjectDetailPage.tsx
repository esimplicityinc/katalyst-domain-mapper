import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  BarChart3,
  Layers,
  Triangle,
  CheckCircle2,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { api } from "../../api/client";
import { ProjectHeader } from "../../components/reports/ProjectHeader";
import { SubNavTabs } from "../../components/reports/SubNavTabs";
import type { Tab } from "../../components/reports/SubNavTabs";
import type { ProjectDetail } from "../../types/project";
import type { FOEReport } from "../../types/report";
import {
  OverviewTab,
  DimensionsTab,
  TriangleTab,
  StrengthsTab,
  GapsTab,
} from "./tabs";
import {
  setSelectedProjectId,
  clearSelectedProjectId,
  onSelectedProjectChange,
} from "../../utils/storage";

const TABS: Tab[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "dimensions", label: "Dimensions", icon: Layers },
  { id: "triangle", label: "Triangle", icon: Triangle },
  { id: "strengths", label: "Strengths", icon: CheckCircle2 },
  { id: "gaps", label: "Gaps", icon: TrendingUp },
];

export function FOEProjectDetailPage() {
  const { repositoryId } = useParams<{ repositoryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [report, setReport] = useState<FOEReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract active tab from URL (e.g., /projects/:id/dimensions -> dimensions)
  const pathSegments = location.pathname.split("/");
  const activeTabFromUrl = pathSegments[pathSegments.length - 1];
  const activeTab = TABS.some((tab) => tab.id === activeTabFromUrl)
    ? activeTabFromUrl
    : "overview";

  // Load project and latest report
  useEffect(() => {
    if (!repositoryId) {
      setError("Repository ID is missing");
      setLoading(false);
      return;
    }

    loadProjectData(repositoryId);
  }, [repositoryId]);

  // Multi-tab synchronization - sync when another tab changes selected project
  useEffect(() => {
    const unsubscribe = onSelectedProjectChange((newProjectId) => {
      if (newProjectId && newProjectId !== repositoryId) {
        navigate(`/reports/projects/${newProjectId}/overview`);
      }
    });

    return unsubscribe;
  }, [repositoryId, navigate]);

  const loadProjectData = async (repoId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch project detail
      const projectData = await api.getProjectDetail(repoId);
      setProject(projectData);

      // Persist selection to localStorage
      setSelectedProjectId(repoId);

      // Fetch latest scan report if available
      if (projectData.scanIds && projectData.scanIds.length > 0) {
        const latestScanId = projectData.scanIds[0];
        const reportData = (await api.getReportRaw(latestScanId)) as FOEReport;
        setReport(reportData);
      }
    } catch (err) {
      console.error("Failed to load project data:", err);
      
      // Handle 404 - project was deleted or doesn't exist
      if (err instanceof Error && (err.message.includes("404") || err.message.includes("not found"))) {
        clearSelectedProjectId(); // Clean up invalid localStorage reference
        setError("This project was not found. It may have been deleted or you may not have access to it.");
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load project data",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    navigate(`/reports/projects/${repositoryId}/${tabId}`, { replace: true });
  };

  const handleSwitchProject = () => {
    navigate("/reports/projects");
  };

  const handleRefresh = () => {
    if (repositoryId) {
      loadProjectData(repositoryId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error ? "Error Loading Project" : "Project Not Found"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error ||
              "The requested project could not be found. It may have been deleted or you may not have access to it."}
          </p>
          <button
            onClick={handleSwitchProject}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <ProjectHeader
        project={project}
        onSwitchProject={handleSwitchProject}
        onRefresh={handleRefresh}
      />

      {/* Sub-navigation Tabs */}
      <SubNavTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        {activeTab === "overview" && <OverviewTab report={report} />}
        {activeTab === "dimensions" && <DimensionsTab report={report} />}
        {activeTab === "triangle" && <TriangleTab report={report} />}
        {activeTab === "strengths" && <StrengthsTab report={report} />}
        {activeTab === "gaps" && <GapsTab report={report} />}
      </div>
    </div>
  );
}
