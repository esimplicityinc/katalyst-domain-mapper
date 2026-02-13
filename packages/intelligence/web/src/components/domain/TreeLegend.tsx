import { Box, Shield, Zap } from "lucide-react";
import { DDDTooltip } from "./DDDTooltip";

const LEGEND_ITEMS = [
  {
    label: "Aggregate",
    colorClass: "bg-indigo-500",
    icon: Box,
    termKey: "aggregate",
  },
  {
    label: "Entity",
    colorClass: "bg-blue-500",
    termKey: "entity",
  },
  {
    label: "Value Object",
    colorClass: "bg-amber-500",
    termKey: "value-object",
  },
  {
    label: "Command",
    colorClass: "bg-green-500",
    icon: Zap,
    termKey: "command",
  },
  {
    label: "Event",
    colorClass: "bg-purple-500",
    termKey: "domain-event",
  },
  {
    label: "Invariant",
    colorClass: "bg-red-500",
    icon: Shield,
    termKey: "invariant",
  },
];

export function TreeLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${item.colorClass}`} />
          <span>{item.label}</span>
          <DDDTooltip termKey={item.termKey} position="bottom" />
        </div>
      ))}
    </div>
  );
}
