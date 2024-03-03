import { NODE_TYPES } from '../Canvas.enums';
import type { ALL_NODE_TYPES, CanvasGraph } from '../Canvas.types';
import {
  getType,
  isABlock,
  isOnceAllCompletedNode,
  isPlaceholderNode,
} from './generalHelpers';
import { addEdge, buildParentMap, getNodeChildren } from './nodeNavigation';

/**
 * Builds a map of child to parent node id.
 * Note that this is different from `buildParentMap` in that it considers
 * children of parent control flow nodes (via `getNodeChildren`) and not just
 * the direct children of a parent.
 * This is useful mainly for the UI display, but internally all functions
 * modifying the data structure should probably use `buildParentMap` instead.
 */
export function convertToChildToParentMap(
  graph: CanvasGraph
): Record<string, string[]> {
  const parentMap: Record<string, string[]> = {};

  Object.keys(graph.nodes).forEach(nodeId => {
    const children = getNodeChildren(graph, nodeId);
    children.forEach(c => {
      parentMap[c] = parentMap[c] || [];
      parentMap[c].push(nodeId);
    });
  });

  return parentMap;
}

function shouldRemoveUtilityOrPlaceholderNode(nodeType: ALL_NODE_TYPES) {
  return isPlaceholderNode(nodeType) || isOnceAllCompletedNode(nodeType);
}

function removeNode(graph: CanvasGraph, nodeId: string) {
  // assign the node's direct children to its parent
  /*
    if the node is an if/else:
      delete all its branches
    if the node is a for loop:
      delete the whole body
    if the node is a placeholder (or ONCE_ALL_COMPLETED):
      if its parent is a block:
        determine which branch of the block it is
        assign the edge of the placeholder to the correct branch (i.e. true/false for if/else, body for for/each)
      if its parent is not a block:
        assign the placeholder's edges to the parent's edges
  */
  // delete the node
  // delete the node's edges
  const childToParentMap = buildParentMap(graph);

  const parents = childToParentMap[nodeId] || [];
  const node = graph.nodes[nodeId];
  if (!node) {
    return;
  }

  const removeNodeFromEdges = (parentId: string, nodeIdToRemove: string) => {
    graph.edges[parentId] = graph.edges[parentId].filter(
      id => id !== nodeIdToRemove
    );
    if (!graph.edges[parentId].length) {
      delete graph.edges[parentId];
    }
  };

  parents.forEach(parentId => {
    const nodeType = getType(graph, nodeId);
    if (shouldRemoveUtilityOrPlaceholderNode(nodeType)) {
      const childOfPlaceholderNode = graph.edges[nodeId]?.[0] ?? null;

      // if its parent is a block:
      //   determine which branch of the block it is
      //   assign the edge of the placeholder to the correct branch (i.e. true/false for if/else, body for for/each)
      // if its parent is not a block:
      //   assign the placeholder's edges to the parent's edges
      if (isABlock(getType(graph, parentId))) {
        const nodeIsEdgeOfParent = graph.edges[parentId].includes(nodeId);

        // determine which branch of the block it is
        const parentNode = graph.nodes[parentId];
        switch (parentNode.type) {
          case NODE_TYPES.IF_ELSE: {
            if (nodeId === parentNode.trueNode) {
              parentNode.trueNode = childOfPlaceholderNode;
            } else if (nodeId === parentNode.falseNode) {
              parentNode.falseNode = childOfPlaceholderNode;
            } else if (nodeIsEdgeOfParent) {
              removeNodeFromEdges(parentId, nodeId);
              if (childOfPlaceholderNode) {
                addEdge(graph, parentId, childOfPlaceholderNode);
              }
            } else {
              console.error('Cannot find node id.', { parentNode, nodeId });
            }
            break;
          }
          case NODE_TYPES.FOR_EACH: {
            if (nodeId === parentNode.body) {
              parentNode.body = childOfPlaceholderNode;
            } else if (nodeIsEdgeOfParent) {
              removeNodeFromEdges(parentId, nodeId);
              if (childOfPlaceholderNode) {
                addEdge(graph, parentId, childOfPlaceholderNode);
              }
            } else {
              console.error('Cannot find node id.', { parentNode, nodeId });
            }
            break;
          }
          case NODE_TYPES.DO_IN_PARALLEL: {
            if (parentNode.nodes.includes(nodeId)) {
              parentNode.nodes = parentNode.nodes.map(id => {
                if (id === nodeId) {
                  return childOfPlaceholderNode;
                }
                return id;
              });
            } else if (nodeIsEdgeOfParent) {
              removeNodeFromEdges(parentId, nodeId);
              if (childOfPlaceholderNode) {
                addEdge(graph, parentId, childOfPlaceholderNode);
              }
            } else {
              console.error('Cannot find node id.', { parentNode, nodeId });
            }
            break;
          }
          default: {
            throw new Error(
              // eslint-disable-next-line
              `[removeNode] Unknown parent block node type: ${parentNode.type}`
            );
          }
        }
      } else {
        graph.edges[parentId] = [...(graph.edges[nodeId] || [])];
      }
    } else if (isABlock(getType(graph, nodeId))) {
      // TODO: do we need to handle this case?
    } else {
      // eslint-disable-next-line
      throw new Error(`Unknown node type to remove: ${node.type}`);
    }
  });

  delete graph.nodes[nodeId];
  delete graph.edges[nodeId];
}

/**
 * Util function to sanitize the nodes and blocks object
 *
 * Util function to sanitize the nodes object
 * 1. Remove all the utility nodes
 * 2. Replace the utility node with its children, thus connecting the parent of util node to the children of util node
 *
 * Util function to sanitize the blocks object
 * 1. Remove all the placeholder nodes
 * 2. Replace the placeholder node with its children, thus connecting the parent of placeholder node to the children of placeholder node
 * 3. Remove all the placeholder nodes from the branches
 * 4. Update the last branch node to point to the block child node
 * 5. If the placeholder node is part of a branch and its previous node is a block, update the child of the previous block to point
 *    to the children of the placeholder node
 *
 * NOTE - This function essentially reverses what the 'preProcessNodes'
 *  function does in 'canvas/stores/nodeStoreSlice/nodeStoreSlice.helpers.ts'
 */
export const sanitizeBlocksAndNodes = (processedNodes: CanvasGraph) => {
  Object.keys(processedNodes.nodes).forEach(nodeId => {
    const nodeType = getType(processedNodes, nodeId);
    if (shouldRemoveUtilityOrPlaceholderNode(nodeType)) {
      removeNode(processedNodes, nodeId);
    }
  });

  return {
    nodes: processedNodes,
  };
};
