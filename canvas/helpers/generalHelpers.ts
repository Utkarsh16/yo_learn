import {
  DEFAULT_NODE_DIMENSIONS,
  EMPTY_DRAG_PLACEHOLDER_DIMENSIONS,
} from '../Canvas.constants';
import {
  BLOCK_TYPES,
  NODE_TYPES,
  PLACEHOLDER_NODES,
  UTILITY_NODES,
} from '../Canvas.enums';
import type {
  ALL_NODE_TYPES,
  CanvasGraph,
  NodeDimensions,
  NodePosition,
} from '../Canvas.types';

export const getNodeDimensions = (
  type = NODE_TYPES.DEFAULT as ALL_NODE_TYPES
): NodeDimensions => {
  switch (type) {
    case PLACEHOLDER_NODES.EMPTY_STATE_PLACEHOLDER:
      return EMPTY_DRAG_PLACEHOLDER_DIMENSIONS;
    default:
      return DEFAULT_NODE_DIMENSIONS;
  }
};

export const isActualNode = (nodeType: ALL_NODE_TYPES) => {
  return Object.values(NODE_TYPES).includes(nodeType as NODE_TYPES);
};

export const isPlaceholderNode = (nodeType: ALL_NODE_TYPES) => {
  return Object.values(PLACEHOLDER_NODES).includes(
    nodeType as PLACEHOLDER_NODES
  );
};

export const isOnceAllCompletedNode = (nodeType: ALL_NODE_TYPES) => {
  return nodeType === UTILITY_NODES.ONCE_ALL_COMPLETED;
};

export const isDoInParallelNode = (nodeType: ALL_NODE_TYPES) => {
  return nodeType === NODE_TYPES.DO_IN_PARALLEL;
};

export const isIfElseNode = (nodeType: ALL_NODE_TYPES) => {
  return nodeType === NODE_TYPES.IF_ELSE;
};

export const isABlock = (nodeType: ALL_NODE_TYPES) => {
  return Object.values(BLOCK_TYPES).includes(
    nodeType as unknown as BLOCK_TYPES
  );
};

export const cloneNodes = (originalNodes: CanvasGraph): CanvasGraph => {
  const nodesClone: CanvasGraph = {
    rootNode: originalNodes.rootNode,
    nodes: {},
    edges: {},
  };

  Object.keys(originalNodes.nodes).forEach(nodeId => {
    nodesClone.nodes[nodeId] = {
      ...originalNodes.nodes[nodeId],
    };
  });
  Object.keys(originalNodes.edges).forEach(nodeId => {
    if (originalNodes.edges[nodeId]) {
      nodesClone.edges[nodeId] = [...originalNodes.edges[nodeId]];
    }
  });

  return nodesClone;
};

export function filterEmpty<T>(arr: (T | null | undefined)[]): T[] {
  if (!arr) {
    return [];
  }
  return arr.filter((i): i is T => !!i);
}

export const getType = (graph: CanvasGraph, key: string) => {
  return graph.nodes[key]?.type as ALL_NODE_TYPES;
};

// overloading this so we don't need to do unnecessary null checks if we pass something we know isn't undefined
export function getNodeTopPosition(
  position: NodePosition,
  nodeDimensions: NodeDimensions
): NodePosition;
export function getNodeTopPosition(
  position: undefined,
  nodeDimensions: NodeDimensions
): undefined;
export function getNodeTopPosition(
  position: NodePosition | undefined,
  nodeDimensions: NodeDimensions
): NodePosition | undefined;
export function getNodeTopPosition(
  position: NodePosition | undefined,
  nodeDimensions: NodeDimensions
) {
  if (!position) {
    return undefined;
  }
  return { ...position, y: position.y - nodeDimensions.height / 2 };
}

// overloading this so we don't need to do unnecessary null checks if we pass something we know isn't undefined
export function getNodeBottomPosition(
  position: NodePosition,
  nodeDimensions: NodeDimensions
): NodePosition;
export function getNodeBottomPosition(
  position: undefined,
  nodeDimensions: NodeDimensions
): undefined;
export function getNodeBottomPosition(
  position: NodePosition | undefined,
  nodeDimensions: NodeDimensions
): NodePosition | undefined;
export function getNodeBottomPosition(
  position: NodePosition | undefined,
  nodeDimensions: NodeDimensions
) {
  if (!position) {
    return undefined;
  }
  return { ...position, y: position.y + nodeDimensions.height / 2 };
}
