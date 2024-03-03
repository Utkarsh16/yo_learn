import type { DROP_DIRECTION } from '../../Canvas.enums';
import type { CanvasGraph, Node } from '../../Canvas.types';
import type { CanvasStore } from '../useCanvasStore.types';

export type DropOptions = {
  nodes: CanvasGraph;
  sourceNodeId: string;
  targetNodeId: string;
  dropDirection: DROP_DIRECTION;
  nodesInfo: CanvasStore['nodesInfo'];
  newNode?: Node & Required<Pick<Node, 'id'>>;
};
