"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import report from "@/data/report.json";

type DimensionKey = "feedback" | "understanding" | "confidence";

const dimensionColors: Record<
  DimensionKey,
  { primary: string; light: string; bg: string }
> = {
  feedback: { primary: "#3b82f6", light: "#93c5fd", bg: "bg-blue-50" },
  understanding: { primary: "#8b5cf6", light: "#c4b5fd", bg: "bg-purple-50" },
  confidence: { primary: "#10b981", light: "#6ee7b7", bg: "bg-green-50" },
};

const dimensionLabels: Record<DimensionKey, string> = {
  feedback: "Feedback",
  understanding: "Understanding",
  confidence: "Confidence",
};

export default function Template5RadarPage() {
  const [selectedDimension, setSelectedDimension] =
    useState<DimensionKey | null>(null);

  const { dimensions, overallScore, maturityLevel, repository, scanDate } =
    report;

  // Prepare radar chart data
  const radarData = [
    {
      dimension: "Feedback",
      actual: dimensions.feedback.score,
      ideal: 100,
      key: "feedback" as DimensionKey,
    },
    {
      dimension: "Understanding",
      actual: dimensions.understanding.score,
      ideal: 100,
      key: "understanding" as DimensionKey,
    },
    {
      dimension: "Confidence",
      actual: dimensions.confidence.score,
      ideal: 100,
      key: "confidence" as DimensionKey,
    },
  ];

  // Get subscores for selected dimension
  const getSubscoreData = (key: DimensionKey) => {
    const dim = dimensions[key];
    return dim.subscores.map((sub) => ({
      name: sub.name,
      score: sub.score,
      max: sub.max,
      percentage: Math.round((sub.score / sub.max) * 100),
    }));
  };

  // Calculate dimension gap from ideal
  const calculateGap = (score: number) => 100 - score;

  // Custom radar tick that handles click
  const CustomTick = ({
    x,
    y,
    payload,
  }: {
    x: number;
    y: number;
    payload: { value: string };
  }) => {
    const dimensionKey = payload.value.toLowerCase() as DimensionKey;
    const isSelected = selectedDimension === dimensionKey;
    const color = dimensionColors[dimensionKey]?.primary || "#6b7280";

    return (
      <g
        onClick={() => setSelectedDimension(isSelected ? null : dimensionKey)}
        style={{ cursor: "pointer" }}
      >
        <text
          x={x}
          y={y}
          fill={isSelected ? color : "#374151"}
          fontSize={14}
          fontWeight={isSelected ? 700 : 500}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {payload.value}
        </text>
        {isSelected && <circle cx={x} cy={y + 16} r={4} fill={color} />}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-medium">Back to Templates</span>
            </Link>
            <div className="text-sm text-slate-400">
              Template 5: Radar Focus
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-2">{repository}</h1>
          <p className="text-slate-400">
            Flow Optimized Engineering Assessment | {scanDate}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Hero Radar Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Radar Chart - Hero Element */}
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Dimension Analysis
              </h2>
              <span className="text-sm text-slate-400">
                Click a dimension to explore
              </span>
            </div>

            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#475569" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={CustomTick as unknown as React.ReactElement}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    axisLine={false}
                    tickCount={5}
                  />
                  {/* Ideal Benchmark (100 on each axis) */}
                  <Radar
                    name="Ideal"
                    dataKey="ideal"
                    stroke="#64748b"
                    fill="#64748b"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  {/* Actual Scores */}
                  <Radar
                    name="Actual"
                    dataKey="actual"
                    stroke={
                      selectedDimension
                        ? dimensionColors[selectedDimension].primary
                        : "#f59e0b"
                    }
                    fill={
                      selectedDimension
                        ? dimensionColors[selectedDimension].primary
                        : "#f59e0b"
                    }
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "12px",
                      boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.5)",
                    }}
                    labelStyle={{ color: "#f1f5f9", fontWeight: 600 }}
                    itemStyle={{ color: "#cbd5e1" }}
                    formatter={(value: number, name: string) => [
                      `${value}/100`,
                      name === "Actual" ? "Current Score" : "Target",
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    formatter={(value: string) => (
                      <span className="text-slate-300">{value}</span>
                    )}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="space-y-6">
            {/* Overall Score Card */}
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl border border-amber-500/30 p-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-amber-400 mb-2">
                  {overallScore}
                </div>
                <div className="text-amber-200/80 text-sm uppercase tracking-wide mb-3">
                  Overall Score
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 rounded-full">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-amber-300 text-sm font-medium">
                    {maturityLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Dimension Scores */}
            {(Object.keys(dimensions) as DimensionKey[]).map((key) => {
              const dim = dimensions[key];
              const colors = dimensionColors[key];
              const isSelected = selectedDimension === key;
              const gap = calculateGap(dim.score);

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDimension(isSelected ? null : key)}
                  className={`w-full text-left rounded-xl border p-4 transition-all duration-300 ${
                    isSelected
                      ? `border-2 ${colors.bg} border-opacity-50`
                      : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600"
                  }`}
                  style={{
                    borderColor: isSelected ? colors.primary : undefined,
                    backgroundColor: isSelected
                      ? `${colors.primary}10`
                      : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="font-semibold"
                      style={{ color: isSelected ? colors.primary : "#e2e8f0" }}
                    >
                      {dimensionLabels[key]}
                    </span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: colors.primary }}
                    >
                      {dim.score}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${dim.score}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>Gap: {gap} points</span>
                    <span>Confidence: {dim.confidence}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subscore Details */}
        {selectedDimension && (
          <div className="animate-fadeIn">
            <div
              className="rounded-2xl border p-8 mb-8"
              style={{
                backgroundColor: `${dimensionColors[selectedDimension].primary}08`,
                borderColor: `${dimensionColors[selectedDimension].primary}30`,
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: dimensionColors[selectedDimension].primary,
                  }}
                />
                <h3 className="text-2xl font-bold text-white">
                  {dimensionLabels[selectedDimension]} Breakdown
                </h3>
              </div>

              {/* Subscore Bar Chart */}
              <div className="h-[300px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getSubscoreData(selectedDimension)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      type="number"
                      domain={[0, 25]}
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      axisLine={{ stroke: "#475569" }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={150}
                      tick={{ fill: "#cbd5e1", fontSize: 12 }}
                      axisLine={{ stroke: "#475569" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #475569",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#f1f5f9" }}
                      formatter={(value: number) => [`${value}`, "Score"]}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {getSubscoreData(selectedDimension).map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={dimensionColors[selectedDimension].primary}
                            fillOpacity={0.3 + (entry.percentage / 100) * 0.7}
                          />
                        ),
                      )}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Subscore Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                {dimensions[selectedDimension].subscores.map((sub, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-white">{sub.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-xl font-bold"
                          style={{
                            color: dimensionColors[selectedDimension].primary,
                          }}
                        >
                          {sub.score}
                        </span>
                        <span className="text-slate-500 text-sm">
                          /{sub.max}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(sub.score / sub.max) * 100}%`,
                          backgroundColor:
                            dimensionColors[selectedDimension].primary,
                        }}
                      />
                    </div>

                    {/* Evidence */}
                    {sub.evidence.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs uppercase tracking-wide text-green-400 mb-1.5">
                          Evidence
                        </div>
                        <ul className="space-y-1">
                          {sub.evidence.slice(0, 2).map((e, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-400 flex items-start gap-2"
                            >
                              <span className="text-green-400 mt-0.5">+</span>
                              {e}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Gaps */}
                    {sub.gaps.length > 0 && (
                      <div>
                        <div className="text-xs uppercase tracking-wide text-red-400 mb-1.5">
                          Gaps
                        </div>
                        <ul className="space-y-1">
                          {sub.gaps.slice(0, 2).map((g, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-400 flex items-start gap-2"
                            >
                              <span className="text-red-400 mt-0.5">-</span>
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Comparison Grid (when no dimension selected) */}
        {!selectedDimension && (
          <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              Quick Comparison: All Dimensions
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {(Object.keys(dimensions) as DimensionKey[]).map((key) => {
                const _dim = dimensions[key];
                const colors = dimensionColors[key];
                const subscoreData = getSubscoreData(key);

                return (
                  <div
                    key={key}
                    className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 hover:border-slate-600 transition-colors cursor-pointer"
                    onClick={() => setSelectedDimension(key)}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      />
                      <h4 className="font-semibold text-white">
                        {dimensionLabels[key]}
                      </h4>
                    </div>

                    {/* Mini bar chart */}
                    <div className="space-y-2">
                      {subscoreData.map((sub, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400 truncate pr-2">
                              {sub.name}
                            </span>
                            <span className="text-slate-300">
                              {sub.percentage}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${sub.percentage}%`,
                                backgroundColor: colors.primary,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700">
                      <span className="text-xs text-slate-400">
                        Click to explore details
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          FOE Assessment Report | Generated {scanDate}
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
