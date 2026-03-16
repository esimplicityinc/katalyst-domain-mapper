// ── Contribute Button ──────────────────────────────────────────────────────
// Small reusable button placed on item cards to open the contribution panel
// pre-filtered to the relevant item type.

import { Inbox } from "lucide-react";
import type { ContributableItemType } from "../../types/contribution";
import { useContribution } from "./ContributionProvider";

interface ContributeButtonProps {
  /** The item type to filter the queue to */
  itemType: ContributableItemType;
  /** Optional: open directly to the "all" tab to see all statuses */
  tab?: "drafts" | "pending" | "rejected" | "accepted" | "all";
  /** Visual size */
  size?: "sm" | "md";
  /** Optional label override (default: "Contributions") */
  label?: string;
}

export function ContributeButton({
  itemType,
  tab = "all",
  size = "sm",
  label = "Contributions",
}: ContributeButtonProps) {
  const { open } = useContribution();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger parent card click handlers
    open({ tab, itemType });
  };

  const sizeClasses =
    size === "sm"
      ? "px-2 py-1 text-[11px] gap-1"
      : "px-2.5 py-1.5 text-xs gap-1.5";

  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <button
      onClick={handleClick}
      data-testid="contribute-button"
      className={`inline-flex items-center font-medium rounded-md transition-colors
        text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20
        hover:bg-blue-100 dark:hover:bg-blue-900/40
        border border-blue-200 dark:border-blue-800
        ${sizeClasses}`}
      title={`View ${label.toLowerCase()} for this item type`}
    >
      <Inbox className={iconSize} />
      {label}
    </button>
  );
}
