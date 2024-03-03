import type {
  ALL_NODE_TYPES,
  CanvasGraph,
  CanvasProps,
  NodePositionMap,
} from '../../Canvas.types';

export type NodeOptions = {
  type: ALL_NODE_TYPES;
  nodeId: string;
  nodePositions: NodePositionMap;
  nodeChildren: string[];
  nodes: CanvasGraph;
  nodeRenderer: CanvasProps['nodeRenderer'];
  shouldHideArrow?: boolean; // Specific to nodes
  shouldHideArrowMarker?: boolean; // Specific to nodes
  isBranch?: boolean; // Specific to blocks
  parentBlock?: string; // Specific to blocks
};
