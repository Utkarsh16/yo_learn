import { useEffect } from 'react';
import type { CanvasProps } from '../Canvas.types';
import {
  useGetDragStore,
  useGetNodesStore,
  useGetPropsStore,
} from '../stores/useCanvasStore';

const useCanvas = (options: CanvasProps) => {
  const {
    emptyStatePlaceholderText,
    onChange,
    nodes,
    isLocked,
    enableParallelDropZones,
  } = options;

  const {
    handleDrag,
    stopDrag,
    dragEnterInWorkflow,
    dragOverInWorkflow,
    dragStopInWorkflow,
  } = useGetDragStore();

  const { setPropsInStore } = useGetPropsStore();
  const { setNodesInfo, setSelectedNodeId } = useGetNodesStore();

  useEffect(() => {
    setPropsInStore({
      isLocked,
      onChange,
      emptyStatePlaceholderText,
      enableParallelDropZones,
    });
  }, [
    onChange,
    setPropsInStore,
    emptyStatePlaceholderText,
    isLocked,
    enableParallelDropZones,
  ]);

  useEffect(() => {
    setNodesInfo(nodes);
  }, [nodes, setNodesInfo]);

  return {
    setSelectedNodeId,
    handleDrag,
    stopDrag,
    dragEnterInWorkflow: isLocked ? undefined : dragEnterInWorkflow,
    dragOverInWorkflow: isLocked ? undefined : dragOverInWorkflow,
    dragStopInWorkflow: isLocked ? undefined : dragStopInWorkflow,
  };
};

export default useCanvas;
