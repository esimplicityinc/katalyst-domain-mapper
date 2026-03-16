import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { api } from "../../api/client";
import type {
  ContributionItem,
  ContributionAction,
  ContributionVersion,
  FieldDiff,
} from "../../types/contribution";
import { ITEM_TYPE_LABELS } from "../../types/contribution";
import { ContributionBadge } from "./ContributionBadge";
import { TransitionActions } from "./TransitionActions";
import { ContributionTimeline } from "./ContributionTimeline";
import { VersionDiff } from "./VersionDiff";

interface ContributionDetailProps {
  item: ContributionItem;
  onBack: () => void;
  onTransitionComplete: () => void;
}

export function ContributionDetail({
  item,
  onBack,
  onTransitionComplete,
}: ContributionDetailProps) {
  const [versions, setVersions] = useState<ContributionVersion[]>([]);
  const [diffs, setDiffs] = useState<FieldDiff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const versionData = await api.contributions.versions(
        item.itemType,
        item.itemId,
      );
      setVersions(versionData);

      // If there are at least 2 versions, load the diff
      if (versionData.length >= 2) {
        const sorted = [...versionData].sort((a, b) => b.version - a.version);
        const diffData = await api.contributions.diff(
          item.itemType,
          item.itemId,
          sorted[1].version,
          sorted[0].version,
        );
        setDiffs(diffData);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load details",
      );
    } finally {
      setLoading(false);
    }
  }, [item.itemType, item.itemId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleTransition = async (
    action: ContributionAction,
    feedback?: string,
  ) => {
    setTransitioning(true);
    try {
      const method = api.contributions[action as keyof typeof api.contributions];
      if (typeof method === "function") {
        if (action === "reject" && feedback) {
          await api.contributions.reject(item.itemType, item.itemId, feedback);
        } else {
          await (method as (type: string, id: string) => Promise<unknown>)(
            item.itemType,
            item.itemId,
          );
        }
      }
      onTransitionComplete();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Transition failed",
      );
    } finally {
      setTransitioning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
            {item.itemId}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-1.5">
            v{item.contribution.version}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Status + type */}
        <div className="space-y-2">
          <ContributionBadge
            status={item.contribution.status}
            version={item.contribution.version}
            showVersion
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {ITEM_TYPE_LABELS[item.itemType] ?? item.itemType}
          </p>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {item.title || item.itemId}
        </h3>

        {/* Item-specific metadata */}
        {Object.keys(item.metadata).length > 0 && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Item Details
            </h4>
            <dl className="space-y-1">
              {Object.entries(item.metadata).map(([key, value]) => (
                <div key={key} className="flex gap-2 text-sm">
                  <dt className="text-gray-500 dark:text-gray-400 capitalize min-w-[100px]">
                    {key}:
                  </dt>
                  <dd className="text-gray-900 dark:text-gray-100">
                    {typeof value === "string"
                      ? value
                      : Array.isArray(value)
                        ? value.join(", ")
                        : JSON.stringify(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Contribution metadata */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Contribution
          </h4>
          <dl className="space-y-1 text-sm">
            {item.contribution.submittedBy && (
              <div className="flex gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Submitted by:</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {item.contribution.submittedBy}
                </dd>
              </div>
            )}
            {item.contribution.submittedAt && (
              <div className="flex gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Submitted:</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {new Date(item.contribution.submittedAt).toLocaleDateString()}
                </dd>
              </div>
            )}
            {item.contribution.reviewedBy && (
              <div className="flex gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Reviewed by:</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {item.contribution.reviewedBy}
                </dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="text-gray-500 dark:text-gray-400">Version:</dt>
              <dd className="text-gray-900 dark:text-gray-100">
                {item.contribution.version}
              </dd>
            </div>
            {item.contribution.supersedes && (
              <div className="flex gap-2">
                <dt className="text-gray-500 dark:text-gray-400">Supersedes:</dt>
                <dd className="text-gray-900 dark:text-gray-100">
                  {item.contribution.supersedes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Actions
          </h4>
          <TransitionActions
            item={item as never}
            onTransition={handleTransition}
            layout="full"
            loading={transitioning}
          />
        </div>

        {/* Version history */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading version history...
          </div>
        ) : (
          <>
            {versions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Version History
                </h4>
                <ContributionTimeline
                  itemId={item.itemId}
                  versions={versions}
                />
              </div>
            )}

            {diffs.length > 0 && versions.length >= 2 && (
              <VersionDiff
                fromVersion={versions[versions.length - 1]?.version ?? 1}
                toVersion={versions[0]?.version ?? 2}
                diffs={diffs}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
