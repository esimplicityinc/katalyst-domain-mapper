import { useState, useEffect, useRef } from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import {
  BarChart3,
  Layers,
  Triangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Loader2,
  Plus,
  Upload,
} from "lucide-react";
import { api } from "../api/client";
import { ProjectList } from "../components/reports/ProjectList";
import { ReportUpload } from "../components/ReportUpload";
import type { Project, ProjectDetail } from "../types/project";
import type { FOEReport } from "../types/report";
import {
  OverviewTab,
  DimensionsTab,
  TriangleTab,
  StrengthsTab,
  GapsTab,
  ChatTab,
} from "./reports/tabs";

const STORAGE_KEY = "foe:selectedProjectId";

const SUB_NAV = [
  { to: "/strategy/foe-projects/scanner", label: "Scanner", icon: Upload },
  { to: "/strategy/foe-projects/overview", label: "Overview", icon: BarChart3 },
  { to: "/strategy/foe-projects/dimensions", label: "Dimensions", icon: Layers },
  { to: "/strategy/foe-projects/triangle", label: "Triangle", icon: Triangle },
  { to: "/strategy/foe-projects/strengths", label: "Strengths", icon: CheckCircle2 },
  { to: "/strategy/foe-projects/gaps", label: "Gaps", icon: TrendingUp },
];

const CHAT_NAV = { to: "/strategy/foe-projects/chat", label: "Chat", icon: Sparkles };

export function FOEProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<ProjectDetail | null>(null);
  const [activeReport, setActiveReport] = useState<FOEReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProjectList, setShowProjectList] = useState(false);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    // Only load once on mount
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadProjects();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await api.listProjects();
      setProjects(list);
      
      // Only auto-select if no project is currently active
      if (list.length > 0 && !activeProject) {
        const savedId = localStorage.getItem(STORAGE_KEY);
        const savedExists = savedId && list.some((p) => p.id === savedId);
        const projectIdToLoad = savedExists ? savedId : list[0].id;
        await selectProject(projectIdToLoad);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      // API might not be reachable — that's fine, show empty state
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (id: string) => {
    try {
      const detail = await api.getProjectDetail(id);
      setActiveProject(detail);
      setShowProjectList(false);
      localStorage.setItem(STORAGE_KEY, id);

      // Load latest report if available
      if (detail.scanIds && detail.scanIds.length > 0) {
        const latestScanId = detail.scanIds[0];
        const reportData = (await api.getReportRaw(latestScanId)) as FOEReport;
        setActiveReport(reportData);
      } else {
        setActiveReport(null);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  // Show project list if user requested it
  if (showProjectList) {
    return (
      <ProjectList
        projects={projects}
        onSelect={selectProject}
        onRefresh={loadProjects}
      />
    );
  }

  // Main interface with tabs - Scanner is always first tab (like Chat in Business Domain)
  return (
    <div className="flex flex-col h-full">
      {/* Top bar with project info + sub-navigation */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Always show breadcrumb (like Business Domain) */}
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProjectList(true)}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Projects
            </button>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {activeProject ? activeProject.name : "No project selected"}
            </h2>
            {activeProject?.url && (
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                — {activeProject.url}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowProjectList(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Switch Project
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="px-4 sm:px-6 flex gap-1 overflow-x-auto">
          <div className="flex gap-1 flex-1">
            {SUB_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-teal-500 text-teal-600 dark:text-teal-300"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
          
          {/* Chat tab on the right */}
          <NavLink
            to={CHAT_NAV.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ml-auto ${
                isActive
                  ? "border-purple-500 text-purple-600 dark:text-purple-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
              }`
            }
          >
            <CHAT_NAV.icon className="w-4 h-4" />
            <span>{CHAT_NAV.label}</span>
            <span className="text-xs text-gray-500 opacity-70">(Powered by Prima)</span>
          </NavLink>
        </div>
      </header>

      {/* Sub-route content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="scanner" replace />} />
          <Route path="scanner" element={<ReportUpload onReportLoaded={(report) => {
            // TODO: Handle uploaded report - create new project or add to existing
            console.log("Report uploaded:", report);
          }} />} />
          <Route path="overview" element={<OverviewTab report={activeReport} />} />
          <Route path="dimensions" element={<DimensionsTab report={activeReport} />} />
          <Route path="triangle" element={<TriangleTab report={activeReport} />} />
          <Route path="strengths" element={<StrengthsTab report={activeReport} />} />
          <Route path="gaps" element={<GapsTab report={activeReport} />} />
          <Route path="chat" element={activeProject ? <ChatTab report={activeReport} project={activeProject} /> : null} />
        </Routes>
      </div>
    </div>
  );
}
