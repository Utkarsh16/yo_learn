import type { StateCreator } from 'zustand';
import type { CanvasGraph } from '../../Canvas.types';
import type { CanvasStore, NodesStore } from '../useCanvasStore.types';
import { getConsolidatedNodesInfo } from './nodeStoreSlice.helpers';

const nodeStoreSlice: StateCreator<CanvasStore, [], [], NodesStore> = set => ({
  nodesInfo: {
    rootNode: '',
    nodesClone: {
      rootNode: null,
      nodes: {},
      edges: {},
    },
    childToParentMap: {},
    allNodeIds: [],
    nodePositions: {},
    blockBranchNodes: [],
  },
  selectedNodeId: null,

  setNodesInfo: (nodes: CanvasGraph) =>
    set(() => ({ nodesInfo: getConsolidatedNodesInfo(nodes) })),

  setSelectedNodeId: (nodeId: null | string) =>
    set(() => ({ selectedNodeId: nodeId })),
});

export default nodeStoreSlice;
