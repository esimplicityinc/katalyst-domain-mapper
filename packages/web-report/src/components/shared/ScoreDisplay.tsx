"use client";

import { clsx } from "clsx";

interface ScoreDisplayProps {
  score: number;
  max: number;
  size?: "sm" | "md" | "lg" | "xl";
  showPercentage?: boolean;
  color?: string;
  label?: string;
}

export function ScoreDisplay({
  score,
  max,
  size = "md",
  showPercentage = true,
  color,
  label,
}: ScoreDisplayProps) {
  const percentage = Math.round((score / max) * 100);

  const getColor = () => {
    if (color) return color;
    if (percentage >= 75) return "#22c55e";
    if (percentage >= 50) return "#f59e0b";
    if (percentage >= 25) return "#f97316";
    return "#ef4444";
  };

  const sizeClasses = {
    sm: "w-16 h-16 text-lg",
    md: "w-24 h-24 text-2xl",
    lg: "w-32 h-32 text-3xl",
    xl: "w-40 h-40 text-4xl",
  };

  const strokeWidth =
    size === "sm" ? 4 : size === "md" ? 6 : size === "lg" ? 8 : 10;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={clsx("relative", sizeClasses[size])}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold" style={{ color: getColor() }}>
            {score}
          </span>
          {showPercentage && (
            <span className="text-xs text-gray-500">/{max}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium text-gray-600">{label}</span>
      )}
    </div>
  );
}

export function ScoreBar({
  score,
  max,
  color,
  showLabel = true,
  height = "md",
}: {
  score: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  height?: "sm" | "md" | "lg";
}) {
  const percentage = Math.round((score / max) * 100);

  const getColor = () => {
    if (color) return color;
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const heightClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      <div
        className={clsx(
          "w-full bg-gray-200 rounded-full overflow-hidden",
          heightClasses[height],
        )}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-1000 ease-out",
            color || getColor(),
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>
            {score}/{max}
          </span>
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
}
