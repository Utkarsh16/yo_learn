import type React from 'react';
import type {
  CanvasGraph,
  CanvasProps,
  NodePositionMap,
} from '../Canvas.types';

type PropsToBeStored = Pick<
  CanvasProps,
  | 'onChange'
  | 'emptyStatePlaceholderText'
  | 'isLocked'
  | 'enableParallelDropZones'
>;

type NodesInfo = {
  rootNode: string;
  nodesClone: CanvasGraph;
  childToParentMap: Record<string, string[]>;
  allNodeIds: string[];
  nodePositions: NodePositionMap;
  blockBranchNodes: string[];
};

/**
 * Exported types
 */
export type PropsStore = {
  propsInStore: PropsToBeStored;
  setPropsInStore: (propsInStore: PropsToBeStored) => void;
};

export type NodesStore = {
  // state
  nodesInfo: NodesInfo;
  selectedNodeId: null | string;

  // actions
  setNodesInfo: (nodes: CanvasGraph) => void;
  setSelectedNodeId: (nodeId: null | string) => void;
};

export type DragStore = {
  drag: null | {
    nodeId: string;
    moved: boolean;
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    outsideDrag?: boolean;
  };
  startDrag: (nodeId: string, clientX: number, clientY: number) => void;
  handleDrag: React.MouseEventHandler<HTMLDivElement>;
  stopDrag: (e: React.DragEvent<HTMLDivElement>, nodeData?: unknown) => void;
  dragEnterInWorkflow: React.DragEventHandler<HTMLDivElement>;
  dragOverInWorkflow: React.DragEventHandler<HTMLDivElement>;
  dragStopInWorkflow: React.DragEventHandler<HTMLDivElement>;
};

export type ScrollableStore = {
  zoomLevel: number;
  offset: { x: number; y: number };
  container: HTMLElement | null;
  // use a callback ref to set the container so we can rerender/update when it changes
  containerRef: (el: HTMLElement | null) => void;
  setZoomLevel: (zoomLevel: number) => void;
  adjustZoomFromScroll: (scrollDeltaY: number) => void;
  scrollCanvas: (deltaX: number, deltaY: number) => void;

  /**
   * Center the canvas, i.e. reset the offset and zoom level
   */
  center: () => void;

  /**
   * For converting a client position (from a mouse event) into a stage position
   * (which can be rendered using absolute positioning)
   */
  clientToStagePosition: (
    clientX: number,
    clientY: number
  ) => { x: number; y: number };
};

export type CanvasStore = DragStore & NodesStore & PropsStore & ScrollableStore;
