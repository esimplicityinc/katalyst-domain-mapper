/**
 * SVG <defs> block containing arrowhead markers for relationship paths.
 */
export function SvgMarkers() {
  return (
    <defs>
      {/* Default arrowhead — gray */}
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="10"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
      </marker>

      {/* Highlighted arrowhead — purple */}
      <marker
        id="arrowhead-highlighted"
        markerWidth="10"
        markerHeight="7"
        refX="10"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#A855F7" />
      </marker>

      {/* Dimmed arrowhead — light gray */}
      <marker
        id="arrowhead-dimmed"
        markerWidth="10"
        markerHeight="7"
        refX="10"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill="#D1D5DB" />
      </marker>
    </defs>
  );
}
