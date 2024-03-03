import { type ReactNode } from 'react';
import type {
  BLOCK_TYPES,
  NODE_TYPES,
  PLACEHOLDER_NODES,
  UTILITY_NODES,
} from './Canvas.enums';

export type ALL_NODE_TYPES = NODE_TYPES | UTILITY_NODES | PLACEHOLDER_NODES;
export type ALL_BLOCK_TYPES = BLOCK_TYPES;

export type NodePosition = {
  x: number;
  y: number;
};

export type NodePositionMap = Record<string, NodePosition | undefined>;

export type NodeDimensions = {
  width: number;
  height: number;
};

export type CanvasGraph = Readonly<{
  rootNode: string | null;
  nodes: Record<string, Node>;
  edges: Record<string, string[]>;
}>;

type NodeBase = {
  type: ALL_NODE_TYPES;
  id?: string;
};

export type ActionNode = NodeBase & {
  type: NODE_TYPES.DEFAULT;
  metadata?: Record<string, unknown>;
};

export type IfNode = NodeBase & {
  type: NODE_TYPES.IF_ELSE;
  trueNode: string | null;
  falseNode: string | null;
};

export type ParallelNode = NodeBase & {
  type: NODE_TYPES.DO_IN_PARALLEL;
  nodes: (string | null)[];
};

export type ForNode = NodeBase & {
  type: NODE_TYPES.FOR_EACH;
  body: string | null;
};

export type EmptyStatePlaceholderNode = NodeBase & {
  type: PLACEHOLDER_NODES.EMPTY_STATE_PLACEHOLDER;
};

export type DropTargetPlaceholderNode = NodeBase & {
  type: PLACEHOLDER_NODES.DROP_TARGET_PLACEHOLDER;
};

export type OnceAllCompletedNode = NodeBase & {
  type: UTILITY_NODES.ONCE_ALL_COMPLETED;
};

export type NodeType = Node['type'];

export type PlaceholderNode =
  | EmptyStatePlaceholderNode
  | DropTargetPlaceholderNode;

export type Node =
  | ActionNode
  | IfNode
  | ParallelNode
  | ForNode
  | PlaceholderNode
  | OnceAllCompletedNode;

export type CanvasProps = {
  /**
   * If this is true, the user can scroll the canvas by holding the Shift key
   * and dragging the mouse.
   */
  allowShiftAndDragToMove?: boolean;

  /**
   * Map of nodes, nodeId to node Data useful for the UI
   *
   * IMPORTANT: Not to be changed from inside of the component
   */
  nodes: CanvasGraph;

  /**
   * Callback to the nodes change from inside the component
   */
  onChange: (options: { nodes: CanvasGraph }) => void;

  /**
   * Callback for rendering the nodes content as per the user liking except for the Special nodes
   */
  nodeRenderer: (nodeId: string, info: Node) => ReactNode;

  /**
   * Callback for selecting or clicking on a node from inside the component
   */
  onNodeSelected?: (nodeId: string | null) => void;

  /**
   * Text to be shown on the empty state placeholder nodes
   */
  emptyStatePlaceholderText?: string;

  /**
   * Optional prop to lock the canvas from editing
   */
  isLocked?: boolean;

  /**
   * Optional prop to enable parallel drop zones
   */
  enableParallelDropZones?: boolean;
};
