import { Building2, ArrowRight, Network, Users, UserCheck, Grid3X3 } from "lucide-react";
import { Link } from "react-router-dom";

export function OrganizationPage() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-brand-primary-500 dark:text-brand-primary-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Organization
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Teams, people, adoption, and organizational intelligence
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
              Organization Intelligence
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore team structures, individual competencies, practice area adoption, and
              how your organization aligns with the systems it builds. Surface relationships
              between people, teams, and the domains they own.
            </p>
          </div>

          {/* Available Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organization Map */}
            <Link
              to="/organization/overview"
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-brand-primary-400 dark:hover:border-brand-primary-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <Network className="w-8 h-8 text-brand-primary-500 dark:text-brand-primary-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-primary-500 dark:group-hover:text-brand-primary-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Organization Map
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Interactive force-directed graph showing teams, people, systems, and user types
                with their relationships. Visualize Conway's Law alignment at a glance.
              </p>
              <div className="flex items-center gap-2 text-sm text-brand-primary-600 dark:text-brand-primary-400">
                <span className="font-medium">Open Tool</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Teams */}
            <Link
              to="/organization/teams"
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-brand-primary-400 dark:hover:border-brand-primary-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <Users className="w-8 h-8 text-brand-primary-500 dark:text-brand-primary-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-primary-500 dark:group-hover:text-brand-primary-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Teams
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Browse team profiles with members, owned systems, users served, and
                practice area adoption dashboards. Team Topologies classification included.
              </p>
              <div className="flex items-center gap-2 text-sm text-brand-primary-600 dark:text-brand-primary-400">
                <span className="font-medium">Open Tool</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* People */}
            <Link
              to="/organization/people"
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-brand-primary-400 dark:hover:border-brand-primary-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <UserCheck className="w-8 h-8 text-brand-primary-500 dark:text-brand-primary-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-primary-500 dark:group-hover:text-brand-primary-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                People
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Individual competency profiles with radar charts, team memberships,
                and contribution activity. Track skill growth across practice areas.
              </p>
              <div className="flex items-center gap-2 text-sm text-brand-primary-600 dark:text-brand-primary-400">
                <span className="font-medium">Open Tool</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Adoption Heatmap */}
            <Link
              to="/organization/adoption"
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-brand-primary-400 dark:hover:border-brand-primary-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <Grid3X3 className="w-8 h-8 text-brand-primary-500 dark:text-brand-primary-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-primary-500 dark:group-hover:text-brand-primary-400 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Adoption Heatmap
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Teams vs. practice areas grid with color-coded adoption levels.
                Identify organizational skill gaps at a glance with drill-down detail.
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
                <span>Create <strong>Teams</strong> in the Architecture view and assign members</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-500 dark:text-brand-primary-400 font-medium">2.</span>
                <span>Define <strong>Practice Areas</strong> and <strong>Competencies</strong> your organization tracks</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-500 dark:text-brand-primary-400 font-medium">3.</span>
                <span>Record <strong>Adoptions</strong> to track which teams and people are learning which practices</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-500 dark:text-brand-primary-400 font-medium">4.</span>
                <span>Explore the <strong>Adoption Heatmap</strong> for an executive overview of skill gaps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
