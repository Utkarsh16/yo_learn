import { NODE_TYPES } from '../Canvas.enums';
import type { CanvasGraph } from '../Canvas.types';
import { filterEmpty } from './generalHelpers';
import { getEdges } from './nodeNavigation';

export function removeChildFromNode(
  graph: CanvasGraph,
  nodeId: string,
  nodeIdToRemove: string
): void {
  const node = graph.nodes[nodeId];
  if (!node) {
    return;
  }
  if (graph.edges[nodeId]) {
    graph.edges[nodeId] = graph.edges[nodeId].filter(
      id => id !== nodeIdToRemove
    );
  }
  switch (node.type) {
    case NODE_TYPES.IF_ELSE: {
      if (node.trueNode === nodeIdToRemove) {
        node.trueNode = null;
      } else if (node.falseNode === nodeIdToRemove) {
        node.falseNode = null;
      }
      break;
    }
    case NODE_TYPES.FOR_EACH: {
      if (node.body === nodeIdToRemove) {
        node.body = null;
      }
      break;
    }
    case NODE_TYPES.DO_IN_PARALLEL: {
      node.nodes = node.nodes.filter(id => id !== nodeIdToRemove);
      break;
    }
    default: {
      break;
    }
  }
}

export function setNodeChildren(
  graph: CanvasGraph,
  {
    nodeId,
    childNodes,
  }: {
    nodeId: string;
    childNodes: (string | null)[];
  }
): void {
  const node = graph.nodes[nodeId];
  if (!node) {
    return;
  }
  switch (node.type) {
    case NODE_TYPES.IF_ELSE: {
      if (childNodes.length > 2) {
        // eslint-disable-next-line
        throw new Error(`Invalid child nodes length: ${node}, ${childNodes}`);
      }

      const [trueNode, falseNode] = childNodes;
      node.trueNode = trueNode ?? null;
      node.falseNode = falseNode ?? null;
      break;
    }
    case NODE_TYPES.FOR_EACH: {
      if (childNodes.length > 1) {
        // eslint-disable-next-line
        throw new Error(`Invalid child nodes length: ${node}, ${childNodes}`);
      }
      node.body = childNodes[0] ?? null;
      break;
    }
    case NODE_TYPES.DO_IN_PARALLEL: {
      node.nodes = filterEmpty(childNodes);
      break;
    }
    default: {
      // TODO: need to take into account different control flow nodes here
      graph.edges[nodeId] = filterEmpty(childNodes);
      break;
    }
  }
}

export function insertChildrenAtIndex(
  graph: CanvasGraph,
  {
    nodeId,
    childNodeIds,
    insertAtIndex,
    replace,
  }: {
    nodeId: string;
    childNodeIds: (string | null)[];
    insertAtIndex: number;
    replace: boolean;
  }
): void {
  const node = graph.nodes[nodeId];
  switch (node?.type) {
    case NODE_TYPES.IF_ELSE: {
      const [trueNode, falseNode] = childNodeIds;
      node.trueNode = trueNode ?? null;
      node.falseNode = falseNode ?? null;
      break;
    }
    default: {
      const deleteCount = replace ? 1 : 0;
      graph.edges[nodeId]?.splice(
        insertAtIndex,
        deleteCount,
        ...filterEmpty(childNodeIds)
      );
    }
  }
}

export function cloneChildren(
  graph: CanvasGraph,
  originalNodeId: string,
  newNodeId: string
): void {
  const originalNode = graph.nodes[originalNodeId];
  const newNode = graph.nodes[newNodeId];
  if (!(originalNode && newNode)) {
    return;
  }

  switch (originalNode.type) {
    case NODE_TYPES.IF_ELSE: {
      if (newNode.type === NODE_TYPES.IF_ELSE) {
        newNode.trueNode = originalNode.trueNode;
        newNode.falseNode = originalNode.falseNode;
      }
      break;
    }
    case NODE_TYPES.FOR_EACH: {
      if (newNode.type === NODE_TYPES.FOR_EACH) {
        newNode.body = originalNode.body;
      }
      break;
    }
    case NODE_TYPES.DO_IN_PARALLEL: {
      if (newNode.type === NODE_TYPES.DO_IN_PARALLEL) {
        newNode.nodes = [...originalNode.nodes];
      }
      break;
    }
    default: {
      break;
    }
  }
  const edges = getEdges(graph, originalNodeId);
  graph.edges[newNodeId] = [...edges];
}
