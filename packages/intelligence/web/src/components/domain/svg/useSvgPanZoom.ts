import { useState, useCallback, useRef } from "react";

interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PanZoomHandlers {
  onMouseDown: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onWheel: (e: React.WheelEvent<SVGSVGElement>) => void;
  onTouchStart: (e: React.TouchEvent<SVGSVGElement>) => void;
  onTouchMove: (e: React.TouchEvent<SVGSVGElement>) => void;
  onTouchEnd: () => void;
}

interface UseSvgPanZoomResult {
  viewBox: ViewBox;
  handlers: PanZoomHandlers;
  resetView: () => void;
  scale: number;
}

const INITIAL_VIEWBOX: ViewBox = {
  x: -50,
  y: -50,
  width: 900,
  height: 700,
};

const MIN_SCALE = 0.3;
const MAX_SCALE = 3.0;
const ZOOM_SENSITIVITY = 0.001;

/**
 * Hook providing pan (drag) and zoom (scroll wheel) for an SVG element
 * by manipulating the viewBox.
 */
export function useSvgPanZoom(): UseSvgPanZoomResult {
  const [viewBox, setViewBox] = useState<ViewBox>({ ...INITIAL_VIEWBOX });
  const isPanning = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  // Current scale: ratio of initial width to current width
  const scale = INITIAL_VIEWBOX.width / viewBox.width;

  const resetView = useCallback(() => {
    setViewBox({ ...INITIAL_VIEWBOX });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Only pan on left-click on the background (not on nodes)
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastPoint.current.x;
      const dy = e.clientY - lastPoint.current.y;
      lastPoint.current = { x: e.clientX, y: e.clientY };

      setViewBox((prev) => ({
        ...prev,
        // Invert direction: dragging right moves viewBox left
        x: prev.x - dx / scale,
        y: prev.y - dy / scale,
      }));
    },
    [scale],
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      e.preventDefault();

      const zoomFactor = 1 + e.deltaY * ZOOM_SENSITIVITY;
      const newWidth = viewBox.width * zoomFactor;
      const newHeight = viewBox.height * zoomFactor;

      // Clamp zoom level
      const newScale = INITIAL_VIEWBOX.width / newWidth;
      if (newScale < MIN_SCALE || newScale > MAX_SCALE) return;

      // Zoom toward cursor position
      const svgEl = e.currentTarget;
      const rect = svgEl.getBoundingClientRect();
      const cursorXRatio = (e.clientX - rect.left) / rect.width;
      const cursorYRatio = (e.clientY - rect.top) / rect.height;

      const dw = newWidth - viewBox.width;
      const dh = newHeight - viewBox.height;

      setViewBox({
        x: viewBox.x - dw * cursorXRatio,
        y: viewBox.y - dh * cursorYRatio,
        width: newWidth,
        height: newHeight,
      });
    },
    [viewBox],
  );

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      isPanning.current = true;
      lastPoint.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (!isPanning.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastPoint.current.x;
      const dy = e.touches[0].clientY - lastPoint.current.y;
      lastPoint.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      setViewBox((prev) => ({
        ...prev,
        x: prev.x - dx / scale,
        y: prev.y - dy / scale,
      }));
    },
    [scale],
  );

  const handleTouchEnd = useCallback(() => {
    isPanning.current = false;
  }, []);

  return {
    viewBox,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    resetView,
    scale,
  };
}
