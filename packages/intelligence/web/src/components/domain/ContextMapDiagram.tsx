import { useState, useMemo, useCallback } from "react";
import { RotateCcw, Layers } from "lucide-react";
import type { DomainModelFull } from "../../types/domain";
import { useAutoLayout } from "./svg/useAutoLayout";
import { useSvgPanZoom } from "./svg/useSvgPanZoom";
import { SvgMarkers } from "./svg/markers";
import { ContextNode } from "./ContextNode";
import { RelationshipPath } from "./RelationshipPath";
import { ContextDetailPanel } from "./ContextDetailPanel";

interface ContextMapDiagramProps {
  model: DomainModelFull;
}

/**
 * Main interactive SVG context map diagram.
 *
 * Renders bounded contexts as positioned nodes with relationship paths,
 * supports pan/zoom, hover highlighting, and click-to-expand detail panels.
 */
export function ContextMapDiagram({ model }: ContextMapDiagramProps) {
  const positions = useAutoLayout(model.boundedContexts);
  const { viewBox, handlers, resetView } = useSvgPanZoom();
  const [selectedContextId, setSelectedContextId] = useState<string | null>(
    null,
  );
  const [hoveredContextId, setHoveredContextId] = useState<string | null>(null);

  // Build a position lookup by context id for relationship paths
  const positionMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const pos of positions) {
      map.set(pos.context.id, { x: pos.x, y: pos.y });
    }
    return map;
  }, [positions]);

  // Collect all relationships with source/target positions
  const relationships = useMemo(() => {
    const rels: Array<{
      sourceId: string;
      targetId: string;
      sourceX: number;
      sourceY: number;
      targetX: number;
      targetY: number;
      type: (typeof model.boundedContexts)[0]["relationships"][0]["type"];
    }> = [];

    for (const ctx of model.boundedContexts) {
      const sourcePos = positionMap.get(ctx.id);
      if (!sourcePos) continue;

      for (const rel of ctx.relationships) {
        const targetPos = positionMap.get(rel.targetContextId);
        if (!targetPos) continue;

        rels.push({
          sourceId: ctx.id,
          targetId: rel.targetContextId,
          sourceX: sourcePos.x,
          sourceY: sourcePos.y,
          targetX: targetPos.x,
          targetY: targetPos.y,
          type: rel.type,
        });
      }
    }

    return rels;
  }, [model.boundedContexts, positionMap]);

  // Which contexts are connected to the hovered context?
  const connectedContextIds = useMemo(() => {
    if (!hoveredContextId) return new Set<string>();
    const ids = new Set<string>();
    ids.add(hoveredContextId);

    for (const ctx of model.boundedContexts) {
      if (ctx.id === hoveredContextId) {
        // All targets of this context's relationships
        for (const rel of ctx.relationships) {
          ids.add(rel.targetContextId);
        }
      } else {
        // Check if this context has a relationship TO the hovered context
        for (const rel of ctx.relationships) {
          if (rel.targetContextId === hoveredContextId) {
            ids.add(ctx.id);
          }
        }
      }
    }

    return ids;
  }, [hoveredContextId, model.boundedContexts]);

  // Compute artifact counts per context
  const artifactCountsMap = useMemo(() => {
    const map = new Map<
      string,
      { aggregates: number; events: number; vos: number }
    >();
    for (const ctx of model.boundedContexts) {
      map.set(ctx.id, {
        aggregates: model.aggregates.filter((a) => a.contextId === ctx.id)
          .length,
        events: model.domainEvents.filter((e) => e.contextId === ctx.id).length,
        vos: model.valueObjects.filter((v) => v.contextId === ctx.id).length,
      });
    }
    return map;
  }, [
    model.boundedContexts,
    model.aggregates,
    model.domainEvents,
    model.valueObjects,
  ]);

  const isRelHighlighted = useCallback(
    (sourceId: string, targetId: string): boolean => {
      if (!hoveredContextId) return false;
      return sourceId === hoveredContextId || targetId === hoveredContextId;
    },
    [hoveredContextId],
  );

  const isRelDimmed = useCallback(
    (sourceId: string, targetId: string): boolean => {
      if (!hoveredContextId) return false;
      return sourceId !== hoveredContextId && targetId !== hoveredContextId;
    },
    [hoveredContextId],
  );

  const handleBackgroundClick = useCallback(() => {
    setSelectedContextId(null);
  }, []);

  const selectedContext = model.boundedContexts.find(
    (c) => c.id === selectedContextId,
  );

  const viewBoxStr = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;

  if (model.boundedContexts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Layers className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No bounded contexts to display. Add one to see the context map
          diagram.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: "500px" }}>
      {/* SVG Canvas */}
      <svg
        viewBox={viewBoxStr}
        className="w-full h-full select-none"
        style={{ cursor: "grab" }}
        {...handlers}
        onClick={handleBackgroundClick}
        aria-label="Context map diagram showing bounded contexts and their relationships"
        role="img"
      >
        <SvgMarkers />

        {/* Relationship paths (rendered before nodes so nodes appear on top) */}
        {relationships.map((rel, i) => (
          <RelationshipPath
            key={`${rel.sourceId}-${rel.targetId}-${i}`}
            sourceX={rel.sourceX}
            sourceY={rel.sourceY}
            targetX={rel.targetX}
            targetY={rel.targetY}
            type={rel.type}
            isHighlighted={isRelHighlighted(rel.sourceId, rel.targetId)}
            isDimmed={isRelDimmed(rel.sourceId, rel.targetId)}
          />
        ))}

        {/* Context nodes */}
        {positions.map((pos) => (
          <ContextNode
            key={pos.context.id}
            context={pos.context}
            x={pos.x}
            y={pos.y}
            isSelected={selectedContextId === pos.context.id}
            isHighlighted={
              !!hoveredContextId && connectedContextIds.has(pos.context.id)
            }
            isDimmed={
              !!hoveredContextId && !connectedContextIds.has(pos.context.id)
            }
            onClick={() => setSelectedContextId(pos.context.id)}
            onMouseEnter={() => setHoveredContextId(pos.context.id)}
            onMouseLeave={() => setHoveredContextId(null)}
            artifactCounts={
              artifactCountsMap.get(pos.context.id) ?? {
                aggregates: 0,
                events: 0,
                vos: 0,
              }
            }
          />
        ))}
      </svg>

      {/* Legend overlay — bottom-left */}
      <div data-testid="context-map-legend" className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Legend
        </h4>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Core</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Supporting</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Generic</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-gray-600 dark:text-gray-400">
              Unclassified
            </span>
          </span>
        </div>
      </div>

      {/* Reset zoom button — top-right */}
      <button
        onClick={resetView}
        className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Reset diagram view"
      >
        <RotateCcw className="w-3 h-3" />
        Reset View
      </button>

      {/* Detail panel (slides in from right) */}
      {selectedContext && (
        <ContextDetailPanel
          context={selectedContext}
          model={model}
          onClose={() => setSelectedContextId(null)}
        />
      )}
    </div>
  );
}
