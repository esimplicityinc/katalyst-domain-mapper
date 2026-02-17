import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Shield,
  Zap,
  FileCode,
  ChevronsUpDown,
  ChevronsDownUp,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { TreeNode } from "./TreeNode";
import { TreeLegend } from "./TreeLegend";
import { DDDTooltip } from "./DDDTooltip";
import type {
  DomainModelFull,
  Aggregate,
  ValueObject,
} from "../../types/domain";

interface AggregateTreeViewProps {
  model: DomainModelFull;
}

export function AggregateTreeView({ model }: AggregateTreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [expandedContexts, setExpandedContexts] = useState<Set<string>>(new Set());

  // Build a slug→ValueObject lookup for cross-referencing
  const voBySlug = useMemo(() => {
    const map = new Map<string, ValueObject>();
    for (const vo of model.valueObjects) {
      map.set(vo.slug, vo);
    }
    return map;
  }, [model.valueObjects]);

  // Collect all expandable node IDs for Expand/Collapse All
  const allExpandableIds = useMemo(() => {
    const ids: string[] = [];
    for (const agg of model.aggregates) {
      // Aggregate root is expandable
      ids.push(agg.id);
      // Value objects within each aggregate are expandable
      for (const voSlug of agg.valueObjects) {
        ids.push(`${agg.id}:vo:${voSlug}`);
      }
    }
    return ids;
  }, [model.aggregates]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleContext = useCallback((contextId: string) => {
    setExpandedContexts((prev) => {
      const next = new Set(prev);
      if (next.has(contextId)) next.delete(contextId);
      else next.add(contextId);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(new Set(allExpandableIds));
  }, [allExpandableIds]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  // Group aggregates by bounded context
  const grouped = useMemo(
    () =>
      model.boundedContexts.map((ctx) => ({
        context: ctx,
        aggregates: model.aggregates.filter((a) => a.contextId === ctx.id),
      })),
    [model.boundedContexts, model.aggregates],
  );

  // Orphan aggregates (no matching context)
  const orphanAggregates = useMemo(
    () =>
      model.aggregates.filter(
        (a) => !model.boundedContexts.some((c) => c.id === a.contextId),
      ),
    [model.aggregates, model.boundedContexts],
  );

  const totalAggregates = model.aggregates.length;

  return (
    <div className="p-6" data-testid="aggregate-tree">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Aggregates <DDDTooltip termKey="aggregate" />
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalAggregates} aggregate{totalAggregates !== 1 ? "s" : ""} across{" "}
            {model.boundedContexts.length} context
            {model.boundedContexts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Expand / Collapse All controls */}
        {totalAggregates > 0 && (
          <div className="flex items-center gap-2">
            <button
              data-testid="expand-all-btn"
              onClick={expandAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              Expand All
            </button>
            <button
              data-testid="collapse-all-btn"
              onClick={collapseAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              <ChevronsDownUp className="w-3.5 h-3.5" />
              Collapse All
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      {totalAggregates > 0 && (
        <div className="mb-4">
          <TreeLegend />
        </div>
      )}

      {/* Empty state */}
      {totalAggregates === 0 ? (
        <div className="text-center py-16">
          <Box className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No aggregates defined yet. Use the chat to discover them or add them
            via the API.
          </p>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="space-y-4">
            {grouped
              .filter((g) => g.aggregates.length > 0)
              .map((group) => {
                const isContextExpanded = expandedContexts.has(group.context.id);
                return (
                  <div key={group.context.id}>
                    {/* Context header - now clickable */}
                    <button
                      onClick={() => toggleContext(group.context.id)}
                      className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100 dark:border-gray-700 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors px-2 -mx-2"
                    >
                      {isContextExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {group.context.title}
                      </h3>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ({group.aggregates.length})
                      </span>
                    </button>

                    {/* Aggregate tree nodes - only show when expanded */}
                    {isContextExpanded && (
                      <div className="space-y-1 ml-2">
                        {group.aggregates.map((agg) => (
                          <AggregateNode
                            key={agg.id}
                            aggregate={agg}
                            expanded={expanded}
                            onToggle={toggleExpand}
                            voBySlug={voBySlug}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

            {/* Orphan aggregates */}
            {orphanAggregates.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100 dark:border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Unassigned
                  </h3>
                </div>
                <div className="space-y-1 ml-2">
                  {orphanAggregates.map((agg) => (
                    <AggregateNode
                      key={agg.id}
                      aggregate={agg}
                      expanded={expanded}
                      onToggle={toggleExpand}
                      voBySlug={voBySlug}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Aggregate Node (top-level tree node for each aggregate) ─────────────────

interface AggregateNodeProps {
  aggregate: Aggregate;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  voBySlug: Map<string, ValueObject>;
}

function AggregateNode({
  aggregate: agg,
  expanded,
  onToggle,
  voBySlug,
}: AggregateNodeProps) {
  const isExpanded = expanded.has(agg.id);

  return (
    <TreeNode
      label={agg.title}
      type="aggregate"
      depth={0}
      expandable
      expanded={isExpanded}
      onToggle={() => onToggle(agg.id)}
      dataTestId={`tree-node-${agg.slug}`}
      icon={<Box className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
    >
      {/* Root Entity */}
      <TreeNode
        label={`Root Entity: ${agg.rootEntity}`}
        type="entity"
        depth={1}
        icon={
          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
        }
      />

      {/* Entities */}
      {agg.entities.length > 0 && (
        <TreeNode
          label="Entities"
          type="category"
          depth={1}
          icon={
            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          }
        >
          {agg.entities.map((entity) => (
            <TreeNode
              key={entity}
              label={entity}
              type="entity"
              depth={2}
              dataTestId={`tree-node-${entity.toLowerCase().replace(/\s+/g, "")}`}
            />
          ))}
        </TreeNode>
      )}

      {/* Value Objects */}
      {agg.valueObjects.length > 0 && (
        <TreeNode
          label="Value Objects"
          type="category"
          depth={1}
          icon={
            <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          }
        >
          {agg.valueObjects.map((voSlug) => {
            const vo = voBySlug.get(voSlug);
            const voNodeId = `${agg.id}:vo:${voSlug}`;
            const voExpanded = expanded.has(voNodeId);
            const hasProperties = vo && vo.properties.length > 0;

            return (
              <TreeNode
                key={voSlug}
                label={vo?.title ?? voSlug}
                type="value-object"
                depth={2}
                expandable={!!hasProperties}
                expanded={voExpanded}
                onToggle={() => onToggle(voNodeId)}
                description={vo?.description ?? undefined}
                dataTestId={`tree-node-${voSlug}`}
              >
                {hasProperties &&
                  vo.properties.map((prop) => (
                    <TreeNode
                      key={prop.name}
                      label={prop.name}
                      type="property"
                      depth={3}
                      annotation={`: ${prop.type}`}
                      description={prop.description}
                    />
                  ))}
              </TreeNode>
            );
          })}
        </TreeNode>
      )}

      {/* Commands */}
      {agg.commands.length > 0 && (
        <TreeNode
          label="Commands"
          type="category"
          depth={1}
          icon={<Zap className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
        >
          {agg.commands.map((cmd) => (
            <TreeNode
              key={cmd}
              label={cmd}
              type="command"
              depth={2}
              dataTestId={`tree-node-${cmd.toLowerCase().replace(/\s+/g, "")}`}
            />
          ))}
        </TreeNode>
      )}

      {/* Events */}
      {agg.events.length > 0 && (
        <TreeNode
          label="Events"
          type="category"
          depth={1}
          icon={
            <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
          }
        >
          {agg.events.map((evt) => (
            <TreeNode
              key={evt}
              label={evt}
              type="event"
              depth={2}
              dataTestId={`tree-node-${evt.toLowerCase().replace(/\s+/g, "")}`}
            />
          ))}
        </TreeNode>
      )}

      {/* Invariants */}
      {agg.invariants.length > 0 && (
        <TreeNode
          label="Invariants"
          type="category"
          depth={1}
          icon={<Shield className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
        >
          {agg.invariants.map((inv, i) => (
            <TreeNode
              key={i}
              label={inv.rule}
              type="invariant"
              depth={2}
              description={inv.description}
            />
          ))}
        </TreeNode>
      )}

      {/* Source file */}
      {agg.sourceFile && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 py-1 pl-6">
          <FileCode className="w-3.5 h-3.5" />
          <code>{agg.sourceFile}</code>
        </div>
      )}
    </TreeNode>
  );
}
