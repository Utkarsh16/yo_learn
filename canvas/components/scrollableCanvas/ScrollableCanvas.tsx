import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { throttle } from 'lodash';
import Controls from 'app/products/platform/HubPlatform/components/canvas/components/controls/Controls';
import { useGetScrollableStore } from '../../stores/useCanvasStore';
import { ContainerDiv, ContentDiv } from './ScrollableCanvas.styles';

type Position = { x: number; y: number };

function useShiftAndDragToScroll(args: {
  allowShiftAndDrag?: boolean;
  clientToStagePosition: (x: number, y: number) => Position;
  container: HTMLElement | null;
  onDrag: (deltaX: number, deltaY: number) => void;
}) {
  const {
    allowShiftAndDrag = true,
    clientToStagePosition,
    container,
    onDrag,
  } = args;
  const [isDragging, setIsDragging] = useState(false);

  // we don't need to process every single event, just enough so it feels smooth
  const throttledOnDrag = useMemo(() => {
    return throttle(onDrag, 10);
  }, [onDrag]);

  useEffect(() => {
    if (!(container && allowShiftAndDrag)) {
      return;
    }

    let startPosition: Position | null = null;

    // use this to determine the drag/move status so we can change the cursor appearance
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsDragging(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsDragging(false);
      }
    };

    const handleStartDrag = (e: MouseEvent) => {
      // if we're not holding the shift key, return
      if (!e.shiftKey) {
        return;
      }
      // we don't want the drag/drop behavior of a node to be triggered when we're moving the canvas
      e.stopPropagation();

      const { x, y } = clientToStagePosition(e.clientX, e.clientY);
      startPosition = { x, y };
    };

    const handleStopDrag = (e: MouseEvent) => {
      if (!startPosition) {
        return;
      }

      // don't trigger any other behavior if we're just stopping the drag
      e.stopPropagation();
      startPosition = null;
    };

    const handleDrag = (e: MouseEvent) => {
      if (!e.shiftKey) {
        return;
      }
      if (!startPosition) {
        return;
      }
      const { x, y } = clientToStagePosition(e.clientX, e.clientY);
      const { x: sx, y: sy } = startPosition;

      const dx = sx - x;
      const dy = sy - y;

      throttledOnDrag(dx, dy);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousemove', handleDrag);
    container.addEventListener('mousedown', handleStartDrag);
    container.addEventListener('mouseup', handleStopDrag);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousemove', handleDrag);
      container.removeEventListener('mousedown', handleStartDrag);
      container.removeEventListener('mouseup', handleStopDrag);
    };
  }, [
    allowShiftAndDrag,
    container,
    isDragging,
    clientToStagePosition,
    throttledOnDrag,
  ]);

  return {
    isDragging,
  };
}

/**
 * Attach Mouse wheel event to the scrollable container
 */
function useScroll(
  container: HTMLElement | null,
  handleScrollZoom: (scrollDeltaY: number) => void,
  handleScrollCanvas: (scrollDeltaX: number, scrollDeltaY: number) => void
) {
  useLayoutEffect(() => {
    if (!container) return;

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();

      // Handle zooming (browsers encode this as wheel events where ctrlKey = true)
      if (e.ctrlKey) {
        handleScrollZoom(e.deltaY);
      } else {
        // Handle scrolling
        handleScrollCanvas(e.deltaX, e.deltaY);
      }
    };

    container.addEventListener('wheel', handleScroll, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleScroll);
    };
  }, [handleScrollZoom, handleScrollCanvas, container]);
}

const ScrollableCanvas = (
  props: React.HTMLProps<HTMLDivElement> & { allowShiftAndDrag?: boolean }
) => {
  const { allowShiftAndDrag, children, ...rest } = props;
  const contentRef = useRef<HTMLDivElement>(null);
  const {
    zoomLevel,
    setZoomLevel,
    offset,
    container,
    containerRef,
    center,
    adjustZoomFromScroll,
    scrollCanvas,
    clientToStagePosition,
  } = useGetScrollableStore();

  // Scale the content when the zoom level changes
  useEffect(() => {
    if (!contentRef.current) return;
    const content = contentRef.current;
    content.style.transform = `scale(${zoomLevel * zoomLevel})`;
  }, [zoomLevel]);

  useScroll(container, adjustZoomFromScroll, scrollCanvas);

  const { isDragging } = useShiftAndDragToScroll({
    allowShiftAndDrag,
    clientToStagePosition,
    container,
    onDrag: scrollCanvas,
  });

  useEffect(() => {
    center();
  }, [center]);

  return (
    <ContainerDiv
      height={1000}
      ref={containerRef}
      isDragging={isDragging}
      {...rest}
    >
      <ContentDiv ref={contentRef} offset={offset}>
        {children}
      </ContentDiv>
      <Controls
        {...{
          zoomLevel,
          setZoomLevel,
        }}
      />
    </ContainerDiv>
  );
};

export default ScrollableCanvas;
