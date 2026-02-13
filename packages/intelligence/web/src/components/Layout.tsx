import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FileJson, Map, Shield, Hexagon, Loader2, Menu, X } from "lucide-react";
import { ApiKeyPrompt } from "./ApiKeyPrompt";
import { ErrorBoundary } from "./ErrorBoundary";
import { api } from "../api/client";

const NAV_ITEMS = [
  {
    to: "/reports",
    label: "Flow Optimized Scanner",
    icon: FileJson,
    description: "Maturity assessments",
  },
  {
    to: "/mapper",
    label: "Domain Mapper",
    icon: Map,
    description: "DDD workspace",
  },
  {
    to: "/governance",
    label: "Governance",
    icon: Shield,
    description: "Health & coverage",
  },
];

type GateState = "loading" | "needs-key" | "ready";

export function Layout() {
  const [gate, setGate] = useState<GateState>("loading");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

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
            <Hexagon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Katalyst
              </h1>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Domain Mapper
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
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <div>
                <div>{item.label}</div>
                <div className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {item.description}
                </div>
              </div>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Flow Optimized Engineering
          </p>
        </div>
      </aside>

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
            <Hexagon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
