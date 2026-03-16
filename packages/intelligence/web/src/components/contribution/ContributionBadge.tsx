import { Pencil, Clock, XCircle, CheckCircle, Archive, GitBranch } from "lucide-react";
import type { ContributionStatus } from "../../types/contribution";
import { CONTRIBUTION_STATUS_COLORS, CONTRIBUTION_STATUS_LABELS } from "../../types/contribution";

const STATUS_ICONS: Record<ContributionStatus, typeof Pencil> = {
  draft: Pencil,
  proposed: Clock,
  rejected: XCircle,
  accepted: CheckCircle,
  deprecated: Archive,
  superseded: GitBranch,
};

interface ContributionBadgeProps {
  status: ContributionStatus;
  version?: number;
  size?: "sm" | "md";
  showVersion?: boolean;
}

export function ContributionBadge({
  status,
  version,
  size = "md",
  showVersion = false,
}: ContributionBadgeProps) {
  const Icon = STATUS_ICONS[status];
  const colors = CONTRIBUTION_STATUS_COLORS[status];
  const label = CONTRIBUTION_STATUS_LABELS[status];

  const sizeClasses =
    size === "sm"
      ? "px-1.5 py-0.5 text-[10px] gap-1"
      : "px-2 py-0.5 text-xs gap-1.5";

  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${colors} ${sizeClasses} ${
        status === "superseded" ? "line-through" : ""
      }`}
    >
      <Icon className={iconSize} />
      {label}
      {showVersion && version && (
        <span className="opacity-70">v{version}</span>
      )}
    </span>
  );
}
