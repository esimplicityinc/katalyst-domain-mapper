"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import report from "@/data/report.json";
import { ScoreDisplay } from "@/components/shared/ScoreDisplay";
import { StatusBadge, MaturityBadge } from "@/components/shared/StatusBadge";
import { FindingCard } from "@/components/shared/FindingCard";
import type {
  FOEReport,
  DimensionScore,
  Finding,
  Recommendation,
} from "@/data/types";

const typedReport = report as FOEReport;

function DimensionCard({
  dimension,
  isExpanded,
  onToggle,
}: {
  dimension: DimensionScore;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-6">
          <ScoreDisplay
            score={dimension.score}
            max={dimension.max}
            size="md"
            color={dimension.color}
          />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">
              {dimension.name}
            </h3>
            <p className="text-sm text-gray-500">
              {dimension.subscores.length} subscores analyzed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={dimension.confidence} size="sm" />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="space-y-4">
            {dimension.subscores.map((subscore, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{subscore.name}</h4>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: dimension.color }}
                  >
                    {subscore.score}/{subscore.max}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(subscore.score / subscore.max) * 100}%`,
                      backgroundColor: dimension.color,
                    }}
                  />
                </div>

                {subscore.evidence.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Evidence
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {subscore.evidence.map((e, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {subscore.gaps.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Gaps
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {subscore.gaps.map((g, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {subscore.deductions && subscore.deductions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Deductions
                    </p>
                    <ul className="text-sm text-red-600 space-y-1">
                      {subscore.deductions.map((d, i) => (
                        <li key={i} className="font-mono text-xs">
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const priorityColors = {
    immediate: "border-l-red-500 bg-red-50",
    "short-term": "border-l-orange-500 bg-orange-50",
    "medium-term": "border-l-blue-500 bg-blue-50",
  };

  const impactColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-gray-100 text-gray-800",
  };

  return (
    <div
      className={`border-l-4 rounded-r-lg p-4 ${priorityColors[recommendation.priority]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={recommendation.priority} size="sm" />
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${impactColors[recommendation.impact]}`}
            >
              {recommendation.impact} impact
            </span>
          </div>
          <h4 className="font-semibold text-gray-900">
            {recommendation.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {recommendation.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardTemplate() {
  const [expandedDimensions, setExpandedDimensions] = useState<
    Record<string, boolean>
  >({});
  const [showAllCritical, setShowAllCritical] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  const toggleDimension = (key: string) => {
    setExpandedDimensions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const dimensions = [
    { key: "feedback", data: typedReport.dimensions.feedback },
    { key: "understanding", data: typedReport.dimensions.understanding },
    { key: "confidence", data: typedReport.dimensions.confidence },
  ];

  const criticalFailures = typedReport.criticalFailures as Finding[];
  const displayedCritical = showAllCritical
    ? criticalFailures
    : criticalFailures.slice(0, 3);

  const recommendations = typedReport.recommendations;
  const displayedRecommendations = showAllRecommendations
    ? recommendations
    : recommendations.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Templates</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">
                FOE Scan Report - Dashboard View
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Scanned: {typedReport.scanDate}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Overall Score Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Large Overall Score */}
            <div className="flex flex-col items-center">
              <ScoreDisplay
                score={typedReport.overallScore}
                max={100}
                size="xl"
              />
              <div className="mt-4">
                <MaturityBadge
                  level={typedReport.maturityLevel}
                  score={typedReport.overallScore}
                />
              </div>
            </div>

            {/* Dimension Scores */}
            <div className="flex-1 w-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Dimension Scores
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dimensions.map(({ key, data }) => (
                  <div
                    key={key}
                    className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <ScoreDisplay
                      score={data.score}
                      max={data.max}
                      size="md"
                      color={data.color}
                      label={data.name}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Executive Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {typedReport.executiveSummary}
            </p>
          </div>
        </section>

        {/* Critical Failures Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Critical Failures
              </h2>
              <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {criticalFailures.length}
              </span>
            </div>
            {criticalFailures.length > 3 && (
              <button
                onClick={() => setShowAllCritical(!showAllCritical)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showAllCritical
                  ? "Show Less"
                  : `Show All (${criticalFailures.length})`}
              </button>
            )}
          </div>
          <div className="grid gap-4">
            {displayedCritical.map((failure) => (
              <FindingCard key={failure.id} finding={failure} />
            ))}
          </div>
        </section>

        {/* Dimension Details Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">
              Dimension Details
            </h2>
          </div>
          <div className="space-y-4">
            {dimensions.map(({ key, data }) => (
              <DimensionCard
                key={key}
                dimension={data}
                isExpanded={expandedDimensions[key] || false}
                onToggle={() => toggleDimension(key)}
              />
            ))}
          </div>
        </section>

        {/* Recommendations Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Recommendations
              </h2>
            </div>
            {recommendations.length > 4 && (
              <button
                onClick={() =>
                  setShowAllRecommendations(!showAllRecommendations)
                }
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showAllRecommendations
                  ? "Show Less"
                  : `Show All (${recommendations.length})`}
              </button>
            )}
          </div>
          <div className="grid gap-4">
            {displayedRecommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </section>

        {/* Methodology Footer */}
        <section className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Methodology
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {typedReport.methodology.filesAnalyzed}
              </p>
              <p className="text-sm text-gray-500">Files Analyzed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {typedReport.methodology.testFilesAnalyzed}
              </p>
              <p className="text-sm text-gray-500">Test Files</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {typedReport.methodology.adrsAnalyzed}
              </p>
              <p className="text-sm text-gray-500">ADRs Analyzed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {typedReport.assessmentMode}
              </p>
              <p className="text-sm text-gray-500">Assessment Mode</p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Confidence Notes
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              {typedReport.methodology.confidenceNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
