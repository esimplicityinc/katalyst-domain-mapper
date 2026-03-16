import { useState } from "react";
import { Loader2, Send, Check, X, RotateCcw, Archive, RefreshCw, GitBranch } from "lucide-react";
import type { ContributionStatus, ContributionAction } from "../../types/contribution";

interface ContributionItemLike {
  itemType: string;
  itemId: string;
  contribution: {
    status: ContributionStatus;
    reviewFeedback: string | null;
    supersededBy: string | null;
  };
}

interface TransitionActionsProps {
  item: ContributionItemLike;
  onTransition: (action: ContributionAction, feedback?: string) => Promise<void>;
  layout?: "inline" | "full";
  loading?: boolean;
}

interface ActionDef {
  action: ContributionAction;
  label: string;
  icon: typeof Send;
  variant: "primary" | "success" | "danger" | "secondary";
}

const ACTION_MAP: Record<ContributionStatus, ActionDef[]> = {
  draft: [
    { action: "submit", label: "Submit for Review", icon: Send, variant: "primary" },
  ],
  proposed: [
    { action: "accept", label: "Accept", icon: Check, variant: "success" },
    { action: "reject", label: "Reject", icon: X, variant: "danger" },
    { action: "withdraw", label: "Withdraw", icon: RotateCcw, variant: "secondary" },
  ],
  rejected: [
    { action: "revise", label: "Revise", icon: RotateCcw, variant: "primary" },
  ],
  accepted: [
    { action: "deprecate", label: "Deprecate", icon: Archive, variant: "secondary" },
  ],
  deprecated: [
    { action: "reactivate", label: "Reactivate", icon: RefreshCw, variant: "primary" },
  ],
  superseded: [],
};

const VARIANT_CLASSES: Record<string, string> = {
  primary:
    "bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700",
  success:
    "bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700",
  danger:
    "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700",
  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200",
};

export function TransitionActions({
  item,
  onTransition,
  layout = "inline",
  loading = false,
}: TransitionActionsProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const actions = ACTION_MAP[item.contribution.status] ?? [];

  if (actions.length === 0 && item.contribution.status === "superseded") {
    if (layout === "full" && item.contribution.supersededBy) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <GitBranch className="w-4 h-4" />
          <span>Superseded by {item.contribution.supersededBy}</span>
        </div>
      );
    }
    return null;
  }

  if (actions.length === 0) return null;

  const handleAction = async (action: ContributionAction) => {
    if (action === "reject" && layout === "full" && !showRejectForm) {
      setShowRejectForm(true);
      return;
    }
    setActiveAction(action);
    try {
      await onTransition(action, action === "reject" ? feedback : undefined);
      setShowRejectForm(false);
      setFeedback("");
    } finally {
      setActiveAction(null);
    }
  };

  const handleRejectSubmit = async () => {
    setActiveAction("reject");
    try {
      await onTransition("reject", feedback);
      setShowRejectForm(false);
      setFeedback("");
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="space-y-2">
      {/* Rejection feedback display (for rejected items in full layout) */}
      {layout === "full" &&
        item.contribution.status === "rejected" &&
        item.contribution.reviewFeedback && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
              Rejection Feedback:
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              {item.contribution.reviewFeedback}
            </p>
          </div>
        )}

      {/* Action buttons */}
      <div className={`flex ${layout === "inline" ? "gap-1.5" : "gap-2 flex-wrap"}`}>
        {actions.map((def) => {
          const isActive = activeAction === def.action;
          const isDisabled = loading || activeAction !== null;
          return (
            <button
              key={def.action}
              onClick={() => handleAction(def.action)}
              disabled={isDisabled}
              className={`inline-flex items-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                VARIANT_CLASSES[def.variant]
              } ${layout === "inline" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"}`}
            >
              {isActive ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <def.icon className="w-3.5 h-3.5" />
              )}
              {def.label}
            </button>
          );
        })}
      </div>

      {/* Reject feedback form (full layout only) */}
      {showRejectForm && (
        <div className="space-y-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Explain why this is being rejected..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-1 focus:ring-red-500 focus:border-red-500"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleRejectSubmit}
              disabled={loading || activeAction !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
            >
              {activeAction === "reject" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              Confirm Reject
            </button>
            <button
              onClick={() => {
                setShowRejectForm(false);
                setFeedback("");
              }}
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
