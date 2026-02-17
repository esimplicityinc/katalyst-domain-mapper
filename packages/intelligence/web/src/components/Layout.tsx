import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { 
  Target, 
  Search, 
  Calendar, 
  Layers, 
  TestTube, 
  Zap, 
  History, 
  Loader2, 
  Menu, 
  X,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
  Network,
  Shield,
  FolderKanban
} from "lucide-react";
import { ApiKeyPrompt } from "./ApiKeyPrompt";
import { ErrorBoundary } from "./ErrorBoundary";
import { api } from "../api/client";
import KatalystLogo from "../assets/katalyst-logo.png";

const NAV_ITEMS = [
  {
    to: "/design",
    label: "Design",
    icon: Layers,
    description: "Architecture & models",
    comingSoon: false,
    children: [
      {
        to: "/design/business-domain",
        label: "Business Domain",
        icon: Network,
        description: "Model domains & contexts"
      }
    ]
  },
  {
    to: "/strategy",
    label: "Strategy",
    icon: Target,
    description: "Goals & governance",
    comingSoon: false,
    children: [
      {
        to: "/strategy/foe-projects",
        label: "FOE Projects",
        icon: FolderKanban,
        description: "Flow Optimized Engineering"
      },
      {
        to: "/strategy/governance",
        label: "Governance Dashboard",
        icon: Shield,
        description: "NFRs & governance metrics"
      }
    ]
  },
  {
    to: "/discovery",
    label: "Discovery",
    icon: Search,
    description: "Research & insights",
    comingSoon: true,
  },
  {
    to: "/planning",
    label: "Planning",
    icon: Calendar,
    description: "Roadmaps & capacity",
    comingSoon: true,
  },
  {
    to: "/testing",
    label: "Testing",
    icon: TestTube,
    description: "Quality & validation",
    comingSoon: true,
  },
  {
    to: "/automation",
    label: "Automation",
    icon: Zap,
    description: "CI/CD & workflows",
    comingSoon: true,
  },
  {
    to: "/history",
    label: "History",
    icon: History,
    description: "Changes & evolution",
    comingSoon: true,
  },
];

type GateState = "loading" | "needs-key" | "ready";

export function Layout() {
  const [gate, setGate] = useState<GateState>("loading");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "/design": true, // Design section expanded by default
    "/strategy": true // Strategy section expanded by default
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check if user has manually set a preference in localStorage
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    // Otherwise, use system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleSection = (path: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  useEffect(() => {
    checkApiKey();
    
    // Listen for system dark mode preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference if user hasn't manually set a preference
      const stored = localStorage.getItem('darkMode');
      if (stored === null) {
        setDarkMode(e.matches);
      }
    };
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document root
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const checkApiKey = async () => {
    setGate("loading");
    try {
      const status = await api.getConfigStatus();
      setGate(status.scannerEnabled ? "ready" : "needs-key");
    } catch {
      // Backend unreachable — let user through (graceful degradation)
      setGate("ready");
    }
  };

  if (gate === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin motion-reduce:animate-none" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connecting...
          </p>
        </div>
      </div>
    );
  }

  if (gate === "needs-key") {
    return (
      <ApiKeyPrompt
        onConfigured={() => setGate("ready")}
        onSkip={() => setGate("ready")}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col
          transform transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:flex-shrink-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={KatalystLogo} alt="Katalyst" className="w-7 h-7" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Katalyst
              </h1>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Business Domain
                </p>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 leading-none">
                  Alpha
                </span>
              </div>
            </div>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav 
          role="navigation" 
          aria-label="Development lifecycle stages navigation"
          className="flex-1 px-3 py-4 space-y-4 overflow-y-auto"
        >
          {/* Available Section */}
          {NAV_ITEMS.filter(item => !item.comingSoon).length > 0 && (
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Available
              </h3>
              <div className="space-y-1">
                {NAV_ITEMS.filter(item => !item.comingSoon).map((item) => (
                  <div key={item.to}>
                    {/* Parent Item */}
                    <div className="flex items-center gap-1">
                      {/* Expand/Collapse Button (if has children) */}
                      {item.children && item.children.length > 0 && (
                        <button
                          onClick={() => toggleSection(item.to)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
                          aria-label={expandedSections[item.to] ? "Collapse" : "Expand"}
                        >
                          {expandedSections[item.to] ? (
                            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>
                      )}
                      
                      {/* Navigation Link */}
                      <NavLink
                        to={item.to}
                        end
                        onClick={() => setSidebarOpen(false)}
                        aria-label={`${item.label}: ${item.description}`}
                        className={({ isActive }) =>
                          `flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 ${
                            isActive
                              ? "bg-brand-primary-300/20 dark:bg-brand-primary-300/10 text-brand-primary-700 dark:text-brand-primary-300"
                              : "text-gray-700 dark:text-gray-300 hover:bg-brand-primary-300/10 dark:hover:bg-gray-700/50"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <div className="flex-1 min-w-0">
                          <div>{item.label}</div>
                          <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                            {item.description}
                          </div>
                        </div>
                      </NavLink>
                    </div>

                    {/* Child Items (nested) */}
                    {item.children && expandedSections[item.to] && (
                      <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={() => setSidebarOpen(false)}
                            aria-label={`${child.label}: ${child.description}`}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 ${
                                isActive
                                  ? "bg-brand-primary-300/20 dark:bg-brand-primary-300/10 text-brand-primary-700 dark:text-brand-primary-300"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-brand-primary-300/10 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                              }`
                            }
                          >
                            <child.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            <span>{child.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coming Soon Section */}
          {NAV_ITEMS.filter(item => item.comingSoon).length > 0 && (
            <div>
              <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Coming Soon
              </h3>
              <div className="space-y-1">
                {NAV_ITEMS.filter(item => item.comingSoon).map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    aria-label={`${item.label}: ${item.description} (Coming Soon)`}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 opacity-50 ${
                        isActive
                          ? "bg-brand-primary-300/20 dark:bg-brand-primary-300/10 text-brand-primary-700 dark:text-brand-primary-300"
                          : "text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span>{item.label}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          SOON
                        </span>
                      </div>
                      <div className="text-xs font-normal text-gray-400 dark:text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-brand-primary-300/10 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary-500"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="flex items-center gap-2">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 px-3">
            Flow Optimized Engineering
          </p>
        </div>
      </aside>

      {/* Mobile overlay - covers entire screen, behind sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header with hamburger */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src={KatalystLogo} alt="Katalyst" className="w-5 h-5" />
            <span className="font-semibold text-gray-900 dark:text-white">Katalyst</span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 leading-none">
              Alpha
            </span>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
