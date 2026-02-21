import { useState, useCallback, useRef, useEffect, useMemo } from "react";

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
  onTouchStart: (e: React.TouchEvent<SVGSVGElement>) => void;
  onTouchMove: (e: React.TouchEvent<SVGSVGElement>) => void;
  onTouchEnd: () => void;
}

interface UseSvgPanZoomResult {
  viewBox: ViewBox;
  handlers: PanZoomHandlers;
  svgRef: React.RefObject<SVGSVGElement>;
  resetView: () => void;
  scale: number;
}

const DEFAULT_WIDTH = 900;
const DEFAULT_HEIGHT = 700;

const MIN_SCALE = 0.3;
const MAX_SCALE = 3.0;
const ZOOM_SENSITIVITY = 0.001;

/**
 * Hook providing pan (drag) and zoom (scroll wheel) for an SVG element
 * by manipulating the viewBox.
 *
 * The wheel handler is attached imperatively with { passive: false } to
 * allow preventDefault() and avoid the "Unable to preventDefault inside
 * passive event listener" console errors.
 *
 * @param initialWidth  - Optional canvas width (defaults to 900). Pass the
 *                        dynamic width returned by useAutoLayout so the initial
 *                        view fits the layout exactly.
 * @param initialHeight - Optional canvas height (defaults to 700).
 */
export function useSvgPanZoom(
  initialWidth: number = DEFAULT_WIDTH,
  initialHeight: number = DEFAULT_HEIGHT,
): UseSvgPanZoomResult {
  const initialViewBox: ViewBox = useMemo(
    () => ({
      x: -50,
      y: -50,
      width: initialWidth + 100,
      height: initialHeight + 100,
    }),
    [initialWidth, initialHeight],
  );

  const [viewBox, setViewBox] = useState<ViewBox>({ ...initialViewBox });

  // Reset viewBox when the canvas dimensions change (e.g. layout engine switch,
  // data reload, or first real layout after async computation).
  useEffect(() => {
    setViewBox({ ...initialViewBox });
  }, [initialViewBox]);
  const isPanning = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Store viewBox in a ref so the imperative wheel handler always has
  // the latest value without needing to re-attach.
  const viewBoxRef = useRef(viewBox);
  viewBoxRef.current = viewBox;

  // Keep the initial viewBox width in a ref so the wheel handler can read
  // it without being listed as a dependency (it never changes after mount).
  const initialWidthRef = useRef(initialViewBox.width);

  // Current scale: ratio of initial width to current width
  const scale = initialViewBox.width / viewBox.width;
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const resetView = useCallback(() => {
    setViewBox({ ...initialViewBox });
  }, [initialViewBox]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
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
        x: prev.x - dx / scaleRef.current,
        y: prev.y - dy / scaleRef.current,
      }));
    },
    [],
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Imperative wheel handler attached with { passive: false }
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const vb = viewBoxRef.current;
      const zoomFactor = 1 + e.deltaY * ZOOM_SENSITIVITY;
      const newWidth = vb.width * zoomFactor;
      const newHeight = vb.height * zoomFactor;

      const newScale = initialWidthRef.current / newWidth;
      if (newScale < MIN_SCALE || newScale > MAX_SCALE) return;

      const rect = svgEl.getBoundingClientRect();
      const cursorXRatio = (e.clientX - rect.left) / rect.width;
      const cursorYRatio = (e.clientY - rect.top) / rect.height;

      const dw = newWidth - vb.width;
      const dh = newHeight - vb.height;

      setViewBox({
        x: vb.x - dw * cursorXRatio,
        y: vb.y - dh * cursorYRatio,
        width: newWidth,
        height: newHeight,
      });
    };

    svgEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => svgEl.removeEventListener("wheel", handleWheel);
  }, []);

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
        x: prev.x - dx / scaleRef.current,
        y: prev.y - dy / scaleRef.current,
      }));
    },
    [],
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
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    svgRef,
    resetView,
    scale,
  };
}
