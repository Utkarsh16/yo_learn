import { NODE_TYPES } from '../../Canvas.enums';
import type { CanvasGraph } from '../../Canvas.types';
import { getType, isABlock } from '../../helpers/generalHelpers';
import {
  buildParentMap,
  directNodeChildren,
  getEdges,
} from '../../helpers/nodeNavigation';

function replaceNodeInEdges(
  graph: CanvasGraph,
  blockNodeId: string,
  nodeIdToReplace: string,
  nodeIdToInsert: string | null
): void {
  graph.edges[blockNodeId] =
    graph.edges[blockNodeId]?.reduce<string[]>((edges, id) => {
      if (id === nodeIdToReplace) {
        if (nodeIdToInsert) {
          edges.push(nodeIdToInsert);
        }
      } else {
        edges.push(id);
      }
      return edges;
    }, []) ?? [];
}

function replaceNodeInBlock(
  graph: CanvasGraph,
  blockNodeId: string,
  nodeIdToReplace: string,
  nodeIdToInsert: string | null
): void {
  const blockNode = graph.nodes[blockNodeId];

  // make sure this isn't an edge first
  if (graph.edges[blockNodeId]?.includes(nodeIdToReplace)) {
    return replaceNodeInEdges(
      graph,
      blockNodeId,
      nodeIdToReplace,
      nodeIdToInsert
    );
  }

  switch (blockNode.type) {
    case NODE_TYPES.IF_ELSE: {
      if (blockNode.trueNode === nodeIdToReplace) {
        blockNode.trueNode = nodeIdToInsert;
      } else if (blockNode.falseNode === nodeIdToReplace) {
        blockNode.falseNode = nodeIdToInsert;
      }
      break;
    }
    case NODE_TYPES.FOR_EACH: {
      if (blockNode.body === nodeIdToReplace) {
        blockNode.body = nodeIdToInsert;
      }
      break;
    }
    case NODE_TYPES.DO_IN_PARALLEL: {
      if (blockNode.nodes.includes(nodeIdToReplace)) {
        blockNode.nodes = blockNode.nodes.map(id => {
          if (id === nodeIdToReplace) {
            return nodeIdToInsert;
          }
          return id;
        });
      } else {
        blockNode.nodes.push(nodeIdToInsert);
      }
      break;
    }
    default: {
      // eslint-disable-next-line
      console.warn(`Unknown block node type: ${blockNode.type}`);
      break;
    }
  }
}

// inserts nodeIdToInsert as one of the branches of a block node
export function insertNodeInBranch(
  graph: CanvasGraph,
  blockNodeId: string,
  nodeIdOfExistingBranch: string,
  nodeIdToInsert: string | null
): void {
  replaceNodeInBlock(
    graph,
    blockNodeId,
    nodeIdOfExistingBranch,
    nodeIdToInsert
  );
  if (nodeIdToInsert) {
    graph.edges[nodeIdToInsert] = [nodeIdOfExistingBranch];
  }
}

export function removeFromParent(
  graph: CanvasGraph,
  childToParentMap: Record<string, string[]>,
  nodeId: string
): void {
  // Leave the node in the graph
  // Move the edges of nodeId to its parent
  //  - if the parent is not a block, just set the edges of parentId to the edges of nodeId
  //  - if the parent is a block, then assign to whatever branch contained nodeId
  // Delete the edges of nodeId

  const parents = childToParentMap[nodeId];
  if (!parents || parents.length === 0) {
    return;
  }
  for (const parentId of parents) {
    if (isABlock(getType(graph, parentId))) {
      const nextNodeId = graph.edges[nodeId]?.[0] ?? null;
      replaceNodeInBlock(graph, parentId, nodeId, nextNodeId);
    } else {
      graph.edges[parentId] = getEdges(graph, nodeId);
    }
  }

  delete graph.edges[nodeId];
}

/**
 * Inserts `insertNodeId` in the graph before `beforeNodeId`
 * @returns Nothing, mutates graph directly
 */
export function insertBefore(
  graph: CanvasGraph,
  childToParentMap: Record<string, string[]>,
  beforeNodeId: string,
  insertNodeId: string
): void {
  const parentId = childToParentMap[beforeNodeId]?.[0];
  if (!parentId) {
    return;
  }

  if (isABlock(getType(graph, parentId))) {
    insertNodeInBranch(graph, parentId, beforeNodeId, insertNodeId);
  } else {
    graph.edges[insertNodeId] = getEdges(graph, parentId);
    graph.edges[parentId] = [insertNodeId];
  }
}

/**
 * Inserts `insertNodeId` in the graph after `afterNodeId`
 * Note that this function won't insert a node into a block - if you need to
 * do that then use `insertBefore` on a drop target placeholder instead
 * @returns Nothing, mutates graph directly
 */
export function insertAfter(
  graph: CanvasGraph,
  afterNodeId: string,
  insertNodeId: string
): void {
  graph.edges[insertNodeId] = getEdges(graph, afterNodeId);
  graph.edges[afterNodeId] = [insertNodeId];
}

export function deleteNode(graph: CanvasGraph, nodeId: string): void {
  const childToParentMap = buildParentMap(graph);
  // remove the node from its parent and make sure its children are connected to the parent
  removeFromParent(graph, childToParentMap, nodeId);

  // delete the node and all children from the graph
  const stack = [nodeId];
  while (stack.length > 0) {
    const head = stack.pop();
    if (head) {
      directNodeChildren(graph, head).forEach(c => {
        if (c) {
          stack.push(c);
        }
      });
      delete graph.nodes[head];
      delete graph.edges[head];
    }
  }
}
