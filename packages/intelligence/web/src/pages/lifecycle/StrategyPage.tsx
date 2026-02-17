import { Target, ArrowRight, Shield, FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";

export function StrategyPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-brand-primary-500 dark:text-brand-primary-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Strategy
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Governance, Flow Optimized Engineering, and organizational health
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Intro */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Governance & Quality Assurance
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor Flow Optimized Engineering practices, track non-functional requirements, 
              and ensure governance compliance across your organization.
            </p>
          </div>

          {/* Available Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FOE Projects */}
            <Link
              to="/strategy/foe-projects"
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-brand-primary-400 dark:hover:border-brand-primary-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <FolderKanban className="w-8 h-8 text-brand-primary-500 dark:text-brand-primary-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-primary-500 dark:group-hover:text-brand-primary-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                FOE Projects
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scan repositories, upload reports, browse project history with AI coaching chat. 
                Track engineering health over time and get personalized improvement guidance.
              </p>
              <div className="flex items-center gap-2 text-sm text-brand-primary-600 dark:text-brand-primary-400">
                <span className="font-medium">Open Tool</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Governance Dashboard */}
            <Link
              to="/strategy/governance"
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-brand-primary-400 dark:hover:border-brand-primary-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <Shield className="w-8 h-8 text-brand-primary-500 dark:text-brand-primary-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-primary-500 dark:group-hover:text-brand-primary-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Governance Dashboard
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Monitor non-functional requirements (NFRs), architecture decision records (ADRs), 
                roadmap items, and capability coverage across your system.
              </p>
              <div className="flex items-center gap-2 text-sm text-brand-primary-600 dark:text-brand-primary-400">
                <span className="font-medium">Open Tool</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Quick Start */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Start
            </h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-500 dark:text-brand-primary-400 font-medium">1.</span>
                <span>Open <strong>FOE Projects</strong> and use the Scanner tab to upload or scan a repository</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-500 dark:text-brand-primary-400 font-medium">2.</span>
                <span>View comprehensive reports across Overview, Dimensions, Triangle, Strengths, and Gaps tabs</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-500 dark:text-brand-primary-400 font-medium">3.</span>
                <span>Use the <strong>AI Chat</strong> tab to get personalized improvement recommendations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-500 dark:text-brand-primary-400 font-medium">4.</span>
                <span>Monitor governance compliance with the <strong>Governance Dashboard</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
