import { NODE_TYPES } from '../Canvas.enums';
import type { CanvasGraph } from '../Canvas.types';
import { filterEmpty, isABlock } from './generalHelpers';

export function getBlockNodes(graph: CanvasGraph) {
  return Object.keys(graph.nodes).filter(id => isABlock(graph.nodes[id].type));
}

export function getEdges(graph: CanvasGraph, nodeId: string): string[] {
  const edges = graph.edges[nodeId] || [];
  return [...edges];
}

export function addEdge(
  graph: CanvasGraph,
  nodeId: string,
  edgeToId: string
): void {
  graph.edges[nodeId] = graph.edges[nodeId] || [];
  graph.edges[nodeId].push(edgeToId);
}

export function directNodeChildren(
  graph: CanvasGraph,
  nodeId: string
): (string | null)[] {
  const node = graph.nodes[nodeId];
  if (!node) {
    return [];
  }

  switch (node.type) {
    case NODE_TYPES.IF_ELSE: {
      return [node.trueNode, node.falseNode];
    }
    case NODE_TYPES.FOR_EACH: {
      return [node.body];
    }
    case NODE_TYPES.DO_IN_PARALLEL: {
      return [...node.nodes];
    }
    default: {
      return [...(graph.edges[nodeId] || [])];
    }
  }
}

export function buildParentMap(graph: CanvasGraph): Record<string, string[]> {
  const parentMap: Record<string, string[]> = {};

  Object.keys(graph.nodes).forEach(nodeId => {
    const children = filterEmpty(directNodeChildren(graph, nodeId));
    children.forEach(c => {
      parentMap[c] = (parentMap[c] || []).concat(nodeId);
    });
    const edges = getEdges(graph, nodeId);
    edges.forEach(e => {
      parentMap[e] = [...new Set((parentMap[e] || []).concat(nodeId))];
    });
  });

  return parentMap;
}

function findChildOfParentControlFlowNode(
  graph: CanvasGraph,
  nodeId: string
): string[] {
  // we need to go up to the parent and return the node its edge points to
  // TODO: it's pretty inefficient building this every time we call getNodeChildren, need to memoize/optimize it
  const parentMap = buildParentMap(graph);
  const stack = [nodeId];
  const visited = new Set([nodeId]);

  while (stack.length > 0) {
    const head = stack.pop();
    if (!head) {
      return [];
    }
    visited.add(head);

    // if the node is a control flow node and it has an edge, return it
    const node = graph.nodes[head];
    if (node) {
      const edges = getEdges(graph, head).filter(
        e => e !== nodeId && !visited.has(e)
      );
      const isControlFlow = isABlock(node.type);

      if (isControlFlow && edges.length > 0) {
        return edges;
      }

      const parents = (parentMap[head] || []).filter(p => !visited.has(p));

      parents.forEach(p => stack.push(p));
    } else {
      console.warn('No node:', head);
    }
  }
  return [];
}

/**
 * Slightly different from getNodeChildren in that it returns the next direct child rather than the true/false/body nodes.
 * (i.e. this is the descendant of the entire block, not any nodes inside the block)
 * @param graph
 * @param nodeId
 * @returns
 */
export function getBlockChildren(
  graph: CanvasGraph,
  nodeId: string | undefined
): string[] {
  if (!nodeId) {
    return [];
  }

  const directChildren = getEdges(graph, nodeId);
  if (directChildren.length > 0) {
    return directChildren;
  }
  return findChildOfParentControlFlowNode(graph, nodeId);
}

function hasNoEmptyValues(arr: (string | null)[]): arr is string[] {
  return arr.every(i => !!i);
}

/**
 * Maps to the "children" field in the old code for the d3 hierarchy.
 * If the node is a "block", it returns the first nodes in the block's "contents",
 * e.g. the true/false nodes for an if block or the body node for a for loop block.
 * @param graph
 * @param nodeId
 * @returns An array of node ids for the children of the given node.
 */
export function getNodeChildren(
  graph: CanvasGraph,
  nodeId: string | undefined
): string[] {
  if (!nodeId) {
    return [];
  }
  const directChildren = directNodeChildren(graph, nodeId);

  if (directChildren.length > 0) {
    // if all the branches of a node point to other nodes, return those nodes
    if (hasNoEmptyValues(directChildren)) {
      return directChildren;
    }
    // otherwise, go up the graph until we get to a control flow node parent, find its edge,
    // and use that as the child of the empty branches
    const childOfHighestControlFlowNode = findChildOfParentControlFlowNode(
      graph,
      nodeId
    );

    const duplicates = new Set<string>();
    const childOfParent = childOfHighestControlFlowNode[0];
    const addParentsChild = directChildren.reduce<string[]>(
      (children, childId) => {
        if (childId && !duplicates.has(childId)) {
          duplicates.add(childId);
          children.push(childId);
        } else if (
          !childId &&
          childOfParent &&
          !duplicates.has(childOfParent)
        ) {
          duplicates.add(childOfParent);
          children.push(childOfParent);
        }
        return children;
      },
      []
    );
    return addParentsChild;
  }

  // if we can't find any direct descendants, go up the graph until we get to a control flow node and find its edge
  return findChildOfParentControlFlowNode(graph, nodeId);
}

/**
 * Maps to the "branches" field in the old code.
 * @param graph
 * @param startNodeId
 * @returns An array of arrays, each one representing a "branch", or sequence of nodes until we reach another control flow node.
 */
export function getNodeBranches(
  graph: CanvasGraph,
  startNodeId: string
): readonly string[][] {
  const node = graph.nodes[startNodeId];

  const parentChildren = new Set(
    findChildOfParentControlFlowNode(graph, startNodeId)
  );

  // e.g. "I" -> ["I", "FOR_J"]
  function traverse(nodeId: string): string[] {
    const branch = [nodeId];
    const queue = [...getEdges(graph, nodeId)];
    while (queue.length > 0) {
      const head = queue.shift();
      if (head) {
        branch.push(head);
        const edges = getEdges(graph, head).filter(e => !parentChildren.has(e));
        if (edges.length > 0) {
          queue.push(edges[0]);
        }
      }
    }
    return branch;
  }

  switch (node.type) {
    case NODE_TYPES.IF_ELSE: {
      // this is added for compatibility with the previous implementation, may want to change it later
      if (node.trueNode === null && node.falseNode === null) {
        return [];
      }
      return [node.trueNode, node.falseNode].map(id =>
        id ? traverse(id) : []
      );
    }
    case NODE_TYPES.FOR_EACH: {
      return [node.body].map(id => (id ? traverse(id) : []));
    }
    case NODE_TYPES.DO_IN_PARALLEL: {
      return node.nodes.map(id => (id ? traverse(id) : []));
    }
    default: {
      return [];
    }
  }
}
