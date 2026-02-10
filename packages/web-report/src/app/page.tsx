"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Terminal,
  GraduationCap,
  HeartPulse,
  PieChart,
  Map,
  FileText,
  GitPullRequest,
  Newspaper,
  SlidersHorizontal,
  Layers,
} from "lucide-react";
import report from "@/data/report.json";

const templates = [
  {
    id: 1,
    name: "Dashboard Cards",
    description:
      "Classic dashboard with metric cards, radial progress, and expandable sections",
    icon: LayoutDashboard,
    href: "/template-1-dashboard",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Terminal / CLI",
    description:
      "Dark theme with monospace fonts, ASCII art, and command-line aesthetics",
    icon: Terminal,
    href: "/template-2-terminal",
    color: "bg-gray-800",
  },
  {
    id: 3,
    name: "Report Card",
    description:
      "Educational grading metaphor with letter grades and rubric-style breakdowns",
    icon: GraduationCap,
    href: "/template-3-report-card",
    color: "bg-amber-500",
  },
  {
    id: 4,
    name: "Health Check",
    description:
      "Medical diagnostic theme with vital signs, symptoms, and prescriptions",
    icon: HeartPulse,
    href: "/template-4-health-check",
    color: "bg-red-500",
  },
  {
    id: 5,
    name: "Radar Chart",
    description:
      "Data visualization centered with interactive radar chart comparison",
    icon: PieChart,
    href: "/template-5-radar",
    color: "bg-purple-500",
  },
  {
    id: 6,
    name: "Timeline Journey",
    description:
      "Maturity progression visualization with milestones and action roadmap",
    icon: Map,
    href: "/template-6-timeline",
    color: "bg-emerald-500",
  },
  {
    id: 7,
    name: "Notion Style",
    description:
      "Clean, minimal design with toggle blocks and checkbox recommendations",
    icon: FileText,
    href: "/template-7-notion",
    color: "bg-gray-600",
  },
  {
    id: 8,
    name: "GitHub PR Review",
    description:
      "Familiar code review interface with diff views and comment threads",
    icon: GitPullRequest,
    href: "/template-8-github",
    color: "bg-gray-900",
  },
  {
    id: 9,
    name: "Editorial / News",
    description:
      "Magazine-style layout with headlines, columns, and pull quotes",
    icon: Newspaper,
    href: "/template-9-editorial",
    color: "bg-stone-700",
  },
  {
    id: 10,
    name: "Interactive Scorecard",
    description:
      "Full-featured app with filtering, sorting, search, and drill-down",
    icon: SlidersHorizontal,
    href: "/template-10-interactive",
    color: "bg-indigo-500",
  },
  {
    id: 11,
    name: "Journey Radar Matrix",
    description:
      "Combined radar + timeline with People/Process/Tech dimension matrix",
    icon: Layers,
    href: "/template-11-journey-radar",
    color: "bg-gradient-to-r from-cyan-500 to-indigo-500",
    featured: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                FOE Web Report Templates
              </h1>
              <p className="text-sm text-gray-500">
                Choose a template style for your scan report
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Report</div>
              <div className="font-semibold text-gray-900">
                {report.repository}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500">Overall Score</div>
              <div className="text-3xl font-bold text-gray-900">
                {report.overallScore}/100
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Maturity Level</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.maturityLevel === "Emerging"
                      ? "bg-red-100 text-red-800"
                      : report.maturityLevel === "Developing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {report.maturityLevel}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Critical Issues</div>
              <div className="text-3xl font-bold text-red-600">
                {
                  report.criticalFailures.filter(
                    (f) => f.severity === "critical",
                  ).length
                }
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Scan Date</div>
              <div className="text-lg font-semibold text-gray-900">
                {report.scanDate}
              </div>
            </div>
          </div>
        </div>

        {/* Template Grid */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select a Template
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Link
                key={template.id}
                href={template.href}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`${template.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-400 group-hover:text-blue-500 transition-colors">
                  <span>View template</span>
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>FOE Web Report Templates v0.1.0</p>
          <p className="mt-1">
            Data loaded from{" "}
            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">
              report.json
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
