import { create } from 'zustand';
import dragStoreSlice from './dragStoreSlice/dragStoreSlice';
import nodeStoreSlice from './nodeStoreSlice/nodeStoreSlice';
import propsStoreSlice from './propsStoreSlice/propsStoreSlice';
import scrollableStoreSlice from './scrollableStoreSlice/scrollableStoreSlice';
import type { CanvasStore as CanvasStoreType } from './useCanvasStore.types';

const useCanvasStore = create<CanvasStoreType>((...args) => ({
  ...scrollableStoreSlice(...args),
  ...dragStoreSlice(...args),
  ...nodeStoreSlice(...args),
  ...propsStoreSlice(...args),
}));

const useGetScrollableStore = () =>
  useCanvasStore(
    ({
      zoomLevel,
      setZoomLevel,
      offset,
      container,
      containerRef,
      center,
      clientToStagePosition,
      adjustZoomFromScroll,
      scrollCanvas,
    }) => ({
      zoomLevel,
      setZoomLevel,
      offset,
      container,
      containerRef,
      center,
      clientToStagePosition,
      adjustZoomFromScroll,
      scrollCanvas,
    })
  );

const useGetDragStore = () =>
  useCanvasStore(
    ({
      drag,
      startDrag,
      handleDrag,
      stopDrag,
      dragEnterInWorkflow,
      dragOverInWorkflow,
      dragStopInWorkflow,
    }) => ({
      drag,
      startDrag,
      handleDrag,
      stopDrag,
      dragEnterInWorkflow,
      dragOverInWorkflow,
      dragStopInWorkflow,
    })
  );

const useGetNodesStore = () =>
  useCanvasStore(
    ({ nodesInfo, setNodesInfo, selectedNodeId, setSelectedNodeId }) => ({
      nodesInfo,
      setNodesInfo,
      selectedNodeId,
      setSelectedNodeId,
    })
  );

const useGetPropsStore = () =>
  useCanvasStore(({ propsInStore, setPropsInStore }) => ({
    propsInStore,
    setPropsInStore,
  }));

export {
  useGetScrollableStore,
  useGetDragStore,
  useGetNodesStore,
  useGetPropsStore,
};
