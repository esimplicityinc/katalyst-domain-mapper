"use client";

import { clsx } from "clsx";
import type { Severity, MaturityLevel, Confidence } from "@/data/types";

interface StatusBadgeProps {
  status:
    | Severity
    | MaturityLevel
    | Confidence
    | "immediate"
    | "short-term"
    | "medium-term";
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getColors = () => {
    switch (status) {
      case "critical":
      case "Emerging":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
      case "immediate":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
      case "Developing":
      case "short-term":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
      case "Optimized":
      case "medium-term":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium rounded-full border",
        getColors(),
        sizeClasses[size],
      )}
    >
      {status}
    </span>
  );
}

export function SeverityDot({ severity }: { severity: Severity }) {
  const colors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };

  return (
    <span
      className={clsx("inline-block w-2 h-2 rounded-full", colors[severity])}
    />
  );
}

export function MaturityBadge({
  level,
  score,
}: {
  level: MaturityLevel;
  score: number;
}) {
  const config = {
    Emerging: { bg: "bg-red-500", range: "0-50" },
    Developing: { bg: "bg-yellow-500", range: "51-75" },
    Optimized: { bg: "bg-green-500", range: "76-100" },
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={clsx(
          "px-4 py-2 rounded-lg text-white font-bold text-lg",
          config[level].bg,
        )}
      >
        {level}
      </div>
      <div className="text-sm text-gray-500">
        Score: {score}/100 (Range: {config[level].range})
      </div>
    </div>
  );
}
