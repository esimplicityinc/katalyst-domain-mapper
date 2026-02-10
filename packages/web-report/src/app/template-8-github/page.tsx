"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitPullRequest,
  Check,
  X,
  MessageSquare,
  FileCode,
  FolderOpen,
  Folder,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Shield,
  Clock,
  User,
  Tag,
} from "lucide-react";
import report from "@/data/report.json";

type DimensionKey = "feedback" | "understanding" | "confidence";
type TabType = "conversation" | "files";

interface Subscore {
  name: string;
  score: number;
  max: number;
  evidence: string[];
  gaps: string[];
  deductions: string[];
}

const severityColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  critical: { bg: "bg-red-500", text: "text-white", border: "border-red-600" },
  high: {
    bg: "bg-orange-500",
    text: "text-white",
    border: "border-orange-600",
  },
  medium: {
    bg: "bg-yellow-500",
    text: "text-black",
    border: "border-yellow-600",
  },
  low: { bg: "bg-blue-500", text: "text-white", border: "border-blue-600" },
};

const priorityColors: Record<string, { bg: string; text: string }> = {
  immediate: { bg: "bg-red-100", text: "text-red-800" },
  "short-term": { bg: "bg-yellow-100", text: "text-yellow-800" },
  "medium-term": { bg: "bg-blue-100", text: "text-blue-800" },
};

export default function Template8GitHubPage() {
  const [activeTab, setActiveTab] = useState<TabType>("conversation");
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(
    new Set(["feedback"]),
  );
  const [selectedFile, setSelectedFile] = useState<{
    dimension: DimensionKey;
    subscore: Subscore;
  } | null>(null);

  const {
    dimensions,
    overallScore,
    maturityLevel,
    repository,
    scanDate,
    criticalFailures,
    recommendations,
    executiveSummary,
  } = report;

  const toggleDimension = (key: string) => {
    const newExpanded = new Set(expandedDimensions);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedDimensions(newExpanded);
  };

  const getMergeStatus = () => {
    if (overallScore < 30)
      return {
        status: "blocked",
        message: "Blocked - Critical issues must be resolved",
        color: "bg-red-600",
      };
    if (overallScore < 50)
      return {
        status: "warning",
        message: "Review required - Significant gaps identified",
        color: "bg-yellow-500",
      };
    if (overallScore < 70)
      return {
        status: "pending",
        message: "Pending approval - Minor issues to address",
        color: "bg-blue-500",
      };
    return {
      status: "ready",
      message: "Ready to merge - Meets quality standards",
      color: "bg-green-500",
    };
  };

  const mergeStatus = getMergeStatus();

  const criticalChecks = criticalFailures.filter(
    (f) => f.severity === "critical",
  );
  const highChecks = criticalFailures.filter((f) => f.severity === "high");
  const passedChecks = Object.values(dimensions).flatMap((d) =>
    d.subscores.filter((s) => s.score / s.max >= 0.6),
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* GitHub-style Navigation */}
      <nav className="bg-gray-900 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold">foe-scanner</span>
            <span className="text-gray-400">/</span>
            <span className="font-semibold">{repository}</span>
          </div>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <span>Back to Templates</span>
          </Link>
        </div>
      </nav>

      {/* PR Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-2 rounded-full ${mergeStatus.status === "blocked" ? "bg-red-100" : mergeStatus.status === "ready" ? "bg-green-100" : "bg-yellow-100"}`}
            >
              <GitPullRequest
                className={`w-6 h-6 ${mergeStatus.status === "blocked" ? "text-red-600" : mergeStatus.status === "ready" ? "text-green-600" : "text-yellow-600"}`}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                FOE Assessment Report
                <span
                  className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    mergeStatus.status === "blocked"
                      ? "bg-red-100 text-red-800"
                      : mergeStatus.status === "ready"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {maturityLevel}
                </span>
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  FOE Scanner
                </span>
                <span>wants to merge assessment results into</span>
                <code className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-sm font-mono">
                  main
                </code>
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  {scanDate}
                </span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">
                {overallScore}
              </div>
              <div className="text-sm text-gray-500">Overall Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Merge Status Banner */}
      <div className={`${mergeStatus.color} text-white px-4 py-3`}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          {mergeStatus.status === "blocked" ? (
            <X className="w-5 h-5" />
          ) : mergeStatus.status === "ready" ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{mergeStatus.message}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab("conversation")}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "conversation"
                  ? "border-orange-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Conversation
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {recommendations.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "files"
                  ? "border-orange-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FileCode className="w-4 h-4" />
              Files Changed
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                {Object.values(dimensions).reduce(
                  (acc, d) => acc + d.subscores.length,
                  0,
                )}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - File Tree */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Assessment Dimensions
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {(
                  Object.entries(dimensions) as [
                    DimensionKey,
                    typeof dimensions.feedback,
                  ][]
                ).map(([key, dim]) => (
                  <div key={key}>
                    <button
                      onClick={() => toggleDimension(key)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      {expandedDimensions.has(key) ? (
                        <>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                          <FolderOpen className="w-4 h-4 text-blue-500" />
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                          <Folder className="w-4 h-4 text-blue-500" />
                        </>
                      )}
                      <span className="flex-1 font-medium text-gray-700 text-sm">
                        {dim.name}
                      </span>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          dim.score >= 60
                            ? "bg-green-100 text-green-700"
                            : dim.score >= 40
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {dim.score}%
                      </span>
                    </button>
                    {expandedDimensions.has(key) && (
                      <div className="bg-gray-50 border-t border-gray-100">
                        {dim.subscores.map((sub, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              setSelectedFile({ dimension: key, subscore: sub })
                            }
                            className={`w-full flex items-center gap-2 pl-10 pr-4 py-2 text-left text-sm transition-colors ${
                              selectedFile?.subscore.name === sub.name
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <FileCode className="w-4 h-4 text-gray-400" />
                            <span className="flex-1 truncate">{sub.name}</span>
                            <span
                              className={`text-xs ${
                                sub.score / sub.max >= 0.6
                                  ? "text-green-600"
                                  : sub.score / sub.max >= 0.4
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {sub.score}/{sub.max}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Status Checks */}
            <div className="mt-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Status Checks
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {/* Failed Checks */}
                {criticalChecks.map((check, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
                      {check.title}
                    </span>
                  </div>
                ))}
                {highChecks.map((check, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
                      {check.title}
                    </span>
                  </div>
                ))}
                {/* Passed Checks Summary */}
                {passedChecks.length > 0 && (
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-100">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">
                      {passedChecks.length} checks passed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === "conversation" ? (
              <div className="space-y-4">
                {/* Executive Summary Comment */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        FOE Scanner
                      </span>
                      <span className="text-gray-500 text-sm ml-2">
                        reviewed {scanDate}
                      </span>
                    </div>
                    <span className="ml-auto px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      Reviewer
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      <p className="font-medium text-gray-900 mb-2">
                        Executive Summary
                      </p>
                      <p>{executiveSummary}</p>
                    </div>
                  </div>
                </div>

                {/* Critical Failures as Review Comments */}
                {criticalFailures.map((failure, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-b border-red-100">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">
                          FOE Scanner
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          left a comment
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          severityColors[failure.severity]?.bg || "bg-gray-500"
                        } ${severityColors[failure.severity]?.text || "text-white"}`}
                      >
                        {failure.severity}
                      </span>
                    </div>
                    <div className="p-4 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        {failure.area}: {failure.title}
                      </h4>
                      {failure.location && (
                        <div className="mb-3 font-mono text-sm bg-gray-900 text-gray-100 rounded px-3 py-2">
                          <span className="text-gray-500"># </span>
                          {failure.location}
                        </div>
                      )}
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium text-gray-700">
                            Evidence:
                          </span>{" "}
                          <span className="text-gray-600">
                            {failure.evidence}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium text-gray-700">
                            Impact:
                          </span>{" "}
                          <span className="text-gray-600">
                            {failure.impact}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-blue-50">
                      <p className="text-sm">
                        <span className="font-medium text-blue-700">
                          Suggestion:
                        </span>{" "}
                        <span className="text-blue-600">
                          {failure.recommendation}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}

                {/* Recommendations as Suggested Changes */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Suggested Changes ({recommendations.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 px-2 py-1 rounded text-xs font-medium ${
                              priorityColors[rec.priority]?.bg || "bg-gray-100"
                            } ${priorityColors[rec.priority]?.text || "text-gray-700"}`}
                          >
                            {rec.priority}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {rec.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {rec.description}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              rec.impact === "high"
                                ? "bg-red-100 text-red-700"
                                : rec.impact === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {rec.impact} impact
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Files Changed Tab - Diff View */
              <div className="space-y-4">
                {selectedFile ? (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* File Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <FileCode className="w-4 h-4 text-gray-500" />
                      <span className="font-mono text-sm text-gray-700">
                        dimensions/{selectedFile.dimension}/
                        {selectedFile.subscore.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}
                        .ts
                      </span>
                      <span
                        className={`ml-auto text-sm font-medium ${
                          selectedFile.subscore.score /
                            selectedFile.subscore.max >=
                          0.6
                            ? "text-green-600"
                            : selectedFile.subscore.score /
                                  selectedFile.subscore.max >=
                                0.4
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {selectedFile.subscore.score}/
                        {selectedFile.subscore.max} points
                      </span>
                    </div>

                    {/* Diff Content */}
                    <div className="font-mono text-sm">
                      {/* Expected vs Actual Header */}
                      <div className="flex border-b border-gray-200">
                        <div className="flex-1 px-4 py-2 bg-red-50 text-red-800 text-xs font-medium">
                          - Expected (Ideal State)
                        </div>
                        <div className="flex-1 px-4 py-2 bg-green-50 text-green-800 text-xs font-medium">
                          + Actual (Current State)
                        </div>
                      </div>

                      {/* Evidence Lines (Green - What's Good) */}
                      {selectedFile.subscore.evidence.length > 0 && (
                        <div className="border-b border-gray-100">
                          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50">
                            Evidence Found:
                          </div>
                          {selectedFile.subscore.evidence.map((ev, idx) => (
                            <div key={idx} className="flex">
                              <div className="w-10 px-2 py-1 text-right text-gray-400 bg-gray-50 border-r border-gray-200 select-none">
                                {idx + 1}
                              </div>
                              <div className="flex-1 px-4 py-1 bg-green-50 text-green-800">
                                <span className="text-green-600 mr-2">+</span>
                                {ev}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Gaps Lines (Red - What's Missing) */}
                      {selectedFile.subscore.gaps.length > 0 && (
                        <div className="border-b border-gray-100">
                          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50">
                            Gaps Identified:
                          </div>
                          {selectedFile.subscore.gaps.map((gap, idx) => (
                            <div key={idx} className="flex">
                              <div className="w-10 px-2 py-1 text-right text-gray-400 bg-gray-50 border-r border-gray-200 select-none">
                                {idx + 1}
                              </div>
                              <div className="flex-1 px-4 py-1 bg-red-50 text-red-800">
                                <span className="text-red-600 mr-2">-</span>
                                {gap}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Deductions */}
                      {selectedFile.subscore.deductions.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50">
                            Score Deductions:
                          </div>
                          {selectedFile.subscore.deductions.map((ded, idx) => (
                            <div key={idx} className="flex">
                              <div className="w-10 px-2 py-1 text-right text-gray-400 bg-gray-50 border-r border-gray-200 select-none">
                                {idx + 1}
                              </div>
                              <div className="flex-1 px-4 py-1 bg-yellow-50 text-yellow-800">
                                <span className="text-yellow-600 mr-2">!</span>
                                {ded}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* All Files Overview */
                  <div className="space-y-4">
                    {(
                      Object.entries(dimensions) as [
                        DimensionKey,
                        typeof dimensions.feedback,
                      ][]
                    ).map(([key, dim]) => (
                      <div
                        key={key}
                        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                      >
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <FolderOpen className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-gray-900">
                            {dim.name}
                          </span>
                          <span
                            className={`ml-auto px-2 py-0.5 rounded text-sm font-medium ${
                              dim.score >= 60
                                ? "bg-green-100 text-green-700"
                                : dim.score >= 40
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {dim.score}/100
                          </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {dim.subscores.map((sub, idx) => {
                            const percentage = (sub.score / sub.max) * 100;
                            const gapCount = sub.gaps.length;
                            const evidenceCount = sub.evidence.length;

                            return (
                              <button
                                key={idx}
                                onClick={() =>
                                  setSelectedFile({
                                    dimension: key,
                                    subscore: sub,
                                  })
                                }
                                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                              >
                                <FileCode className="w-4 h-4 text-gray-400" />
                                <span className="flex-1 text-gray-700">
                                  {sub.name}
                                </span>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-green-600">
                                    +{evidenceCount}
                                  </span>
                                  <span className="text-red-600">
                                    -{gapCount}
                                  </span>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        percentage >= 60
                                          ? "bg-green-500"
                                          : percentage >= 40
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="w-12 text-right text-gray-600">
                                    {sub.score}/{sub.max}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          FOE Assessment Report | Template 8: GitHub PR Review Style | Generated{" "}
          {scanDate}
        </div>
      </footer>
    </div>
  );
}
