import React from 'react';
import TranslationWrapper from '../../translationWrapper';
import type { CanvasProps } from '../Canvas.types';
import DragShadow from '../components/dragShadow/DragShadow';
import DropTarget from '../components/dropTarget/DropTarget';
import Nodes from '../components/nodes/Nodes';
import ScrollableCanvas from '../components/scrollableCanvas/ScrollableCanvas';
import { CanvasWrapper } from './CanvasContainer.styles';
import { CanvasPropsContext } from './canvasContainer.context';
import useCanvas from './canvasContainer.hook';

function useOnNodeSelected(
  onNodeSelected: ((nodeId: string | null) => void) | null | undefined
) {
  const onNodeSelectedRef = React.useRef(onNodeSelected);
  React.useEffect(() => {
    onNodeSelectedRef.current = onNodeSelected;
  });

  return React.useCallback((nodeId: string | null) => {
    onNodeSelectedRef.current?.(nodeId);
  }, []);
}

const Canvas = (props: CanvasProps) => {
  const {
    handleDrag,
    stopDrag,
    dragEnterInWorkflow,
    dragOverInWorkflow,
    dragStopInWorkflow,
    setSelectedNodeId,
  } = useCanvas(props);

  const onMouseDown = React.useCallback((e: React.MouseEvent) => {
    // Prevent double click from selecting text
    if (e.detail === 2) {
      e.preventDefault();
    }
  }, []);

  // get a stable reference in case the consumer passes an anonymous function
  const onNodeSelected = useOnNodeSelected(props.onNodeSelected);

  // clear the selection if we click the canvas instead of a node
  const onClick = React.useCallback(() => {
    setSelectedNodeId(null);
    onNodeSelected?.(null);
  }, [setSelectedNodeId, onNodeSelected]);

  // pass any necessary props down via context so we can access them in child components
  const contextValue = React.useMemo(() => {
    return {
      onNodeSelected,
    };
  }, [onNodeSelected]);

  return (
    <CanvasPropsContext.Provider value={contextValue}>
      <CanvasWrapper data-testid="base-canvas-wrapper">
        <ScrollableCanvas
          allowShiftAndDrag={props.allowShiftAndDragToMove}
          onDragEnter={dragEnterInWorkflow}
          onDragOver={dragOverInWorkflow}
          onDrop={dragStopInWorkflow}
          onMouseUp={stopDrag}
          onMouseMove={handleDrag}
          onMouseDown={onMouseDown}
          onClick={onClick}
        >
          <DragShadow />
          <DropTarget />
          <Nodes nodeRenderer={props.nodeRenderer} />
        </ScrollableCanvas>
      </CanvasWrapper>
    </CanvasPropsContext.Provider>
  );
};

const CanvasWithTranslation = (props: CanvasProps) => (
  <TranslationWrapper namespaces={['hubPlatform']}>
    <Canvas {...props} />
  </TranslationWrapper>
);

export default CanvasWithTranslation;
