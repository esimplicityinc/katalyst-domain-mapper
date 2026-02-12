import { Box, Shield, Zap } from "lucide-react";

const LEGEND_ITEMS = [
  {
    label: "Aggregate",
    colorClass: "bg-indigo-500",
    icon: Box,
  },
  {
    label: "Entity",
    colorClass: "bg-blue-500",
  },
  {
    label: "Value Object",
    colorClass: "bg-amber-500",
  },
  {
    label: "Command",
    colorClass: "bg-green-500",
    icon: Zap,
  },
  {
    label: "Event",
    colorClass: "bg-purple-500",
  },
  {
    label: "Invariant",
    colorClass: "bg-red-500",
    icon: Shield,
  },
];

export function TreeLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${item.colorClass}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
