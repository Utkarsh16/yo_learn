import type { StateCreator } from 'zustand';
import { NODE_DATA_TRANSFER_KEY } from '../../Canvas.constants';
import { NODE_TYPES } from '../../Canvas.enums';
import { getDropTarget } from '../../helpers/dragDrop';
import { createNewNode } from '../../helpers/nodeCreation';
import type { CanvasStore, DragStore } from '../useCanvasStore.types';
import { getUpdatedNodesAndBlocksAfterDrop } from './dragStoreSlice.helpers';

const dragStoreSlice: StateCreator<CanvasStore, [], [], DragStore> = (
  set,
  get
) => ({
  drag: null,

  /**
   * Starts a drag operation on a node
   */
  startDrag: (nodeId: string, clientX: number, clientY: number) => {
    const { nodesInfo } = get();
    const position = nodesInfo.nodePositions[nodeId];
    if (!position) {
      return;
    }
    const { x, y } = position;
    const { x: stageX, y: stageY } = get().clientToStagePosition(
      clientX,
      clientY
    );
    const offsetX = stageX - x;
    const offsetY = stageY - y;

    set({
      drag: { nodeId, x, y, offsetX, offsetY, moved: false },
      selectedNodeId: nodeId,
    });
  },

  /**
   * Handles a mousemove event on the canvas -- takes the event object so that
   * preventDefault can be called conditionally
   */
  handleDrag: e => {
    const { drag } = get();
    if (drag && !drag.outsideDrag) {
      e.preventDefault();
      const { offsetX, offsetY } = drag;
      const { x: stageX, y: stageY } = get().clientToStagePosition(
        e.clientX,
        e.clientY
      );
      set({
        drag: {
          ...drag,
          x: stageX - offsetX,
          y: stageY - offsetY,
          moved: true,
        },
      });
    }
  },

  /**
   * Stops a drag operation on a node
   */
  stopDrag: (
    e,
    nodeData?: { type?: NODE_TYPES; metadata?: Record<string, string> }
  ) => {
    const { drag, nodesInfo, propsInStore } = get();
    const dropTarget = getDropTarget(
      drag,
      nodesInfo,
      propsInStore.enableParallelDropZones
    );

    set({ drag: null });

    if (dropTarget && drag) {
      const newNode = nodeData
        ? createNewNode(nodeData.type || NODE_TYPES.DEFAULT, nodeData.metadata)
        : undefined;

      const { dropTargetId, dropDirection } = dropTarget;

      const { nodes: updatedNodes } = getUpdatedNodesAndBlocksAfterDrop({
        newNode,
        nodesInfo,
        dropDirection,
        targetNodeId: dropTargetId,
        nodes: nodesInfo.nodesClone,
        sourceNodeId: newNode ? (newNode.id as string) : drag.nodeId,
      });
      propsInStore.onChange({
        nodes: updatedNodes,
      });
    }
  },

  dragEnterInWorkflow: e => {
    const offsetX = 0;
    const offsetY = 0;

    const { x: stageX, y: stageY } = get().clientToStagePosition(
      e.clientX,
      e.clientY
    );

    set({
      drag: {
        x: stageX,
        y: stageY,
        offsetX,
        offsetY,
        moved: true,
        outsideDrag: true,
        nodeId: '',
      },
    });
  },

  dragOverInWorkflow: e => {
    e.preventDefault();

    const { drag } = get();
    if (drag) {
      const { offsetX, offsetY } = drag;
      const { x: stageX, y: stageY } = get().clientToStagePosition(
        e.clientX,
        e.clientY
      );
      set({
        drag: {
          ...drag,
          x: stageX - offsetX,
          y: stageY - offsetY,
          nodeId: '',
        },
      });
    }
  },

  dragStopInWorkflow: e => {
    e.preventDefault();
    const nodeData = e.dataTransfer?.getData(NODE_DATA_TRANSFER_KEY);

    get().stopDrag(e, nodeData ? JSON.parse(nodeData) : undefined);
  },
});

export default dragStoreSlice;
