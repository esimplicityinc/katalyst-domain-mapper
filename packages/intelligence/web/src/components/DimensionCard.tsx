import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import type { DimensionReport } from "../types/report";

interface DimensionCardProps {
  name: string;
  dimension: DimensionReport;
  color: string;
}

const dimensionInfo: Record<string, { description: string; weight: string }> = {
  feedback: {
    description: "Speed and quality of learning cycles",
    weight: "35%",
  },
  understanding: {
    description: "System clarity and shared mental models",
    weight: "35%",
  },
  confidence: {
    description: "Trust in changes and system stability",
    weight: "30%",
  },
};

const confidenceBadgeColors = {
  high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
  low: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
};

export function DimensionCard({ name, dimension, color }: DimensionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { score, maxScore, subscores, findings, gaps } = dimension;
  const percentage = Math.round((score / maxScore) * 100);
  const info = dimensionInfo[name.toLowerCase()];

  const chartData = [
    {
      name,
      value: percentage,
      fill: color,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize mb-1">
            {name}
          </h3>
          {info && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {info.description}
            </p>
          )}
          {info && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Weight: {info.weight}
            </p>
          )}
        </div>
      </div>

      {/* Score visualization */}
      <div className="flex items-center gap-6 mb-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                background={{ fill: "#e5e7eb" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="flex flex-col items-center -mt-24">
            <div className="text-3xl font-bold" style={{ color }}>
              {score}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              of {maxScore}
            </div>
          </div>
        </div>

        {/* Subscores */}
        <div className="flex-1 space-y-3">
          {Object.entries(subscores).map(([key, subscore]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {subscore.score}/{subscore.max}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      confidenceBadgeColors[subscore.confidence]
                    }`}
                  >
                    {subscore.confidence}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${(subscore.score / subscore.max) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Findings and Gaps summary */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="font-medium text-green-900 dark:text-green-100">
            {findings.length} Strengths
          </div>
        </div>
        <div className="flex-1 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="font-medium text-orange-900 dark:text-orange-100">
            {gaps.length} Gaps
          </div>
        </div>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        {isExpanded ? (
          <>
            Hide Details
            <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            Show Details
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Findings */}
          {findings.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Strengths
              </h4>
              <ul className="space-y-2">
                {findings.map((finding, idx) => (
                  <li key={idx} className="text-sm">
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {finding.area}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {finding.description}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {gaps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Opportunities
              </h4>
              <ul className="space-y-2">
                {gaps.map((gap, idx) => (
                  <li key={idx} className="text-sm">
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {gap.area}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {gap.recommendation}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
